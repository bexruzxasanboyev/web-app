// Darslik sahifalari uchun API client.
// Backend'siz to'g'ridan-to'g'ri minds.abdulvahob-blog.uz ga ulanadi.
// Eski sahifalarning kutgan shape'larini saqlash uchun javoblarni adaptatsiya qiladi.
import { payApi } from './payClient.js'
import { getTgUser } from '../hooks/useTelegram.js'
import { getRecentLessons } from '../utils.js'

const API_URL = 'https://minds.abdulvahob-blog.uz'
const TOKEN_KEY = 'pay_api_token'
const TOKEN_TIME_KEY = 'pay_api_token_time'
const TOKEN_TTL = 20 * 60 * 60 * 1000

async function fetchNewToken() {
  const form = new URLSearchParams()
  form.append('username', 'Admin')
  form.append('password', 'Admin12345')
  const r = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!r.ok) throw new Error('Token olishda xatolik')
  const data = await r.json()
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(TOKEN_TIME_KEY, String(Date.now()))
  return data.access_token
}

async function getToken() {
  const saved = localStorage.getItem(TOKEN_KEY)
  const t = localStorage.getItem(TOKEN_TIME_KEY)
  if (saved && t && Date.now() - Number(t) < TOKEN_TTL) return saved
  return fetchNewToken()
}

export class ApiError extends Error {
  constructor(message, { status, paymentRequired = false } = {}) {
    super(message)
    this.status = status
    this.paymentRequired = paymentRequired
  }
}

async function request(method, path, { body, retry = true } = {}) {
  const token = await getToken()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && retry) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_TIME_KEY)
    return request(method, path, { body, retry: false })
  }

  let data = null
  try { data = await res.json() } catch { /* bo'sh javob */ }

  if (!res.ok) {
    const msg = data?.detail || data?.message || `Xatolik (${res.status})`
    throw new ApiError(typeof msg === 'string' ? msg : JSON.stringify(msg), {
      status: res.status,
    })
  }
  return data
}

// === Foydalanuvchi va obuna ===
function getCurrentUserId() {
  const u = getTgUser()
  if (u?.id) return Number(u.id)
  const saved = localStorage.getItem('current_user_id')
  return saved ? Number(saved) : null
}

// Telegram bot deep-link orqali taklif havolasi
const BOT_USERNAME = 'DilraboIsrailovaBot'
export function buildReferralLink(userId) {
  return `https://t.me/${BOT_USERNAME}?start=ref${userId}`
}

let subCache = null
let subTime = 0
const SUB_TTL = 60 * 1000

async function getSubscription() {
  const userId = getCurrentUserId()
  if (!userId) return { is_active: false, deadline: null }
  if (subCache && Date.now() - subTime < SUB_TTL) return subCache
  try {
    const u = await payApi.getUser(userId)
    subCache = {
      is_active: !!u?.user_status,
      deadline: u?.deadline || null,
      user: u,
    }
    subTime = Date.now()
  } catch {
    subCache = { is_active: false, deadline: null, user: null }
    subTime = Date.now()
  }
  return subCache
}

function invalidateSubscription() {
  subCache = null
  subTime = 0
}

function requirePaid(sub) {
  if (!sub.is_active) {
    throw new ApiError('Obuna talab qilinadi', { status: 402, paymentRequired: true })
  }
}

// === Asosit darslik sahifalarini minds API ga adaptatsiya ===
export const api = {
  getHome: async () => {
    const [types, sub] = await Promise.all([
      request('GET', '/types/?limit=100'),
      getSubscription(),
    ])
    const sections = (types?.data || []).map((t) => ({
      id: t.id,
      title: t.name,
      lesson_count: t.video_count || 0,
    }))
    const userId = getCurrentUserId()
    return {
      banners: [],
      subscription: sub,
      referral_link: userId ? buildReferralLink(userId) : null,
      section_count: sections.length,
      sections,
    }
  },

  getSection: async (id) => {
    const [type, videos] = await Promise.all([
      request('GET', `/types/one?id=${id}`).catch(() => null),
      request('GET', `/videos/?type_id=${id}&limit=100`),
    ])
    const lessons = (videos?.data || []).map((v) => ({
      id: v.id,
      title: v.name,
      image_url: v.picture_url && v.picture_url !== 'string' ? v.picture_url : null,
      section_title: type?.name || '',
      is_new: false,
    }))
    return {
      id: Number(id),
      title: type?.name || "Bo'lim",
      lessons,
    }
  },

  getLesson: async (id) => {
    const [video, sub] = await Promise.all([
      request('GET', `/videos/one?id=${id}`),
      getSubscription(),
    ])
    requirePaid(sub)

    let typeName = ''
    if (video.type_id) {
      try {
        const type = await request('GET', `/types/one?id=${video.type_id}`)
        typeName = type?.name || ''
      } catch { /* ok */ }
    }

    let isSaved = false
    const userId = getCurrentUserId()
    if (userId) {
      try {
        const list = await request('GET', `/saved/?user_id=${userId}&limit=200`)
        isSaved = (list?.data || []).some((s) => s.video_id === Number(id))
      } catch { /* ok */ }
    }

    const cleanStr = (s) => (s && s !== 'string' ? s : null)
    return {
      id: video.id,
      title: video.name,
      body: cleanStr(video.text),
      image_url: cleanStr(video.picture_url),
      video_url: cleanStr(video.video_url),
      section_title: typeName,
      mentor: cleanStr(video.author),
      published_at: video.created_at,
      is_saved: isSaved,
    }
  },

  saveLesson: async (videoId) => {
    const userId = getCurrentUserId()
    if (!userId) throw new ApiError("Foydalanuvchi aniqlanmadi")
    return request('POST', '/saved/add', {
      body: { video_id: Number(videoId), user_id: userId },
    })
  },

  unsaveLesson: async (videoId) => {
    const userId = getCurrentUserId()
    if (!userId) throw new ApiError("Foydalanuvchi aniqlanmadi")
    const list = await request('GET', `/saved/?user_id=${userId}&limit=200`)
    const item = (list?.data || []).find((s) => s.video_id === Number(videoId))
    if (item) return request('DELETE', `/saved/delete?id=${item.id}`)
    return null
  },

  getFaq: async () => {
    const r = await request('GET', '/faqs/?limit=100')
    return (r?.data || []).map((f) => ({
      id: f.id,
      question: f.question || f.name,
      answer: f.answer || f.text,
    }))
  },

  getSaved: async () => {
    const userId = getCurrentUserId()
    if (!userId) return []
    const sub = await getSubscription()
    requirePaid(sub)
    const r = await request('GET', `/saved/?user_id=${userId}&limit=100`)
    const items = r?.data || []
    const lessons = await Promise.all(
      items.map(async (s) => {
        try {
          const v = await request('GET', `/videos/one?id=${s.video_id}`)
          const cleanStr = (x) => (x && x !== 'string' ? x : null)
          return {
            id: v.id,
            title: v.name,
            image_url: cleanStr(v.picture_url),
            section_title: '',
          }
        } catch {
          return null
        }
      })
    )
    return lessons.filter(Boolean)
  },

  search: async (q) => {
    const r = await request('GET', `/videos/?search=${encodeURIComponent(q)}&limit=50`)
    return (r?.data || []).map((v) => ({
      id: v.id,
      title: v.name,
      image_url: v.picture_url && v.picture_url !== 'string' ? v.picture_url : null,
      section_title: '',
    }))
  },

  getProfile: async () => {
    const sub = await getSubscription()
    const userId = getCurrentUserId()
    let referral_count = 0
    if (userId) {
      try {
        const r = await request('GET', `/referral/?user_id=${userId}&limit=100`)
        referral_count = r?.data?.length || 0
      } catch { /* ok */ }
    }
    const tgUser = getTgUser()
    return {
      user: {
        first_name: tgUser?.first_name || sub.user?.name || '',
        last_name: tgUser?.last_name || '',
        username: tgUser?.username || '',
      },
      subscription: sub,
      recent_count: getRecentLessons().length,
      referral_count,
    }
  },

  getRecent: async () => getRecentLessons(),

  getReferrals: async () => {
    const userId = getCurrentUserId()
    if (!userId) return []
    let items = []
    try {
      const r = await request('GET', `/referral/?user_id=${userId}&limit=100`)
      items = r?.data || []
    } catch { return [] }
    // Har bir referral uchun do'st nomini olishga harakat qilamiz
    const enriched = await Promise.all(
      items.map(async (ref) => {
        let name = null
        try {
          const u = await payApi.getUser(ref.client_id)
          name = u?.name
        } catch { /* ok */ }
        return {
          id: ref.id,
          first_name: name || `ID: ${ref.client_id}`,
          username: null,
          created_at: ref.created_at,
        }
      })
    )
    return enriched
  },
  getMe: async () => {
    const userId = getCurrentUserId()
    if (!userId) return null
    try { return await payApi.getUser(userId) } catch { return null }
  },

  // === To'lov / Obuna ===
  getPaymentStatus: async () => {
    const userId = getCurrentUserId()
    if (!userId) return { subscription: { is_active: false, deadline: null }, months: [] }
    const [user, months] = await Promise.all([
      payApi.getUser(userId).catch(() => null),
      payApi.listMonths(userId).catch(() => []),
    ])
    return {
      subscription: {
        is_active: !!user?.user_status,
        deadline: user?.deadline || null,
      },
      months: (months || []).filter(
        (m) => m.status !== false && m.month_status !== false
      ),
    }
  },
  addCard: async (data) => {
    const userId = getCurrentUserId()
    if (!userId) throw new ApiError("Foydalanuvchi aniqlanmadi")
    return payApi.addCard({ ...data, user_id: userId })
  },
  confirmCard: async (data) => {
    const userId = getCurrentUserId()
    if (!userId) throw new ApiError("Foydalanuvchi aniqlanmadi")
    const r = await payApi.confirmCard({ ...data, user_id: userId })
    invalidateSubscription()
    return r
  },
}
