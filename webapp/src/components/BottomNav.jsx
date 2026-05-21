import { NavLink } from 'react-router-dom'
import { Heart, HelpCircle, Home, Info, User } from 'lucide-react'

const ITEMS = [
  { to: '/', icon: Home, label: 'Bosh sahifa' },
  { to: '/faq', icon: HelpCircle, label: 'FAQ' },
  { to: '/saved', icon: Heart, label: 'Saqlangan' },
  { to: '/about', icon: Info, label: 'Haqimizda' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        >
          <span className="nav-icon">
            <Icon size={21} />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
