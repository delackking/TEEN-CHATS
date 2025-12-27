# TeenChat 💬

A modern, real-time chat application with voice communication capabilities, built with Next.js, Socket.IO, and WebRTC.

## Features

- 🔐 **User Authentication** - Secure login and registration with unique user IDs
- 💬 **Real-time Messaging** - Instant direct messages and group chats
- 🎤 **Voice Calls** - Peer-to-peer voice communication using WebRTC
- 👥 **Group Management** - Create groups and add members by ID
- 🔍 **User Search** - Find and connect with users by ID or username
- 🌙 **Dark Theme** - Beautiful, modern dark UI design
- ⚡ **Typing Indicators** - See when others are typing
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: CSS Modules with custom design system
- **Real-time**: Socket.IO for messaging
- **Voice**: WebRTC with PeerJS
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd TEENCHAT
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the values:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating an Account

1. Click "Sign Up" on the login page
2. Enter a username, nickname, and password
3. Optionally add an email address
4. Click "Create Account"

### Starting a Direct Message

1. Click "Add User by ID" in the sidebar
2. Search for a user by their ID or username
3. Click on the user to start chatting

### Creating a Group

1. Switch to the "Groups" tab in the sidebar
2. Click "Create Group"
3. Enter a group name
4. Add members by searching for their user IDs

### Voice Calls

1. Open a direct message conversation
2. Click the phone icon in the header
3. Allow microphone access when prompted
4. Use the microphone icon to mute/unmute

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Import your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Configure environment variables in Vercel:
   - Add `NEXTAUTH_URL` (your Vercel deployment URL)
   - Add `NEXTAUTH_SECRET` (generate a secure random string)
   - Add `DATABASE_URL` (Vercel Postgres connection string)

4. Set up Vercel Postgres:
   - Go to your project in Vercel
   - Navigate to Storage → Create Database → Postgres
   - Copy the connection strings to your environment variables

5. Deploy:
   - Vercel will automatically deploy your application
   - Run database migrations after deployment

## Project Structure

```
TEENCHAT/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── chat/              # Chat page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Login/register page
│   ├── components/
│   │   ├── AuthProvider.tsx   # NextAuth provider
│   │   ├── ChatWindow.tsx     # Chat interface
│   │   └── Sidebar.tsx        # Navigation sidebar
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       ├── socket-client.ts   # Socket.IO client
│       ├── socket-server.ts   # Socket.IO server
│       └── voice-manager.ts   # WebRTC manager
├── server.js                  # Custom Next.js server
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` (SQLite) or `postgres://...` (PostgreSQL) |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` or `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Generate with `openssl rand -base64 32` |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Socket.IO
