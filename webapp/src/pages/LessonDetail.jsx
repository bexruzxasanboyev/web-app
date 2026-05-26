import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Heart, Play } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { LessonDetailSkeleton } from '../components/Skeletons.jsx'
import Paywall from '../components/Paywall.jsx'
import { api } from '../api/client.js'
import { addRecentLesson, formatDate } from '../utils.js'
import { haptic, openLink } from '../hooks/useTelegram.js'

const MENTOR_DEFAULT = 'Dilrabo Isroilova'

export default function LessonDetail() {
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState(null)
  const [locked, setLocked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setLesson(null)
    setError(null)
    setLocked(false)
    setImgFailed(false)
    api
      .getLesson(id)
      .then((data) => {
        setLesson(data)
        setSaved(data.is_saved)
        addRecentLesson(data)
      })
      .catch((e) => {
        if (e.paymentRequired) setLocked(true)
        else setError(e.message)
      })
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

  const mentor = lesson?.mentor || MENTOR_DEFAULT
  const ctaUrl = lesson?.video_url || lesson?.cta_url
  const ctaLabel = lesson?.video_url ? 'Tomosha qilish' : (lesson?.cta_label || 'Tomosha qilish')

  return (
    <>
      <PageHeader title="Darslik" back />
      <div className="page">
        {locked && (
          <Paywall
            title="Bu darslik obuna ostida"
            text="Barcha darsliklarga to'liq kirish uchun obuna sotib oling."
          />
        )}
        {error && !locked && <EmptyState title="Xatolik" text={error} />}
        {!lesson && !error && !locked && <LessonDetailSkeleton />}
        {lesson && (
          <>
            <div className="dl-hero">
              {lesson.image_url && !imgFailed ? (
                <img
                  src={lesson.image_url}
                  alt=""
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="dl-hero-placeholder">
                  <svg viewBox="0 0 120 130" className="dl-hero-diamond">
                    <defs>
                      <linearGradient id="dlhG" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff6d8" />
                        <stop offset="50%" stopColor="#f5d77a" />
                        <stop offset="100%" stopColor="#b8860b" />
                      </linearGradient>
                    </defs>
                    <polygon points="30,6 90,6 112,40 8,40" fill="url(#dlhG)" />
                    <polygon points="8,40 112,40 60,126" fill="url(#dlhG)" opacity="0.85" />
                    <line x1="30" y1="6" x2="60" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <line x1="90" y1="6" x2="60" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <line x1="8" y1="40" x2="60" y2="126" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                    <line x1="112" y1="40" x2="60" y2="126" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                  </svg>
                </div>
              )}
              <span className="dl-shimmer" aria-hidden="true" />
            </div>

            <div className="dl-body">
              {lesson.section_title && (
                <div className="dl-label">{lesson.section_title.toUpperCase()}</div>
              )}

              <div className="dl-title-row">
                <h2>{lesson.title}</h2>
                <button
                  className={'save-pill' + (saved ? ' saved' : '')}
                  onClick={toggleSave}
                  aria-label="Saqlash"
                >
                  <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                  <span>{saved ? 'Saqlandi' : 'Saqlash'}</span>
                </button>
              </div>

              <div className="dl-label">DARSLIK HAQIDA</div>
              <div className="dl-mentor">Mentor: {mentor}</div>

              {lesson.body && <p className="dl-text">{lesson.body}</p>}

              {lesson.warning && (
                <div className="warning-box">
                  <AlertTriangle
                    size={15}
                    style={{ verticalAlign: '-2px', marginRight: 6 }}
                  />
                  <b>Muhim:</b> {lesson.warning}
                </div>
              )}

              {ctaUrl && (
                <button
                  className="watch-btn"
                  onClick={() => openLink(ctaUrl)}
                >
                  <Play size={16} fill="currentColor" />
                  <span>{ctaLabel}</span>
                </button>
              )}

              {lesson.published_at && (
                <div className="detail-date">
                  {formatDate(lesson.published_at)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
