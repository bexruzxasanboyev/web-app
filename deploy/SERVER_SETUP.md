# Serverni sozlash (bir martalik)

Server: `157.180.46.214` · OS: Ubuntu (taxminan) · Docker ishlatilmaydi.

Quyidagi qadamlar serverda **bir marta** bajariladi. Keyin har deploy
`deploy/deploy.ps1` orqali avtomatik bo'ladi.

---

## 1. Serverga kirish

```bash
ssh root@157.180.46.214
```

## 2. Kerakli paketlar

```bash
apt update && apt upgrade -y
apt install -y python3 python3-venv python3-pip postgresql nginx curl git

# Node.js 20 (zaxira uchun — mini app odatda lokalda build qilinadi)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

## 3. PostgreSQL bazasi

```bash
sudo -u postgres psql <<'SQL'
CREATE USER prisma WITH PASSWORD 'KUCHLI_PAROL_QOYING';
CREATE DATABASE prisma OWNER prisma;
SQL
```

> `KUCHLI_PAROL_QOYING` ni o'zgartiring va `.env` dagi `DATABASE_URL` ga yozing.

## 4. Ilova uchun foydalanuvchi va papka

```bash
useradd -r -s /bin/false prisma || true
mkdir -p /var/www/prisma
```

## 5. Birinchi kodni yuklash

Lokal kompyuteringizdan (Windows PowerShell) deploy skriptini ishga tushiring:

```powershell
.\deploy\deploy.ps1
```

Birinchi marta servislar hali yo'qligi uchun ogohlantirish chiqadi — bu normal.

## 6. `.env` faylini sozlash

`.env` fayli `deploy.ps1` orqali serverga yuboriladi. Serverda tekshiring:

```bash
cd /var/www/prisma/backend
nano .env
```

To'g'ri to'ldirilganiga ishonch hosil qiling:
- `BOT_TOKEN`, `BOT_USERNAME` — @BotFather'dan
- `DATABASE_URL` — `postgresql+asyncpg://prisma:PAROL@localhost:5432/prisma`
- `WEBAPP_URL` — `https://sizning-domeningiz.uz` (HTTPS shart!)
- `CORS_ORIGINS` — `["https://sizning-domeningiz.uz"]`
- `ADMIN_IDS` — o'z Telegram ID'ingiz

```bash
chmod 600 .env
chown prisma:prisma .env
```

## 7. Bazani tayyorlash (migratsiya + boshlang'ich kontent)

```bash
cd /var/www/prisma/backend
.venv/bin/alembic upgrade head
.venv/bin/python -m app.seed
```

`alembic upgrade head` — barcha jadvallarni yaratadi (migratsiya repoda tayyor).
`python -m app.seed` — `seed_data.json` dagi bo'lim, darslik, banner va FAQ'ni
bazaga yuklaydi. Kontentni yangilab, bu buyruqni qayta ishga tushirsangiz bo'ladi.

## 8. systemd servislari

```bash
cp /var/www/prisma/deploy/prisma-api.service /etc/systemd/system/
cp /var/www/prisma/deploy/prisma-bot.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now prisma-api prisma-bot
systemctl status prisma-api prisma-bot
```

## 9. nginx

```bash
cp /var/www/prisma/deploy/nginx.conf /etc/nginx/sites-available/prisma
# nginx.conf ichida server_name ni o'z domeningizga o'zgartiring
nano /etc/nginx/sites-available/prisma
ln -s /etc/nginx/sites-available/prisma /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 10. HTTPS sertifikati (SHART)

Telegram mini app faqat HTTPS bilan ishlaydi. Domen DNS'i shu serverga
yo'naltirilgach:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d sizning-domeningiz.uz
```

## 11. BotFather sozlamasi

@BotFather'da (@prisma_uz_bot uchun):
- Bot sozlamalarida **Mini App URL** ni `https://sizning-domeningiz.uz` qiling
- `/setmenubutton` — menyu tugmasiga mini app'ni biriktiring

---

## Keyingi deploylar

Lokal kompyuterdan faqat:

```powershell
.\deploy\deploy.ps1
```

Kontentni (`seed_data.json`) yangilagan bo'lsangiz, deploydan keyin serverda:

```bash
cd /var/www/prisma/backend && .venv/bin/python -m app.seed
```

## Foydali buyruqlar

```bash
journalctl -u prisma-bot -f      # bot loglari
journalctl -u prisma-api -f      # api loglari
systemctl restart prisma-bot     # botni qayta ishga tushirish
```

## Xavfsizlik (tavsiya)

Parol bilan SSH o'rniga SSH-key sozlang:
```bash
# lokal kompyuterda:  ssh-keygen -t ed25519
# kalitni serverga:   ssh-copy-id root@157.180.46.214
# keyin serverda /etc/ssh/sshd_config ichida: PasswordAuthentication no
```
