import type { AcceptedPreview } from './preview/accepted-result';

export function exportAppearance(accepted: AcceptedPreview) {
  return {
    appearance: accepted.state,
    themeCss: accepted.render.appearance.themeCss,
    prefsCss: accepted.render.appearance.prefsCss,
    root: {
      className: accepted.render.appearance.className,
      ...accepted.render.appearance.dataAttrs,
    },
  };
}
