# URL Shortener

A modern URL shortener built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✨ Shorten long URLs with auto-generated or custom short codes
- 📊 Analytics tracking with click counts
- 📋 One-click copy to clipboard
- 🎨 Beautiful, responsive UI with Tailwind CSS
- ⚡ Fast and lightweight
- 🔒 Input validation and error handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Shortening URLs

1. Enter a long URL in the input field
2. Optionally provide a custom short code
3. Click "Shorten URL"
4. Copy the generated short link

### Analytics

1. Navigate to the Analytics section
2. Enter a short code to view its statistics
3. See click counts and creation date

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Request Body:**
```json
{
  "url": "https://example.com/very-long-url",
  "customCode": "my-link" // optional
}
```

**Response:**
```json
{
  "id": "unique-id",
  "originalUrl": "https://example.com/very-long-url",
  "shortCode": "abc123",
  "createdAt": "2025-05-16T10:00:00.000Z",
  "clicks": 0
}
```

### GET /api/analytics/[shortCode]
Get analytics for a shortened URL.

**Response:**
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very-long-url",
  "clicks": 42,
  "createdAt": "2025-05-16T10:00:00.000Z"
}
```

### GET /[shortCode]
Redirect to the original URL and increment click count.

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **ID Generation:** nanoid
- **Database:** In-memory (for demo purposes)

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── shorten/
│   │   └── analytics/
│   ├── [shortCode]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├���─ components/
│   ├── URLShortener.tsx
│   └── Analytics.tsx
└── lib/
    └── database.ts
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).