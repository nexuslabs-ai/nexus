import type {
  ComponentEntry,
  PropEntry,
  PropsFile,
} from '@nxds/source-model/props-entries.ts';
import { reactPropsFiles } from '@nxds/source-model/react-props.mjs';
import {
  componentsRoot,
  vueComponentsRoot,
} from '@nxds/source-model/roots.mjs';
import {
  componentParts,
  createVueProgram,
  isOwnDeclaration,
  parseFile,
  partEntry,
  type VueProgram,
} from '@nxds/source-model/vue-sources.ts';
import path from 'node:path';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';

import { shared, vueOnlyApi } from './parity.ts';

interface VuePartApi {
  entry: ComponentEntry;
  /** Named slots; the default slot is `hasDefaultSlot`. */
  slots: string[];
  hasDefaultSlot: boolean;
  events: string[];
  inheritsAsChild: boolean;
}

interface Contract {
  react: Map<string, ComponentEntry>;
  vue: Map<string, VuePartApi>;
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

function vueContract(vueProgram: VueProgram, slug: string) {
  const parts = componentParts(vueProgram, slug).map(
    (part): VuePartApi => ({
      entry: partEntry(vueProgram, part),
      slots: part.meta.slots
        .map((slot) => slot.name)
        .filter((name) => name !== 'default'),
      hasDefaultSlot: part.meta.slots.some((slot) => slot.name === 'default'),
      events: part.meta.events
        .filter((event) => isOwnDeclaration(event.getDeclarations()))
        .map((event) => event.name),
      inheritsAsChild: part.meta.props.some((prop) => prop.name === 'asChild'),
    })
  );
  return new Map(parts.map((part) => [part.entry.name, part]));
}

interface VueName {
  prop: PropEntry;
  kind: 'defaultSlot' | 'slot' | 'emit' | 'asChild' | 'prop';
  vueName: string;
}

/**
 * The Vue API each React prop maps to: the default slot for `children`, a
 * kebab-case slot, an emit, `as-child`, or the same prop.
 */
function vueNames(react: ComponentEntry) {
  return react.props.map((prop): VueName => {
    if (prop.name === 'children' && REACT_NODE.test(prop.type)) {
      return { prop, kind: 'defaultSlot', vueName: 'default' };
    }
    if (REACT_NODE.test(prop.type)) {
      return { prop, kind: 'slot', vueName: kebab(prop.name) };
    }
    if (prop.name === 'asChild') {
      return { prop, kind: 'asChild', vueName: prop.name };
    }
    if (/^on[A-Z]/.test(prop.name)) {
      return { prop, kind: 'emit', vueName: kebab(prop.name.slice(2)) };
    }
    return { prop, kind: 'prop', vueName: prop.name };
  });
}

/** The Vue names the React part's props map to. */
function mappedNames(react: ComponentEntry) {
  return new Set<string>(vueNames(react).map(({ vueName }) => vueName));
}

/** Every way the Vue part's API differs from the React part's. */
function partDrift(react: ComponentEntry, vue: VuePartApi) {
  const drift: string[] = [];
  const at = (name: string) => `${react.name}.${name}`;
  const vueProps = new Map(
    vue.entry.props
      .filter((prop) => prop.name !== 'class')
      .map((prop) => [prop.name, prop])
  );
  for (const { prop, kind, vueName } of vueNames(react)) {
    if (kind === 'defaultSlot') {
      if (!vue.hasDefaultSlot) drift.push(`${at(prop.name)}: no default slot`);
      continue;
    }
    if (kind === 'slot') {
      if (!vue.slots.includes(vueName)) {
        drift.push(`${at(prop.name)}: no #${vueName} slot`);
      }
      continue;
    }
    if (kind === 'asChild') {
      if (!vue.inheritsAsChild) drift.push(`${at(prop.name)}: missing`);
      continue;
    }
    if (kind === 'emit') {
      if (!vue.events.includes(vueName)) {
        drift.push(`${at(prop.name)}: no '${vueName}' emit`);
      }
      continue;
    }
    const twin = vueProps.get(vueName);
    if (!twin) {
      drift.push(`${at(prop.name)}: missing`);
      continue;
    }
    drift.push(...propDrift(at(prop.name), prop, twin));
  }

  const mapped = mappedNames(react);
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
  if (react.description !== vue.description) {
    drift.push(
      `${at}: description "${react.description}" vs "${vue.description}"`
    );
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
  const vueProgram = createVueProgram();
  const reactFiles = new Map(
    (reactPropsFiles() as PropsFile[]).map((file) => [file.slug, file])
  );
  for (const slug of shared) {
    const react = reactFiles.get(slug);
    if (!react) throw new Error(`@nxds/react has no props file for ${slug}.`);
    contracts.set(slug, {
      react: new Map(react.components.map((entry) => [entry.name, entry])),
      vue: vueContract(vueProgram, slug),
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
    const drift = [...vue].flatMap(([name, part]) => {
      const twin = react.get(name);
      return twin ? partDrift(twin, part) : [];
    });
    expect(drift).toEqual([]);
  });

  it('allows only Vue-only API that Vue declares and React lacks', () => {
    const vueOnly = new Set(
      [...contracts.values()].flatMap(({ react, vue }) =>
        [...vue].flatMap(([name, part]) => {
          const reactPart = react.get(name);
          const mapped = reactPart ? mappedNames(reactPart) : new Set<string>();
          return [
            ...part.entry.props.map((prop) => prop.name),
            ...part.slots,
            ...part.events,
          ]
            .filter((api) => !mapped.has(api))
            .map((api) => `${name}.${api}`);
        })
      )
    );
    expect(Object.keys(vueOnlyApi).filter((key) => !vueOnly.has(key))).toEqual(
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
