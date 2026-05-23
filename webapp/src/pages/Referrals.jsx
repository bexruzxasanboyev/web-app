import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { ListRowSkeleton } from '../components/Skeletons.jsx'
import { api } from '../api/client.js'
import { formatDate } from '../utils.js'

export default function Referrals() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    api.getReferrals().then(setItems).catch(() => setItems([]))
  }, [])

  return (
    <>
      <PageHeader title="Taklif qilingan do'stlar" />
      <div className="page">
        {!items && <ListRowSkeleton />}
        {items && items.length === 0 && (
          <EmptyState
            icon={Users}
            title="Hali do'st yo'q"
            text="Bosh sahifadagi tugma orqali do'stlaringizni taklif qiling!"
          />
        )}
        {items &&
          items.map((friend, i) => (
            <div key={i} className="list-row">
              <span className="invite-icon">
                <Users size={18} />
              </span>
              <div className="lr-main">
                <div className="lr-title">
                  {friend.first_name || 'Foydalanuvchi'}
                </div>
                {friend.username && (
                  <div className="lr-sub gold">@{friend.username}</div>
                )}
              </div>
              <div className="lr-meta">{formatDate(friend.created_at)}</div>
            </div>
          ))}
      </div>
    </>
  )
}
