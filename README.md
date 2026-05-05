# Blogify

A full-stack blogging platform where users can write, read, and like stories. Built with Next.js, Express, MongoDB, and TypeScript.

---

## Features

- Register and log in with JWT authentication
- Create blog posts with an optional cover image
- Default gradient cover generated automatically when no image is uploaded
- Like posts and track view counts
- Admin dashboard to manage users and blogs
- Admins cannot delete their own account

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express 5
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Multer (image uploads)
- bcrypt (password hashing)

---

## Project Structure

```
blogify/
├── client/          # Next.js frontend
│   ├── app/         # Pages (App Router)
│   ├── components/  # Reusable components
│   ├── services/    # Axios API client
│   └── hooks/       # Custom React hooks
│
└── server/          # Express backend
    └── src/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── uploads/  # Uploaded images (gitignored)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Clone the repository

```bash
git clone https://github.com/arman2255/blog-arman.git
cd blog-arman
```

---

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGO_URI=mongodb://localhost:27017/blogapp
JWT_SECRET=your_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

### 3. Set up the frontend

```bash
cd client
npm install
```

Create a `.env.local` file inside the `client` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all blogs |
| GET | `/api/blogs/:id` | Get a single blog |
| POST | `/api/blogs` | Create a blog (auth required) |
| POST | `/api/blogs/:id/like` | Like a blog (auth required) |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get platform stats |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/blogs` | Get all blogs |
| DELETE | `/api/admin/users/:id` | Delete a user and their blogs |
| DELETE | `/api/admin/blogs/:id` | Delete a blog |

---

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — set `NEXT_PUBLIC_API_URL` to your backend URL
- **Backend** → [Render](https://render.com) — set all `.env` variables in the dashboard
- **Database** → [MongoDB Atlas](https://www.mongodb.com/atlas) — free tier available

---

## Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Port the server runs on (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:3000) |

### Client (`client/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## License

MIT
