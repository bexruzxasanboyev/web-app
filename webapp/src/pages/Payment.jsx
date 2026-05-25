import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, CreditCard, Lock, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { api } from '../api/client.js'
import { haptic } from '../hooks/useTelegram.js'

const STEP_PLAN = 'plan'
const STEP_CARD = 'card'
const STEP_CODE = 'code'
const STEP_DONE = 'done'

function formatMoney(value) {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm"
}

function formatCard(raw) {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
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
  const [step, setStep] = useState(STEP_PLAN)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [code, setCode] = useState('')
  const [transactionId, setTransactionId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .getPaymentStatus()
      .then((data) => {
        setStatus(data)
        if (data?.subscription?.is_active) setStep(STEP_DONE)
      })
      .catch((e) => setError(e.message))
  }, [])

  const onPickPlan = (month) => {
    haptic()
    setSelectedMonth(month)
    setFormError(null)
    setStep(STEP_CARD)
  }

  const onSubmitCard = async (e) => {
    e.preventDefault()
    if (busy || !selectedMonth) return
    const digits = cardNumber.replace(/\s/g, '')
    if (digits.length < 16) {
      setFormError("Karta raqami 16 ta raqamdan iborat bo'lishi kerak")
      return
    }
    const [mm, yy] = expiry.split('/')
    if (!mm || !yy || mm.length !== 2 || yy.length !== 2) {
      setFormError("Karta amal qilish muddati MM/YY shaklida bo'lsin")
      return
    }
    setBusy(true)
    setFormError(null)
    try {
      const res = await api.addCard({
        month: selectedMonth.id,
        card_number: digits,
        expiry_year: yy,
        expiry_month: mm,
      })
      setTransactionId(res.transaction_id)
      haptic('medium')
      setStep(STEP_CODE)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onSubmitCode = async (e) => {
    e.preventDefault()
    if (busy || !selectedMonth || !transactionId) return
    if (code.trim().length < 4) {
      setFormError("Tasdiq kodini to'liq kiriting")
      return
    }
    setBusy(true)
    setFormError(null)
    try {
      const res = await api.confirmCard({
        month: selectedMonth.id,
        transaction_id: transactionId,
        code: code.trim(),
      })
      haptic('success')
      setStatus((prev) => ({ ...(prev || {}), subscription: res.subscription }))
      setStep(STEP_DONE)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
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

  return (
    <>
      <PageHeader title="Obuna" back />
      <div className="page">
        {step === STEP_DONE && (
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
        )}

        {step === STEP_PLAN && (
          <>
            <div className="pay-hero">
              <span className="pay-hero-icon"><Lock size={26} /></span>
              <h2>Darsliklarga to'liq kirish</h2>
              <p>Obuna sotib oling va barcha bo'limlardagi darsliklarni cheksiz ko'ring</p>
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
                    </button>
                  ))}
                </div>
                <div className="pay-note">
                  <ShieldCheck size={14} /> To'lov ma'lumotlari xavfsiz, faqat
                  bank tomonida saqlanadi
                </div>
              </>
            )}
          </>
        )}

        {step === STEP_CARD && selectedMonth && (
          <form className="pay-form" onSubmit={onSubmitCard}>
            <div className="pay-selected">
              <div className="ps-row">
                <span>{selectedMonth.name || `${selectedMonth.number} oylik`}</span>
                <b>{formatMoney(selectedMonth.money)}</b>
              </div>
              <button
                type="button"
                className="ps-change"
                onClick={() => { setStep(STEP_PLAN); setFormError(null) }}
              >
                O'zgartirish
              </button>
            </div>

            <label className="pay-label">Karta raqami</label>
            <div className="pay-input-wrap">
              <CreditCard size={18} />
              <input
                className="pay-input"
                inputMode="numeric"
                placeholder="8600 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                maxLength={19}
                autoFocus
              />
            </div>

            <label className="pay-label">Amal qilish muddati</label>
            <input
              className="pay-input solo"
              inputMode="numeric"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                setExpiry(v)
              }}
              maxLength={5}
            />

            {formError && <div className="pay-error">{formError}</div>}

            <button className="watch-btn" type="submit" disabled={busy}>
              {busy ? 'Yuborilmoqda...' : "Tasdiq kodini olish"}
            </button>
            <div className="pay-note">
              <ShieldCheck size={14} /> Karta ma'lumotlari faqat to'lov tizimi
              tomonida saqlanadi
            </div>
          </form>
        )}

        {step === STEP_CODE && selectedMonth && (
          <form className="pay-form" onSubmit={onSubmitCode}>
            <div className="pay-hero">
              <span className="pay-hero-icon"><ShieldCheck size={26} /></span>
              <h2>Tasdiq kodi</h2>
              <p>Karta egasining telefon raqamiga yuborilgan kodni kiriting</p>
            </div>

            <input
              className="pay-input solo pay-code"
              inputMode="numeric"
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
            />

            {formError && <div className="pay-error">{formError}</div>}

            <button className="watch-btn" type="submit" disabled={busy}>
              {busy ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>

            <button
              type="button"
              className="pay-back"
              onClick={() => { setStep(STEP_CARD); setFormError(null); setCode('') }}
            >
              Karta ma'lumotlarini o'zgartirish
            </button>
          </form>
        )}
      </div>
    </>
  )
}
