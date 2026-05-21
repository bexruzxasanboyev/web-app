import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import LessonCard from '../components/LessonCard.jsx'
import { EmptyState, Loader } from '../components/States.jsx'
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
      <PageHeader title="Prisma" />
      <div className="page">
        {error && <EmptyState title="Xatolik" text={error} />}
        {!data && !error && <Loader />}
        {data && (
          <>
            <div className="section-title-row">
              <h2>{data.title}</h2>
              <span className="count-badge">{data.lessons.length}</span>
            </div>
            {data.lessons.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Darsliklar yo'q"
                text="Bu bo'limga hali darslik qo'shilmagan."
              />
            ) : (
              data.lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))
            )}
          </>
        )}
      </div>
    </>
  )
}
