import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Payment from './pages/Payment.jsx'
import PaymentPlan from './pages/PaymentPlan.jsx'
import PaymentConfirm from './pages/PaymentConfirm.jsx'

// Faqat raqamli ID'larni qabul qiladi
function NumericRoute({ paramName = 'user_id', children }) {
  const params = useParams()
  const value = params[paramName]
  if (!/^\d+$/.test(value || '')) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Bosh sahifa — Telegram WebApp orqali avtomatik user'ni aniqlaydi */}
        <Route path="/" element={<Payment />} />

        {/* pay_web bilan bir xil URL pattern (bot deep-link uchun) */}
        <Route path="/:user_id" element={<NumericRoute><Payment /></NumericRoute>} />
        <Route path="/:user_id/:month_id" element={<NumericRoute><PaymentPlan /></NumericRoute>} />
        <Route
          path="/:user_id/confirm/:transaction_id/:month_id"
          element={<NumericRoute><PaymentConfirm /></NumericRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
