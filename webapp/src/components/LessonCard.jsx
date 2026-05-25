import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MENTOR_DEFAULT = 'Dilrabo Isroilova'

export default function LessonCard({ lesson, index = 0 }) {
  const navigate = useNavigate()
  const mentor = lesson.mentor || MENTOR_DEFAULT
  const num = lesson.position || index + 1

  return (
    <div className="lesson-row" onClick={() => navigate(`/lessons/${lesson.id}`)}>
      <div className="lr-thumb">
        {lesson.image_url && <img src={lesson.image_url} alt="" />}
        <span className="lr-shimmer" aria-hidden="true" />
        <svg className="lr-diamond" viewBox="0 0 24 28" aria-hidden="true">
          <defs>
            <linearGradient id={`lrDG-${lesson.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff6d8" />
              <stop offset="50%" stopColor="#f5d77a" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
          <polygon points="6,1 18,1 23,8 12,27 1,8" fill={`url(#lrDG-${lesson.id})`} stroke="rgba(255,215,100,0.5)" strokeWidth="0.4" />
          <line x1="6" y1="1" x2="12" y2="27" stroke="rgba(0,0,0,0.2)" strokeWidth="0.3" />
          <line x1="18" y1="1" x2="12" y2="27" stroke="rgba(0,0,0,0.2)" strokeWidth="0.3" />
          <line x1="1" y1="8" x2="23" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
        </svg>
      </div>
      <div className="lr-body">
        <div className="lr-label">
          DARSLIK {num}
          {lesson.is_new && <span className="lr-new">YANGI</span>}
        </div>
        <div className="lr-title">{lesson.title}</div>
        <div className="lr-mentor">Mentor: {mentor}</div>
      </div>
      <ChevronRight className="lr-chev" size={18} />
    </div>
  )
}
