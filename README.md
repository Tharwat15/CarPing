# CarPing

A mobile-responsive, zero-backend QR contact card web application for vehicles. Drivers can generate a printable windshield QR code encoding their details directly in the URL so anyone who scans it can quickly call or message them on WhatsApp.

**Live App:** https://car-ping.vercel.app/

## Features

- **Zero-Backend Architecture:** Driver name, vehicle model, phone number, optional note, and language preference are encoded into URL query parameters (`?name=...&model=...&phone=...&note=...&lang=...`) with no database or backend server required.
- **Phone Number Normalization:** Converts local numbers (such as `010...` or 10-digit numbers) and `00`-prefixed numbers into standardized international digits (`20...` by default) so `https://wa.me/<number>` deep links work reliably.
- **Bilingual Card Generator:** Supports English (`EN`) and Arabic (`عربي`, with RTL layout) for the windshield card preview.
- **Export & Print Ready:** Download the card as a formatted PNG image, print directly from the browser, copy the scan link, or open a live preview of `/car`.
- **Scan Landing Page (`/car`):** Displays vehicle and driver info, optional driver note, quick reach-out reason presets (blocking car, lights left on, quick check), one-tap phone copy, direct `tel:` call button, and pre-filled WhatsApp messaging.

## Tech Stack

- **Framework & Bundler:** React, Vite
- **Styling:** Tailwind CSS
- **Routing:** `react-router-dom`
- **QR Code Generation:** `qrcode.react`
- **Icons:** `lucide-react`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
