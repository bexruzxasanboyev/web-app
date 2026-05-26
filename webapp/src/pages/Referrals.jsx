import { useEffect, useState } from 'react'
import { Share2, UserPlus, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState } from '../components/States.jsx'
import { ListRowSkeleton } from '../components/Skeletons.jsx'
import { api, buildReferralLink } from '../api/client.js'
import { formatDate } from '../utils.js'
import { getTgUser, haptic, shareReferral } from '../hooks/useTelegram.js'

export default function Referrals() {
  const [items, setItems] = useState(null)
  const tgUser = getTgUser()
  const userId = tgUser?.id || null
  const referralLink = userId ? buildReferralLink(userId) : null

  useEffect(() => {
    api.getReferrals().then(setItems).catch(() => setItems([]))
  }, [])

  const onInvite = () => {
    if (!referralLink) return
    haptic()
    shareReferral(referralLink)
  }

  const onCopy = async () => {
    if (!referralLink) return
    haptic()
    try {
      await navigator.clipboard.writeText(referralLink)
    } catch { /* ok */ }
  }

  return (
    <>
      <PageHeader title="Taklif qilingan do'stlar" back />
      <div className="page">
        {/* Taklif blogi — har doim ko'rinadi */}
        {referralLink && (
          <div className="invite-share-card">
            <div className="isc-head">
              <span className="isc-icon"><UserPlus size={20} /></span>
              <div className="isc-text">
                <div className="isc-title">Do'stingizni taklif qiling</div>
                <div className="isc-sub">Havolangizni ulashing va birga o'rganing</div>
              </div>
            </div>
            <div className="isc-link" onClick={onCopy}>{referralLink}</div>
            <button className="watch-btn isc-share" onClick={onInvite}>
              <Share2 size={16} />
              <span>Telegramda ulashish</span>
            </button>
          </div>
        )}

        {!items && <ListRowSkeleton />}
        {items && items.length === 0 && (
          <EmptyState
            icon={Users}
            title="Hali do'st yo'q"
            text="Yuqoridagi tugma orqali do'stlaringizni taklif qiling!"
          />
        )}
        {items && items.length > 0 && (
          <>
            <div className="section-title-row">
              <h2>Taklif qilinganlar</h2>
              <span className="count-badge">{items.length}</span>
            </div>
            {items.map((friend, i) => (
              <div key={friend.id || i} className="list-row">
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
          </>
        )}
      </div>
    </>
  )
}
