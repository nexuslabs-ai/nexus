import {
  applyNxdsAppearance,
  DEFAULT_NXDS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  type NxdsAppearanceCookieOptions,
  type NxdsAppearanceState,
  type NxdsResolvedAppearanceMode,
  persistNxdsAppearance,
  prefersDarkColorScheme,
  readStoredNxdsAppearance,
  removeNxdsAppearance,
  resolveNxdsAppearanceMode,
  sanitizeNxdsAppearance,
  watchColorScheme,
} from '@nxds/core';
import {
  type App,
  computed,
  type ComputedRef,
  effectScope,
  inject,
  type InjectionKey,
  onScopeDispose,
  type Plugin,
  readonly,
  type Ref,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';

export interface NxdsAppearanceOptions {
  /**
   * localStorage key for the saved appearance. The head script reads it before
   * first paint and the plugin after mount, overriding `defaultState`.
   * Pass `false` to turn it off.
   */
  storageKey?: string | false;
  /**
   * Cookie the plugin writes so your server can render the saved appearance.
   * The client never reads it.
   */
  cookieWriteKey?: string | false;
  cookieOptions?: NxdsAppearanceCookieOptions;
  /**
   * The appearance to show, held in a ref you own. With it, the plugin reads
   * and saves nothing, and `setState` only calls `onStateChange`.
   */
  state?: Readonly<Ref<NxdsAppearanceState>>;
  defaultState?: NxdsAppearanceState;
  /** Called with the next appearance on every `setState`. */
  onStateChange?: (state: NxdsAppearanceState) => void;
}

export interface NxdsAppearance {
  state: Readonly<Ref<NxdsAppearanceState>>;
  resolvedMode: ComputedRef<NxdsResolvedAppearanceMode>;
  /** `true` once the app has mounted and the saved appearance is loaded. */
  mounted: Readonly<Ref<boolean>>;
  setState: (
    update:
      | NxdsAppearanceState
      | ((previous: NxdsAppearanceState) => NxdsAppearanceState)
  ) => void;
  reset: () => void;
}

const NxdsAppearanceKey: InjectionKey<NxdsAppearance> =
  Symbol('nxds-appearance');

/**
 * Vue plugin that runs the nxds theme engine for the whole app.
 * Until the app mounts it provides `defaultState` and leaves the page alone,
 * so server and client render the same markup. The head script covers first
 * paint. After mount it loads the saved appearance and applies it.
 */
export function createNxdsAppearance({
  storageKey = DEFAULT_STORAGE_KEY,
  cookieWriteKey = false,
  cookieOptions,
  state: controlledState,
  defaultState = DEFAULT_NXDS_APPEARANCE,
  onStateChange,
}: NxdsAppearanceOptions = {}): Plugin {
  return {
    install(app: App) {
      const isControlled = controlledState !== undefined;
      const initialState = sanitizeNxdsAppearance(defaultState);
      const internalState = shallowRef(initialState);
      const state = computed(
        () => controlledState?.value ?? internalState.value
      );
      const systemDark = ref(false);
      const mounted = ref(false);
      const scope = effectScope(true);

      const setState: NxdsAppearance['setState'] = (update) => {
        const next = sanitizeNxdsAppearance(
          typeof update === 'function' ? update(state.value) : update
        );
        if (!isControlled) internalState.value = next;
        onStateChange?.(next);
      };

      app.provide(NxdsAppearanceKey, {
        state,
        resolvedMode: computed(() =>
          resolveNxdsAppearanceMode(state.value.mode, systemDark.value)
        ),
        mounted: readonly(mounted),
        setState,
        reset: () => setState(initialState),
      });

      const mount = app.mount;
      app.mount = (...args) => {
        const root = mount(...args);
        if (mounted.value) return root;

        if (!isControlled) {
          internalState.value = readStoredNxdsAppearance(
            storageKey,
            internalState.value
          );
        }
        mounted.value = true;
        scope.run(() => {
          const syncSystemDark = () =>
            (systemDark.value = prefersDarkColorScheme());
          syncSystemDark();
          onScopeDispose(watchColorScheme(syncSystemDark));
          watchEffect(() => applyNxdsAppearance(state.value, systemDark.value));
          if (isControlled) return;
          watchEffect(() =>
            persistNxdsAppearance(state.value, {
              storageKey,
              cookieWriteKey,
              cookieOptions,
            })
          );
        });

        return root;
      };

      app.onUnmount(() => {
        scope.stop();
        removeNxdsAppearance();
      });
    },
  };
}

/** The appearance installed by `createNxdsAppearance()`. */
export function useNxdsAppearance(): NxdsAppearance {
  const appearance = inject(NxdsAppearanceKey);
  if (!appearance) {
    throw new Error('useNxdsAppearance needs app.use(createNxdsAppearance())');
  }
  return appearance;
}
