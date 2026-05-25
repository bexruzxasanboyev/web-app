import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { api } from '../api/client.js'
import { haptic } from '../hooks/useTelegram.js'
import {
  formatCardNumber,
  formatExpiry,
  formatMoney,
  normalizeDigits,
} from '../utils.js'

export default function PaymentPlan() {
  const { month_id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getPaymentStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
  }, [])

  const plan = useMemo(() => {
    if (!status) return null
    const monthIdNum = Number(month_id)
    return (status.months || []).find((m) => m.id === monthIdNum) || null
  }, [status, month_id])

  const canSubmit =
    !submitting &&
    plan &&
    normalizeDigits(cardNumber).length === 16 &&
    expiry.length === 5

  const onSubmit = async () => {
    if (!canSubmit) return
    haptic()
    const [mm, yy] = expiry.split('/')
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.addCard({
        month: plan.id,
        card_number: normalizeDigits(cardNumber),
        expiry_month: mm,
        expiry_year: yy,
      })
      navigate(`/payment/confirm/${res.transaction_id}/${plan.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !status) {
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

  if (!plan) {
    return (
      <>
        <PageHeader title="To'lov" back />
        <div className="page">
          <EmptyState
            title="Tarif topilmadi"
            text="Ushbu tarif mavjud emas yoki olib tashlangan"
          />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="To'lov" back />
      <div className="page">
        <div className="pay-form">
          <div className="pay-selected">
            <div className="ps-row">
              <span>{plan.name || `${plan.number || ''} oylik obuna`.trim()}</span>
              <b>{formatMoney(plan.money)}</b>
            </div>
            <span className="ps-change" onClick={() => navigate('/payment')}>
              O'zgartirish
            </span>
          </div>

          <label className="pay-label">Karta raqami</label>
          <div className="pay-input-wrap">
            <CreditCard size={18} />
            <input
              className="pay-input"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            />
          </div>

          <label className="pay-label">Amal qilish muddati</label>
          <input
            className="pay-input solo"
            inputMode="numeric"
            placeholder="MM/YY"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            style={{ maxWidth: 150 }}
          />

          {error && <div className="pay-error">{error}</div>}

          <button
            className="watch-btn"
            style={{ marginTop: 20, width: '100%' }}
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {submitting ? 'Yuborilmoqda...' : "Obuna bo'lish"}
          </button>

          <div className="pay-note">
            <ShieldCheck size={14} /> To'lov xavfsiz tarzda amalga oshiriladi
          </div>
        </div>
      </div>
    </>
  )
}
