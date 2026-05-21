import { useNavigate } from 'react-router-dom'
import { formatDate } from '../utils.js'

export default function LessonCard({ lesson }) {
  const navigate = useNavigate()
  return (
    <div
      className="lesson-card"
      onClick={() => navigate(`/lessons/${lesson.id}`)}
    >
      <div className="lc-img">
        {lesson.image_url && <img src={lesson.image_url} alt="" />}
        {lesson.is_new && <span className="lc-new">YANGI</span>}
      </div>
      <div className="lc-body">
        <div className="lc-title">{lesson.title}</div>
        {lesson.published_at && (
          <div className="lc-date">{formatDate(lesson.published_at)}</div>
        )}
      </div>
    </div>
  )
}
