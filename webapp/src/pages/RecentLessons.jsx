import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { ListRowSkeleton } from '../components/Skeletons.jsx'
import Paywall from '../components/Paywall.jsx'
import { api } from '../api/client.js'
import { formatDate } from '../utils.js'

export default function RecentLessons() {
  const [items, setItems] = useState(null)
  const [locked, setLocked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .getRecent()
      .then(setItems)
      .catch((e) => {
        if (e.paymentRequired) setLocked(true)
        else setItems([])
      })
  }, [])

  return (
    <>
      <PageHeader title="Ohirgi ko'rilgan" />
      <div className="page">
        {locked && (
          <Paywall
            title="Tarix — obuna ostida"
            text="Obuna sotib oling va darsliklarni ko'ring."
          />
        )}
        {!locked && !items && <ListRowSkeleton />}
        {!locked && items && items.length === 0 && (
          <EmptyState
            icon={Clock}
            title="Bo'sh"
            text="Siz hali birorta darslik ko'rmadingiz."
          />
        )}
        {!locked && items &&
          items.map((lesson) => (
            <div
              key={lesson.id}
              className="list-row"
              onClick={() => navigate(`/lessons/${lesson.id}`)}
            >
              <span className="invite-icon">
                <Clock size={18} />
              </span>
              <div className="lr-main">
                <div className="lr-title">{lesson.title}</div>
                <div className="lr-sub">{formatDate(lesson.viewed_at)}</div>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
