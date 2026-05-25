import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { FaqSkeleton } from '../components/Skeletons.jsx'
import { api } from '../api/client.js'

export default function Faq() {
  const [items, setItems] = useState(null)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    api.getFaq().then(setItems).catch(() => setItems([]))
  }, [])

  return (
    <>
      <PageHeader title="FAQ" />
      <div className="page">
        <div className="faq-head">
          <h2>Ko'p so'raladigan savollar</h2>
          <p>Quyida eng ko'p beriladigan savollarga javoblar</p>
        </div>

        {!items && <FaqSkeleton />}
        {items &&
          items.map((item) => (
            <div
              key={item.id}
              className={'faq-item' + (openId === item.id ? ' open' : '')}
            >
              <div
                className="faq-q"
                onClick={() =>
                  setOpenId(openId === item.id ? null : item.id)
                }
              >
                <span>{item.question}</span>
                <span className="faq-chev">
                  <ChevronDown size={16} />
                </span>
              </div>
              <div className="faq-a">{item.answer}</div>
            </div>
          ))}
      </div>
    </>
  )
}
