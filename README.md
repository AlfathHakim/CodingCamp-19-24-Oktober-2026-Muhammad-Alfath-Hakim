# To-Do List Life Dashboard

Dashboard personal satu halaman yang menggabungkan jam & sapaan, timer fokus
(Pomodoro), to-do list, dan quick links. Dibangun **100% dengan vanilla
HTML, CSS, dan JavaScript** — tanpa framework, tanpa library, tanpa build
tools. Cukup buka `index.html` di browser.

## Fitur

### 1. Greeting (Sapaan, Jam & Tanggal)
- Menampilkan jam (dengan detik) dan tanggal yang **update real-time** setiap detik.
- Sapaan berubah sesuai waktu: *Good Morning*, *Good Afternoon*, *Good Evening*, *Good Night*.
- **Challenge 2 — Nama kustom:** klik nama di sapaan untuk mengeditnya. Nama disimpan di `localStorage` sehingga tetap ada setelah reload.

### 2. Focus Timer (Timer Fokus 25 Menit)
- Timer hitung mundur 25 menit (Pomodoro).
- Tombol **Start** (mulas/lanjut), **Stop** (jeda, waktu tersimpan), dan **Reset** (kembali ke 25:00).
- Menggunakan *wall-clock end timestamp* agar tidak drift (akurat meski tab di-background).
- Baris status: *Ready to focus → Focusing → Paused → Time's up!*

### 3. To-Do List
- **Tambah** tugas lewat input + tombol Add (atau tekan Enter).
- **Edit** tugas dengan **double-click** pada teks tugas (Enter untuk simpan, Esc untuk batal).
- **Tandai selesai** dengan mencentang checkbox (teks dicoret).
- **Hapus** tugas dengan tombol ✕.
- **TC-2:** semua tugas disimpan ke `localStorage` dan dipulihkan saat reload.
- **Challenge 3 — Cegah duplikat:** menambah tugas yang sama persis dengan yang sudah ada akan ditolak dan menampilkan pesan error inline.

### 4. Quick Links
- **Tambah** link dengan input *Link Name* + *URL* dan tombol *Add Link*.
- Link dirender sebagai tombol yang **membuka situs di tab baru** (`target="_blank"`, `rel="noopener noreferrer"`).
- **Hapus** link dengan tombol ✕.
- Semua link disimpan ke `localStorage`. Pada kunjungan pertama, beberapa link default (Google, Gmail, GitHub, dll.) di-seed otomatis.
- URL aman: domain tanpa protokol (mis. `google.com`) otomatis diberi `https://`; skema non-http (mis. `javascript:`) ditolak.

## Tantangan (Challenges)
| Challenge | Status |
|-----------|--------|
| Challenge 1 — Light/Dark mode | ⚠️ UI & CSS siap, tapi **logika toggle JS belum dihubungkan** (lihat *Known Limitations*). |
| Challenge 2 — Nama kustom di sapaan | ✅ Selesai (persist via `localStorage`). |
| Challenge 3 — Cegah tugas duplikat | ✅ Selesai (cek exact match + pesan error). |
| TC-2 — Semua tugas tersimpan | ✅ Selesai (`localStorage`). |

## Tech Stack
- HTML5 semantik (tanpa framework)
- CSS3 murni — satu file, theming via CSS custom properties
- JavaScript (ES5-friendly, tanpa library)
- Browser API: `localStorage`, `setInterval`, DOM API

## Struktur Proyek
```
.
├── index.html        # Markup semantik & struktur layout
├── css/
│   └── style.css      # Seluruh styling + tema Light/Dark
├── js/
│   └── script.js      # Seluruh logika (greeting, timer, to-do, quick links)
└── README.md
```

## Cara Menjalankan
Tidak butuh server atau build step.
1. Download/clone repo ini.
2. Buka `index.html` langsung di browser (double-click, atau drag ke browser).

Disarankan browser modern (Chrome, Edge, Firefox, Safari versi terbaru).

## Kunci `localStorage` yang Dipakai
| Key | Isi |
|-----|-----|
| `dashboard.userName` | Nama kustom di sapaan (Challenge 2) |
| `dashboard.tasks` | Array tugas: `[{ id, text, done }]` |
| `dashboard.quickLinks` | Array link: `[{ id, name, url }]` |

Untuk mereset data: buka DevTools → tab **Application** → **Local Storage** → hapus key di atas, lalu reload.

## Known Limitations
- **Challenge 1 (Light/Dark mode):** tombol toggle, class CSS `.dark-mode`, dan variabel tema sudah ada, namun **JavaScript untuk men-toggle class tersebut belum dibuat**, jadi tombol belum berfungsi. Pekerjaan tersisa: toggle class `.dark-mode` di `<body>`, simpan preferensi ke `localStorage`, dan tukar ikon 🌙/☀️.
- Timer & jam pakai `setInterval`; akurasi sangat baik untuk pemakaian normal tetapi tidak presisi sub-detik.

## Roadmap / Ide Pengembangan
- Hubungkan logika Light/Dark mode (Challenge 1).
- Notifikasi/suara saat timer selesai.
- Filter to-do (semua / belum selesai / selesai) + hitungan tugas.
- Ekspor/impor data to-do & quick links (backup).
- Dukungan keyboard shortcut (mis. mulai/jeda timer dengan spasi).
