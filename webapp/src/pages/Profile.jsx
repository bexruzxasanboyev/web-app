import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Clock, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { Loader } from '../components/States.jsx'
import { api } from '../api/client.js'
import { getTgUser } from '../hooks/useTelegram.js'

export default function Profile() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()
  const tgUser = getTgUser()

  useEffect(() => {
    api.getProfile().then(setData).catch(() => {})
  }, [])

  const source = data?.user || tgUser || {}
  const name =
    [source.first_name, source.last_name].filter(Boolean).join(' ') ||
    'Foydalanuvchi'
  const username = source.username
  const initial = name.trim().charAt(0).toUpperCase() || 'U'

  return (
    <>
      <PageHeader title="Profil" />
      <div className="page">
        <div className="profile-top">
          <div className="avatar">{initial}</div>
          <h2>{name}</h2>
          {username && <div className="username">@{username}</div>}
        </div>

        {!data && <Loader />}
        {data && (
          <>
            <div className="profile-card" onClick={() => navigate('/recent')}>
              <span className="pc-icon">
                <Clock size={22} />
              </span>
              <div className="pc-text">
                <div className="pc-title">Ohirgi ko'rilgan darsliklar</div>
                <div className="pc-sub">{data.recent_count} ta darslik</div>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="profile-card"
              onClick={() => navigate('/referrals')}
            >
              <span className="pc-icon">
                <Users size={22} />
              </span>
              <div className="pc-text">
                <div className="pc-title">Taklif qilingan do'stlar</div>
                <div className="pc-sub">{data.referral_count} ta do'st</div>
              </div>
              <ChevronRight size={20} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
