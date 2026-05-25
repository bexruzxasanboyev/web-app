import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ExternalLink, Lock, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { api } from '../api/client.js'
import { getTgUser, haptic, openLink } from '../hooks/useTelegram.js'

const EXTERNAL_PAY_BASE = 'https://oylikobuna.vercel.app'

function formatMoney(value) {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm"
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function Payment() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [redirecting, setRedirecting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .getPaymentStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
  }, [])

  const refresh = () => {
    setStatus(null)
    setError(null)
    api.getPaymentStatus().then(setStatus).catch((e) => setError(e.message))
  }

  const onPickPlan = (month) => {
    const tgUser = getTgUser()
    const userId = tgUser?.id
    if (!userId) {
      setError("Foydalanuvchi aniqlanmadi. Botni Telegram orqali oching.")
      return
    }
    haptic()
    const url = `${EXTERNAL_PAY_BASE}/${userId}/${month.id}`
    setRedirecting(true)
    openLink(url)
    // Foydalanuvchi tashqi saytda to'lab qaytib kelgach, holat yangilashi uchun
    // 'Holatni yangilash' tugmasi ko'rinadi
  }

  if (error) {
    return (
      <>
        <PageHeader title="To'lov" back />
        <div className="page">
          <EmptyState title="Xatolik" text={error} />
        </div>
      </>
    )
  }

  if (!status) {
    return (
      <>
        <PageHeader title="To'lov" back />
        <div className="page">
          <div className="loader"><span className="spinner" /></div>
        </div>
      </>
    )
  }

  const sub = status.subscription || { is_active: false, deadline: null }
  const months = status.months || []

  if (sub.is_active) {
    return (
      <>
        <PageHeader title="Obuna" back />
        <div className="page">
          <div className="pay-success">
            <span className="pay-success-icon"><CheckCircle2 size={42} /></span>
            <h2>Obuna faol</h2>
            {sub.deadline && (
              <p>Amal qilish muddati: <b>{formatDate(sub.deadline)}</b></p>
            )}
            <button className="watch-btn" onClick={() => navigate('/')}>
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Obuna" back />
      <div className="page">
        <div className="pay-hero">
          <span className="pay-hero-icon"><Lock size={26} /></span>
          <h2>Darsliklarga to'liq kirish</h2>
          <p>Tarifni tanlang — to'lov sahifasi ochiladi. To'lov tugagandan keyin shu yerga qayting va "Holatni yangilash" tugmasini bosing.</p>
        </div>

        {months.length === 0 ? (
          <EmptyState
            title="Tariflar hozircha yo'q"
            text="Iltimos, keyinroq qayta urinib ko'ring"
          />
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
                  disabled={redirecting}
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
                  <ExternalLink size={16} className="plan-ext" />
                </button>
              ))}
            </div>

            {redirecting && (
              <button className="watch-btn" onClick={refresh}>
                Holatni yangilash
              </button>
            )}

            <div className="pay-note">
              <ShieldCheck size={14} /> Karta ma'lumotlari faqat to'lov tizimi
              tomonida saqlanadi
            </div>
          </>
        )}
      </div>
    </>
  )
}
