import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search as SearchIcon, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import BannerCarousel from '../components/BannerCarousel.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { EmptyState } from '../components/States.jsx'
import { HomeSkeleton } from '../components/Skeletons.jsx'
import { api } from '../api/client.js'
import { haptic, shareReferral } from '../hooks/useTelegram.js'

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getHome().then(setData).catch((e) => setError(e.message))
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q.length >= 2) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <>
      <PageHeader title="Prisma" />
      <div className="page">
        {error && <EmptyState title="Xatolik yuz berdi" text={error} />}
        {!data && !error && <HomeSkeleton />}
        {data && (
          <form className="search-bar" onSubmit={onSearch}>
            <SearchIcon size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidirish..."
            />
          </form>
        )}

        {data && (
          <>
            <BannerCarousel banners={data.banners} />

            <div
              className="invite-card"
              onClick={() => {
                haptic()
                shareReferral(data.referral_link)
              }}
            >
              <span className="invite-icon">
                <Users size={20} />
              </span>
              <span className="invite-text">Do'stingizni taklif qiling</span>
              <ChevronRight size={20} className="chev" />
            </div>

            <div className="section-title-row">
              <h2>Bo'limlar</h2>
              <span className="count-badge">{data.section_count}</span>
            </div>
            <div className="section-grid">
              {data.sections.map((section, i) => (
                <SectionCard key={section.id} section={section} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
