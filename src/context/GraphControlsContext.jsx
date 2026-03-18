import { createContext, useContext } from 'react'
import { useFluxState, useFluxDispatch } from '../state/FluxProvider'
import { DEFAULT_GRAPH_BG } from '../utils/contrast'

const GraphControlsContext = createContext(null)

export function GraphControlsProvider({ children }) {
  const showControls = useFluxState((s) => s.ui.showControls)
  const graphBgColor = useFluxState((s) => s.ui.graphBgColor)
  const dispatch = useFluxDispatch()
  const setShowControls = (vOrUpdater) => {
    const next = typeof vOrUpdater === 'function' ? vOrUpdater(showControls) : vOrUpdater
    dispatch({ type: 'UI/SET_SHOW_CONTROLS', payload: next })
  }
  const setGraphBgColor = (vOrUpdater) => {
    const next = typeof vOrUpdater === 'function' ? vOrUpdater(graphBgColor) : vOrUpdater
    dispatch({ type: 'UI/SET_GRAPH_BG_COLOR', payload: next })
  }
  return (
    <GraphControlsContext.Provider
      value={{ showControls, setShowControls, graphBgColor, setGraphBgColor }}
    >
      {children}
    </GraphControlsContext.Provider>
  )
}

export function useGraphControls() {
  const ctx = useContext(GraphControlsContext)
  return ctx ?? {
    showControls: false,
    setShowControls: () => {},
    graphBgColor: DEFAULT_GRAPH_BG,
    setGraphBgColor: () => {},
  }
}
