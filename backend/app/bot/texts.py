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
        "🚀 <b>Prisma</b> — biznes va shaxsiy rivojlanish bo'yicha eng "
        "yaxshi darsliklar platformasi!\n\n"
        "📚 Bu yerda siz topasiz:\n"
        "• Shogirdlik kurslari\n"
        "• Biznes g'oyalar\n"
        "• Prisma tizimlari\n"
        "• Va yana ko'p narsalar!\n\n"
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
    "📖 <b>Prisma Bot haqida</b>\n\n"
    "📺 Bu bot Prisma platformasining rasmiy boti.\n\n"
    "📚 Platforma orqali siz:\n"
    "• Bo'limlar bo'yicha darsliklar ko'rishingiz\n"
    "• Yangi darsliklar haqida bildirishnoma olishingiz\n"
    "• Biznes va shaxsiy o'sish bo'yicha bilim olishingiz mumkin\n\n"
    "🔄 Versiya: 3.0\n"
    "👨‍💻 Ishlab chiquvchi: @developerCC"
)


SUPPORT_TEXT = (
    "📞 <b>Qo'llab-quvvatlash xizmati</b>\n\n"
    "Savol yoki muammolaringiz bo'lsa, quyidagi tugma orqali bog'laning:"
)
