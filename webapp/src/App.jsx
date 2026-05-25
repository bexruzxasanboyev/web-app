import { Route, Routes } from 'react-router-dom'
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
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/:month_id" element={<PaymentPlan />} />
        <Route path="/payment/confirm/:transaction_id/:month_id" element={<PaymentConfirm />} />
      </Route>
    </Routes>
  )
}
