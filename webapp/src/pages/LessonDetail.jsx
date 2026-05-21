import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, ExternalLink, Heart } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState, Loader } from '../components/States.jsx'
import { api } from '../api/client.js'
import { formatDate } from '../utils.js'
import { haptic, openLink } from '../hooks/useTelegram.js'

export default function LessonDetail() {
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLesson(null)
    setError(null)
    api
      .getLesson(id)
      .then((data) => {
        setLesson(data)
        setSaved(data.is_saved)
      })
      .catch((e) => setError(e.message))
  }, [id])

  const toggleSave = async () => {
    if (saving) return
    setSaving(true)
    haptic()
    try {
      if (saved) {
        await api.unsaveLesson(id)
        setSaved(false)
      } else {
        await api.saveLesson(id)
        setSaved(true)
      }
    } catch {
      // tarmoq xatosi — holatni o'zgartirmaymiz
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Prisma" />
      <div className="page">
        {error && <EmptyState title="Xatolik" text={error} />}
        {!lesson && !error && <Loader />}
        {lesson && (
          <div className="detail-card">
            <div className="detail-img">
              {lesson.image_url && <img src={lesson.image_url} alt="" />}
              <button
                className={'save-btn' + (saved ? ' saved' : '')}
                onClick={toggleSave}
                aria-label="Saqlash"
              >
                <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="detail-body">
              <h2>{lesson.title}</h2>
              {lesson.body && <p>{lesson.body}</p>}

              {lesson.warning && (
                <div className="warning-box">
                  <AlertTriangle
                    size={15}
                    style={{ verticalAlign: '-2px', marginRight: 6 }}
                  />
                  <b>Muhim:</b> {lesson.warning}
                </div>
              )}

              {lesson.cta_url && (
                <button
                  className="cta-btn"
                  onClick={() => openLink(lesson.cta_url)}
                >
                  {lesson.cta_label || "Havolaga o'tish"}
                  <ExternalLink size={17} />
                </button>
              )}

              {lesson.published_at && (
                <div className="detail-date">
                  {formatDate(lesson.published_at)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
