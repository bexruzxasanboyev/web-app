import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0)
  const touchStart = useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (banners.length < 2) return undefined
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      5000,
    )
    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners.length) return null

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (dx > 40) {
      setIndex((i) => (i - 1 + banners.length) % banners.length)
    } else if (dx < -40) {
      setIndex((i) => (i + 1) % banners.length)
    }
  }

  return (
    <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner) => {
          const isExpert = banner.image_url?.includes('expert')
          return (
            <div
              key={banner.id}
              className={'banner' + (isExpert ? ' banner-expert' : '')}
              onClick={() =>
                banner.lesson_id && navigate(`/lessons/${banner.lesson_id}`)
              }
            >
              {banner.image_url && <img src={banner.image_url} alt="" />}
              {banner.badge_text && (
                <span className="banner-badge">{banner.badge_text}</span>
              )}
              <div className="banner-overlay">
                <h3>{banner.title}</h3>
                {banner.subtitle && <p>{banner.subtitle}</p>}
              </div>
            </div>
          )
        })}
      </div>
      {banners.length > 1 && (
        <div className="carousel-dots">
          {banners.map((banner, i) => (
            <span
              key={banner.id}
              className={'dot' + (i === index ? ' active' : '')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
