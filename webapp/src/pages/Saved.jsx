import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import LessonCard from '../components/LessonCard.jsx'
import { EmptyState } from '../components/States.jsx'
import { LessonListSkeleton } from '../components/Skeletons.jsx'
import Paywall from '../components/Paywall.jsx'
import { api } from '../api/client.js'

export default function Saved() {
  const [items, setItems] = useState(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    api
      .getSaved()
      .then(setItems)
      .catch((e) => {
        if (e.paymentRequired) setLocked(true)
        else setItems([])
      })
  }, [])

  return (
    <>
      <PageHeader title="Saqlangan" />
      <div className="page">
        {locked && (
          <Paywall
            title="Saqlangan darsliklar — obuna ostida"
            text="Obuna sotib oling va saqlagan darsliklaringizni cheksiz ko'ring."
          />
        )}
        {!locked && !items && <LessonListSkeleton />}
        {!locked && items && items.length === 0 && (
          <EmptyState
            icon={Heart}
            title="Saqlangan yo'q"
            text="Darslikni ochib 💗 Saqlash ni bosing"
          />
        )}
        {!locked && items &&
          items.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
      </div>
    </>
  )
}
