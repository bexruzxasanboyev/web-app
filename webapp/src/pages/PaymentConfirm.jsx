import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { payApi } from '../api/payClient.js'
import { getTgUser, haptic } from '../hooks/useTelegram.js'

const CODE_LEN = 6

export default function PaymentConfirm() {
  const { user_id: urlUserId, transaction_id, month_id } = useParams()
  const navigate = useNavigate()
  const tgUser = getTgUser()

  const userId = useMemo(() => {
    if (urlUserId && /^\d+$/.test(urlUserId)) return Number(urlUserId)
    if (tgUser?.id) return Number(tgUser.id)
    return null
  }, [urlUserId, tgUser])

  const [code, setCode] = useState(Array(CODE_LEN).fill(''))
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(120)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const inputsRef = useRef([])

  useEffect(() => { inputsRef.current[0]?.focus() }, [])

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleChange = (i, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < CODE_LEN - 1) inputsRef.current[i + 1]?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputsRef.current[i - 1]?.focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LEN)
    if (!pasted) return
    const next = Array(CODE_LEN).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setCode(next)
    inputsRef.current[Math.min(pasted.length, CODE_LEN - 1)]?.focus()
  }

  const isComplete = code.every((d) => d !== '')

  const onConfirm = async () => {
    if (!isComplete || submitting || !userId) return
    haptic()
    setSubmitting(true)
    setError(null)
    try {
      await payApi.confirmCard({
        user_id: userId,
        month: Number(month_id),
        transaction_id: Number(transaction_id),
        code: code.join(''),
      })
      setSuccess(true)
      haptic('success')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const onResend = async () => {
    if (resendTimer > 0 || resending || !userId) return
    setResending(true)
    setError(null)
    try {
      const res = await payApi.addCard({
        user_id: userId,
        month: Number(month_id),
        card_number: '',
        expiry_month: '',
        expiry_year: '',
      })
      const txId = res?.transaction_id || res?.id
      if (txId) navigate(`/${userId}/confirm/${txId}/${month_id}`, { replace: true })
      setResendTimer(120)
      setCode(Array(CODE_LEN).fill(''))
      inputsRef.current[0]?.focus()
    } catch (e) {
      setError(e.message)
    } finally {
      setResending(false)
    }
  }

  const fmtTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (success) {
    return (
      <>
        <PageHeader title="To'lov" />
        <div className="page">
          <div className="pay-success">
            <span className="pay-success-icon"><CheckCircle2 size={42} /></span>
            <h2>Obuna faollashdi</h2>
            <p>To'lov muvaffaqiyatli tasdiqlandi. Darsliklarga to'liq kirish ochildi.</p>
            <button className="watch-btn" onClick={() => navigate('/')}>
              Darsliklarga o'tish
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Tasdiqlash" back />
      <div className="page">
        <div className="pay-form">
          <div className="pay-hero">
            <span className="pay-hero-icon"><ShieldCheck size={26} /></span>
            <h2>SMS-kodni kiriting</h2>
            <p>Karta egasi raqamiga {CODE_LEN} xonali tasdiqlash kodi yuborildi.</p>
          </div>

          <div className="otp-row" onPaste={handlePaste}>
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                className="otp-input"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          {error && <div className="pay-error">{error}</div>}

          <button
            className="watch-btn"
            style={{ marginTop: 20, width: '100%' }}
            disabled={!isComplete || submitting}
            onClick={onConfirm}
          >
            {submitting ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
          </button>

          <button
            className="pay-back"
            onClick={onResend}
            disabled={resendTimer > 0 || resending}
            style={{ background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}
          >
            {resendTimer > 0
              ? `Kodni qayta yuborish (${fmtTimer(resendTimer)})`
              : resending ? 'Yuborilmoqda...' : 'Kodni qayta yuborish'}
          </button>
        </div>
      </div>
    </>
  )
}
