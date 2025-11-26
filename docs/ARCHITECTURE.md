# Architecture Deep Dive

## Table of Contents
- [The Clean Architecture Layers](#the-clean-architecture-layers)
- [Dependency Rule](#dependency-rule)
- [Data Flow](#data-flow)
- [Why Each Layer Matters](#why-each-layer-matters)
- [Trade-offs and When to Use](#trade-offs-and-when-to-use)

---

## The Clean Architecture Layers

Clean Architecture organizes code into concentric circles, where each circle represents a different area of software. The key rule is: **source code dependencies can only point inward**.

### Visual Representation

```
┌─────────────────────────────────────────────────────┐
│                  Frameworks & Drivers                │
│              (Interfaces & Infrastructure)            │
│  ┌───────────────────────────────────────────────┐  │
│  │           Interface Adapters                  │  │
│  │         (Controllers, Presenters)             │  │
│  │  ┌───────────────────────────────────────┐   │  │
│  │  │      Application Business Rules        │   │  │
│  │  │          (Use Cases)                   │   │  │
│  │  │  ┌─────────────────────────────────┐  │   │  │
│  │  │  │  Enterprise Business Rules       │  │   │  │
│  │  │  │      (Entities & DTOs)           │  │   │  │
│  │  │  └─────────────────────────────────┘  │   │  │
│  │  └───────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Layer Breakdown in Our Project

#### 1. Domain Layer (Center - Enterprise Business Rules)
**Location:** `src/domain/`

**Purpose:** Core business logic that would exist even if there were no application.

**Contents:**
- `entities/` - Business objects with methods and properties
- `dtos/` - Data structures for transferring data between layers

**Example:**
```javascript
// user.entity.js
class UserEntity {
  constructor(id, name, email, role, createdAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt || new Date();
  }

  // Domain logic
  isAdmin() {
    return this.role === 'admin';
  }

  canEditUser(targetUserId) {
    return this.isAdmin() || this.id === targetUserId;
  }
}
```

**Dependencies:** NONE - This is pure business logic

**Why it matters:** You can test business logic without Express, MongoDB, or any framework.

---

#### 2. Application Layer (Application Business Rules)
**Location:** `src/application/`

**Purpose:** Application-specific business rules. Orchestrates the flow of data to and from entities.

**Contents:**
- `use-cases/` - One class per use case (SRP)
- `ports/` - Interfaces (abstractions) for infrastructure
- `mappers/` - Transform data between layers

**Example:**
```javascript
// create-user.use-case.js
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository; // Depends on interface, not implementation
  }

  async execute(data) {
    // Validation (application rule)
    if (!data.name || !data.email) {
      throw new Error('Name and email are required');
    }

    // Create domain entity
    const newUser = new UserEntity(null, data.name, data.email, data.role);
    
    // Persist using repository port
    const savedUser = await this.userRepository.create(newUser);
    
    // Return DTO (not entity)
    return UserMapper.toDTO(savedUser);
  }
}
```

**Dependencies:** Domain layer only

**Why it matters:** Business rules are isolated from HTTP, databases, and frameworks.

---

#### 3. Infrastructure Layer (Frameworks & Drivers)
**Location:** `src/infrastructure/`

**Purpose:** Implements the interfaces defined by the Application layer.

**Contents:**
- `database/` - DB connection and schemas
- `repositories/` - Concrete repository implementations
- `utils/` - Framework-specific utilities

**Example:**
```javascript
// mongo-user.repository.js
class MongoUserRepository extends UserRepositoryInterface {
  async create(userEntity) {
    // Convert Entity → Mongoose Document
    const userModel = new UserModel({
      name: userEntity.name,
      email: userEntity.email,
      role: userEntity.role,
    });

    const savedUser = await userModel.save();

    // Convert Mongoose Document → Entity
    return this._mapToEntity(savedUser);
  }

  _mapToEntity(mongoDoc) {
    return new UserEntity(
      mongoDoc._id.toString(),
      mongoDoc.name,
      mongoDoc.email,
      mongoDoc.role,
      mongoDoc.createdAt
    );
  }
}
```

**Dependencies:** Application layer (via interfaces)

**Why it matters:** You can swap MongoDB for PostgreSQL by creating a new repository. Use cases don't change.

---

#### 4. Interfaces Layer (Interface Adapters)
**Location:** `src/interfaces/`

**Purpose:** Converts data from external format (HTTP) to the format needed by use cases.

**Contents:**
- `controllers/` - HTTP request handlers
- `routes/` - Route definitions

**Example:**
```javascript
// create-user.controller.js
class CreateUserController {
  constructor(createUserUseCase) {
    this.createUserUseCase = createUserUseCase;
  }

  async handle(req, res) {
    try {
      // Extract data from HTTP request
      const userData = req.body;
      
      // Execute use case
      const userDTO = await this.createUserUseCase.execute(userData);
      
      // Format HTTP response
      sendResponse(res, 201, true, 'User created successfully', userDTO);
    } catch (error) {
      sendResponse(res, 400, false, error.message);
    }
  }
}
```

**Dependencies:** Application layer

**Why it matters:** You can add GraphQL, CLI, or WebSocket interfaces without changing business logic.

---

## Dependency Rule

**Rule:** Source code dependencies can only point INWARD.

```
┌──────────────┐
│ Interfaces   │────┐
└──────────────┘    │
                    ↓
┌──────────────┐    ↓
│Infrastructure│────┤
└──────────────┘    │
                    ↓
                ┌───────────┐
                │Application│
                └───────────┘
                      ↓
                  ┌──────┐
                  │Domain│
                  └──────┘
```

### What This Means

1. **Domain** knows nothing about other layers
2. **Application** knows about Domain, but not Infrastructure or Interfaces
3. **Infrastructure** implements interfaces defined by Application
4. **Interfaces** orchestrate Application use cases

### How We Achieve This

**Problem:** Use cases need to save data, but can't depend on MongoDB.

**Solution:** Dependency Inversion

```javascript
// Application Layer defines WHAT it needs (interface)
class UserRepositoryInterface {
  async create(user) { throw new Error('Not implemented'); }
}

// Application Use Case depends on the interface
class CreateUserUseCase {
  constructor(userRepository) { // Receives abstraction
    this.userRepository = userRepository;
  }
}

// Infrastructure implements the interface
class MongoUserRepository extends UserRepositoryInterface {
  async create(user) {
    // MongoDB-specific implementation
  }
}

// Composition Root wires concrete implementation
const repository = new MongoUserRepository();
const useCase = new CreateUserUseCase(repository);
```

---

## Data Flow

### Request Flow (Inward)

```
1. HTTP Request
      ↓
2. Express Route
      ↓
3. Controller (Interfaces)
   - Extracts data from request
      ↓
4. Use Case (Application)
   - Validates input
   - Creates Entity (Domain)
   - Calls Repository Interface
      ↓
5. Repository Implementation (Infrastructure)
   - Maps Entity → Database Model
   - Saves to MongoDB
      ↓
6. Database
```

### Response Flow (Outward)

```
1. Database
      ↓
2. Repository Implementation (Infrastructure)
   - Maps Database Model → Entity (Domain)
      ↓
3. Use Case (Application)
   - Maps Entity → DTO (Domain)
   - Returns DTO
      ↓
4. Controller (Interfaces)
   - Formats DTO for HTTP
      ↓
5. HTTP Response
```

### Example: Creating a User

**Step-by-step:**

```javascript
// 1. HTTP Request arrives
POST /api/v1/users
{ "name": "John", "email": "john@example.com" }

// 2. Route directs to Controller
router.post('/', (req, res) => createUserController.handle(req, res));

// 3. Controller extracts data and calls Use Case
const userDTO = await this.createUserUseCase.execute(req.body);

// 4. Use Case creates Entity
const newUser = new UserEntity(null, data.name, data.email, data.role);

// 5. Use Case calls Repository Interface
const savedUser = await this.userRepository.create(newUser);

// 6. Repository converts Entity to Mongoose Model
const userModel = new UserModel({
  name: userEntity.name,
  email: userEntity.email,
  role: userEntity.role,
});

// 7. Repository saves to MongoDB
const savedDoc = await userModel.save();

// 8. Repository converts back to Entity
return new UserEntity(savedDoc._id.toString(), savedDoc.name, ...);

// 9. Use Case converts Entity to DTO
return UserMapper.toDTO(savedUser);

// 10. Controller sends HTTP Response
res.status(201).json({ success: true, data: userDTO });
```

---

## Why Each Layer Matters

### Domain Layer
**Problem it solves:** Business logic scattered across controllers and database models.

**Without it:**
```javascript
// ❌ Business logic in controller
app.post('/users', (req, res) => {
  if (req.body.role === 'admin') {
    // Admin logic here
  }
});

// ❌ Business logic in database model
userSchema.methods.canEdit = function(targetId) {
  return this.role === 'admin' || this._id === targetId;
};
```

**With it:**
```javascript
// ✅ Business logic in domain
class UserEntity {
  canEditUser(targetUserId) {
    return this.isAdmin() || this.id === targetUserId;
  }
}
```

### Application Layer
**Problem it solves:** Complex orchestration mixed with HTTP and persistence concerns.

**Without it:**
```javascript
// ❌ Everything in one controller
app.post('/users', async (req, res) => {
  // Validation
  if (!req.body.email) return res.status(400).json({ error: 'Invalid' });
  
  // Business logic
  const user = new User(req.body);
  
  // Persistence
  await user.save();
  
  // Response formatting
  res.json({ success: true, data: user });
});
```

**With it:**
```javascript
// ✅ Separated concerns
class CreateUserUseCase {
  async execute(data) {
    // Only business logic
    const user = new UserEntity(null, data.name, data.email);
    return await this.repository.create(user);
  }
}
```

### Infrastructure Layer
**Problem it solves:** Database coupled to business logic.

**Benefit:** Swap databases without touching business logic.

```javascript
// Start with MongoDB
const repo = new MongoUserRepository();

// Later, switch to PostgreSQL
const repo = new PostgresUserRepository();

// Use cases don't change!
const useCase = new CreateUserUseCase(repo);
```

### Interfaces Layer
**Problem it solves:** HTTP logic mixed with business logic.

**Benefit:** Add multiple interfaces (HTTP, GraphQL, CLI) using the same use cases.

```javascript
// HTTP Interface
class CreateUserController {
  async handle(req, res) {
    const dto = await this.useCase.execute(req.body);
    res.json(dto);
  }
}

// GraphQL Interface
const createUserMutation = {
  async createUser(args) {
    return await createUserUseCase.execute(args);
  }
};

// CLI Interface
program.command('create-user')
  .action(async (name, email) => {
    await createUserUseCase.execute({ name, email });
  });
```

---

## Trade-offs and When to Use

### When to Use Clean Architecture

✅ **Good for:**
- Applications that will grow in complexity
- Projects with long lifespans
- Teams with multiple developers
- When you might switch databases or frameworks
- When business logic is complex

❌ **Overkill for:**
- Simple CRUD apps with no complex business logic
- Prototypes and MVPs
- Small scripts and utilities
- Projects with 1-2 month lifespan

### Trade-offs

| Pros | Cons |
|------|------|
| Testable business logic | More files and folders |
| Framework independence | Initial setup complexity |
| Swappable infrastructure | Learning curve for team |
| Clear separation of concerns | More abstraction layers |
| Scalable architecture | Can feel over-engineered for simple apps |

### The Pragmatic Approach

You don't need to be dogmatic about Clean Architecture. Start with:

1. **Separate domain logic from infrastructure** (most important)
2. **Use repository pattern** for data access
3. **Dependency injection** for flexibility

Then gradually add more structure as complexity grows.

---

## Next Steps

- See [SOLID_PRINCIPLES.md](./SOLID_PRINCIPLES.md) for detailed SOLID examples
- Study the codebase to see these concepts in action
- Try adding a new feature (e.g., UpdateUser use case)
- Experiment with swapping MongoDB for an in-memory repository

**Remember:** Clean Architecture is a tool, not a religion. Use it when it makes sense for your project.
