import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import LessonCard from '../components/LessonCard.jsx'
import { EmptyState } from '../components/States.jsx'
import { SectionDetailSkeleton } from '../components/Skeletons.jsx'
import { api } from '../api/client.js'

export default function SectionDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setData(null)
    setError(null)
    api.getSection(id).then(setData).catch((e) => setError(e.message))
  }, [id])

  return (
    <>
      <PageHeader title={data?.title || 'Bo\'lim'} back />
      <div className="page">
        {error && <EmptyState title="Xatolik" text={error} />}
        {!data && !error && <SectionDetailSkeleton />}
        {data && (
          <>
            <div className="section-hero-card">
              <span className="shc-glow" aria-hidden="true" />
              <h2>{data.title}</h2>
              <p>{data.lessons.length} ta darslik</p>
            </div>

            {data.lessons.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Darsliklar yo'q"
                text="Bu bo'limga hali darslik qo'shilmagan."
              />
            ) : (
              <div className="lesson-list">
                {data.lessons.map((lesson, i) => (
                  <LessonCard key={lesson.id} lesson={lesson} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
