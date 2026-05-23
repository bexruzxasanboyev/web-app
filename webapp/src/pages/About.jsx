import { BookOpen, Layers, Target } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'

const ROWS = [
  {
    icon: Layers,
    title: 'Prisma nima?',
    desc: 'Biznes, marketing va shaxsiy rivojlanish kurslari',
  },
  {
    icon: BookOpen,
    title: 'Darsliklar',
    desc: 'Video darslar va amaliy materiallar',
  },
  {
    icon: Target,
    title: 'Maqsad',
    desc: 'Har kim uchun biznes qurishni osonlashtirish',
  },
]

const STATS = [
  { num: '10', lbl: "Bo'lim" },
  { num: '50+', lbl: 'Darslik' },
  { num: '24/7', lbl: 'Yordam' },
]

export default function About() {
  return (
    <>
      <PageHeader title="Haqimizda" />
      <div className="page">
        <div className="brand-hero">
          <div className="diamond-stage" aria-hidden="true">
            <span className="spark spark-a">✦</span>
            <span className="spark spark-b">✦</span>
            <span className="spark spark-c">✦</span>
            <svg className="diamond-svg" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff6d8" />
                  <stop offset="35%" stopColor="#f5d77a" />
                  <stop offset="75%" stopColor="#d9a93a" />
                  <stop offset="100%" stopColor="#9a6f08" />
                </linearGradient>
                <linearGradient id="dGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d9a93a" />
                  <stop offset="100%" stopColor="#7a5500" />
                </linearGradient>
                <radialGradient id="dShine" cx="40%" cy="22%" r="42%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <filter id="dGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#dGlow)">
                <polygon points="30,6 90,6 112,40 8,40" fill="url(#dGold)" stroke="rgba(255,215,100,0.55)" strokeWidth="0.6" />
                <polygon points="8,40 112,40 60,126" fill="url(#dGoldDark)" stroke="rgba(255,215,100,0.55)" strokeWidth="0.6" />
                <line x1="30" y1="6" x2="8" y2="40" stroke="rgba(0,0,0,0.22)" strokeWidth="0.6" />
                <line x1="90" y1="6" x2="112" y2="40" stroke="rgba(0,0,0,0.22)" strokeWidth="0.6" />
                <line x1="30" y1="6" x2="60" y2="40" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                <line x1="90" y1="6" x2="60" y2="40" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                <line x1="60" y1="6" x2="60" y2="40" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
                <line x1="8" y1="40" x2="60" y2="126" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
                <line x1="112" y1="40" x2="60" y2="126" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
                <line x1="35" y1="40" x2="60" y2="126" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
                <line x1="85" y1="40" x2="60" y2="126" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
                <polygon points="30,6 90,6 60,40" fill="url(#dShine)" />
                <polygon points="35,9 55,9 50,18" fill="rgba(255,255,255,0.45)" />
              </g>
            </svg>
          </div>
          <h2 className="brand-name">Prisma</h2>
          <p className="brand-tagline">Bilim — yangi qarashlar nuri</p>
        </div>

        <div className="stat-grid">
          {STATS.map((s) => (
            <div className="stat-tile" key={s.lbl}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="about-label">PLATFORMA HAQIDA</div>
        <div className="about-list">
          {ROWS.map(({ icon: Icon, title, desc }) => (
            <div className="about-row" key={title}>
              <span className="ar-icon">
                <Icon size={20} />
              </span>
              <div>
                <div className="ar-title">{title}</div>
                <div className="ar-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
