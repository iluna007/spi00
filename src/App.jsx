import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Parte1 from './pages/Parte1'
import Parte2 from './pages/Parte2'
import Parte3 from './pages/Parte3'
import Parte4 from './pages/Parte4'
import Parte5 from './pages/Parte5'
import TodasPartes from './pages/TodasPartes'
import About from './pages/About'
import Otros from './pages/Otros'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div
        className="flex w-full min-w-0 flex-col bg-neutral-100"
        style={{ height: '100vh', minHeight: 0 }}
      >
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
            <Route path="/otros" element={<Otros />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
