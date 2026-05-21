import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import LessonCard from '../components/LessonCard.jsx'
import { EmptyState, Loader } from '../components/States.jsx'
import { api } from '../api/client.js'

export default function Saved() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    api.getSaved().then(setItems).catch(() => setItems([]))
  }, [])

  return (
    <>
      <PageHeader title="Saqlangan" />
      <div className="page">
        {!items && <Loader />}
        {items && items.length === 0 && (
          <EmptyState
            icon={Heart}
            title="Saqlangan yo'q"
            text="Darslikni ochib 💗 Saqlash ni bosing"
          />
        )}
        {items &&
          items.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
      </div>
    </>
  )
}
