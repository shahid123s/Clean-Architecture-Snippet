# SOLID Principles in Practice

This document shows how SOLID principles are applied in this codebase with concrete examples.

## Table of Contents
- [S - Single Responsibility Principle](#s---single-responsibility-principle)
- [O - Open/Closed Principle](#o---openclosed-principle)
- [L - Liskov Substitution Principle](#l---liskov-substitution-principle)
- [I - Interface Segregation Principle](#i---interface-segregation-principle)
- [D - Dependency Inversion Principle](#d---dependency-inversion-principle)

---

## S - Single Responsibility Principle

> A class should have one, and only one, reason to change.

### ❌ Bad Example (Without SRP)

```javascript
// One service doing everything
class UserService {
  async createUser(data) {
    // Validation
    if (!data.email) throw new Error('Invalid email');
    
    // Create user
    const user = new User(data);
    
    // Save to database
    await mongodb.collection('users').insertOne(user);
    
    // Send welcome email
    await sendEmail(user.email, 'Welcome!');
    
    // Log to analytics
    await analytics.track('user_created', user);
    
    return user;
  }
  
  async getUsers() { /* ... */ }
  async updateUser() { /* ... */ }
  async deleteUser() { /* ... */ }
  async sendPasswordReset() { /* ... */ }
}
```

**Problems:**
- Changes to email logic require changing UserService
- Changes to database require changing UserService
- Changes to analytics require changing UserService
- Hard to test in isolation
- Violates SRP - multiple reasons to change

### ✅ Good Example (With SRP)

```javascript
// Each class has ONE responsibility

// 1. Creating users
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(data) {
    if (!data.name || !data.email) {
      throw new Error('Name and email are required');
    }

    const newUser = new UserEntity(null, data.name, data.email, data.role);
    return await this.userRepository.create(newUser);
  }
}

// 2. Getting all users
class GetAllUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute() {
    return await this.userRepository.findAll();
  }
}

// 3. Getting user by ID
class GetUserByIdUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}
```

**Benefits:**
- Each class has one reason to change
- Easy to test each use case independently
- Easy to understand what each class does
- Changes are isolated

### In Our Codebase

| File | Single Responsibility |
|------|----------------------|
| `user.entity.js` | Represents a user domain object |
| `create-user.use-case.js` | Creates users |
| `get-all-users.use-case.js` | Retrieves all users |
| `mongo-user.repository.js` | Persists users to MongoDB |
| `user.mapper.js` | Maps between entities and DTOs |
| `create-user.controller.js` | Handles HTTP requests for user creation |

---

## O - Open/Closed Principle

> Software entities should be open for extension, but closed for modification.

### ❌ Bad Example (Violates OCP)

```javascript
class UserRepository {
  async save(user) {
    const dbType = process.env.DB_TYPE;
    
    if (dbType === 'mongodb') {
      await mongodb.collection('users').insertOne(user);
    } else if (dbType === 'postgres') {
      await postgres.query('INSERT INTO users ...', user);
    } else if (dbType === 'mysql') {
      await mysql.query('INSERT INTO users ...', user);
    }
    // Adding new database = modifying this class ❌
  }
}
```

**Problem:** Every new database requires modifying the `save()` method.

### ✅ Good Example (Follows OCP)

```javascript
// Abstract interface (can't modify)
class UserRepositoryInterface {
  async create(user) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}

// Extend with MongoDB (no modification to interface)
class MongoUserRepository extends UserRepositoryInterface {
  async create(user) {
    const userModel = new UserModel(user);
    return await userModel.save();
  }
  
  async findAll() {
    return await UserModel.find();
  }
  
  async findById(id) {
    return await UserModel.findById(id);
  }
}

// Extend with PostgreSQL (no modification to interface or MongoDB)
class PostgresUserRepository extends UserRepositoryInterface {
  async create(user) {
    const result = await this.pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      [user.name, user.email]
    );
    return result.rows[0];
  }
  
  async findAll() {
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows;
  }
  
  async findById(id) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}

// Use cases don't change!
class CreateUserUseCase {
  constructor(userRepository) { // Works with ANY repository
    this.userRepository = userRepository;
  }

  async execute(data) {
    const user = new UserEntity(null, data.name, data.email);
    return await this.userRepository.create(user);
  }
}
```

**Benefits:**
- Add new databases without touching use cases
- Add new features by extending, not modifying
- Original code remains stable

### In Our Codebase

We can easily add new repositories:

```javascript
// server.js - Easy to switch implementations

// Option 1: In-memory (for testing)
const userRepository = new InMemoryUserRepository();

// Option 2: MongoDB (production)
const userRepository = new MongoUserRepository();

// Option 3: PostgreSQL (future)
const userRepository = new PostgresUserRepository();

// Option 4: Cache-wrapped (optimization)
const userRepository = new CachedUserRepository(
  new MongoUserRepository()
);

// Use cases don't change!
const createUserUseCase = new CreateUserUseCase(userRepository);
```

---

## L - Liskov Substitution Principle

> Objects of a superclass should be replaceable with objects of a subclass without breaking the application.

### ❌ Bad Example (Violates LSP)

```javascript
class Bird {
  fly() {
    return "Flying in the sky";
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Penguins can't fly!"); // ❌ Breaks LSP
  }
}

function makeBirdFly(bird) {
  return bird.fly(); // Crashes if bird is a Penguin
}
```

**Problem:** Substituting `Penguin` for `Bird` breaks the application.

### ✅ Good Example (Follows LSP)

```javascript
// Abstract repository
class UserRepositoryInterface {
  async create(user) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}

// All implementations follow the same contract
class MongoUserRepository extends UserRepositoryInterface {
  async create(user) {
    // Returns UserEntity
    const saved = await UserModel.create(user);
    return this._mapToEntity(saved);
  }
}

class InMemoryUserRepository extends UserRepositoryInterface {
  async create(user) {
    // Also returns UserEntity (same contract)
    this.users.push(user);
    return user;
  }
}

// Use case works with ANY repository
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository; // Can be ANY implementation
  }

  async execute(data) {
    const user = new UserEntity(null, data.name, data.email);
    // Always returns UserEntity, regardless of which repo
    return await this.userRepository.create(user);
  }
}
```

**Benefits:**
- Any repository can be swapped without breaking use cases
- All implementations respect the same contract
- Tests can use in-memory, production uses MongoDB

### In Our Codebase

```javascript
// Both repositories are interchangeable
function testCreateUser() {
  // Test with in-memory (fast, no database needed)
  const repo = new InMemoryUserRepository();
  const useCase = new CreateUserUseCase(repo);
  const user = await useCase.execute({ name: 'Test', email: 'test@example.com' });
  assert(user instanceof UserEntity);
}

function productionCreateUser() {
  // Production with MongoDB
  const repo = new MongoUserRepository();
  const useCase = new CreateUserUseCase(repo);
  const user = await useCase.execute({ name: 'John', email: 'john@example.com' });
  assert(user instanceof UserEntity); // Same behavior!
}
```

---

## I - Interface Segregation Principle

> A client should not be forced to depend on methods it does not use.

### ❌ Bad Example (Violates ISP)

```javascript
// Fat interface
class SuperRepository {
  // User methods
  createUser() {}
  findUser() {}
  updateUser() {}
  deleteUser() {}
  
  // Post methods (user repo doesn't need these!)
  createPost() {}
  findPost() {}
  
  // Admin methods (regular users don't need these!)
  deleteAllData() {}
  resetDatabase() {}
  exportData() {}
}

// Now CreateUserUseCase depends on methods it doesn't use
class CreateUserUseCase {
  constructor(repository) {
    this.repository = repository; // Has createPost, deleteAllData, etc. ❌
  }

  async execute(data) {
    return await this.repository.createUser(data);
    // Only needs createUser, but forced to depend on everything
  }
}
```

**Problems:**
- Changes to `createPost` might affect `CreateUserUseCase`
- `CreateUserUseCase` depends on methods it never uses
- Hard to test - must mock entire SuperRepository

### ✅ Good Example (Follows ISP)

```javascript
// Small, focused interface
class UserRepositoryInterface {
  async create(user) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  // That's it! No unrelated methods
}

// Use case only depends on what it needs
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository; // Only user methods
  }

  async execute(data) {
    const user = new UserEntity(null, data.name, data.email);
    return await this.userRepository.create(user); // Only uses create()
  }
}

// Separate interface for posts
class PostRepositoryInterface {
  async create(post) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
}
```

**Benefits:**
- Use cases only depend on methods they actually use
- Changes are isolated
- Easy to test with minimal mocks

### In Our Codebase

Each repository has a focused interface:

```javascript
// user.repository.interface.js
class UserRepositoryInterface {
  async create(userEntity) { }
  async findAll() { }
  async findById(id) { }
}

// If we add posts later, separate interface
// post.repository.interface.js
class PostRepositoryInterface {
  async create(postEntity) { }
  async findByUserId(userId) { }
}

// Use cases depend only on what they need
class CreateUserUseCase {
  constructor(userRepository) { // Only UserRepository
    this.userRepository = userRepository;
  }
}

class CreatePostUseCase {
  constructor(postRepository) { // Only PostRepository
    this.postRepository = postRepository;
  }
}
```

---

## D - Dependency Inversion Principle

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

### ❌ Bad Example (Violates DIP)

```javascript
// Low-level module
class MongoDatabase {
  async save(data) {
    await mongodb.collection('users').insertOne(data);
  }
}

// High-level module DEPENDS on low-level module ❌
class CreateUserUseCase {
  constructor() {
    this.database = new MongoDatabase(); // Direct dependency!
  }

  async execute(data) {
    const user = { name: data.name, email: data.email };
    await this.database.save(user);
  }
}
```

**Problems:**
- `CreateUserUseCase` is coupled to MongoDB
- Can't test without MongoDB
- Can't switch to PostgreSQL without rewriting UseCase
- High-level logic depends on low-level implementation

### ✅ Good Example (Follows DIP)

```javascript
// Abstraction (interface)
class UserRepositoryInterface {
  async create(user) { throw new Error('Not implemented'); }
}

// High-level module depends on abstraction
class CreateUserUseCase {
  constructor(userRepository) { // Depends on INTERFACE
    this.userRepository = userRepository;
  }

  async execute(data) {
    const user = new UserEntity(null, data.name, data.email);
    return await this.userRepository.create(user);
    // Doesn't know or care if it's MongoDB, PostgreSQL, or in-memory
  }
}

// Low-level module implements the abstraction
class MongoUserRepository extends UserRepositoryInterface {
  async create(user) {
    // MongoDB-specific implementation
  }
}

class PostgresUserRepository extends UserRepositoryInterface {
  async create(user) {
    // PostgreSQL-specific implementation
  }
}

// Dependency Injection at composition root
const repository = new MongoUserRepository(); // or PostgresUserRepository
const useCase = new CreateUserUseCase(repository);
```

**Benefits:**
- Use case doesn't depend on specific database
- Easy to test with mock repository
- Easy to switch implementations
- Follows the dependency rule

### Dependency Flow

```
Before (Violates DIP):
┌─────────────────┐
│   CreateUser    │
│   Use Case      │
│  (High-level)   │
└────────┬────────┘
         │
         ↓ depends on
┌────────────────┐
│  MongoDatabase │
│  (Low-level)   │
└────────────────┘
```

```
After (Follows DIP):
┌─────────────────┐
│   CreateUser    │
│   Use Case      │
│  (High-level)   │
└────────┬────────┘
         │
         ↓ depends on
┌────────────────────┐
│    Repository      │
│   Interface        │
│  (Abstraction)     │
└────────┬───────────┘
         ↑ implements
┌────────┴────────┐
│  MongoDatabase  │
│  (Low-level)    │
└─────────────────┘
```

### In Our Codebase

**Abstraction (Application Layer):**
```javascript
// src/application/ports/repositories/user.repository.interface.js
class UserRepositoryInterface {
  async create(userEntity) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}
```

**High-level module depends on abstraction:**
```javascript
// src/application/use-cases/create-user.use-case.js
class CreateUserUseCase {
  constructor(userRepository) { // Abstraction
    this.userRepository = userRepository;
  }

  async execute(data) {
    const user = new UserEntity(null, data.name, data.email, data.role);
    return await this.userRepository.create(user);
  }
}
```

**Low-level module implements abstraction:**
```javascript
// src/infrastructure/repositories/mongo-user.repository.js
class MongoUserRepository extends UserRepositoryInterface {
  async create(userEntity) {
    const userModel = new UserModel({
      name: userEntity.name,
      email: userEntity.email,
      role: userEntity.role,
    });
    return await userModel.save();
  }
}
```

**Wiring at composition root:**
```javascript
// src/server.js
const userRepository = new MongoUserRepository(); // Concrete implementation
const createUserUseCase = new CreateUserUseCase(userRepository); // Inject
```

---

## Summary

| Principle | What it means | How we apply it |
|-----------|--------------|-----------------|
| **SRP** | One class, one responsibility | Each Use Case does ONE thing |
| **OCP** | Open for extension, closed for modification | Add new repos without changing use cases |
| **LSP** | Subtypes must be substitutable | Any repository works with any use case |
| **ISP** | Don't depend on unused methods | Small, focused repository interfaces |
| **DIP** | Depend on abstractions, not concretions | Use cases depend on repository interface |

## Testing the Principles

Try these exercises:

1. **SRP:** Add a new use case (e.g., `UpdateUserUseCase`)
2. **OCP:** Add a `CachedUserRepository` without modifying existing code
3. **LSP:** Swap `MongoUserRepository` for `InMemoryUserRepository` in `server.js`
4. **ISP:** Split `UserRepository` if it grows too large
5. **DIP:** Add a new repository type (e.g., `RedisUserRepository`)

If you can do these without breaking existing code, you're applying SOLID correctly! 🎉
