import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { payApi } from '../api/payClient.js'
import { getTgUser, haptic } from '../hooks/useTelegram.js'
import {
  formatCardNumber,
  formatExpiry,
  formatMoney,
  normalizeDigits,
} from '../utils.js'

export default function PaymentPlan() {
  const { user_id: urlUserId, month_id } = useParams()
  const navigate = useNavigate()
  const tgUser = getTgUser()

  const userId = useMemo(() => {
    if (urlUserId && /^\d+$/.test(urlUserId)) return Number(urlUserId)
    if (tgUser?.id) return Number(tgUser.id)
    return null
  }, [urlUserId, tgUser])

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!userId || !month_id) {
      setError('Foydalanuvchi yoki tarif topilmadi')
      setLoading(false)
      return
    }
    setLoading(true)
    payApi
      .getMonth(userId, Number(month_id))
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId, month_id])

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
      const res = await payApi.addCard({
        user_id: userId,
        month: Number(month_id),
        card_number: normalizeDigits(cardNumber),
        expiry_month: mm,
        expiry_year: yy,
      })
      const txId = res?.transaction_id || res?.id
      if (!txId) throw new Error("Transaction ID qaytmadi")
      navigate(`/${userId}/confirm/${txId}/${month_id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="To'lov" back />
        <div className="page"><div className="loader"><span className="spinner" /></div></div>
      </>
    )
  }

  if (!plan) {
    return (
      <>
        <PageHeader title="To'lov" back />
        <div className="page">
          <EmptyState title="Tarif topilmadi" text={error || "Ushbu tarif mavjud emas"} />
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
            <span className="ps-change" onClick={() => navigate(`/${userId}`)}>
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
