# Putuskan.id

> **Data bicara. Kamu putuskan.**

Putuskan.id adalah SaaS Sistem Pendukung Keputusan (SPK) berbasis metode **SAW (Simple Additive Weighting)** dengan antarmuka Neo-Brutalism yang kasual dan mudah digunakan. Dirancang untuk siapa saja yang lagi bingung mutusin sesuatu — dari milih laptop, kos, sampai keputusan bisnis.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Astro JS](https://astro.build) v6 (SSR) + React islands |
| Styling | Tailwind CSS v4, Space Grotesk font |
| Auth | [Better Auth](https://better-auth.com) (email/password) |
| Database | MySQL 8, raw SQL via `mysql2/promise` |
| Charts | Recharts |
| Deploy | VPS + Nginx + PM2 |

---

## Fitur

- **Autentikasi** — register & login dengan email/password
- **Manajemen project** — buat banyak project keputusan berbeda
- **Faktor (Kriteria)** — tambah, edit, hapus; atur bobot kepentingan; pilih arah nilai (benefit/cost)
- **Tipe nilai fleksibel** — angka bebas atau skala 1–5 untuk kriteria kualitatif
- **Pilihan (Alternatif)** — input semua kandidat yang mau dibanding-bandingin
- **Perhitungan SAW otomatis** — normalisasi → weighted sum → ranking
- **Hasil visual** — ranking dengan progress bar, bar chart perbandingan skor, tabel detail perhitungan
- **Onboarding** — guided empty state + hint inline di tiap tab editor

---

## Struktur Project

```
src/
├── components/
│   ├── layout/
│   │   └── Navbar.astro
│   ├── spk/
│   │   ├── ProjectEditor.tsx   # React island utama (tab Faktor/Pilihan/Nilai/Hasil)
│   │   ├── ProjectList.tsx     # Dashboard project list + onboarding empty state
│   │   ├── ProjectCard.tsx     # Card project dengan three-dot delete menu
│   │   └── ResultsView.tsx     # Ranking, bar chart, detail perhitungan SAW
│   └── ui/
│       └── Toast.tsx           # Global toast notification
├── layouts/
│   └── AppLayout.astro
├── lib/
│   ├── auth/
│   │   ├── index.ts            # Better Auth server config
│   │   └── client.ts           # Better Auth client
│   ├── db/
│   │   ├── index.ts            # MySQL connection pool
│   │   ├── queries.ts          # Semua raw SQL queries
│   │   └── schema.sql          # Database schema lengkap
│   └── saw.ts                  # SAW algorithm engine
├── pages/
│   ├── api/
│   │   ├── auth/[...all].ts
│   │   └── projects/[id]/
│   │       ├── criteria.ts
│   │       ├── alternatives.ts
│   │       └── values.ts
│   ├── dashboard/index.astro
│   ├── project/
│   │   ├── [id].astro
│   │   └── new.astro
│   ├── index.astro
│   ├── login.astro
│   ├── register.astro
│   └── 404.astro
├── styles/
│   └── global.css              # Neo-Brutalism design system
├── types/
│   └── index.ts
└── middleware.ts               # Session injection + route protection
```

---

## Setup Lokal

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd putuskan-project
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Isi variabelnya:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=putuskan_id

BETTER_AUTH_SECRET=generate_dengan_openssl_rand_base64_32
BETTER_AUTH_URL=http://localhost:4321
```

Generate `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Setup database

Jalankan schema di MySQL/phpMyAdmin:

```bash
mysql -u your_user -p putuskan_id < src/lib/db/schema.sql
```

Atau import file `src/lib/db/schema.sql` langsung via phpMyAdmin.

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:4321](http://localhost:4321)

---

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server di `localhost:4321` |
| `npm run dev -- --force` | Dev server + clear Vite cache |
| `npm run build` | Build production ke `./dist/` |
| `npm run preview` | Preview build production |

---

## Deploy (VPS)

### Build

```bash
npm run build
```

### Jalankan dengan PM2

```bash
pm2 start dist/server/entry.mjs --name putuskan-id
pm2 save
pm2 startup
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name putuskan.id www.putuskan.id;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment production

Buat `.env.production` di server (jangan di-commit):

```env
BETTER_AUTH_URL=https://putuskan.id
BETTER_AUTH_SECRET=your_production_secret
```

---

## Algoritma SAW

1. **Normalisasi** — untuk benefit: `r_ij = x_ij / max(x_j)`, untuk cost: `r_ij = min(x_j) / x_ij`
2. **Weighted sum** — `V_i = Σ (w_j × r_ij)`
3. **Ranking** — alternatif dengan skor tertinggi = pilihan terbaik

Total bobot semua faktor harus pas di **1.00**.

---

## Design System

Neo-Brutalism dengan palet warna:

| Token | Hex | Penggunaan |
|---|---|---|
| Dark | `#1A1A1A` | Text utama, border, background card header |
| Dark alt | `#333333` | Text sekunder |
| Accent | `#FF3D00` | CTA, highlight, active state |
| Light | `#F0F0F0` | Background, disabled state |

Font: **Space Grotesk** (Google Fonts)
