import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Paywall({
  title = "Obuna talab qilinadi",
  text = "Bu kontentni ko'rish uchun obuna sotib oling. Barcha darsliklar bir narxda.",
  cta = "Obuna sotib olish",
}) {
  const navigate = useNavigate()
  return (
    <div className="paywall">
      <span className="paywall-icon"><Lock size={32} /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="watch-btn" onClick={() => navigate('/payment')}>
        {cta}
      </button>
    </div>
  )
}

export function SubscriptionBanner({ subscription }) {
  const navigate = useNavigate()
  if (!subscription) return null
  if (subscription.is_active) return null
  return (
    <button className="sub-banner" onClick={() => navigate('/payment')}>
      <span className="sb-icon"><Lock size={20} /></span>
      <span className="sb-text">
        <span className="sb-title">Obuna sotib oling</span>
        <span className="sb-sub">Darsliklarga to'liq kirish uchun</span>
      </span>
    </button>
  )
}
