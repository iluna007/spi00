import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useGraphControls } from '../context/GraphControlsContext'
import { getContrastBorderClass, getContrastTextClasses } from '../utils/contrast'

const navLinks = [
  { to: '/', label: 'Parte 1- De Dios' },
  { to: '/parte2', label: 'Parte 2- De la naturaleza y el origen del alma' },
  { to: '/parte3', label: 'Parte 3- De los Afectos' },
  { to: '/parte4', label: 'Parte 4- De la Servidumbre' },
  { to: '/parte5', label: 'Parte 5- De la Libertad' },
 // { to: '/todas', label: 'Todas' },
  { to: '/about', label: 'Info' },
]

const ControlsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
)

const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { showControls, setShowControls, graphBgColor } = useGraphControls()
  const borderClass = getContrastBorderClass(graphBgColor)
  const textClasses = getContrastTextClasses(graphBgColor)

  const linkClass = ({ isActive }) =>
    `block min-h-[44px] flex items-center px-4 py-3 text-sm font-medium transition-colors border-b border-current border-opacity-10 last:border-0 ${isActive ? textClasses.active : textClasses.text}`

  return (
    <nav
      className={`shrink-0 border-b-2 ${borderClass}`}
      style={{ backgroundColor: graphBgColor }}
    >
      <div className="flex w-full items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
        <NavLink
          to="/"
          className={`min-h-[44px] flex items-center text-base font-semibold sm:text-lg ${textClasses.active}`}
          onClick={() => setMenuOpen(false)}
        >
          Spi00
        </NavLink>
        {/* Desktop: links + controls */}
        <ul className="hidden items-center gap-4 md:flex lg:gap-6">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `min-h-[44px] flex items-center px-1 text-sm font-medium transition-colors hover:opacity-100 ${isActive ? textClasses.active : textClasses.text}`
                }
                end={to === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setShowControls((v) => !v)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1.5 transition-colors opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 ${textClasses.text} ${showControls ? 'opacity-100' : ''}`}
              title="Controles del grafo"
              aria-label="Controles del grafo"
            >
              <ControlsIcon />
            </button>
          </li>
        </ul>
        {/* Mobile: hamburger + controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-2 ${textClasses.text}`}
            aria-label="Controles del grafo"
          >
            <ControlsIcon />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-2 ${textClasses.text}`}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className={`border-t-2 ${borderClass} md:hidden`}
          style={{ backgroundColor: graphBgColor }}
        >
          <ul className="py-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass} end={to === '/'} onClick={() => setMenuOpen(false)}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
