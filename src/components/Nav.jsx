import { NavLink } from 'react-router-dom'
import { useGraphControls, getContrastBorderClass, getContrastTextClasses } from '../context/GraphControlsContext'

const navLinks = [
  { to: '/', label: 'Parte 1' },
  { to: '/parte2', label: 'Parte 2' },
  { to: '/parte3', label: 'Parte 3' },
  { to: '/parte4', label: 'Parte 4' },
  { to: '/parte5', label: 'Parte 5' },
  { to: '/todas', label: 'Todas' },
  { to: '/about', label: 'Info' },
]

const ControlsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
)

export default function Nav() {
  const { showControls, setShowControls, graphBgColor } = useGraphControls()
  const borderClass = getContrastBorderClass(graphBgColor)
  const textClasses = getContrastTextClasses(graphBgColor)
  return (
    <nav
      className={`border-b-2 ${borderClass}`}
      style={{ backgroundColor: graphBgColor }}
    >
      <div className="flex w-full items-center justify-between px-4 py-3">
        <NavLink
          to="/"
          className={`text-lg font-semibold ${textClasses.active}`}
        >
          spi00
        </NavLink>
        <ul className="flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:opacity-100 ${isActive ? textClasses.active : textClasses.text}`
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
              className={`rounded p-1.5 transition-colors opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 ${textClasses.text} ${showControls ? 'opacity-100' : ''}`}
              title="Controles del grafo"
              aria-label="Controles del grafo"
            >
              <ControlsIcon />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
