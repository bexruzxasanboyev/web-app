import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  History,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { payApi } from '../api/payClient.js'
import { getTgUser, haptic } from '../hooks/useTelegram.js'
import { formatDateTime, formatMoney } from '../utils.js'

export default function Payment() {
  const { user_id: urlUserId } = useParams()
  const navigate = useNavigate()
  const tgUser = getTgUser()

  // user_id: URL > Telegram WebApp
  const userId = useMemo(() => {
    if (urlUserId && /^\d+$/.test(urlUserId)) return Number(urlUserId)
    if (tgUser?.id) return Number(tgUser.id)
    return null
  }, [urlUserId, tgUser])

  const [user, setUser] = useState(null)
  const [months, setMonths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setError('Foydalanuvchi aniqlanmadi')
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([payApi.getUser(userId), payApi.listMonths(userId)])
      .then(([u, m]) => {
        setUser(u)
        setMonths(Array.isArray(m) ? m.filter((x) => x.status !== false && x.month_status !== false) : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const isActive = Boolean(user?.user_status)

  const daysRemaining = useMemo(() => {
    if (!user?.deadline) return null
    const diff = new Date(user.deadline).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [user?.deadline])

  if (loading) {
    return (
      <>
        <PageHeader title="Obuna" back />
        <div className="page"><div className="loader"><span className="spinner" /></div></div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader title="Obuna" back />
        <div className="page"><EmptyState title="Xatolik" text={error} /></div>
      </>
    )
  }

  const onPickPlan = (m) => {
    haptic()
    navigate(`/${userId}/${m.id}`)
  }

  const sortedPlans = [...months].sort((a, b) => (a.number || 0) - (b.number || 0))

  return (
    <>
      <PageHeader title="Obuna" back />
      <div className="page">
        <div className="pay-account-card">
          <div className="pa-head">
            <div className="pa-head-info">
              <div className="pa-label">Foydalanuvchi</div>
              <h2 className="pa-name">{user?.name || "Noma'lum"}</h2>
              {user?.phone && <div className="pa-username">{user.phone}</div>}
            </div>
            <div className={'pa-status' + (isActive ? ' pa-status-active' : ' pa-status-inactive')}>
              {isActive ? "Obuna faol" : "Faol emas"}
            </div>
          </div>

          <div className="pa-deadline">
            <div className="pa-label">Obuna muddati</div>
            {isActive && daysRemaining !== null ? (
              <h3 className="pa-days">{daysRemaining} kun</h3>
            ) : (
              <h3 className="pa-days">—</h3>
            )}
            <div className="pa-deadline-sub">
              {user?.deadline
                ? `Tugash sanasi: ${formatDateTime(user.deadline)}`
                : 'Tugash sanasi belgilanmagan'}
            </div>
          </div>

          {isActive && (
            <div className="pa-paid">
              <CheckCircle2 size={16} />
              <span>Faol obuna — to'liq kirish</span>
            </div>
          )}
        </div>

        {!isActive && (
          <div className="pay-hero">
            <span className="pay-hero-icon"><Lock size={26} /></span>
            <h2>Darsliklarga to'liq kirish</h2>
            <p>Tarifni tanlang — karta orqali to'lov qilasiz va obuna shu zahoti faollashadi.</p>
          </div>
        )}

        {sortedPlans.length === 0 ? (
          !isActive && (
            <EmptyState title="Tariflar hozircha yo'q" text="Iltimos, keyinroq qayta urinib ko'ring" />
          )
        ) : (
          <>
            <div className="section-title-row">
              <h2>Tariflar</h2>
              <span className="count-badge">{sortedPlans.length}</span>
            </div>
            <div className="plan-list">
              {sortedPlans.map((m) => (
                <button key={m.id} className="plan-card" onClick={() => onPickPlan(m)}>
                  <div className="plan-info">
                    <div className="plan-name">{m.name || `${m.number || ''} oylik obuna`.trim()}</div>
                    {m.number && <div className="plan-sub">{m.number} oy davomida</div>}
                  </div>
                  <div className="plan-price">{formatMoney(m.money)}</div>
                  <ChevronRight size={16} className="plan-ext" />
                </button>
              ))}
            </div>
            <div className="pay-note">
              <ShieldCheck size={14} /> Karta ma'lumotlari to'lov tizimi tomonida saqlanadi
            </div>
          </>
        )}

        {isActive && (user?.payments?.length ?? 0) > 0 && (
          <button className="pay-menu-card" onClick={() => navigate(`/${userId}/history`)}>
            <span className="pmc-icon"><History size={18} /></span>
            <span className="pmc-text">To'lovlar tarixi</span>
            <ChevronRight size={18} className="pmc-arrow" />
          </button>
        )}
      </div>
    </>
  )
}
