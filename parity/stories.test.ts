import {
  componentStoryFiles,
  DOCS_TAG,
  parseStoriesFile,
  type StoriesFile,
  tagsOf,
} from '@nxds/source-model/docs-stories.ts';
import { vueComponentsRoot } from '@nxds/source-model/roots.mjs';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { behaviourDifferences, behaviourOnlyIn, shared } from './parity.ts';

const printer = ts.createPrinter({ removeComments: true });

function vueStoryFiles(slug: string) {
  const dir = path.join(vueComponentsRoot, slug);
  return readdirSync(dir)
    .filter((file) => file.endsWith('.stories.ts'))
    .sort()
    .map((file) => path.join(dir, file));
}

function docsStoryNames(files: string[]) {
  return files.flatMap((file) =>
    parseStoriesFile(file)
      .stories.filter((story) => tagsOf(story.object).includes(DOCS_TAG))
      .map((story) => story.name)
  );
}

function property(object: ts.ObjectLiteralExpression, name: string) {
  for (const member of object.properties) {
    if (ts.isPropertyAssignment(member) && member.name.getText() === name) {
      return member.initializer;
    }
    if (ts.isMethodDeclaration(member) && member.name.getText() === name) {
      return member;
    }
  }
  return undefined;
}

/** Whether `node` reads a variable, ignoring object keys and member names. */
function readsVariable(node: ts.Node): boolean {
  if (ts.isIdentifier(node)) {
    const { parent } = node;
    const isKey =
      (ts.isPropertyAssignment(parent) && parent.name === node) ||
      (ts.isPropertyAccessExpression(parent) && parent.name === node);
    return !isKey && node.text !== 'undefined';
  }
  return ts.forEachChild(node, readsVariable) ?? false;
}

function printArguments(call: ts.CallExpression, source: ts.SourceFile) {
  return call.arguments
    .map((argument) =>
      readsVariable(argument)
        ? '_'
        : printer.printNode(ts.EmitHint.Expression, argument, source)
    )
    .join(', ');
}

/** `expect(…).not.toBe` → `not.toBe`, or null when `callee` doesn't hang off `expect(…)`. */
function matcherPath(callee: ts.Expression): string | null {
  const names: string[] = [];
  let node = callee;
  while (ts.isPropertyAccessExpression(node)) {
    names.unshift(node.name.text);
    node = node.expression;
  }
  const isExpect =
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'expect';
  return isExpect && names.length > 0 ? names.join('.') : null;
}

/** A same-file helper's body, when `call` calls one. */
function helperBody(call: ts.CallExpression, file: StoriesFile) {
  if (!ts.isIdentifier(call.expression)) return undefined;
  const declaration = file.declarations.get(call.expression.text);
  if (!declaration) return undefined;
  if (ts.isFunctionDeclaration(declaration)) return declaration.body;
  if (!ts.isVariableStatement(declaration)) return undefined;
  const [variable] = declaration.declarationList.declarations;
  const init = variable?.initializer;
  return init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
    ? init.body
    : undefined;
}

interface PlayStory {
  steps: string[];
  /** Imported helpers the play calls whose steps the reader can't see. */
  unread: string[];
}

/** Whether `name` is imported into `file` from outside `storybook/test`. */
function isImportedHelper(name: string, file: StoriesFile) {
  const binding = file.imports.get(name);
  return binding !== undefined && binding.module !== 'storybook/test';
}

/**
 * The steps a play function takes, in source order: each user action, each
 * Testing Library query and each assertion's matcher, with literal arguments
 * printed and anything that reads a variable as `_`. Same-file helpers are
 * read in place, one level deep. An imported `expect*` helper counts as one
 * step; any other imported helper is unread.
 */
function playSteps(
  play: ts.Node,
  file: StoriesFile,
  source: ts.SourceFile
): PlayStory {
  const steps: string[] = [];
  const unread: string[] = [];
  const visit = (node: ts.Node, depth: number) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const matcher = matcherPath(callee);
      const name = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : ts.isIdentifier(callee)
          ? callee.text
          : '';
      if (matcher) {
        steps.push(`expect.${matcher}(${printArguments(node, source)})`);
      } else if (
        ts.isPropertyAccessExpression(callee) &&
        callee.expression.getText(source) === 'userEvent'
      ) {
        steps.push(`userEvent.${name}(${printArguments(node, source)})`);
      } else if (/^(?:get|query|find)(?:All)?By[A-Z]/.test(name)) {
        steps.push(`${name}(${printArguments(node, source)})`);
      }
      const body = depth === 0 ? helperBody(node, file) : undefined;
      if (body) visit(body, depth + 1);
      else if (ts.isIdentifier(callee) && /^expect[A-Z]/.test(name)) {
        steps.push(`${name}(${printArguments(node, source)})`);
      } else if (ts.isIdentifier(callee) && isImportedHelper(name, file)) {
        unread.push(name);
      }
    }
    ts.forEachChild(node, (child) => visit(child, depth));
  };
  visit(play, 0);
  return { steps, unread };
}

/** Each story with a `play` function, by name, as its steps. */
function playStories(files: string[]) {
  const stories = new Map<string, PlayStory>();
  for (const filePath of files) {
    const file = parseStoriesFile(filePath);
    for (const story of file.stories) {
      const play = property(story.object, 'play');
      if (!play) continue;
      stories.set(story.name, playSteps(play, file, play.getSourceFile()));
    }
  }
  return stories;
}

/** Whether two stories' step lists match. A missing story matches nothing. */
function sameSteps(react: string[] | undefined, vue: string[] | undefined) {
  if (!react || !vue) return false;
  return JSON.stringify(react) === JSON.stringify(vue);
}

const behaviour = shared.map((slug) => ({
  slug,
  react: playStories(componentStoryFiles(slug)),
  vue: playStories(vueStoryFiles(slug)),
}));

describe('docs stories', () => {
  it.each(shared)(
    '%s shows the same docs examples, in the same order',
    (slug) => {
      const react = docsStoryNames(componentStoryFiles(slug));
      expect(react.length).toBeGreaterThan(0);
      expect(docsStoryNames(vueStoryFiles(slug))).toEqual(react);
    }
  );
});

describe('behaviour stories', () => {
  it.each(behaviour)(
    '$slug pairs every play story with one in the other framework',
    ({ slug, react, vue }) => {
      const unpaired = (
        mine: Map<string, PlayStory>,
        theirs: Map<string, PlayStory>,
        framework: 'react' | 'vue'
      ) =>
        [...mine.keys()]
          .filter((name) => !theirs.has(name))
          .map((name) => `${slug}/${name}`)
          .filter((id) => !(id in behaviourOnlyIn[framework]));

      expect(react.size).toBeGreaterThan(0);
      expect({
        react: unpaired(react, vue, 'react'),
        vue: unpaired(vue, react, 'vue'),
      }).toEqual({ react: [], vue: [] });
    }
  );

  it.each(behaviour)(
    '$slug play stories take steps the reader can see',
    ({ slug, react, vue }) => {
      const unreadable = [...react, ...vue]
        .filter(([, { steps, unread }]) => steps.length === 0 || unread.length)
        .map(([name, { unread }]) => ({ story: `${slug}/${name}`, unread }));
      expect(unreadable).toEqual([]);
    }
  );

  it.each(behaviour)(
    '$slug play stories take the same steps',
    ({ slug, react, vue }) => {
      const drift = [...react]
        .filter(([name]) => vue.has(name))
        .filter(([name]) => !(`${slug}/${name}` in behaviourDifferences))
        .filter(([name, { steps }]) => !sameSteps(steps, vue.get(name)?.steps))
        .map(([name, { steps }]) => ({
          story: name,
          react: steps,
          vue: vue.get(name)?.steps,
        }));
      expect(drift).toEqual([]);
    }
  );

  it('allows only differences for stories that still exist', () => {
    const story = (id: string, framework: 'react' | 'vue') => {
      const [slug, name] = id.split('/');
      return behaviour
        .find((entry) => entry.slug === slug)
        ?.[framework].get(name ?? '');
    };
    const exists = (id: string, framework: 'react' | 'vue') =>
      story(id, framework) !== undefined;
    const stale = [
      ...Object.keys(behaviourOnlyIn.react).filter(
        (id) => !exists(id, 'react') || exists(id, 'vue')
      ),
      ...Object.keys(behaviourOnlyIn.vue).filter(
        (id) => !exists(id, 'vue') || exists(id, 'react')
      ),
      ...Object.keys(behaviourDifferences).filter(
        (id) =>
          !exists(id, 'react') ||
          !exists(id, 'vue') ||
          sameSteps(story(id, 'react')?.steps, story(id, 'vue')?.steps)
      ),
    ];
    expect(stale).toEqual([]);
  });
});
