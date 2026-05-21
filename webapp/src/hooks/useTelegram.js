// Telegram WebApp SDK bilan ishlash uchun yordamchilar.
import { useEffect } from 'react'

export const tg = window.Telegram?.WebApp

const APP_BG = '#0b0b0b'

export function initTelegram() {
  if (!tg) return
  tg.ready()
  tg.expand()
  try {
    tg.setHeaderColor(APP_BG)
    tg.setBackgroundColor(APP_BG)
  } catch {
    // eski Telegram versiyalari bu metodlarni qo'llamasligi mumkin
  }
}

export function getTgUser() {
  return tg?.initDataUnsafe?.user || null
}

export function isInTelegram() {
  return Boolean(tg?.initData)
}

// Sub-sahifalarda Telegram'ning "orqaga" tugmasini boshqaradi.
export function useBackButton(show, onBack) {
  useEffect(() => {
    if (!tg?.BackButton) return undefined
    if (!show) {
      tg.BackButton.hide()
      return undefined
    }
    tg.BackButton.show()
    tg.BackButton.onClick(onBack)
    return () => {
      tg.BackButton.offClick(onBack)
      tg.BackButton.hide()
    }
  }, [show, onBack])
}

export function haptic(style = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred(style)
  } catch {
    // qo'llab-quvvatlanmasa — e'tiborsiz qoldiramiz
  }
}

export function openLink(url) {
  if (!url) return
  if (url.startsWith('https://t.me') && tg?.openTelegramLink) {
    tg.openTelegramLink(url)
  } else if (tg?.openLink) {
    tg.openLink(url)
  } else {
    window.open(url, '_blank')
  }
}

export function shareReferral(link) {
  if (!link) return
  const text = "Prisma platformasiga qo'shiling — biznes va shaxsiy rivojlanish darsliklari!"
  const shareUrl =
    `https://t.me/share/url?url=${encodeURIComponent(link)}` +
    `&text=${encodeURIComponent(text)}`
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl)
  } else {
    window.open(shareUrl, '_blank')
  }
}
