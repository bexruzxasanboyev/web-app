import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Radio,
  TrendingUp,
  Megaphone,
  Workflow,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Coins,
  Globe,
  Users,
  BookOpen,
} from 'lucide-react'

// 3 ta refined "mood" — hammasi metall oltin oilasida
const MOODS = {
  warm:   { accent: '#f5d77a', deep: '#b88a2a' },  // klassik oltin
  amber:  { accent: '#e89a52', deep: '#a35a1f' },  // amber / mis
  cool:   { accent: '#cfd4b8', deep: '#7a7e5a' },  // champagne / oq oltin
}

const SECTION_CONFIG = {
  'Jonli efir':            { Icon: Radio,         mood: 'amber' },
  'Sotuv darslari':        { Icon: TrendingUp,    mood: 'warm'  },
  Marketing:               { Icon: Megaphone,     mood: 'amber' },
  'Biznes audit':          { Icon: Workflow,      mood: 'cool'  },
  'Shogirdlik kurslari':   { Icon: GraduationCap, mood: 'warm'  },
  "Biznes g'oyalar":       { Icon: Lightbulb,     mood: 'amber' },
  'Shaxsiy rivojlanish':   { Icon: Sparkles,      mood: 'warm'  },
  'Moliyaviy savodxonlik': { Icon: Coins,         mood: 'cool'  },
  'Onlayn biznes':         { Icon: Globe,         mood: 'cool'  },
  Networking:              { Icon: Users,         mood: 'warm'  },
}

const DEFAULT_CONFIG = { Icon: BookOpen, mood: 'warm' }

export default function SectionCard({ section, index = 0 }) {
  const navigate = useNavigate()
  const { Icon, mood } = SECTION_CONFIG[section.title] || DEFAULT_CONFIG
  const { accent, deep } = MOODS[mood]
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div
      className="section-card"
      style={{
        '--accent': accent,
        '--deep': deep,
        '--delay': `${index * 60}ms`,
      }}
      onClick={() => navigate(`/sections/${section.id}`)}
    >
      {section.image_url && !imgFailed && (
        <img
          src={section.image_url}
          alt=""
          className="sc-bg"
          onError={() => setImgFailed(true)}
        />
      )}
      <span className="sc-glow" aria-hidden="true" />
      <span className="sc-shimmer" aria-hidden="true" />

      <div className="sc-icon-wrap" aria-hidden="true">
        <span className="sc-icon-glow" />
        <Icon className="sc-icon" size={28} strokeWidth={1.8} />
      </div>

      <span className="sc-badge">{section.lesson_count}</span>

      <div className="sc-overlay">
        <span className="sc-title">{section.title}</span>
        <span className="sc-bar" />
      </div>
    </div>
  )
}
