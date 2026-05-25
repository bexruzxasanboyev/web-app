import { useCallback } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useBackButton } from '../hooks/useTelegram.js'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRoot = location.pathname === '/'
  const goBack = useCallback(() => navigate(-1), [navigate])

  useBackButton(!isRoot, goBack)

  return (
    <div className="app">
      <Outlet />
    </div>
  )
}
