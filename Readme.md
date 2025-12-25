# Real-Time Chat Backend

A real-time one-to-one chat application backend built with Node.js (ES6), Socket.IO, and MongoDB. Features JWT authentication, message persistence, and online/offline status tracking.

## Features

- ✅ ES6 Module Syntax
- ✅ JWT Authentication for socket connections
- ✅ Real-time message sending and receiving
- ✅ Online/Offline user status tracking
- ✅ Message persistence in MongoDB
- ✅ Chat history retrieval
- ✅ Typing indicators
- ✅ User registration and login
- ✅ Modular architecture with MVC pattern
- ✅ Separate middleware layer
- ✅ Input validation

## Tech Stack

- **Backend**: Node.js (ES6 Modules), Express.js
- **Real-time Communication**: Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## Project Structure

```
realtime-chat-backend/
├── server.js                          # Main entry point
├── config/
│   └── database.js                   # MongoDB connection config
├── models/
│   ├── User.js                       # User model schema
│   └── Message.js                    # Message model schema
├── controllers/
│   ├── authController.js             # Authentication logic
│   ├── userController.js             # User operations
│   └── messageController.js          # Message operations
├── middleware/
│   ├── authMiddleware.js            # JWT authentication middleware
│   ├── validationMiddleware.js      # Input validation middleware
│   └── errorMiddleware.js           # Error handling middleware
├── routes/
│   ├── authRoutes.js                # Auth API routes
│   └── userRoutes.js                # User API routes
├── sockets/
│   └── socketHandler.js             # Socket.IO event handlers
├── .env.example                      # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher with ES6 module support)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd realtime-chat-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a strong, random string before deploying to production!

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# Linux/Mac
sudo systemctl start mongodb

# Or with brew on Mac
brew services start mongodb-community

# Windows
net start MongoDB
```

### 5. Start the server

Development mode (with auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000`

You should see:

```
✅ MongoDB Connected: localhost
📊 Database Name: chatapp
🚀 Server running on port 3000
🌐 Environment: development
```

## API Endpoints

### REST API

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Validation Rules:**

- Username: minimum 3 characters, alphanumeric with underscores
- Password: minimum 6 characters

**Response:**

```json
{
  "message": "User registered successfully",
  "userId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "username": "john_doe"
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "username": "john_doe"
}
```

#### 3. Get All Users

```http
GET /api/users
```

**Response:**

```json
[
  {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "username": "john_doe",
    "online": true,
    "lastSeen": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 4. Get Online Users

```http
GET /api/users/online
```

#### 5. Get User by ID

```http
GET /api/users/:userId
```

#### 6. Health Check

```http
GET /health
```

## Socket Events

### Connection

Connect to the socket with JWT authentication:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "YOUR_JWT_TOKEN",
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to server");
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});
```

### Client → Server Events

#### 1. `get_chat_history`

```javascript
socket.emit("get_chat_history", {
  otherUserId: "64f5a1b2c3d4e5f6g7h8i9j0",
});
```

#### 2. `send_message`

```javascript
socket.emit("send_message", {
  receiverId: "64f5a1b2c3d4e5f6g7h8i9j0",
  message: "Hello there!",
});
```

#### 3. `typing`

```javascript
socket.emit("typing", {
  receiverId: "64f5a1b2c3d4e5f6g7h8i9j0",
});
```

#### 4. `stop_typing`

```javascript
socket.emit("stop_typing", {
  receiverId: "64f5a1b2c3d4e5f6g7h8i9j0",
});
```

#### 5. `mark_as_read`

```javascript
socket.emit("mark_as_read", {
  messageId: "64f5a1b2c3d4e5f6g7h8i9j0",
});
```

### Server → Client Events

#### 1. `chat_history`

```javascript
socket.on("chat_history", (messages) => {
  console.log("Chat history:", messages);
});
```

#### 2. `receive_message`

```javascript
socket.on("receive_message", (message) => {
  console.log("New message:", message);
});
```

#### 3. `message_sent`

```javascript
socket.on("message_sent", (message) => {
  console.log("Message sent:", message);
});
```

#### 4. `user_status`

```javascript
socket.on("user_status", (data) => {
  console.log("User status:", data);
  // { userId: '...', username: '...', online: true/false }
});
```

#### 5. `user_typing`

```javascript
socket.on("user_typing", (data) => {
  console.log(`${data.username} is typing...`);
});
```

#### 6. `user_stop_typing`

```javascript
socket.on("user_stop_typing", (data) => {
  console.log("User stopped typing");
});
```

#### 7. `message_read`

```javascript
socket.on("message_read", (data) => {
  console.log("Message read:", data.messageId);
});
```

#### 8. `error`

```javascript
socket.on("error", (error) => {
  console.error("Error:", error.message);
});
```

## Middleware Architecture

### 1. Authentication Middleware (`authMiddleware.js`)

- `verifyToken`: Verifies JWT tokens for REST API routes
- `authenticateSocket`: Verifies JWT tokens for Socket.IO connections

### 2. Validation Middleware (`validationMiddleware.js`)

- `validateRegister`: Validates registration input
- `validateLogin`: Validates login input
- `validateMessage`: Validates message content

### 3. Error Middleware (`errorMiddleware.js`)

- `notFound`: Handles 404 errors
- `errorHandler`: General error handler

## Testing the Application

### 1. Test with cURL

**Register:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

**Get Users:**

```bash
curl http://localhost:3000/api/users
```

### 2. Test with Node.js Client

Create `test-client.js`:

```javascript
import { io } from "socket.io-client";

const token = "YOUR_JWT_TOKEN_HERE";

const socket = io("http://localhost:3000", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("✅ Connected!");

  socket.emit("send_message", {
    receiverId: "OTHER_USER_ID",
    message: "Hello from test client!",
  });
});

socket.on("receive_message", (msg) => {
  console.log("📩 Message:", msg);
});

socket.on("error", (err) => {
  console.error("❌ Error:", err);
});
```

Run:

```bash
node test-client.js
```

## Database Schema

### User Schema

```javascript
{
  username: String (unique, required, min: 3),
  password: String (hashed, required, min: 6),
  online: Boolean (default: false),
  lastSeen: Date (default: now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Message Schema

```javascript
{
  sender: ObjectId (ref: User, required),
  receiver: ObjectId (ref: User, required),
  message: String (required, max: 1000),
  timestamp: Date (default: now),
  read: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## ES6 Features Used

- ✅ ES6 Module Syntax (`import`/`export`)
- ✅ Arrow Functions
- ✅ Async/Await
- ✅ Template Literals
- ✅ Destructuring
- ✅ Const/Let declarations
- ✅ Default Parameters
- ✅ Map data structure

## Security Best Practices

✅ **Implemented:**

- JWT token authentication
- Password hashing with bcrypt (10 rounds)
- Socket authentication middleware
- Input validation
- CORS configuration
- Environment variables for secrets

⚠️ **For Production:**

- Use HTTPS
- Implement rate limiting
- Add helmet.js for security headers
- Implement refresh tokens
- Add logging and monitoring
- Database connection pooling
- Message encryption

## Common Issues & Solutions

### Error: Cannot use import statement outside a module

**Solution:** Make sure `"type": "module"` is in your `package.json`

### Error: MongoDB Connection Failed

**Solution:** Ensure MongoDB is running and the URI in `.env` is correct

### Error: JWT_SECRET not defined

**Solution:** Create `.env` file with `JWT_SECRET` variable

### Port Already in Use

**Solution:**

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

## License

MIT

---

**📌 Assignment Submission Checklist:**

- [ ] All files created with ES6 module syntax
- [ ] Separate config folder for database
- [ ] Middleware folder with auth, validation, and error handlers
- [ ] README with complete setup instructions
- [ ] `.env.example` file included
- [ ] `.gitignore` configured properly
- [ ] Code tested and working
- [ ] GitHub repository is public
