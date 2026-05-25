# Dilrabo Isroilova — Sotuv va Audit (Telegram Bot + Mini App)

`@salesaireportdilraboisraolivabot` — Dilrabo Isroilova "Sotuv va Audit"
akademiyasining rasmiy boti va mini app'i.

> **Eslatma:** kod ichida va serverda papka/servis/baza nomi `prisma` deb
> qolgan (boshlang'ich loyiha nomi). Bu faqat ichki kod nomi — foydalanuvchi
> ko'rmaydi. Hammasini qayta nomlash production downtime talab qiladi.

## Stack

| Qism      | Texnologiya                                   |
|-----------|-----------------------------------------------|
| Bot       | Python, aiogram 3 (polling)                   |
| Backend   | Python, FastAPI                               |
| Mini app  | React 18 + Vite + React Router + Telegram SDK |
| Baza      | PostgreSQL (Docker'siz)                       |
| Deploy    | SSH + systemd + nginx                         |

## Imkoniyatlar

**Bot:** /start, reply klaviatura (Ilovani ochish, Bildirishnoma, Qo'llab
quvvatlash, Bot haqida), bildirishnoma toggle, taklif (referral) havolasi.

**Mini app (5 bo'lim):**
- **Bosh sahifa** — qidiruv, banner karusel, "Do'stni taklif qilish", bo'limlar gridi
- **Bo'lim ichi** — bo'limdagi darsliklar ro'yxati
- **Darslik** — to'liq matn, ogohlantirish, video/havola tugmasi, saqlash (💗)
- **FAQ** — akkordeon savol-javoblar
- **Saqlangan** — saqlangan darsliklar
- **Haqimizda** — platforma haqida
- **Profil** — foydalanuvchi, ohirgi ko'rilganlar, taklif qilingan do'stlar

## Tuzilma

```
mini app/
├── backend/                  Python (bot + API bitta kodbazada)
│   ├── app/
│   │   ├── core/             config, database, security (initData)
│   │   ├── models/           User, Section, Lesson, Banner, FaqItem, ...
│   │   ├── bot/              aiogram bot — handlers, keyboards, texts
│   │   ├── api/              FastAPI — routers, deps, schemas
│   │   ├── services/         referral xizmati
│   │   └── seed.py           seed_data.json'ni bazaga yuklaydi
│   ├── alembic/              migratsiyalar (0001_initial tayyor)
│   ├── seed_data.json        kontent (bo'lim/darslik/banner/FAQ)
│   └── requirements.txt
├── webapp/                   React mini app
│   └── src/
│       ├── components/       Layout, BottomNav, kartalar, karusel, ...
│       ├── pages/            Home, SectionDetail, LessonDetail, Faq, ...
│       ├── hooks/            useTelegram (SDK)
│       └── api/client.js
├── deploy/                   nginx, systemd, deploy.ps1, SERVER_SETUP.md
└── README.md
```

## Kontent qo'shish

Darslik, bo'lim, banner, FAQ — `backend/seed_data.json` faylida.
Tahrirlab quyidagini ishga tushiring (rasm/video havolalarini ham shu yerga):

```bash
python -m app.seed
```

## Lokal ishga tushirish

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # .env ni to'ldiring
alembic upgrade head
python -m app.seed
uvicorn app.api.main:app --reload --port 8000   # API
python -m app.bot.main                          # bot (alohida terminal)
```

### Mini app

```powershell
cd webapp
npm install
copy .env.example .env
npm run dev
```

> Mini app Telegram ichida HTTPS bilan ishlaydi. Lokal sinov uchun `ngrok`
> orqali tunnel oching va BotFather'da test URL qo'ying.

## Deploy

Birinchi marta: **`deploy/SERVER_SETUP.md`** bo'yicha serverni sozlang.
Keyin har safar lokal PowerShell'dan:

```powershell
.\deploy\deploy.ps1
```

## Holat

🟢 **To'liq versiya:** bot va mini app `@avtopilotminiappbot` dizayniga mos
qilib, **Dilrabo Isroilova — Sotuv va Audit** brendi ostida qurildi. Kontent (haqiqiy darslik matnlari,
rasm, video) `seed_data.json` orqali qo'shiladi.
