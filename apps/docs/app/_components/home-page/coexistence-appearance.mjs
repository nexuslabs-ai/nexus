export function invitationAppearance(library, mode) {
  const mui = library === 'MUI';
  const ant = library === 'Ant Design';
  return {
    mode,
    brandColor: mui ? '#1976d2' : ant ? '#1677ff' : '#171717',
    surfaceTone: 'neutral',
    density: 'default',
    corners: mui ? 'subtle' : 'smooth',
    elevation: 'flat',
    stroke: 'normal',
    prefs: {
      uiFont: mui
        ? 'Roboto, Helvetica, Arial, sans-serif'
        : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      uiFontSize: 14,
    },
  };
}
