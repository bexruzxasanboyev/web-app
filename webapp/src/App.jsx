import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import SectionDetail from './pages/SectionDetail.jsx'
import LessonDetail from './pages/LessonDetail.jsx'
import Search from './pages/Search.jsx'
import Faq from './pages/Faq.jsx'
import Saved from './pages/Saved.jsx'
import About from './pages/About.jsx'
import Profile from './pages/Profile.jsx'
import RecentLessons from './pages/RecentLessons.jsx'
import Referrals from './pages/Referrals.jsx'
import Payment from './pages/Payment.jsx'
import PaymentPlan from './pages/PaymentPlan.jsx'
import PaymentConfirm from './pages/PaymentConfirm.jsx'

// Faqat raqamli ID'larni pay sahifalariga o'tkazadi (static route'lar bilan to'qnashmasin)
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
        {/* Darsliklar (asosiy bo'limlar) */}
        <Route path="/" element={<Home />} />
        <Route path="/sections/:id" element={<SectionDetail />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recent" element={<RecentLessons />} />
        <Route path="/referrals" element={<Referrals />} />

        {/* To'lov (minds API ga to'g'ridan-to'g'ri) */}
        <Route path="/payment" element={<Payment />} />
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
