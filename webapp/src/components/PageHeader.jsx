import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, back = false }) {
  const navigate = useNavigate()
  return (
    <header className={'page-header' + (back ? ' has-back' : '')}>
      {back && (
        <button
          className="ph-back"
          onClick={() => navigate(-1)}
          aria-label="Orqaga"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1>{title}</h1>
    </header>
  )
}
