# Personal Finance App

*Aplikasi keuangan pribadi untuk mengelola transaksi, budget, dan kategori*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/muharisharis13s-projects/v0-personal-finance-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/e2w66SMbEjK)

## Overview

Aplikasi personal finance untuk mencatat pemasukan, pengeluaran, mengatur budget, dan mengkategorikan transaksi.

## Deployment

Project ini live di:

**[https://vercel.com/muharisharis13s-projects/v0-personal-finance-app](https://vercel.com/muharisharis13s-projects/v0-personal-finance-app)**

## Menjalankan Script Database

Project ini menggunakan **MySQL/MariaDB** yang tersedia di shared hosting. Berikut adalah langkah-langkah untuk menjalankan script SQL:

### Cara 1: Melalui phpMyAdmin (Recommended)

1. Login ke **cPanel** shared hosting Anda
2. Buka **phpMyAdmin** dari menu Databases
3. Pilih atau buat database baru untuk aplikasi ini
4. Klik tab **Import** atau **SQL**
5. Upload atau paste script SQL secara berurutan:
   - `scripts/001-create-tables.sql` - Membuat tabel-tabel yang diperlukan
   - `scripts/002-seed-default-categories.sql` - Mengisi data kategori default

### Cara 2: Melalui Terminal/SSH

Jika shared hosting Anda mendukung akses SSH:

\`\`\`bash
# Login ke MySQL
mysql -u username_db -p nama_database

# Jalankan script
source /path/to/scripts/001-create-tables.sql
source /path/to/scripts/002-seed-default-categories.sql
\`\`\`

### Cara 3: Melalui MySQL Command Line

\`\`\`bash
# Import langsung dari file
mysql -u username_db -p nama_database < scripts/001-create-tables.sql
mysql -u username_db -p nama_database < scripts/002-seed-default-categories.sql
\`\`\`

### Daftar Script

| File | Deskripsi |
|------|-----------|
| `001-create-tables.sql` | Membuat struktur tabel (users, categories, transactions, budgets) |
| `002-seed-default-categories.sql` | Menambahkan kategori default untuk income dan expense |

### Urutan Eksekusi

**Penting:** Jalankan script sesuai urutan nomor file (001, 002, dst.) untuk menghindari error foreign key constraint.

### Konfigurasi Environment Variables

Setelah database dibuat, tambahkan environment variables berikut di hosting atau file `.env.local`:

\`\`\`env
DATABASE_HOST=localhost
DATABASE_USER=username_db_anda
DATABASE_PASSWORD=password_db_anda
DATABASE_NAME=nama_database_anda
DATABASE_PORT=3306
\`\`\`

## Build Your App

Lanjutkan pengembangan aplikasi di:

**[https://v0.app/chat/e2w66SMbEjK](https://v0.app/chat/e2w66SMbEjK)**
