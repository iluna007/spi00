import { createContext, useContext, useReducer, useMemo } from 'react'
import { initialState, rootReducer } from './store'

const FluxContext = createContext(null)

export function FluxProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <FluxContext.Provider value={value}>{children}</FluxContext.Provider>
}

export function useFluxDispatch() {
  const ctx = useContext(FluxContext)
  if (!ctx) throw new Error('useFluxDispatch debe usarse dentro de FluxProvider')
  return ctx.dispatch
}

export function useFluxState(selector) {
  const ctx = useContext(FluxContext)
  if (!ctx) throw new Error('useFluxState debe usarse dentro de FluxProvider')
  return selector ? selector(ctx.state) : ctx.state
}
