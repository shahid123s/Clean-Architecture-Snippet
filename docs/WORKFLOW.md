# Development Workflow Guide

A step-by-step guide for developers new to this Clean Architecture project. Follow this guide to understand how to work with the codebase and add new features.

## 📋 Table of Contents

- [First Time Setup](#first-time-setup)
- [Understanding the Codebase](#understanding-the-codebase)
- [Common Workflows](#common-workflows)
  - [Adding a New Use Case](#adding-a-new-use-case)
  - [Adding a New Entity](#adding-a-new-entity)
  - [Switching Databases](#switching-databases)
- [Testing Your Changes](#testing-your-changes)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🚀 First Time Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/shahid123s/Clean-Architecture-Snippet.git
cd Clean-Architecture-Snippet

# Install dependencies
npm install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env` with your connection string

### Step 3: Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

Your `.env` should look like:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/clean-arch-db
```

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
[INFO] Server running in development mode on port 3000
[INFO] MongoDB Connected Successfully
```

### Step 5: Test the API

```bash
# Create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "role": "user"}'

# Get all users
curl http://localhost:3000/api/v1/users
```

---

## 🔍 Understanding the Codebase

### Where to Start

**If you want to understand...**

1. **How a request flows through the system:**
   - Start at: `src/interfaces/routes/user.routes.js`
   - Then: `src/interfaces/controllers/create-user.controller.js`
   - Then: `src/application/use-cases/create-user.use-case.js`
   - Finally: `src/infrastructure/repositories/mongo-user.repository.js`

2. **Business logic:**
   - Look in: `src/domain/entities/`
   - Look in: `src/application/use-cases/`

3. **Database interaction:**
   - Look in: `src/infrastructure/repositories/`
   - Look in: `src/infrastructure/database/`

4. **HTTP handling:**
   - Look in: `src/interfaces/controllers/`
   - Look in: `src/interfaces/routes/`

### Key Files and Their Purpose

```
src/
├── domain/
│   ├── entities/user.entity.js       ← Business objects
│   └── dtos/user.dto.js              ← Data transfer objects
│
├── application/
│   ├── use-cases/                    ← Business logic (START HERE)
│   ├── ports/repositories/           ← Interfaces for data access
│   └── mappers/user.mapper.js        ← Transform data between layers
│
├── infrastructure/
│   ├── database/connection.js        ← Database setup
│   ├── repositories/                 ← Database implementations
│   └── utils/                        ← Helpers and utilities
│
├── interfaces/
│   ├── controllers/                  ← HTTP request handlers
│   └── routes/                       ← Route definitions
│
└── server.js                         ← Dependency wiring (IMPORTANT!)
```

---

## 🛠️ Common Workflows

### Adding a New Use Case

Let's say you want to add **"Update User"** functionality.

#### Step 1: Add to Repository Interface

```javascript
// src/application/ports/repositories/user.repository.interface.js

class UserRepositoryInterface {
  async create(userEntity) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  
  // ✅ Add new method
  async update(id, userEntity) { throw new Error('Not implemented'); }
}
```

#### Step 2: Implement in Concrete Repository

```javascript
// src/infrastructure/repositories/mongo-user.repository.js

class MongoUserRepository extends UserRepositoryInterface {
  // ... existing methods ...

  // ✅ Add implementation
  async update(id, userEntity) {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        name: userEntity.name,
        email: userEntity.email,
        role: userEntity.role,
      },
      { new: true }
    );
    
    if (!updatedUser) return null;
    return this._mapToEntity(updatedUser);
  }
}
```

#### Step 3: Create Use Case

```javascript
// src/application/use-cases/update-user.use-case.js

const UserEntity = require('../../domain/entities/user.entity');
const UserMapper = require('../mappers/user.mapper');

class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, data) {
    // Validation
    if (!data.name || !data.email) {
      throw new Error('Name and email are required');
    }

    // Create entity with updated data
    const userEntity = new UserEntity(id, data.name, data.email, data.role);
    
    // Update in repository
    const updatedUser = await this.userRepository.update(id, userEntity);
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    // Return DTO
    return UserMapper.toDTO(updatedUser);
  }
}

module.exports = UpdateUserUseCase;
```

#### Step 4: Create Controller

```javascript
// src/interfaces/controllers/update-user.controller.js

const sendResponse = require('../../infrastructure/utils/response.util');

class UpdateUserController {
  constructor(updateUserUseCase) {
    this.updateUserUseCase = updateUserUseCase;
  }

  async handle(req, res) {
    try {
      const userDTO = await this.updateUserUseCase.execute(req.params.id, req.body);
      sendResponse(res, 200, true, 'User updated successfully', userDTO);
    } catch (error) {
      if (error.message === 'User not found') {
        return sendResponse(res, 404, false, error.message);
      }
      sendResponse(res, 400, false, error.message);
    }
  }
}

module.exports = UpdateUserController;
```

#### Step 5: Add Route

```javascript
// src/interfaces/routes/user.routes.js

const express = require('express');

const createUserRoutes = (createUserController, getUsersController, updateUserController) => {
  const router = express.Router();

  router.post('/', (req, res) => createUserController.handle(req, res));
  router.get('/', (req, res) => getUsersController.getAll(req, res));
  router.get('/:id', (req, res) => getUsersController.getById(req, res));
  
  // ✅ Add new route
  router.put('/:id', (req, res) => updateUserController.handle(req, res));

  return router;
};

module.exports = createUserRoutes;
```

#### Step 6: Wire in Server

```javascript
// src/server.js

const UpdateUserUseCase = require('./application/use-cases/update-user.use-case');
const UpdateUserController = require('./interfaces/controllers/update-user.controller');

// ... existing code ...

// ✅ Instantiate use case
const updateUserUseCase = new UpdateUserUseCase(userRepository);

// ✅ Instantiate controller
const updateUserController = new UpdateUserController(updateUserUseCase);

// ✅ Pass to routes
const userRoutes = createUserRoutes(
  createUserController, 
  getUsersController,
  updateUserController  // Add here
);
```

#### Step 7: Test

```bash
# Update user
curl -X PUT http://localhost:3000/api/v1/users/6926bfb147c4f54476d5b1b1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe Updated", "email": "jane.updated@example.com", "role": "admin"}'
```

---

### Adding a New Entity

Let's add a **Post** entity.

#### Step 1: Create Entity

```javascript
// src/domain/entities/post.entity.js

class PostEntity {
  constructor(id, title, content, authorId, createdAt) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.authorId = authorId;
    this.createdAt = createdAt || new Date();
  }

  isOwnedBy(userId) {
    return this.authorId === userId;
  }
}

module.exports = PostEntity;
```

#### Step 2: Create DTO

```javascript
// src/domain/dtos/post.dto.js

class PostDTO {
  constructor(id, title, content, authorId) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.authorId = authorId;
  }
}

module.exports = PostDTO;
```

#### Step 3: Create Repository Interface

```javascript
// src/application/ports/repositories/post.repository.interface.js

class PostRepositoryInterface {
  async create(postEntity) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findByAuthorId(authorId) { throw new Error('Not implemented'); }
}

module.exports = PostRepositoryInterface;
```

#### Step 4: Create Database Schema

```javascript
// src/infrastructure/database/schemas/post.schema.js

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', PostSchema);
```

#### Step 5: Implement Repository

```javascript
// src/infrastructure/repositories/mongo-post.repository.js

const PostRepositoryInterface = require('../../application/ports/repositories/post.repository.interface');
const PostEntity = require('../../domain/entities/post.entity');
const PostModel = require('../database/schemas/post.schema');

class MongoPostRepository extends PostRepositoryInterface {
  async create(postEntity) {
    const postModel = new PostModel({
      title: postEntity.title,
      content: postEntity.content,
      authorId: postEntity.authorId,
    });

    const savedPost = await postModel.save();
    return this._mapToEntity(savedPost);
  }

  async findAll() {
    const posts = await PostModel.find();
    return posts.map(post => this._mapToEntity(post));
  }

  async findById(id) {
    const post = await PostModel.findById(id);
    if (!post) return null;
    return this._mapToEntity(post);
  }

  async findByAuthorId(authorId) {
    const posts = await PostModel.find({ authorId });
    return posts.map(post => this._mapToEntity(post));
  }

  _mapToEntity(mongoPost) {
    return new PostEntity(
      mongoPost._id.toString(),
      mongoPost.title,
      mongoPost.content,
      mongoPost.authorId.toString(),
      mongoPost.createdAt
    );
  }
}

module.exports = MongoPostRepository;
```

#### Step 6: Create Use Cases, Controllers, and Routes

Follow the same pattern as the User entity!

---

### Switching Databases

Want to switch from MongoDB to PostgreSQL? Here's how:

#### Step 1: Install PostgreSQL Driver

```bash
npm install pg
```

#### Step 2: Create PostgreSQL Repository

```javascript
// src/infrastructure/repositories/postgres-user.repository.js

const { Pool } = require('pg');
const UserRepositoryInterface = require('../../application/ports/repositories/user.repository.interface');
const UserEntity = require('../../domain/entities/user.entity');

class PostgresUserRepository extends UserRepositoryInterface {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async create(userEntity) {
    const result = await this.pool.query(
      'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
      [userEntity.name, userEntity.email, userEntity.role]
    );
    
    return this._mapToEntity(result.rows[0]);
  }

  async findAll() {
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows.map(row => this._mapToEntity(row));
  }

  async findById(id) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    return this._mapToEntity(result.rows[0]);
  }

  _mapToEntity(row) {
    return new UserEntity(
      row.id,
      row.name,
      row.email,
      row.role,
      row.created_at
    );
  }
}

module.exports = PostgresUserRepository;
```

#### Step 3: Update server.js

```javascript
// src/server.js

// Comment out MongoDB
// const MongoUserRepository = require('./infrastructure/repositories/mongo-user.repository');
// const userRepository = new MongoUserRepository();

// Use PostgreSQL instead
const { Pool } = require('pg');
const PostgresUserRepository = require('./infrastructure/repositories/postgres-user.repository');

const pool = new Pool({
  connectionString: config.postgresUri,
});

const userRepository = new PostgresUserRepository(pool);

// Everything else stays the same! ✨
```

**That's it!** Use cases, controllers, and routes don't change at all.

---

## 🧪 Testing Your Changes

### Manual Testing with cURL

```bash
# Create
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Read All
curl http://localhost:3000/api/v1/users

# Read One
curl http://localhost:3000/api/v1/users/[USER_ID]

# Update (if you implemented it)
curl -X PUT http://localhost:3000/api/v1/users/[USER_ID] \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "email": "updated@example.com"}'
```

### Check MongoDB

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use clean-arch-db

# View users
db.users.find().pretty()
```

---

## ✅ Best Practices

### DO ✅

1. **Keep entities pure** - No database or framework code in `domain/`
2. **One use case, one responsibility** - Each use case file does ONE thing
3. **Depend on interfaces** - Use cases depend on `RepositoryInterface`, not concrete implementations
4. **Map at boundaries** - Convert between Entities and DTOs at layer boundaries
5. **Wire at composition root** - All dependency injection happens in `server.js`

### DON'T ❌

1. **Don't put business logic in controllers** - Controllers just handle HTTP
2. **Don't import infrastructure in use cases** - Use cases should never see MongoDB
3. **Don't skip the mapper** - Always convert Entities ↔ DTOs
4. **Don't create circular dependencies** - Dependencies flow one direction: inward
5. **Don't put everything in one file** - Split by responsibility

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Problem:** Missing dependency or wrong path.

**Solution:**
```bash
npm install  # Reinstall dependencies
```

Check import paths are correct:
```javascript
// ✅ Correct (relative path)
const UserEntity = require('../../domain/entities/user.entity');

// ❌ Wrong
const UserEntity = require('domain/entities/user.entity');
```

### Error: "MongoDB Connection Error"

**Problem:** MongoDB not running or wrong URI.

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod             # Linux
```

Check `.env`:
```env
MONGO_URI=mongodb://localhost:27017/clean-arch-db
```

### Error: "User not found" when it should exist

**Problem:** Looking in wrong database or collection.

**Solution:**
```bash
# Check which database you're using
mongosh
show dbs
use clean-arch-db
db.users.find()  # See if users exist
```

### Changes not taking effect

**Problem:** Server not restarting.

**Solution:**
```bash
# Kill the server (Ctrl+C)
# Restart
npm start

# Or use nodemon for auto-restart
npm install -g nodemon
nodemon src/server.js
```

---

## 📚 Next Steps

1. **Read the docs:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into architecture
   - [SOLID_PRINCIPLES.md](./SOLID_PRINCIPLES.md) - SOLID with examples

2. **Try these exercises:**
   - Add "Delete User" functionality
   - Add a "Post" entity
   - Implement authentication use cases
   - Add validation middleware

3. **Explore the code:**
   - Trace a request from route → controller → use case → repository
   - See how entities are mapped to DTOs
   - Understand how dependency injection works in `server.js`

---

## 🙋‍♂️ Getting Help

**Still confused?**
- Read the inline comments in the code
- Check the examples in [ARCHITECTURE.md](./ARCHITECTURE.md)
- Look at how existing features are implemented
- Ask questions in GitHub Issues

**Remember:** Clean Architecture has a learning curve, but it pays off in maintainability! 🚀
