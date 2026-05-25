// Backend'siz to'g'ridan-to'g'ri minds.abdulvahob-blog.uz ga so'rov yuboradi.
const API_URL = 'https://minds.abdulvahob-blog.uz'
const TOKEN_KEY = 'pay_api_token'
const TOKEN_TIME_KEY = 'pay_api_token_time'
const TOKEN_TTL = 20 * 60 * 60 * 1000 // 20 soat

async function fetchNewToken() {
  const form = new URLSearchParams()
  form.append('username', 'Admin')
  form.append('password', 'Admin12345')

  const res = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) throw new Error('Token olishda xatolik')
  const data = await res.json()
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(TOKEN_TIME_KEY, String(Date.now()))
  return data.access_token
}

async function getToken() {
  const saved = localStorage.getItem(TOKEN_KEY)
  const savedAt = localStorage.getItem(TOKEN_TIME_KEY)
  if (saved && savedAt && Date.now() - Number(savedAt) < TOKEN_TTL) {
    return saved
  }
  return fetchNewToken()
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_TIME_KEY)
}

async function request(method, path, { params, body, retry = true } = {}) {
  let url = `${API_URL}${path}`
  if (params) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.append(k, String(v))
    })
    const s = qs.toString()
    if (s) url += (path.includes('?') ? '&' : '?') + s
  }

  const token = await getToken()
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && retry) {
    clearToken()
    return request(method, path, { params, body, retry: false })
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // bo'sh javob
  }

  if (!res.ok) {
    const msg = data?.detail || data?.message || `Xatolik (${res.status})`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data
}

export const payApi = {
  // Foydalanuvchi ma'lumotlari (obuna deadline, payments, status)
  getUser: (userId) => request('GET', '/users/one', { params: { user_id: userId } }),

  // Foydalanuvchiga mavjud tariflar (oylar)
  listMonths: (userId) => request('GET', '/months/', { params: { user_id: userId } }),

  // Bitta tarif
  getMonth: (userId, monthId) =>
    request('GET', '/months/one', { params: { user_id: userId, id: monthId } }),

  // Karta qo'shish va SMS yuborish — transaction_id qaytaradi
  addCard: ({ user_id, month, card_number, expiry_month, expiry_year }) =>
    request('POST', '/cards/add', {
      body: { user_id, month, card_number, expiry_month, expiry_year },
    }),

  // SMS kodni tasdiqlash
  confirmCard: ({ user_id, month, transaction_id, code, procode }) =>
    request('POST', '/cards/confirm', {
      body: {
        user_id,
        month,
        transaction_id,
        code,
        ...(procode != null ? { procode } : {}),
      },
    }),
}
