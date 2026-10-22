import path from 'node:path';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';

import type {
  ComponentEntry,
  PropEntry,
  PropsFile,
} from '../apps/docs/scripts/props-entries.ts';
import { reactPropsFiles } from '../apps/docs/scripts/react-props.mjs';
import {
  componentsRoot,
  vueComponentsRoot,
} from '../apps/docs/scripts/roots.mjs';
import {
  componentProps,
  createVueChecker,
  exportedParts,
  parseFile,
  type VueChecker,
} from '../apps/docs/scripts/vue-sources.ts';

import { shared, vueOnlyApi } from './parity.ts';

interface VuePart {
  entry: ComponentEntry;
  slots: string[];
  events: string[];
  inheritsAsChild: boolean;
}

interface Contract {
  react: Map<string, ComponentEntry>;
  vue: Map<string, VuePart>;
  /** Parts Vue re-exports from Reka, which have no SFC to read. */
  vueReExports: Set<string>;
}

const REACT_NODE = /^React(?:\.ReactNode|Node)$/;

const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** A type as its union members, sorted, without `null` or `undefined`. */
function members(type: string) {
  return type
    .split('|')
    .map((member) => member.trim())
    .filter((member) => member && member !== 'null' && member !== 'undefined')
    .sort();
}

function isOwn(declarations: { file: string }[]) {
  return declarations.some(({ file }) =>
    file.startsWith(vueComponentsRoot + path.sep)
  );
}

/** Names a Vue component folder re-exports straight from a package. */
function packageReExports(slug: string) {
  const index = parseFile(path.join(vueComponentsRoot, slug, 'index.ts'));
  return index.statements.flatMap((statement) => {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text.startsWith('.') ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      return [];
    }
    return statement.exportClause.elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => element.name.text);
  });
}

function vueContract(checker: VueChecker, slug: string) {
  const entries = new Map(
    componentProps(checker, slug).components.map((entry) => [entry.name, entry])
  );
  const parts = exportedParts(slug).map(({ name, file }): VuePart => {
    const meta = checker.getComponentMeta(file);
    const entry = entries.get(name);
    if (!entry) throw new Error(`${slug}: ${name} has no props entry.`);
    return {
      entry,
      slots: meta.slots
        .map((slot) => slot.name)
        .filter((name) => name !== 'default'),
      events: meta.events
        .filter((event) => isOwn(event.getDeclarations()))
        .map((event) => event.name),
      inheritsAsChild: meta.props.some((prop) => prop.name === 'asChild'),
    };
  });
  return new Map(parts.map((part) => [part.entry.name, part]));
}

/** Every way the Vue part's API differs from the React part's. */
function partDrift(react: ComponentEntry, vue: VuePart) {
  const drift: string[] = [];
  const at = (name: string) => `${react.name}.${name}`;
  const vueProps = new Map(
    vue.entry.props
      .filter((prop) => prop.name !== 'class')
      .map((prop) => [prop.name, prop])
  );
  const mapped = new Set<string>();

  for (const prop of react.props) {
    if (REACT_NODE.test(prop.type)) {
      mapped.add(kebab(prop.name));
      if (!vue.slots.includes(kebab(prop.name))) {
        drift.push(`${at(prop.name)}: no #${kebab(prop.name)} slot`);
      }
      continue;
    }
    if (prop.name === 'asChild') {
      if (!vue.inheritsAsChild) drift.push(`${at('asChild')}: missing`);
      continue;
    }
    if (/^on[A-Z]/.test(prop.name)) {
      const event = kebab(prop.name.slice(2));
      mapped.add(event);
      if (!vue.events.includes(event)) {
        drift.push(`${at(prop.name)}: no '${event}' emit`);
      }
      continue;
    }
    const twin = vueProps.get(prop.name);
    mapped.add(prop.name);
    if (!twin) {
      drift.push(`${at(prop.name)}: missing`);
      continue;
    }
    drift.push(...propDrift(at(prop.name), prop, twin));
  }

  const vueOnly = [...vueProps.keys(), ...vue.slots, ...vue.events].filter(
    (name) => !mapped.has(name) && !(at(name) in vueOnlyApi)
  );
  drift.push(...vueOnly.map((name) => `${at(name)}: Vue only`));
  return drift;
}

function propDrift(at: string, react: PropEntry, vue: PropEntry) {
  const drift: string[] = [];
  if (members(react.type).join(' | ') !== members(vue.type).join(' | ')) {
    drift.push(`${at}: type ${react.type} vs ${vue.type}`);
  }
  if (react.defaultValue !== vue.defaultValue) {
    drift.push(`${at}: default ${react.defaultValue} vs ${vue.defaultValue}`);
  }
  if (react.required !== vue.required) drift.push(`${at}: required`);
  if (react.description && !vue.description) {
    drift.push(`${at}: no description`);
  }
  return drift;
}

/** Each interface's property names in `file`, by interface name. */
function interfaceKeys(file: string) {
  const source = parseFile(file);
  const keys = new Map<string, string[]>();
  for (const statement of source.statements) {
    if (!ts.isInterfaceDeclaration(statement)) continue;
    keys.set(
      statement.name.text,
      statement.members.map((member) => member.name?.getText() ?? '').sort()
    );
  }
  return keys;
}

const contracts = new Map<string, Contract>();

beforeAll(() => {
  const checker = createVueChecker();
  const reactFiles = new Map(
    (reactPropsFiles() as PropsFile[]).map((file) => [file.slug, file])
  );
  for (const slug of shared) {
    const react = reactFiles.get(slug);
    if (!react) throw new Error(`@nxds/react has no props file for ${slug}.`);
    contracts.set(slug, {
      react: new Map(react.components.map((entry) => [entry.name, entry])),
      vue: vueContract(checker, slug),
      vueReExports: new Set(packageReExports(slug)),
    });
  }
}, 120_000);

describe('component contract', () => {
  it.each(shared)('%s exports the same parts', (slug) => {
    const { react, vue, vueReExports } = contracts.get(slug)!;
    const vueParts = new Set([...vue.keys(), ...vueReExports]);
    expect(react.size).toBeGreaterThan(0);
    expect([...vueParts].sort()).toEqual([...react.keys()].sort());
  });

  it.each(shared)('%s parts take the same props, slots and events', (slug) => {
    const { react, vue } = contracts.get(slug)!;
    const drift = [...vue].flatMap(([name, part]) =>
      partDrift(react.get(name)!, part)
    );
    expect(drift).toEqual([]);
  });

  it('allows only Vue-only API that still exists', () => {
    const declared = new Set(
      [...contracts.values()].flatMap(({ vue }) =>
        [...vue].flatMap(([name, part]) =>
          [
            ...part.entry.props.map((prop) => prop.name),
            ...part.slots,
            ...part.events,
          ].map((api) => `${name}.${api}`)
        )
      )
    );
    expect(Object.keys(vueOnlyApi).filter((key) => !declared.has(key))).toEqual(
      []
    );
  });
});

describe('appearance contract', () => {
  const react = interfaceKeys(
    path.join(componentsRoot, 'appearance', 'provider', 'provider.tsx')
  );
  const vue = interfaceKeys(
    path.join(vueComponentsRoot, 'appearance', 'appearance.ts')
  );

  it('the Vue plugin takes the options the React provider takes as props', () => {
    const providerProps = react
      .get('NxdsAppearanceProviderProps')
      ?.filter((key) => key !== 'children');
    expect(providerProps?.length).toBeGreaterThan(0);
    expect(vue.get('NxdsAppearanceOptions')).toEqual(providerProps);
  });

  it('useNxdsAppearance returns what the React context holds', () => {
    const context = react.get('NxdsAppearanceContextValue');
    expect(context?.length).toBeGreaterThan(0);
    expect(vue.get('NxdsAppearance')).toEqual(context);
  });
});
