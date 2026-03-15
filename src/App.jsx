import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
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
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/otros" element={<Otros />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
