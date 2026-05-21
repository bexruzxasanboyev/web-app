import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import LessonCard from '../components/LessonCard.jsx'
import { EmptyState, Loader } from '../components/States.jsx'
import { api } from '../api/client.js'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = (params.get('q') || '').trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    api
      .search(q)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [params])

  const submit = (e) => {
    e.preventDefault()
    const q = query.trim()
    setParams(q ? { q } : {})
  }

  return (
    <>
      <PageHeader title="Qidiruv" />
      <div className="page">
        <form className="search-bar" onSubmit={submit}>
          <SearchIcon size={18} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Darslik qidirish..."
          />
        </form>

        {loading && <Loader />}
        {!loading && results.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="Hech narsa topilmadi"
            text="Boshqa kalit so'z bilan urinib ko'ring."
          />
        )}
        {!loading &&
          results.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
      </div>
    </>
  )
}
