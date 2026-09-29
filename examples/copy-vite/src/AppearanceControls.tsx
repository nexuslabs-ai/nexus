import { useNexusAppearance } from '~/components/nexus/components/appearance/provider'

import { Button } from '~/components/ui/button'

export function AppearanceControls() {
  const { state, setState } = useNexusAppearance()

  function toggleMode() {
    setState((current) => ({
      ...current,
      mode: current.mode === 'dark' ? 'light' : 'dark',
    }))
  }

  function toggleDensity() {
    setState((current) => ({
      ...current,
      density: current.density === 'compact' ? 'default' : 'compact',
    }))
  }

  return (
    <div className="mt-6 flex gap-2">
      <Button data-probe="appearance-mode" variant="outline" onClick={toggleMode}>
        Nexus mode: {state.mode}
      </Button>
      <Button data-probe="appearance-density" variant="outline" onClick={toggleDensity}>
        Nexus density: {state.density}
      </Button>
    </div>
  )
}
