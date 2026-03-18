import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useFluxDispatch } from './state/FluxProvider'
import { GraphControlsProvider, useGraphControls } from './context/GraphControlsContext'
import { getContrastBorderClass } from './utils/contrast'
import Nav from './components/Nav'
import Parte1 from './pages/Parte1'
import Parte2 from './pages/Parte2'
import Parte3 from './pages/Parte3'
import Parte4 from './pages/Parte4'
import Parte5 from './pages/Parte5'
import TodasPartes from './pages/TodasPartes'
import About from './pages/About'
import './App.css'

function RoutingSync() {
  const { pathname } = useLocation()
  const dispatch = useFluxDispatch()
  useEffect(() => {
    dispatch({ type: 'ROUTING/NAVIGATE', payload: pathname })
  }, [pathname, dispatch])
  return null
}

function AppContent() {
  const { graphBgColor } = useGraphControls()
  const borderClass = getContrastBorderClass(graphBgColor)
  return (
    <div
      className={`flex w-full min-w-0 flex-col border-2 ${borderClass}`}
      style={{ height: '100vh', minHeight: 0, backgroundColor: graphBgColor }}
    >
      <RoutingSync />
      <Nav />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <Routes>
          <Route path="/" element={<Parte1 />} />
          <Route path="/parte1" element={<Parte1 />} />
          <Route path="/parte2" element={<Parte2 />} />
          <Route path="/parte3" element={<Parte3 />} />
          <Route path="/parte4" element={<Parte4 />} />
          <Route path="/parte5" element={<Parte5 />} />
          <Route path="/todas" element={<TodasPartes />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <GraphControlsProvider>
        <AppContent />
      </GraphControlsProvider>
    </BrowserRouter>
  )
}

export default App
