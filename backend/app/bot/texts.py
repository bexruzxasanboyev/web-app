"""Bot xabar matnlari va tugma yozuvlari.

Matnlarni o'zgartirish uchun shu faylni tahrirlang.
"""

# --- Reply klaviatura tugmalari ---
BTN_OPEN_APP = "📲 Ilovani ochish"
BTN_NOTIFICATIONS = "🔔 Bildirishnoma"
BTN_SUPPORT = "📞 Qo'llab quvvatlash"
BTN_ABOUT = "📖 Bot haqida"

# --- Inline tugmalar ---
BTN_NOTIF_ON = "🔔 Yoqish"
BTN_NOTIF_OFF = "🔕 O'chirish"
BTN_CONTACT = "📲 Murojaat qilish"


def start_text(first_name: str) -> str:
    return (
        f"👋 Assalomu alaykum, <b>{first_name}</b>!\n\n"
        "🚀 <b>Dilrabo Isroilova</b> — <i>Sotuv va Audit</i> akademiyasiga "
        "xush kelibsiz!\n\n"
        "📚 Bu yerda siz topasiz:\n"
        "• Sotuv ko'nikmalari va texnikalari\n"
        "• Biznes auditi va tahlili\n"
        "• Mijoz bilan ishlash sirlari\n"
        "• Marketing va savdo strategiyalari\n\n"
        "👇 Quyidagi tugmalardan foydalaning:"
    )


OPEN_APP_TEXT = "👇 Quyidagi tugmani bosib ilovani oching:"


def notifications_text(enabled: bool) -> str:
    if enabled:
        return (
            "🔔 <b>Bildirishnoma holati:</b> ✅ Yoqilgan\n\n"
            "Yangi darsliklar va bo'limlar qo'shilganda xabar olasiz."
        )
    return (
        "🔔 <b>Bildirishnoma holati:</b> ❌ O'chirilgan\n\n"
        "Yangi darsliklar va bo'limlar qo'shilganda xabar olmaysiz."
    )


ABOUT_TEXT = (
    "📖 <b>Dilrabo Isroilova — Sotuv va Audit</b>\n\n"
    "📺 Bu bot Dilrabo Isroilova akademiyasining rasmiy boti.\n\n"
    "📚 Platforma orqali siz:\n"
    "• Sotuv va audit bo'yicha video darslar ko'rishingiz\n"
    "• Yangi darsliklar haqida bildirishnoma olishingiz\n"
    "• Real biznes tajribasidan bilim olishingiz mumkin\n\n"
    "🔄 Versiya: 1.0\n"
    "👨‍💻 Ishlab chiquvchi: @developerCC"
)


SUPPORT_TEXT = (
    "📞 <b>Qo'llab-quvvatlash xizmati</b>\n\n"
    "Savol yoki muammolaringiz bo'lsa, quyidagi tugma orqali bog'laning:"
)
