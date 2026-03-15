import { NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Parte 1' },
  { to: '/parte2', label: 'Parte 2' },
  { to: '/parte3', label: 'Parte 3' },
  { to: '/parte4', label: 'Parte 4' },
  { to: '/parte5', label: 'Parte 5' },
  { to: '/todas', label: 'Todas' },
  { to: '/about', label: 'About' },
  { to: '/otros', label: 'Otros' },
]

export default function Nav() {
  return (
    <nav className="border-b border-neutral-200 bg-neutral-50">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <NavLink
          to="/"
          className="text-lg font-semibold text-neutral-900"
        >
          spi00
        </NavLink>
        <ul className="flex gap-6">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors text-neutral-600 hover:text-neutral-900 ${
                    isActive ? 'text-neutral-900' : ''
                  }`
                }
                end={to === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
