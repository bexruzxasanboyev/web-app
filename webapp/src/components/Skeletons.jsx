export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} />
}

function rangeKey(n) {
  return Array.from({ length: n }, (_, i) => i)
}

export function HomeSkeleton() {
  return (
    <>
      <Skeleton className="sk-search" />
      <Skeleton className="sk-banner" />
      <Skeleton className="sk-invite" />
      <div className="sk-title-row">
        <Skeleton className="sk-title" />
        <Skeleton className="sk-count" />
      </div>
      <div className="section-grid">
        {rangeKey(6).map((i) => (
          <Skeleton key={i} className="sk-section-card" />
        ))}
      </div>
    </>
  )
}

export function SectionDetailSkeleton() {
  return (
    <>
      <Skeleton className="sk-section-hero" />
      <LessonListSkeleton count={4} />
    </>
  )
}

export function LessonDetailSkeleton() {
  return (
    <>
      <Skeleton className="sk-hero" />
      <Skeleton className="sk-label" />
      <Skeleton className="sk-line h2" style={{ marginTop: 8 }} />
      <Skeleton className="sk-line h2 mid" style={{ marginTop: 6 }} />
      <Skeleton className="sk-label" style={{ marginTop: 18 }} />
      <Skeleton className="sk-line wide" style={{ marginTop: 8 }} />
      <Skeleton className="sk-line wide" style={{ marginTop: 8 }} />
      <Skeleton className="sk-line mid" style={{ marginTop: 8 }} />
      <Skeleton className="sk-button" />
    </>
  )
}

export function FaqSkeleton({ count = 4 }) {
  return (
    <>
      {rangeKey(count).map((i) => (
        <Skeleton key={i} className="sk-faq-item" />
      ))}
    </>
  )
}

export function LessonListSkeleton({ count = 4 }) {
  return (
    <div className="lesson-list">
      {rangeKey(count).map((i) => (
        <div key={i} className="sk-lesson-row">
          <Skeleton className="sk-thumb" />
          <div className="sk-rows">
            <Skeleton className="sk-label" />
            <Skeleton className="sk-line wide" />
            <Skeleton className="sk-line mid" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <>
      <Skeleton className="sk-profile-card" />
      <Skeleton className="sk-profile-card" />
    </>
  )
}

export function ListRowSkeleton({ count = 5 }) {
  return (
    <>
      {rangeKey(count).map((i) => (
        <Skeleton key={i} className="sk-list-row" />
      ))}
    </>
  )
}
