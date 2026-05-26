const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function normalizeDigits(v) {
  return String(v || '').replace(/\D/g, '')
}

export function formatCardNumber(v) {
  const digits = normalizeDigits(v).slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function formatExpiry(v) {
  const digits = normalizeDigits(v).slice(0, 4)
  let mm = digits.slice(0, 2)
  let yy = digits.slice(2)
  if (mm.length === 1 && Number(mm[0]) > 1) {
    yy = mm[0] + yy
    mm = '0' + mm
  }
  if (mm.length === 2) {
    const n = Number(mm)
    if (n === 0) mm = '01'
    if (n > 12) mm = '12'
  }
  return yy.length ? `${mm}/${yy}` : mm
}

export function formatMoney(value) {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm"
}

// === Ohirgi ko'rilgan darsliklar (localStorage) ===
const RECENT_KEY = 'recent_lessons'
const RECENT_MAX = 30

export function addRecentLesson(lesson) {
  if (!lesson?.id) return
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const list = raw ? JSON.parse(raw) : []
    const filtered = list.filter((l) => l.id !== lesson.id)
    filtered.unshift({
      id: lesson.id,
      title: lesson.title,
      image_url: lesson.image_url || null,
      section_title: lesson.section_title || '',
      viewed_at: new Date().toISOString(),
    })
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, RECENT_MAX)))
  } catch { /* localStorage to'lib qolgan */ }
}

export function getRecentLessons() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return (
    d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  )
}
