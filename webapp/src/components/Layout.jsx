import { useCallback } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import { useBackButton } from '../hooks/useTelegram.js'

const MAIN_ROUTES = ['/', '/faq', '/saved', '/about', '/profile']

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMain = MAIN_ROUTES.includes(location.pathname)
  const goBack = useCallback(() => navigate(-1), [navigate])

  useBackButton(!isMain, goBack)

  return (
    <div className="app">
      <Outlet />
      <BottomNav />
    </div>
  )
}
