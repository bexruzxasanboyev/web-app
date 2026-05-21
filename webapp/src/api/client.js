// Backend API bilan ishlash uchun fetch o'ramchisi.
// Har so'rovga Telegram initData "Authorization" sarlavhasida yuboriladi.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getInitData() {
  return window.Telegram?.WebApp?.initData || ''
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `tma ${getInitData()}`,
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail || detail
    } catch {
      // javob JSON emas
    }
    throw new Error(detail || `Xatolik (${response.status})`)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  getHome: () => request('/home'),
  getSection: (id) => request(`/sections/${id}`),
  getLesson: (id) => request(`/lessons/${id}`),
  saveLesson: (id) => request(`/lessons/${id}/save`, { method: 'POST' }),
  unsaveLesson: (id) => request(`/lessons/${id}/save`, { method: 'DELETE' }),
  getFaq: () => request('/faq'),
  getSaved: () => request('/saved'),
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  getProfile: () => request('/profile'),
  getRecent: () => request('/profile/recent'),
  getReferrals: () => request('/profile/referrals'),
  getMe: () => request('/users/me'),
}
