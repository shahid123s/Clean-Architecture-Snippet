# Clean Architecture Node.js API Example

A production-ready Node.js/Express API example demonstrating **Clean Architecture**, **SOLID Principles**, and **Domain-Driven Design** concepts. Built as an educational resource for developers learning scalable backend architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Table of Contents

- [What is This Project?](#what-is-this-project)
- [Why Clean Architecture?](#why-clean-architecture)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Architecture Deep Dive](#architecture-deep-dive)
- [SOLID Principles in Action](#solid-principles-in-action)
- [Learning Resources](#learning-resources)

---

## 🎯 What is This Project?

This is a **User Management API** built with Node.js and Express that demonstrates how to structure a real-world application using Clean Architecture principles. It's designed as a learning resource for developers who want to:

- Understand Clean Architecture in a practical context
- See SOLID principles applied in JavaScript
- Learn how to structure scalable backend applications
- Understand the Repository pattern and Dependency Injection
- See how to integrate MongoDB while maintaining architectural integrity

**Tech Stack:**
- Node.js + Express
- MongoDB + Mongoose
- Clean Architecture
- SOLID Principles
- Repository Pattern
- Dependency Injection

---

## 🤔 Why Clean Architecture?

### The Problem with Traditional Layered Architecture

In traditional MVC or layered architectures, business logic often gets mixed with framework code, database logic, and UI concerns. This makes:

- **Testing difficult**: You need a database to test business logic
- **Changes expensive**: Changing the database means rewriting business logic
- **Framework lock-in**: You're married to Express, MongoDB, etc.

### The Clean Architecture Solution

Clean Architecture inverts the dependencies so that:

1. **Business logic is independent** of frameworks, databases, and UI
2. **Core logic is testable** without external dependencies
3. **Infrastructure is pluggable** - swap MongoDB for PostgreSQL with minimal changes
4. **Frameworks are tools**, not the foundation of your app

> **"The center of your application is not the database. Nor is it one or more of the frameworks you may be using. The center of your application is the use cases of your application"** - Robert C. Martin

---

## 📁 Project Structure

```
src/
├── domain/                           # Enterprise Business Rules
│   ├── entities/
│   │   └── user.entity.js            # Core business objects
│   └── dtos/
│       └── user.dto.js               # Data Transfer Objects
│
├── application/                      # Application Business Rules
│   ├── use-cases/                    # Application-specific business logic
│   │   ├── create-user.use-case.js
│   │   ├── get-all-users.use-case.js
│   │   └── get-user-by-id.use-case.js
│   ├── ports/                        # Interfaces (abstractions)
│   │   └── repositories/
│   │       └── user.repository.interface.js
│   └── mappers/                      # Entity ↔ DTO transformations
│       └── user.mapper.js
│
├── infrastructure/                   # External Interfaces (Frameworks & Drivers)
│   ├── database/
│   │   ├── connection.js             # MongoDB connection
│   │   └── schemas/
│   │       └── user.schema.js        # Mongoose schema
│   ├── repositories/                 # Concrete implementations
│   │   ├── in-memory-user.repository.js
│   │   └── mongo-user.repository.js
│   └── utils/
│       ├── logger.util.js
│       └── response.util.js
│
├── interfaces/                       # Interface Adapters (Controllers & Presenters)
│   ├── controllers/
│   │   ├── create-user.controller.js
│   │   └── get-users.controller.js
│   └── routes/
│       └── user.routes.js
│
├── config/
│   └── index.js                      # Configuration management
│
├── app.js                            # Express app setup
└── server.js                         # Composition Root (wiring dependencies)
```

### Layer Responsibilities

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| **Domain** | Core business entities and DTOs | None - Pure business logic |
| **Application** | Use cases and business rules | Domain only |
| **Infrastructure** | Database, external services | Application (via interfaces) |
| **Interfaces** | HTTP, CLI, etc. | Application |

---

## 🔑 Key Concepts

### 1. **Entities** (Domain Layer)
Pure business objects with domain logic. No framework dependencies.

```javascript
class UserEntity {
  constructor(id, name, email, role, createdAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt || new Date();
  }

  isAdmin() {
    return this.role === 'admin';
  }
}
```

### 2. **Use Cases** (Application Layer)
Application-specific business rules. Each use case does ONE thing.

```javascript
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository; // Depends on abstraction, not concrete class
  }

  async execute(data) {
    // Business logic here
    const newUser = new UserEntity(null, data.name, data.email, data.role);
    return await this.userRepository.create(newUser);
  }
}
```

### 3. **Repository Pattern** (Application Layer - Interface)
Abstracts data access. The application layer defines the interface, infrastructure implements it.

```javascript
// Application defines WHAT it needs
class UserRepositoryInterface {
  async create(userEntity) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}

// Infrastructure defines HOW to do it
class MongoUserRepository extends UserRepositoryInterface {
  async create(userEntity) {
    // MongoDB-specific implementation
  }
}
```

### 4. **Dependency Injection** (Composition Root)
All dependencies are wired in `server.js`. This is the ONLY place that knows about concrete implementations.

```javascript
// Wire everything together
const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const createUserController = new CreateUserController(createUserUseCase);
```

### 5. **DTOs** (Data Transfer Objects)
Decouple external API contracts from internal domain entities.

```javascript
// External API sees this
class UserDTO {
  constructor(id, name, email, role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }
}

// Internal domain is protected
class UserEntity {
  // Can have different structure, methods, validations
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote URI)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shahid123s/Clean-Architecture-Snippet.git
   cd Clean-Architecture-Snippet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/clean-arch-db
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Run the application**
   ```bash
   npm start
   ```

The server will start at `http://localhost:3000`

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. Create User
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"  // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "6926bfb147c4f54476d5b1b1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

#### 2. Get All Users
```http
GET /users
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "6926bfb147c4f54476d5b1b1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  ]
}
```

#### 3. Get User by ID
```http
GET /users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "6926bfb147c4f54476d5b1b1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```


---

## 🏗️ Architecture Deep Dive

### The Dependency Rule

**Dependencies point INWARD:**

```
Interfaces → Application → Domain
Infrastructure → Application → Domain
```

- **Domain** depends on nothing
- **Application** depends only on Domain
- **Infrastructure** depends on Application (via interfaces)
- **Interfaces** depends on Application

### Data Flow

**Request Flow:**
```
HTTP Request
  ↓
Controller (Interface Layer)
  ↓
Use Case (Application Layer)
  ↓
Repository Interface (Application Layer)
  ↓
Repository Implementation (Infrastructure Layer)
  ↓
Database
```

**Response Flow:**
```
Database
  ↓
Repository maps to Entity (Domain Layer)
  ↓
Use Case transforms to DTO (Domain Layer)
  ↓
Controller formats response
  ↓
HTTP Response
```

### Why This Matters

**Scenario: We want to switch from MongoDB to PostgreSQL**

With Clean Architecture:
1. Create a new `PostgresUserRepository` in infrastructure
2. Update `server.js` to use the new repository
3. **That's it!** Domain and Application layers are untouched

**Without Clean Architecture:**
- Rewrite business logic
- Update all controllers
- Change data models
- Hope you didn't break anything

---

## 💎 SOLID Principles in Action

### S - Single Responsibility Principle
Each class has ONE reason to change.

✅ **Good:** Each Use Case does one thing
```javascript
CreateUserUseCase  // Only creates users
GetAllUsersUseCase // Only retrieves all users
```

❌ **Bad:** One service does everything
```javascript
UserService {
  create()
  getAll()
  getById()
  update()
  delete()
  sendEmail()  // ❌ Multiple responsibilities!
}
```

### O - Open/Closed Principle
Open for extension, closed for modification.

✅ **Good:** We can add new repositories without changing Use Cases
```javascript
// Add a new repository without touching the Use Case
class CacheUserRepository extends UserRepositoryInterface {
  // New implementation
}
```

### L - Liskov Substitution Principle
Subtypes must be substitutable for their base types.

✅ **Good:** Any repository can replace another
```javascript
// Both are interchangeable
const repo1 = new InMemoryUserRepository();
const repo2 = new MongoUserRepository();
```

### I - Interface Segregation Principle
No client should depend on methods it doesn't use.

✅ **Good:** Small, focused interfaces
```javascript
UserRepositoryInterface {
  create()
  findAll()
  findById()
}
```

### D - Dependency Inversion Principle
Depend on abstractions, not concretions.

✅ **Good:** Use Case depends on interface
```javascript
class CreateUserUseCase {
  constructor(userRepository) {  // Depends on interface
    this.userRepository = userRepository;
  }
}
```

❌ **Bad:** Direct dependency on concrete class
```javascript
class CreateUserUseCase {
  constructor() {
    this.userRepository = new MongoUserRepository(); // ❌ Coupled to MongoDB
  }
}
```

---

## 📖 Learning Resources

### Related Concepts
- [The Clean Architecture (Article by Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)

### Additional Documentation
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Detailed architecture explanation
- [SOLID_PRINCIPLES.md](./docs/SOLID_PRINCIPLES.md) - SOLID principles with code examples

---

## 🤝 Contributing

Contributions are welcome! This is an educational project, so improvements to documentation and code clarity are especially appreciated.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Created as an educational resource for learning Clean Architecture in Node.js.

**Happy Learning! 🚀**
