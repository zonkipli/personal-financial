# Personal finance app

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/muharisharis13s-projects/v0-personal-finance-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/e2w66SMbEjK)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/muharisharis13s-projects/v0-personal-finance-app](https://vercel.com/muharisharis13s-projects/v0-personal-finance-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/e2w66SMbEjK](https://v0.app/chat/e2w66SMbEjK)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Menjalankan Script Database

Project ini menggunakan Supabase sebagai database. Berikut adalah langkah-langkah untuk menjalankan script SQL:

### Cara 1: Melalui v0.app (Recommended)

1. Buka project di [v0.app](https://v0.app)
2. Pastikan integrasi Supabase sudah terhubung di bagian **Connect** pada sidebar
3. Klik pada file script di folder `/scripts`
4. Klik tombol **Run** untuk menjalankan script

### Cara 2: Melalui Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project yang sudah terhubung
3. Buka **SQL Editor** dari sidebar
4. Copy-paste isi script dan jalankan secara berurutan:
   - `scripts/001-create-tables.sql` - Membuat tabel-tabel yang diperlukan
   - `scripts/002-seed-default-categories.sql` - Mengisi data kategori default

### Daftar Script

| File | Deskripsi |
|------|-----------|
| `001-create-tables.sql` | Membuat struktur tabel (users, categories, transactions, budgets) |
| `002-seed-default-categories.sql` | Menambahkan kategori default untuk income dan expense |

### Urutan Eksekusi

**Penting:** Jalankan script sesuai urutan nomor file (001, 002, dst.) untuk menghindari error foreign key constraint.
