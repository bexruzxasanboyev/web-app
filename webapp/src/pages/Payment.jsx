import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  History,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { api } from '../api/client.js'
import { getTgUser, haptic } from '../hooks/useTelegram.js'
import { formatDateTime, formatMoney } from '../utils.js'

export default function Payment() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const tgUser = getTgUser()

  useEffect(() => {
    api
      .getPaymentStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
  }, [])

  const sub = status?.subscription || { is_active: false, deadline: null }
  const months = status?.months || []

  const daysRemaining = useMemo(() => {
    if (!sub.deadline) return null
    const diff = new Date(sub.deadline).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [sub.deadline])

  const name =
    [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ') ||
    "Foydalanuvchi"

  if (error) {
    return (
      <>
        <PageHeader title="Obuna" back />
        <div className="page">
          <EmptyState title="Xatolik" text={error} />
        </div>
      </>
    )
  }

  if (!status) {
    return (
      <>
        <PageHeader title="Obuna" back />
        <div className="page">
          <div className="loader"><span className="spinner" /></div>
        </div>
      </>
    )
  }

  const onPickPlan = (m) => {
    haptic()
    navigate(`/payment/${m.id}`)
  }

  return (
    <>
      <PageHeader title="Obuna" back />
      <div className="page">
        <div className="pay-account-card">
          <div className="pa-head">
            <div className="pa-head-info">
              <div className="pa-label">Foydalanuvchi</div>
              <h2 className="pa-name">{name}</h2>
              {tgUser?.username && (
                <div className="pa-username">@{tgUser.username}</div>
              )}
            </div>
            <div
              className={
                'pa-status' + (sub.is_active ? ' pa-status-active' : ' pa-status-inactive')
              }
            >
              {sub.is_active ? "Obuna faol" : 'Faol emas'}
            </div>
          </div>

          <div className="pa-deadline">
            <div className="pa-label">Obuna muddati</div>
            {sub.is_active && daysRemaining !== null ? (
              <h3 className="pa-days">{daysRemaining} kun</h3>
            ) : (
              <h3 className="pa-days">{sub.is_active ? 'Muddatsiz' : '—'}</h3>
            )}
            <div className="pa-deadline-sub">
              {sub.deadline
                ? `Tugash sanasi: ${formatDateTime(sub.deadline)}`
                : 'Tugash sanasi belgilanmagan'}
            </div>
          </div>

          {sub.is_active && (
            <div className="pa-paid">
              <CheckCircle2 size={16} />
              <span>Faol obuna — to'liq kirish</span>
            </div>
          )}
        </div>

        {!sub.is_active && (
          <div className="pay-hero">
            <span className="pay-hero-icon"><Lock size={26} /></span>
            <h2>Darsliklarga to'liq kirish</h2>
            <p>Tarifni tanlang — karta orqali to'lov qilasiz va obuna shu zahoti faollashadi.</p>
          </div>
        )}

        {months.length === 0 ? (
          !sub.is_active && (
            <EmptyState
              title="Tariflar hozircha yo'q"
              text="Iltimos, keyinroq qayta urinib ko'ring"
            />
          )
        ) : (
          <>
            <div className="section-title-row">
              <h2>Tariflar</h2>
              <span className="count-badge">{months.length}</span>
            </div>
            <div className="plan-list">
              {months.map((m) => (
                <button
                  key={m.id}
                  className="plan-card"
                  onClick={() => onPickPlan(m)}
                >
                  <div className="plan-info">
                    <div className="plan-name">
                      {m.name || `${m.number || ''} oylik obuna`.trim()}
                    </div>
                    {m.number && (
                      <div className="plan-sub">{m.number} oy davomida</div>
                    )}
                  </div>
                  <div className="plan-price">{formatMoney(m.money)}</div>
                  <ChevronRight size={16} className="plan-ext" />
                </button>
              ))}
            </div>

            <div className="pay-note">
              <ShieldCheck size={14} /> Karta ma'lumotlari to'lov tizimi
              tomonida saqlanadi
            </div>
          </>
        )}

        {sub.is_active && (
          <button
            className="pay-menu-card"
            onClick={() => navigate('/recent')}
          >
            <span className="pmc-icon"><History size={18} /></span>
            <span className="pmc-text">To'lovlar tarixi</span>
            <ChevronRight size={18} className="pmc-arrow" />
          </button>
        )}
      </div>
    </>
  )
}
