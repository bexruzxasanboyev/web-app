import { BookOpen, Layers, Target } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Logo from '../components/Logo.jsx'

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

export default function About() {
  return (
    <>
      <PageHeader title="Haqimizda" />
      <div className="page">
        <div className="about-hero">
          <Logo size={72} />
          <h2>Prisma</h2>
          <p>Biznes va shaxsiy o'sish platformasi</p>
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
