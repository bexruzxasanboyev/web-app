import { useNavigate } from 'react-router-dom'

export default function SectionCard({ section }) {
  const navigate = useNavigate()
  return (
    <div
      className="section-card"
      onClick={() => navigate(`/sections/${section.id}`)}
    >
      {section.image_url && <img src={section.image_url} alt="" />}
      <span className="sc-badge">{section.lesson_count}</span>
      <div className="sc-overlay">
        <span className="sc-title">{section.title}</span>
      </div>
    </div>
  )
}
