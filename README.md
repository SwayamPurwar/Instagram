# Instagram Clone — Full-Stack Social Media Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-darkgreen?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io" alt="Socket.io" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <strong>A comprehensive, real-time social media application inspired by Instagram.</strong><br/>
  Share your moments, interact with friends, manage your profile,<br/>
  and chat in real-time.
</p>

<p align="center">
  <a href="https://github.com/Swayampurwar/instagram">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-black?style=for-the-button&logo=github" alt="GitHub" />
  </a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 Post Creation | Create posts with images, captions, and user mentions |
| 💬 Real-Time Chat | Instant messaging between users powered by Socket.io and Redis |
| ❤️ Interactions | Like, unlike, and comment on posts seamlessly |
| 👥 Follow System | Follow and unfollow users to curate your personal feed |
| 🔐 Secure Authentication | Robust user authentication using JWT and bcryptjs |
| ☁️ Cloud Storage | Secure image uploading and management via ImageKit and Multer |
| 🤖 AI Integration | Smart features powered by Google Generative AI (@google/genai) |
| 🎨 Modern UI | Responsive, high-performance interface built with React and Vite |

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite |
| **Backend Framework** | Node.js + Express.js 5 |
| **Database** | MongoDB (Mongoose) |
| **Real-Time Engine** | Socket.io + Redis Adapter |
| **Cloud Storage** | ImageKit |
| **Authentication** | JWT + bcryptjs |
| **AI Services** | Google Generative AI |
| **Styling** | Custom CSS |
| **HTTP Client** | Axios |

## 📁 Project Structure

```text
instagram/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database and server configurations
│   │   ├── controllers/     # Route logic (auth, chat, post, user, follow)
│   │   ├── dao/             # Data Access Object layer for database operations
│   │   ├── middlewares/     # JWT verification and validation logic
│   │   ├── models/          # Mongoose schemas (User, Post, Message, Like, Comment)
│   │   ├── routes/          # Express API route definitions
│   │   ├── services/        # Third-party services (AI, Storage)
│   │   └── sockets/         # Real-time Socket.io event handling
│   ├── server.js            # Express application entry point
│   └── package.json         # Backend dependencies
├── Frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI (NavBar, PostCard, StoryViewer)
│   │   ├── context/         # React Context for global state (Socket, Toast)
│   │   ├── pages/           # Main views (Home, Profile, Chat, Explore, Login)
│   │   ├── App.jsx          # Root component layout
│   │   └── main.jsx         # React DOM rendering
│   ├── vite.config.js       # Vite build configuration
│   └── package.json         # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (Local or Atlas)
- Redis server
- ImageKit account for image uploads

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/SwayamPurwar/instagram.git](https://github.com/SwayamPurwar/instagram.git)
   cd instagram
   ```
2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```
4. **Setup Environment Variables:**
Create .env files in both the backend and frontend directories based on the tables below
 
5. **Run the Development Servers:** 

   **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

## 🔑 Environment Variables

### Backend (backend/.env)

| Variable | Description | Required |
|---|---|---|
| PORT | API Port (e.g., 3000) | ✅ |
| MONGO_URI | MongoDB connection string | ✅ |
| IMAGEKIT_PUBLIC_KEY | ImageKit public key | ✅ |
| IMAGEKIT_PRIVATE_KEY | ImageKit private key | ✅ |
| MAGEKIT_URL_ENDPOINT | ImageKit URL endpoint | ✅ |
| GOOGLE_GEMINI_API_KEY | API key for Google GenAI integration | Optional |


### Frontend (frontend/.env)

| Variable | Description |Required |
|---|---|---|
| VITE_API_URL | Backend API Base URL | ✅ |
| VITE_WS_URL | WebSocket Server URL | ✅ |


## 🔌 Core API Routes
| Route | Method | Description |
| --- | --- | --- |
| /api/auth/register | POST | Register a new user |
| /api/auth/login | POST | Authenticate and receive JWT |
| /api/posts | GET/POST | Fetch feed or create a new post |
| /api/posts/:id/like | POST | Like or unlike a specific post |
| /api/users/:id/follow | POST | Follow or unfollow a user |
| /api/chat/messages/:id | GET | Retrieve conversation history with a user |

## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** the repository.
2. **Create** a new branch: `git checkout -b feature/your-feature-name`.
3. **Commit** your changes: `git commit -m 'Add some feature'`.
4. **Push** to the branch: `git push origin feature/your-feature-name`.
5. **Open** a Pull Request.

Please ensure your code follows the existing style and includes proper TypeScript types.

## 👨‍💻 Author

**Swayam Purwar**
- **LinkedIn**: [Swayam Purwar](https://www.linkedin.com/in/SwayamPurwar)
- **GitHub**: [@SwayamPurwar](https://github.com/SwayamPurwar/)
- **Email**: [swayampurwar111104@gmail.com](mailto:swayampurwar111104@gmail.com)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by Swayam Purwar
  <br/>
  <a href="https://swayamzerodha.vercel.app/">swayamzerodha.vercel.app</a>
</p>