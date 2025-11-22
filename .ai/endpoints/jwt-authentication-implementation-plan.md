# Implementation Plan: JWT Authentication System (Register & Login)

## 1. Requirements Analysis

### Functional Requirements
- Implement JWT-based authentication system using LexikJWTAuthenticationBundle
- Create POST /api/auth/register endpoint for user registration with automatic shop creation
- Create POST /api/auth/login endpoint for user authentication
- JWT tokens must contain `userId` and `email` claims
- Token expiration: 1 hour (3600 seconds)
- Password hashing using Symfony PasswordHasher (bcrypt/argon2)
- Automatic creation of 4 default pages (home, catalog, product, contact) on registration
- Automatic creation of shop with default theme settings on registration
- Email uniqueness validation
- Password strength validation (minimum 8 characters)
- Return user and shop data on successful registration
- Return JWT token and user data on successful login
- No authentication required for these endpoints (public access)

### Non-Functional Requirements
- **Security**: Passwords never returned in responses, secure token generation, protection against timing attacks
- **Performance**: Registration within 500ms, login within 500ms
- **Validation**: Comprehensive input validation with detailed error messages
- **Error Handling**: Consistent error response format across endpoints
- **Logging**: Security-aware logging (log failed attempts without exposing sensitive data)
- **Data Isolation**: Each user has isolated shop and page data via foreign keys
- **Transaction Safety**: Registration must be atomic (user + shop + pages created together or not at all)

### Business Context
The authentication system is the gateway to the Theme Builder application. Users must register to create their shop and authenticate to access protected endpoints (shop management, theme settings, page editing, image uploads). The system follows REST principles and JWT standard (RFC 7519) for stateless authentication.

---

## 2. Architectural Overview

### Design Pattern Selection

**JWT Authentication Pattern**: Stateless authentication using signed JSON Web Tokens. Server verifies token signature and expiration without database lookup on every request (except user data fetching if needed).

**Repository Pattern**: Doctrine ORM repositories for User entity data access. Repository handles CRUD operations and query construction.

**Service Layer Pattern**: Business logic orchestration in AuthService and ShopInitializationService. Controllers remain thin, delegating to services.

**Request DTO Pattern**: Symfony validation attributes on request DTOs (RegisterRequest, LoginRequest) for automatic validation before business logic execution.

**ReadModel Pattern**: UserReadModel and ShopReadModel decouple domain entities from API responses, preventing accidental data exposure.

**Transaction Management**: Doctrine transactions ensure atomic registration (user + shop + pages created together).

### Layered Architecture

```
Controller Layer (AuthController)
    ↓ (validates and delegates)
Service Layer (AuthService, ShopInitializationService, DefaultLayoutService)
    ↓ (orchestrates and calls)
Repository Layer (UserRepository, ShopRepository, PageRepository)
    ↓ (persists and queries)
Database (PostgreSQL)
    ↓ (returns entities)
Repository Layer (constructs ReadModels)
    ↓ (returns ReadModels)
Service Layer (processes and returns)
    ↓ (returns DTOs or tokens)
Controller Layer (serializes to JSON)
```

### Key Architectural Decisions

1. **LexikJWTAuthenticationBundle**: Industry-standard Symfony JWT implementation. Provides token generation, validation, and security integration out of the box.

2. **RS256 Algorithm**: Asymmetric encryption (public/private key pair) for JWT signing. More secure than symmetric HS256, allows token verification without exposing signing key.

3. **User Entity as Security UserInterface**: Implement Symfony's UserInterface to integrate with Security component. Enables future protected endpoint authentication via security.yaml firewalls.

4. **No Refresh Tokens in MVP**: Users re-authenticate after token expiration. Refresh tokens add complexity and are deferred to post-MVP.

5. **Atomic Registration**: Use Doctrine transactions to ensure user, shop, and pages are created together. Rollback on any failure prevents orphaned data.

6. **Default Layout Service**: Centralized service provides default page layouts for all page types. Ensures consistency and simplifies registration logic.

7. **Password Validation**: Minimum 8 characters in MVP. Post-MVP: complexity requirements (uppercase, lowercase, number, special character).

8. **Email Validation**: RFC 5322 format validation. Database UNIQUE constraint prevents race conditions.

9. **Shop Name Uniqueness**: UNIQUE constraint on shop name prevents duplicate shops (per API plan Section 2.1).

10. **Token Claims**: Include `userId` (UUID string) and `email` (string) in JWT payload for easy identification without database lookup.

---

## 3. Technical Specification

### Database Schema (Existing)

**users table**:
- `id` (uuid, PK)
- `email` (varchar(255), UNIQUE, NOT NULL)
- `password` (varchar(255), NOT NULL) - hashed
- `created_at` (timestamp, DEFAULT now())
- `updated_at` (timestamp, DEFAULT now())

**shops table**:
- `id` (uuid, PK)
- `user_id` (uuid, FK → users.id, UNIQUE, NOT NULL)
- `name` (varchar(60), UNIQUE, NOT NULL)
- `theme_settings` (jsonb, NOT NULL)
- `created_at` (timestamp, DEFAULT now())
- `updated_at` (timestamp, DEFAULT now())

**pages table**:
- `id` (uuid, PK)
- `shop_id` (uuid, FK → shops.id, NOT NULL)
- `type` (page_type_enum: home, catalog, product, contact)
- `layout` (jsonb, NOT NULL)
- `created_at` (timestamp, DEFAULT now())
- `updated_at` (timestamp, DEFAULT now())
- UNIQUE constraint on (shop_id, type)

**Foreign Key Cascade**:
- Delete user → Cascade delete shop → Cascade delete pages

---

### API Contract - Registration

**Endpoint**: `POST /api/auth/register`

**Route Attribute**:
```php
#[Route('/api/auth/register', name: 'auth_register', methods: ['POST'])]
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "shop_name": "My Shop"
}
```

**Success Response (201 Created)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2025-10-15T10:30:00Z"
  },
  "shop": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "My Shop",
    "created_at": "2025-10-15T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request)** - Validation Error:
```json
{
  "error": "validation_error",
  "message": "Invalid email format",
  "field": "email"
}
```

**Error Response (409 Conflict)** - Email Exists:
```json
{
  "error": "email_exists",
  "message": "An account with this email already exists"
}
```

**Error Response (409 Conflict)** - Shop Name Exists:
```json
{
  "error": "shop_exists",
  "message": "A shop with this name already exists"
}
```

**Error Response (500 Internal Server Error)**:
```json
{
  "error": "registration_failed",
  "message": "Registration failed. Please try again."
}
```

---

### API Contract - Login

**Endpoint**: `POST /api/auth/login`

**Route Attribute**:
```php
#[Route('/api/auth/login', name: 'auth_login', methods: ['POST'])]
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTczNjQwMDAsImV4cCI6MTY5NzM2NzYwMCwidXNlcklkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0.signature",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**JWT Token Payload**:
```json
{
  "iat": 1697364000,
  "exp": 1697367600,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

**Error Response (401 Unauthorized)** - Invalid Credentials:
```json
{
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}
```

**Error Response (500 Internal Server Error)**:
```json
{
  "error": "login_failed",
  "message": "Login failed. Please try again."
}
```

---

### Component Specifications

#### 1. User Entity (src/Model/Entity/User.php)

**Responsibility**: Domain entity representing a user account. Implements Symfony UserInterface for security integration.

**Properties**:
- `id` (UuidV7, PK)
- `email` (Email, unique)
- `password` (Password value object, hashed)
- `createdAt` (DateTimeImmutable)
- `updatedAt` (DateTimeImmutable)

**Methods**:
- `__construct(Email $email, Password $password)` - Creates new user with generated UUID
- `getEmail(): Email`
- `setPassword(Password $password): void`
- `getUserIdentifier(): string` - Returns email (required by UserInterface)
- `getRoles(): array` - Returns ['ROLE_USER'] (required by UserInterface)
- `eraseCredentials(): void` - No-op (no temporary credentials stored)
- `getPassword(): string` - Returns hashed password string (required by UserInterface)

**Doctrine Mapping**:
- Table: `users`
- ID generation strategy: Custom (UuidV7 in constructor)
- Email: unique constraint
- Lifecycle callbacks: `#[HasLifecycleCallbacks]` for updated_at

**Design Notes**:
- Implements `Symfony\Component\Security\Core\User\UserInterface`
- Email and Password are value objects for validation and type safety
- createdAt set in constructor, updatedAt via `#[PreUpdate]` callback
- No plain text password storage (Password VO encapsulates hashing)

#### 2. Email Value Object (src/Model/ValueObject/Email.php)

**Responsibility**: Encapsulates email validation and ensures valid email format.

**Properties**:
- `value` (string, readonly)

**Methods**:
- `__construct(string $value)` - Validates email format (RFC 5322), throws InvalidArgumentException if invalid
- `getValue(): string`
- `__toString(): string`
- `equals(Email $other): bool`

**Validation**:
- Use `filter_var($value, FILTER_VALIDATE_EMAIL)` for RFC 5322 compliance
- Trim whitespace before validation
- Convert to lowercase for consistency

#### 3. Password Value Object (src/Model/ValueObject/Password.php)

**Responsibility**: Encapsulates password hashing and validation.

**Properties**:
- `hashedValue` (string, readonly)

**Static Factory Methods**:
- `fromPlainText(string $plainPassword, PasswordHasherInterface $hasher): self` - Hashes password
- `fromHash(string $hash): self` - Creates from existing hash (for entity hydration)

**Methods**:
- `getHash(): string`
- `verify(string $plainPassword, PasswordHasherInterface $hasher): bool`

**Validation**:
- Minimum 8 characters (in fromPlainText)
- Maximum 72 characters (bcrypt limitation)
- Throw InvalidArgumentException for invalid passwords

**Design Notes**:
- Immutable (readonly property)
- Hashing done via Symfony PasswordHasherInterface (bcrypt or argon2)
- Never store plain text password

#### 4. Shop Entity (src/Model/Entity/Shop.php)

**Responsibility**: Domain entity representing a user's shop.

**Properties**:
- `id` (UuidV7, PK)
- `userId` (UuidV7, FK, unique)
- `name` (ShopName value object)
- `themeSettings` (ThemeSettings value object)
- `createdAt` (DateTimeImmutable)
- `updatedAt` (DateTimeImmutable)

**Methods**:
- `__construct(UuidV7 $userId, ShopName $name, ThemeSettings $themeSettings)`
- `getName(): ShopName`
- `setName(ShopName $name): void`
- `getThemeSettings(): ThemeSettings`
- `updateThemeSettings(ThemeSettings $settings): void`

**Doctrine Mapping**:
- Table: `shops`
- userId: unique constraint, foreign key to users.id
- themeSettings: JSONB type, custom Doctrine type
- Lifecycle callbacks for updated_at

#### 5. Page Entity (src/Model/Entity/Page.php)

**Responsibility**: Domain entity representing a shop page.

**Properties**:
- `id` (UuidV7, PK)
- `shopId` (UuidV7, FK)
- `type` (PageType enum)
- `layout` (Layout value object)
- `createdAt` (DateTimeImmutable)
- `updatedAt` (DateTimeImmutable)

**Methods**:
- `__construct(UuidV7 $shopId, PageType $type, Layout $layout)`
- `getType(): PageType`
- `getLayout(): Layout`
- `updateLayout(Layout $layout): void`

**Doctrine Mapping**:
- Table: `pages`
- Unique constraint: (shop_id, type)
- layout: JSONB type, custom Doctrine type

#### 6. RegisterRequest DTO (src/Request/RegisterRequest.php)

**Responsibility**: Request DTO for registration endpoint validation.

**Properties**:
- `email` (string, #[NotBlank], #[Email])
- `password` (string, #[NotBlank], #[Length(min: 8, max: 72)])
- `shopName` (string, #[NotBlank], #[Length(min: 1, max: 60)])

**Methods**:
- `getEmail(): string`
- `getPassword(): string`
- `getShopName(): string`

**Validation Constraints**:
- Email: NotBlank, Email (RFC 5322)
- Password: NotBlank, Length(min: 8, max: 72)
- ShopName: NotBlank, Length(min: 1, max: 60)

#### 7. LoginRequest DTO (src/Request/LoginRequest.php)

**Responsibility**: Request DTO for login endpoint validation.

**Properties**:
- `email` (string, #[NotBlank], #[Email])
- `password` (string, #[NotBlank])

**Methods**:
- `getEmail(): string`
- `getPassword(): string`

**Validation Constraints**:
- Email: NotBlank, Email
- Password: NotBlank (no length validation on login)

#### 8. UserReadModel (src/ReadModel/UserReadModel.php)

**Responsibility**: Read model for user data in API responses.

**Properties**:
- `id` (string, UUID)
- `email` (string)
- `createdAt` (string, ISO 8601)

**Interface**: Implements `JsonSerializable`

**Method**: `jsonSerialize(): array`

**Design Notes**:
- `final readonly class`
- No password field (security)
- createdAt formatted as ISO 8601 string
- Constructed in repository or service layer

#### 9. ShopReadModel (src/ReadModel/ShopReadModel.php)

**Responsibility**: Read model for shop data in API responses.

**Properties**:
- `id` (string, UUID)
- `name` (string)
- `createdAt` (string, ISO 8601)

**Interface**: Implements `JsonSerializable`

**Method**: `jsonSerialize(): array`

**Design Notes**:
- `final readonly class`
- No themeSettings field (not included in registration response per API plan)
- Constructed in repository or service layer

#### 10. UserRepository (src/Repository/UserRepository.php)

**Responsibility**: Data access layer for User entity.

**Methods**:

**`save(User $user): void`**
- Persists user entity to database
- Calls `$entityManager->persist()` and `flush()`

**`findByEmail(Email $email): ?User`**
- Finds user by email address
- Returns User entity or null

**`emailExists(Email $email): bool`**
- Checks if email already exists
- Returns boolean (for registration validation)

**`findById(UuidV7 $id): ?User`**
- Finds user by UUID
- Returns User entity or null

**Design Notes**:
- Extend `ServiceEntityRepository<User>`
- Use Doctrine QueryBuilder for queries
- Handle unique constraint violations gracefully

#### 11. ShopRepository (src/Repository/ShopRepository.php)

**Responsibility**: Data access layer for Shop entity.

**Methods**:

**`save(Shop $shop): void`**
- Persists shop entity to database

**`findByUserId(UuidV7 $userId): ?Shop`**
- Finds shop for specific user
- Returns Shop entity or null

**`shopNameExists(ShopName $name): bool`**
- Checks if shop name already exists
- Returns boolean

**`findById(UuidV7 $id): ?Shop`**
- Finds shop by UUID
- Returns Shop entity or null

#### 12. PageRepository (src/Repository/PageRepository.php)

**Responsibility**: Data access layer for Page entity.

**Methods**:

**`save(Page $page): void`**
- Persists page entity to database

**`saveBatch(array $pages): void`**
- Batch saves multiple pages (for registration)
- Uses single flush for performance

**`findByShopIdAndType(UuidV7 $shopId, PageType $type): ?Page`**
- Finds specific page for shop
- Returns Page entity or null

#### 13. AuthService (src/Service/AuthService.php)

**Responsibility**: Orchestrates authentication operations (registration and login).

**Constructor Dependencies**:
- `UserRepository $userRepository`
- `ShopRepository $shopRepository`
- `ShopInitializationService $shopInitializationService`
- `PasswordHasherInterface $passwordHasher`
- `JWTTokenManagerInterface $jwtManager` (from LexikJWTAuthenticationBundle)
- `EntityManagerInterface $entityManager` (for transactions)
- `LoggerInterface $logger`

**Methods**:

**`register(string $email, string $password, string $shopName): array`**
- Validates email and shop name uniqueness
- Creates User entity with hashed password
- Creates Shop entity with default theme settings
- Creates 4 default pages via ShopInitializationService
- Wraps in database transaction
- Returns array with UserReadModel and ShopReadModel
- Throws DomainException for validation errors (email exists, shop name exists)

**Flow**:
1. Create Email and Password value objects (validation happens here)
2. Check email uniqueness (`$userRepository->emailExists()`)
3. Check shop name uniqueness (`$shopRepository->shopNameExists()`)
4. Begin transaction
5. Create User entity, save
6. Create Shop entity with user ID, save
7. Call `$shopInitializationService->createDefaultPages($shop->getId())`
8. Commit transaction
9. Create UserReadModel and ShopReadModel
10. Return array

**`login(string $email, string $password): array`**
- Validates credentials
- Finds user by email
- Verifies password hash
- Generates JWT token with userId and email claims
- Returns array with token and UserReadModel
- Throws InvalidCredentialsException for invalid credentials (generic message to prevent user enumeration)

**Flow**:
1. Create Email value object
2. Find user by email
3. If user not found, throw InvalidCredentialsException
4. Verify password using `Password::verify()`
5. If password invalid, throw InvalidCredentialsException
6. Generate JWT token with custom claims (userId, email)
7. Create UserReadModel
8. Return array with token and user

**Error Handling**:
- Catch Doctrine exceptions during registration, rollback transaction
- Log all errors with context (email, shop name, exception)
- Never log passwords or sensitive data
- Use generic error messages for security (prevent enumeration)

#### 14. ShopInitializationService (src/Service/ShopInitializationService.php)

**Responsibility**: Handles shop initialization tasks (creating default pages with layouts).

**Constructor Dependencies**:
- `PageRepository $pageRepository`
- `DefaultLayoutService $defaultLayoutService`

**Methods**:

**`createDefaultPages(UuidV7 $shopId): void`**
- Creates 4 pages (home, catalog, product, contact)
- Each page has default layout from DefaultLayoutService
- Batch saves all pages for performance

**Flow**:
1. Get default layouts for each page type from DefaultLayoutService
2. Create Page entities with shopId, type, and layout
3. Batch save all pages via `$pageRepository->saveBatch()`

#### 15. DefaultLayoutService (src/Service/DefaultLayoutService.php)

**Responsibility**: Provides default page layouts for new shops.

**Methods**:

**`getDefaultLayout(PageType $pageType): Layout`**
- Returns default Layout value object for page type
- Layouts defined in service code (not database)
- Each layout contains default components

**Implementation**:
```php
public function getDefaultLayout(PageType $pageType): Layout
{
    return match($pageType) {
        PageType::Home => $this->getHomeLayout(),
        PageType::Catalog => $this->getCatalogLayout(),
        PageType::Product => $this->getProductLayout(),
        PageType::Contact => $this->getContactLayout(),
    };
}
```

**Private methods**: `getHomeLayout()`, `getCatalogLayout()`, `getProductLayout()`, `getContactLayout()`

**Layout Structure** (per API plan Section 4.1):
- Home: Default header + Default hero + featured products + Default footer
- Catalog: Default header + Default category grid + product list + Default footer
- Product: Default header + Default product detail + Default footer
- Contact: Default header + Default contact form + Default footer

#### 16. AuthController (src/Controller/AuthController.php)

**Responsibility**: HTTP request/response handling for authentication endpoints.

**Constructor Dependencies**:
- `AuthService $authService`
- `ValidatorInterface $validator`
- `LoggerInterface $logger`

**Methods**:

**`register(Request $request): JsonResponse`**
- Route: `POST /api/auth/register`
- Extracts JSON body, creates RegisterRequest DTO
- Validates DTO
- Calls `$authService->register()`
- Returns 201 Created with user and shop data
- Handles validation errors (400), conflicts (409), server errors (500)

**`login(Request $request): JsonResponse`**
- Route: `POST /api/auth/login`
- Extracts JSON body, creates LoginRequest DTO
- Validates DTO
- Calls `$authService->login()`
- Returns 200 OK with token and user data
- Handles validation errors (400), invalid credentials (401), server errors (500)

**Error Handling Strategy**:
- Validation errors: 400 with field details
- Email/shop name exists: 409 with specific error code
- Invalid credentials: 401 with generic message (security)
- Unexpected errors: 500 with generic message, detailed logging

---

## 4. Implementation Phases

### Phase 1: Dependencies & Configuration
**Priority**: Critical (foundation)

**Tasks**:
1. Install LexikJWTAuthenticationBundle: `composer require lexik/jwt-authentication-bundle`
2. Install Symfony Security Bundle: `composer require symfony/security-bundle`
3. Install Symfony PasswordHasher: `composer require symfony/password-hasher`
4. Generate JWT keypair: `php bin/console lexik:jwt:generate-keypair`
5. Configure environment variables in `.env`
6. Create `config/packages/lexik_jwt_authentication.yaml`
7. Create `config/packages/security.yaml`
8. Verify dependencies loaded correctly

**Configuration Files**:

**`.env` additions**:
```env
###> lexik/jwt-authentication-bundle ###
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_secure_passphrase_here
JWT_TOKEN_TTL=3600
###< lexik/jwt-authentication-bundle ###
```

**`config/packages/lexik_jwt_authentication.yaml`**:
```yaml
lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: '%env(JWT_TOKEN_TTL)%'

    # Custom JWT payload with userId and email
    user_identity_field: email
```

**`config/packages/security.yaml`**:
```yaml
security:
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'
        App\Model\Entity\User: 'auto'

    providers:
        app_user_provider:
            entity:
                class: App\Model\Entity\User
                property: email

    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false

        # Public endpoints (no authentication)
        public:
            pattern: ^/api/(auth|public|demo)
            stateless: true

        # Protected endpoints (JWT required)
        api:
            pattern: ^/api
            stateless: true
            jwt: ~

    access_control:
        - { path: ^/api/auth, roles: PUBLIC_ACCESS }
        - { path: ^/api/public, roles: PUBLIC_ACCESS }
        - { path: ^/api/demo, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: ROLE_USER }
```

**Acceptance Criteria**:
- LexikJWTAuthenticationBundle installed
- JWT keys generated in `config/jwt/`
- Environment variables configured
- Configuration files created and valid
- `php bin/console debug:config lexik_jwt_authentication` shows correct config
- `php bin/console debug:config security` shows correct config

---

### Phase 2: Domain Model (Entities & Value Objects)
**Priority**: Critical (core domain)

**Tasks**:
1. Create Email value object with validation
2. Create Password value object with hashing
3. Create ShopName value object with validation
4. Create ThemeSettings value object (JSONB)
5. Create Layout value object (JSONB)
6. Create User entity implementing UserInterface
7. Create Shop entity
8. Create Page entity (if not exists)
9. Add Doctrine type classes for custom value objects
10. Configure Doctrine mappings (attributes)

**Acceptance Criteria**:
- All value objects immutable (readonly properties)
- Email validates RFC 5322 format
- Password hashes with bcrypt/argon2
- User implements UserInterface correctly
- Doctrine mappings correct (verify with `php bin/console doctrine:schema:validate`)
- Value objects throw exceptions for invalid data

**Testing Strategy**:
- Unit test Email validation (valid/invalid formats)
- Unit test Password hashing and verification
- Unit test ShopName validation (length constraints)
- Unit test User entity creation and methods
- Unit test Shop entity creation and methods

---

### Phase 3: Repositories
**Priority**: Critical (data access)

**Tasks**:
1. Create UserRepository with methods: save, findByEmail, emailExists, findById
2. Create ShopRepository with methods: save, findByUserId, shopNameExists
3. Create PageRepository with methods: save, saveBatch
4. Register repositories in services.yaml (autowiring)
5. Test repository methods with database fixtures

**Acceptance Criteria**:
- All repositories extend ServiceEntityRepository
- Query methods use QueryBuilder or DQL
- Repositories handle null cases gracefully
- Batch operations optimized (single flush)
- Unit tests pass with test database

**Testing Strategy**:
- Unit test with test database for each repository method
- Test emailExists() with existing/non-existing emails
- Test shopNameExists() with existing/non-existing names
- Test saveBatch() inserts all pages
- Verify foreign key constraints work

---

### Phase 4: Services (Business Logic)
**Priority**: Critical (orchestration)

**Tasks**:
1. Create DefaultLayoutService with page layout definitions
2. Create ShopInitializationService
3. Create AuthService with register() and login() methods
4. Create custom exceptions (InvalidCredentialsException, UserAlreadyExistsException)
5. Implement transaction management in register()
6. Implement JWT token generation with custom claims (userId, email)
7. Add comprehensive error handling and logging

**JWT Token Generation with Custom Claims**:
```php
// In AuthService::login()
$token = $this->jwtManager->createFromPayload($user, [
    'userId' => $user->getId()->toString(),
    'email' => $user->getEmail()->getValue(),
]);
```

**Acceptance Criteria**:
- DefaultLayoutService returns valid Layout objects for all page types
- ShopInitializationService creates 4 pages successfully
- AuthService::register() is atomic (transaction rollback on error)
- AuthService::login() generates JWT with userId and email claims
- JWT tokens have 1-hour expiration
- Exceptions thrown for validation failures
- All operations logged appropriately (no sensitive data in logs)

**Testing Strategy**:
- Unit test DefaultLayoutService returns correct layouts
- Unit test ShopInitializationService with mocked dependencies
- Unit test AuthService::register() success case
- Unit test AuthService::register() with email conflict (rollback)
- Unit test AuthService::register() with shop name conflict (rollback)
- Unit test AuthService::login() success case
- Unit test AuthService::login() with invalid email
- Unit test AuthService::login() with invalid password
- Verify JWT token payload contains userId and email
- Verify JWT token expiration is 3600 seconds

---

### Phase 5: ReadModels
**Priority**: High (API responses)

**Tasks**:
1. Create UserReadModel with id, email, createdAt
2. Create ShopReadModel with id, name, createdAt
3. Implement JsonSerializable interface
4. Format dates as ISO 8601 strings
5. Test JSON serialization output

**Acceptance Criteria**:
- ReadModels are immutable (final readonly class)
- No sensitive data included (passwords, internal IDs)
- JsonSerializable produces correct JSON structure
- Dates formatted correctly

**Testing Strategy**:
- Unit test jsonSerialize() output structure
- Verify no password field in UserReadModel JSON
- Verify date format is ISO 8601

---

### Phase 6: Request DTOs
**Priority**: High (input validation)

**Tasks**:
1. Create RegisterRequest DTO with validation constraints
2. Create LoginRequest DTO with validation constraints
3. Test DTO validation with Symfony Validator
4. Verify error messages are user-friendly

**Acceptance Criteria**:
- Email validation uses #[Email] constraint
- Password length validated (8-72 characters)
- Shop name length validated (1-60 characters)
- Validation errors include field name and message

**Testing Strategy**:
- Unit test RegisterRequest with invalid email
- Unit test RegisterRequest with short password (<8 chars)
- Unit test RegisterRequest with long password (>72 chars)
- Unit test RegisterRequest with short/long shop name
- Unit test LoginRequest with invalid email
- Verify validation error messages

---

### Phase 7: Controller
**Priority**: High (HTTP layer)

**Tasks**:
1. Create AuthController
2. Implement register() method with route
3. Implement login() method with route
4. Extract JSON request body and create DTOs
5. Validate DTOs with ValidatorInterface
6. Call AuthService methods
7. Handle exceptions and return appropriate HTTP responses
8. Add request/response logging
9. Return UserReadModel and ShopReadModel in responses

**Acceptance Criteria**:
- POST /api/auth/register accessible and returns 201
- POST /api/auth/login accessible and returns 200
- Validation errors return 400 with field details
- Email conflict returns 409 with error code "email_exists"
- Shop name conflict returns 409 with error code "shop_exists"
- Invalid credentials return 401 with generic message
- Server errors return 500 with generic message
- JWT token returned on successful login
- Token contains userId and email claims

**Testing Strategy**:
- Integration test: successful registration
- Integration test: registration with existing email (409)
- Integration test: registration with existing shop name (409)
- Integration test: registration with invalid email (400)
- Integration test: registration with short password (400)
- Integration test: successful login
- Integration test: login with invalid email (401)
- Integration test: login with invalid password (401)
- Verify JWT token structure and claims
- Verify token expiration

---

### Phase 8: Testing & Documentation
**Priority**: Medium (quality assurance)

**Tasks**:
1. Write comprehensive unit tests for all components
2. Write integration tests for full registration/login flows
3. Test JWT token generation and validation
4. Test transaction rollback scenarios
5. Test security (timing attacks, password enumeration)
6. Update API documentation
7. Update CHANGELOG.md

**Acceptance Criteria**:
- Unit test coverage >80%
- All integration tests pass
- JWT tokens validated successfully by LexikJWTAuthenticationBundle
- Transaction rollbacks work correctly
- Security tests pass (no timing leaks, no enumeration)
- Documentation complete

**Testing Strategy**:
- Unit tests for each component (value objects, entities, services, repositories)
- Integration tests for registration and login endpoints
- Test with real database (not mocked)
- Verify JWT token with LexikJWTAuthenticationBundle validation
- Test concurrent registration attempts (race conditions)
- Test password hashing algorithm (bcrypt/argon2)

---

## 5. Testing Strategy

### Unit Testing (PHPUnit)

**Email Value Object Tests**:
- Valid email formats
- Invalid email formats (throw exception)
- Whitespace trimming
- Lowercase conversion

**Password Value Object Tests**:
- Valid password creation
- Short password (<8 chars) throws exception
- Long password (>72 chars) throws exception
- Hash generation uses PasswordHasherInterface
- Verification with correct password returns true
- Verification with incorrect password returns false

**User Entity Tests**:
- User creation with email and password
- UUID generation
- getUserIdentifier() returns email
- getRoles() returns ['ROLE_USER']
- Password update

**UserRepository Tests** (with test database):
- save() persists user
- findByEmail() with existing email returns user
- findByEmail() with non-existing email returns null
- emailExists() with existing email returns true
- emailExists() with non-existing email returns false

**ShopRepository Tests** (with test database):
- save() persists shop
- findByUserId() returns shop
- shopNameExists() returns true/false correctly

**DefaultLayoutService Tests**:
- getDefaultLayout(PageType::Home) returns Layout
- getDefaultLayout(PageType::Catalog) returns Layout
- getDefaultLayout(PageType::Product) returns Layout
- getDefaultLayout(PageType::Contact) returns Layout
- Layouts contain expected components

**ShopInitializationService Tests** (mocked PageRepository):
- createDefaultPages() creates 4 pages
- Pages have correct types (home, catalog, product, contact)
- PageRepository::saveBatch() called once

**AuthService Tests** (mocked dependencies):
- register() with new email creates user and shop
- register() with existing email throws exception
- register() with existing shop name throws exception
- register() rollback on failure
- login() with valid credentials returns token and user
- login() with invalid email throws InvalidCredentialsException
- login() with invalid password throws InvalidCredentialsException
- JWT token contains userId and email claims

**Controller Tests** (mocked AuthService):
- register() with valid data returns 201
- register() with invalid data returns 400
- register() with existing email returns 409
- register() with existing shop name returns 409
- login() with valid credentials returns 200 with token
- login() with invalid credentials returns 401
- Error responses match API contract

### Integration Testing (PHPUnit)

**Registration Flow**:
- POST /api/auth/register with valid data
- Verify 201 response with user and shop
- Verify user exists in database
- Verify shop exists in database
- Verify 4 pages created for shop
- Verify password is hashed
- Attempt second registration with same email returns 409
- Attempt registration with same shop name returns 409

**Login Flow**:
- POST /api/auth/login with valid credentials
- Verify 200 response with JWT token and user
- Verify token contains userId and email claims
- Verify token expiration is 3600 seconds
- Attempt login with invalid email returns 401
- Attempt login with invalid password returns 401
- Verify generic error message (no enumeration)

**JWT Token Validation**:
- Generate token via login
- Decode token using LexikJWTAuthenticationBundle
- Verify payload contains userId, email, iat, exp
- Verify signature is valid
- Verify token expires after 1 hour

**Transaction Rollback**:
- Mock database failure during shop creation
- Verify user is not created (transaction rolled back)
- Verify no orphaned data

### Security Testing

**Password Enumeration Prevention**:
- Login with valid email but invalid password
- Login with invalid email
- Verify identical response time (prevent timing attacks)
- Verify identical error message (prevent enumeration)

**Password Hashing**:
- Verify password is hashed before storage
- Verify bcrypt or argon2 is used
- Verify hash cost factor is appropriate (>10)

**JWT Token Security**:
- Verify RS256 algorithm is used (not HS256)
- Verify private key is not exposed
- Verify token expiration is enforced
- Attempt to use expired token on protected endpoint (401)
- Attempt to tamper with token payload (401)

---

## 6. Risks & Considerations

### Security Risks

**Password Storage**:
- **Risk**: Plain text passwords in database
- **Mitigation**: Use Password value object with PasswordHasherInterface
- **Verification**: Inspect database, verify bcrypt/argon2 hashes

**Timing Attacks**:
- **Risk**: Login response time reveals valid emails
- **Mitigation**: Use constant-time password comparison, generic error messages
- **Verification**: Measure response times for valid/invalid emails

**User Enumeration**:
- **Risk**: Different error messages for "email not found" vs "invalid password"
- **Mitigation**: Generic error message "Invalid email or password"
- **Verification**: Test login with various invalid inputs

**JWT Token Exposure**:
- **Risk**: Private key compromised
- **Mitigation**: Store keys securely, never commit to version control, use environment variables
- **Verification**: Check .gitignore includes config/jwt/

**Token Replay Attacks**:
- **Risk**: Stolen token used by attacker
- **Mitigation**: Short token expiration (1 hour), HTTPS only in production
- **Post-MVP**: Implement refresh tokens and token blacklisting

### Performance Risks

**Registration Performance**:
- **Risk**: Creating user + shop + 4 pages slow
- **Mitigation**: Use batch insert for pages, database transaction
- **Target**: <500ms for registration
- **Verification**: Load test with 100 concurrent registrations

**Login Performance**:
- **Risk**: Password hashing slow
- **Mitigation**: Use appropriate bcrypt cost factor (10-12)
- **Target**: <500ms for login
- **Verification**: Benchmark password verification

**Database Contention**:
- **Risk**: Concurrent registrations with same email cause deadlock
- **Mitigation**: Database UNIQUE constraint prevents duplicates, catch UniqueConstraintViolationException
- **Verification**: Integration test with concurrent registrations

### Data Integrity Risks

**Partial Registration**:
- **Risk**: User created but shop creation fails
- **Mitigation**: Database transaction with rollback
- **Verification**: Mock database failure during shop creation, verify user not created

**Orphaned Pages**:
- **Risk**: Pages created without shop
- **Mitigation**: Foreign key constraint with CASCADE delete
- **Verification**: Delete shop, verify pages deleted

**Email Case Sensitivity**:
- **Risk**: User@example.com and user@example.com treated as different
- **Mitigation**: Convert email to lowercase in Email value object
- **Verification**: Attempt registration with different case

### Operational Risks

**JWT Key Rotation**:
- **Risk**: Compromised keys cannot be easily rotated
- **Mitigation**: Document key rotation procedure
- **Post-MVP**: Implement key versioning and rotation

**Token Revocation**:
- **Risk**: Cannot revoke tokens (stateless JWT)
- **Mitigation**: Short expiration (1 hour)
- **Post-MVP**: Implement token blacklist or refresh tokens

**Lost JWT Passphrase**:
- **Risk**: Cannot generate new keys without passphrase
- **Mitigation**: Store passphrase securely (environment variable, secrets manager)
- **Verification**: Document recovery procedure

---

## 7. Follow-Up Considerations

### Immediate Follow-Ups (Within MVP Scope)

**Protected Endpoints**:
- Implement protected endpoints (Shop, Theme, Pages, Images)
- Use JWT authentication via security.yaml firewall
- Extract userId from token for data isolation
- Priority: Critical (required for full application)

**CORS Configuration**:
- Configure CORS for frontend applications
- Allow theme-builder and demo-shop origins
- Allow Authorization header
- Priority: High (required for frontend integration)

**Input Sanitization**:
- Sanitize shop name and other user inputs
- Prevent XSS in layout data
- Priority: Medium (defense in depth)

### Post-MVP Enhancements

**Refresh Tokens**:
- Implement refresh token flow
- Longer-lived refresh tokens (30 days)
- Short-lived access tokens (15 minutes)
- Priority: High (better UX)

**Email Verification**:
- Send verification email on registration
- Require email confirmation before full access
- Priority: Medium (reduces fake accounts)

**Password Reset**:
- "Forgot password" functionality
- Email-based password reset flow
- Priority: Medium (improves UX)

**Two-Factor Authentication**:
- Optional 2FA for enhanced security
- TOTP or SMS-based
- Priority: Low (MVP users are small businesses, not high-security)

**Account Lockout**:
- Lock account after N failed login attempts
- Prevent brute force attacks
- Priority: Medium (security enhancement)

**Password Strength Meter**:
- Real-time password strength feedback
- Encourage strong passwords
- Priority: Low (UX enhancement)

**Social Login**:
- OAuth integration (Google, Facebook)
- Simplify registration
- Priority: Low (MVP focus is email/password)

**JWT Key Rotation**:
- Automated key rotation
- Support multiple active keys
- Priority: Low (security enhancement)

---

## 8. Success Metrics

### Implementation Success Criteria

- [ ] LexikJWTAuthenticationBundle installed and configured
- [ ] JWT keys generated and secured
- [ ] User entity implements UserInterface
- [ ] Email and Password value objects with validation
- [ ] UserRepository, ShopRepository, PageRepository implemented
- [ ] AuthService with register() and login() methods
- [ ] ShopInitializationService creates 4 default pages
- [ ] DefaultLayoutService provides page layouts
- [ ] AuthController with both endpoints
- [ ] JWT tokens contain userId and email claims
- [ ] Token expiration set to 3600 seconds (1 hour)
- [ ] Registration is atomic (transaction rollback on error)
- [ ] Email uniqueness enforced
- [ ] Shop name uniqueness enforced
- [ ] Password hashing with bcrypt/argon2
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] Security tests passing (no enumeration, timing attacks)
- [ ] API responses match specification exactly
- [ ] Error responses consistent and user-friendly
- [ ] Logging comprehensive (no sensitive data)
- [ ] Documentation updated

### Performance Benchmarks

- Registration time: <500ms (p95)
- Login time: <500ms (p95)
- Password hashing time: <200ms
- JWT token generation: <50ms
- Database transaction time: <100ms
- Concurrent registrations: 100 req/s without errors

### Security Benchmarks

- Password hash cost factor: ≥10 (bcrypt) or ≥2 (argon2)
- Token expiration: 3600 seconds
- Private key permissions: 600 (read/write owner only)
- No plain text passwords in logs
- Timing attack resistance: <5ms variance
- User enumeration resistance: identical error messages

### Code Quality Metrics

- PHPStan level 6 or higher (no errors)
- PHP CS Fixer passes
- Test coverage >80%
- No N+1 queries
- All public methods have PHPDoc
- No circular dependencies

---

## 9. Implementation Checklist

### Phase 1: Dependencies & Configuration
- [ ] Install lexik/jwt-authentication-bundle
- [ ] Install symfony/security-bundle
- [ ] Install symfony/password-hasher
- [ ] Generate JWT keypair
- [ ] Configure .env with JWT variables
- [ ] Create lexik_jwt_authentication.yaml
- [ ] Create security.yaml
- [ ] Verify configuration with debug commands

### Phase 2: Domain Model
- [ ] Create Email value object
- [ ] Create Password value object
- [ ] Create ShopName value object
- [ ] Create ThemeSettings value object
- [ ] Create Layout value object
- [ ] Create User entity (UserInterface)
- [ ] Create Shop entity
- [ ] Create Page entity
- [ ] Create Doctrine custom types
- [ ] Validate Doctrine mappings

### Phase 3: Repositories
- [ ] Create UserRepository
- [ ] Create ShopRepository
- [ ] Create PageRepository
- [ ] Write repository unit tests
- [ ] Verify foreign key constraints

### Phase 4: Services
- [ ] Create DefaultLayoutService
- [ ] Create ShopInitializationService
- [ ] Create AuthService
- [ ] Create custom exceptions
- [ ] Implement transaction management
- [ ] Implement JWT token generation with custom claims
- [ ] Write service unit tests

### Phase 5: ReadModels
- [ ] Create UserReadModel
- [ ] Create ShopReadModel
- [ ] Implement JsonSerializable
- [ ] Write ReadModel tests

### Phase 6: Request DTOs
- [ ] Create RegisterRequest
- [ ] Create LoginRequest
- [ ] Write DTO validation tests

### Phase 7: Controller
- [ ] Create AuthController
- [ ] Implement register() endpoint
- [ ] Implement login() endpoint
- [ ] Add error handling
- [ ] Add logging
- [ ] Write integration tests

### Phase 8: Testing & Documentation
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run security tests
- [ ] Update API documentation
- [ ] Update CHANGELOG.md
- [ ] Code review
- [ ] Merge to main branch

---

## 10. Estimated Implementation Timeline

**Total Estimated Time**: 12-16 hours for experienced Symfony developer

**Phase 1 (Dependencies & Configuration)**: 1-1.5 hours
- Package installation: 15 minutes
- Configuration files: 30 minutes
- Key generation and setup: 15-30 minutes

**Phase 2 (Domain Model)**: 2-3 hours
- Value objects: 45-60 minutes
- Entities: 45-60 minutes
- Doctrine mappings: 30-45 minutes

**Phase 3 (Repositories)**: 1.5-2 hours
- Repository implementation: 45-60 minutes
- Unit tests: 45-60 minutes

**Phase 4 (Services)**: 3-4 hours
- DefaultLayoutService: 30-45 minutes
- ShopInitializationService: 30-45 minutes
- AuthService: 1-1.5 hours
- Unit tests: 1-1.5 hours

**Phase 5 (ReadModels)**: 30-45 minutes
- Implementation: 15-20 minutes
- Tests: 15-25 minutes

**Phase 6 (Request DTOs)**: 30-45 minutes
- Implementation: 15-20 minutes
- Tests: 15-25 minutes

**Phase 7 (Controller)**: 2-3 hours
- Implementation: 1-1.5 hours
- Integration tests: 1-1.5 hours

**Phase 8 (Testing & Documentation)**: 1.5-2 hours
- Security tests: 45-60 minutes
- Documentation: 45-60 minutes

**Buffer for unforeseen issues**: +2 hours

---

## 11. Dependencies & Prerequisites

### External Dependencies
- **PHP 8.3+**: Already installed
- **Symfony 7.3**: Already installed
- **Doctrine ORM**: Already installed
- **PostgreSQL 16**: Already installed
- **lexik/jwt-authentication-bundle**: To be installed
- **symfony/security-bundle**: To be installed
- **symfony/password-hasher**: Included in security-bundle

### Internal Dependencies
- **Database Schema**: users, shops, pages tables (already exist per migrations)
- **Existing Entities**: Shop and Page entities may need updates
- **Existing Patterns**: Follow ReadModel and Service layer patterns

### Development Environment Requirements
- PHP 8.3+
- Composer
- PostgreSQL 16
- OpenSSL (for JWT key generation)
- Docker (if using docker-compose setup)

### No Database Migration Required
Database schema already exists from previous migrations. New entities will map to existing tables.

---

## 12. Appendix: Default Page Layouts

### Home Page Default Layout
```json
{
  "components": [
    {
      "id": "default-header-home",
      "type": "header",
      "variant": "default",
      "settings": {
        "logo": "",
        "navigation": [
          {"label": "Home", "link": "/"},
          {"label": "Catalog", "link": "/catalog"},
          {"label": "Contact", "link": "/contact"}
        ]
      }
    },
    {
      "id": "default-hero-home",
      "type": "hero",
      "variant": "with-image",
      "settings": {
        "heading": "Welcome to Your Store",
        "subheading": "Customize this page to match your brand",
        "ctaText": "Shop Now",
        "ctaLink": "/catalog",
        "imageUrl": ""
      }
    },
    {
      "id": "default-featured-products-home",
      "type": "featured-products",
      "variant": "grid-3",
      "settings": {
        "heading": "Featured Products",
        "productIds": []
      }
    },
    {
      "id": "default-footer-home",
      "type": "footer",
      "variant": "default",
      "settings": {
        "copyright": "© 2025 Your Store. All rights reserved."
      }
    }
  ]
}
```

### Catalog Page Default Layout
```json
{
  "components": [
    {
      "id": "default-header-catalog",
      "type": "header",
      "variant": "default",
      "settings": {
        "logo": "",
        "navigation": [
          {"label": "Home", "link": "/"},
          {"label": "Catalog", "link": "/catalog"},
          {"label": "Contact", "link": "/contact"}
        ]
      }
    },
    {
      "id": "default-category-pills-catalog",
      "type": "category-pills",
      "variant": "default",
      "settings": {}
    },
    {
      "id": "default-product-grid-catalog",
      "type": "products-grid",
      "variant": "grid-dynamic",
      "settings": {
        "heading": "All Products"
      }
    },
    {
      "id": "default-footer-catalog",
      "type": "footer",
      "variant": "default",
      "settings": {
        "copyright": "© 2025 Your Store. All rights reserved."
      }
    }
  ]
}
```

### Product Page Default Layout
```json
{
  "components": [
    {
      "id": "default-header-product",
      "type": "header",
      "variant": "default",
      "settings": {
        "logo": "",
        "navigation": [
          {"label": "Home", "link": "/"},
          {"label": "Catalog", "link": "/catalog"},
          {"label": "Contact", "link": "/contact"}
        ]
      }
    },
    {
      "id": "default-product-detail",
      "type": "product-detail",
      "variant": "default",
      "settings": {}
    },
    {
      "id": "default-footer-product",
      "type": "footer",
      "variant": "default",
      "settings": {
        "copyright": "© 2025 Your Store. All rights reserved."
      }
    }
  ]
}
```

### Contact Page Default Layout
```json
{
  "components": [
    {
      "id": "default-header-contact",
      "type": "header",
      "variant": "default",
      "settings": {
        "logo": "",
        "navigation": [
          {"label": "Home", "link": "/"},
          {"label": "Catalog", "link": "/catalog"},
          {"label": "Contact", "link": "/contact"}
        ]
      }
    },
    {
      "id": "default-contact-form",
      "type": "contact-form",
      "variant": "default",
      "settings": {
        "heading": "Get in Touch",
        "subheading": "We'd love to hear from you"
      }
    },
    {
      "id": "default-footer-contact",
      "type": "footer",
      "variant": "default",
      "settings": {
        "copyright": "© 2025 Your Store. All rights reserved."
      }
    }
  ]
}
```

### Default Theme Settings
```json
{
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "surface": "#F9FAFB",
    "text": "#1F2937",
    "textLight": "#6B7280"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  }
}
```
