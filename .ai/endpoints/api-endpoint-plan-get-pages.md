# Implementation Plan: GET /api/pages REST API Endpoint

## 1. Overview

The GET /api/pages endpoint provides authenticated access to all page layouts for a user's shop. This endpoint enables the Theme Builder frontend to retrieve the complete set of page configurations (home, catalog, product, contact) along with their component layouts. The endpoint requires JWT authentication and automatically filters pages to only return those belonging to the authenticated user's shop.

**Purpose:**
- Retrieve all pages (home, catalog, product, contact) for the authenticated user's shop
- Return page type, layout components, and timestamps for each page
- Support Theme Builder's page management functionality
- Enforce user-specific data isolation via JWT authentication

**Key Characteristics:**
- Authenticated endpoint requiring valid Bearer token
- Returns all 4 pages for a shop in a single request
- Ordered by page type for consistent frontend rendering
- Uses ReadModel pattern to prevent entity data exposure
- Leverages JWT user_id to find associated shop automatically

## 2. API Specification

### Endpoint Details

**URL:** `GET /api/pages`

**Authentication:** Required (Bearer token via LexikJWTAuthenticationBundle)

**Request:**
- Method: GET
- Headers:
  - `Authorization: Bearer {jwt_token}` (required)
- Query Parameters: None
- Request Body: None

**Response:**

**Success (200 OK):**
```json
{
  "pages": [
    {
      "type": "home",
      "layout": [
        {
          "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
          "type": "hero",
          "variant": "with-image",
          "settings": {
            "heading": "Welcome to My Store",
            "subheading": "Quality products for everyone",
            "ctaText": "Shop Now",
            "ctaLink": "/catalog",
            "imageUrl": "https://r2.example.com/hero.jpg"
          }
        },
        {
          "id": "d2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
          "type": "featured-products",
          "variant": "grid-3",
          "settings": {
            "heading": "Featured Products",
            "productIds": [1, 2, 3]
          }
        }
      ],
      "created_at": "2025-10-15T10:30:00Z",
      "updated_at": "2025-10-15T14:30:00Z"
    },
    {
      "type": "catalog",
      "layout": [...],
      "created_at": "2025-10-15T10:30:00Z",
      "updated_at": "2025-10-15T10:30:00Z"
    },
    {
      "type": "product",
      "layout": [...],
      "created_at": "2025-10-15T10:30:00Z",
      "updated_at": "2025-10-15T10:30:00Z"
    },
    {
      "type": "contact",
      "layout": [...],
      "created_at": "2025-10-15T10:30:00Z",
      "updated_at": "2025-10-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "message": "Missing or invalid authentication token"
}
```

**500 Internal Server Error:**
```json
{
  "error": "server_error",
  "message": "An unexpected error occurred"
}
```

## 3. Business Logic Flow

### Request Processing Flow

```
HTTP Request with JWT Token
    ↓
Security Layer (LexikJWTAuthenticationBundle)
    ↓ (extracts user_id from token)
PagesController::getAllPages()
    ↓ (retrieves authenticated user_id)
PageService::getAllPagesForUser(user_id)
    ↓
PageRepository::findAllByUserId(user_id)
    ↓ (queries shop by user_id, then pages by shop_id)
Database Query (shops + pages tables with JOIN)
    ↓
Array of PageReadModel objects
    ↓
JSON Serialization (via JsonSerializable)
    ↓
HTTP Response (200 OK with pages array)
```

### Authentication Flow

```
JWT Token in Authorization Header
    ↓
LexikJWTAuthenticationBundle validates token
    ↓
Extracts user_id from token payload
    ↓
Makes user_id available via Security component
    ↓
Controller accesses via $this->getUser()->getId()
```

### Data Access Pattern

```
user_id (from JWT)
    ↓
Query shops table (WHERE user_id = :userId)
    ↓ (shops.id)
Query pages table (WHERE shop_id = :shopId)
    ↓
Transform to PageReadModel (excludes shop_id, page_id)
    ↓
Return array ordered by type
```

## 4. Required Components

### Controller Layer

**File:** `/home/maciej/web/theme-builder/backend/src/Controller/PagesController.php`

**Purpose:** Handle HTTP request/response for GET /api/pages endpoint

**Implementation Details:**
- Extend `AbstractController` from Symfony
- Use `#[Route('/api/pages', methods: ['GET'])]` attribute
- Require authentication via `#[IsGranted('IS_AUTHENTICATED_FULLY')]`
- Inject `PageService` via constructor
- Extract user ID from authenticated user (`$this->getUser()->getId()`)
- Call service layer to retrieve pages
- Return `JsonResponse` with pages array
- Handle exceptions with try-catch and proper HTTP status codes
- Log errors for debugging and monitoring

**Method Signature:**
```php
public function getAllPages(): JsonResponse
```

**Responsibilities:**
- Extract authenticated user ID from security context
- Delegate business logic to PageService
- Transform service result to HTTP response
- Handle exceptions and return appropriate error responses
- Log important events (errors, unexpected scenarios)

**Error Handling:**
- 401 Unauthorized: Handled automatically by Symfony Security
- 500 Internal Server Error: Catch all exceptions and log details

### Service Layer

**File:** `/home/maciej/web/theme-builder/backend/src/Service/PageService.php`

**Purpose:** Orchestrate page retrieval business logic

**Implementation Details:**
- Create new service class (doesn't exist yet)
- Mark as `final readonly` for immutability
- Inject `PageRepository` via constructor
- Implement `getAllPagesForUser(string $userId): array` method
- Delegate to repository for data access
- No additional business logic needed for MVP (pure pass-through)
- Return array of PageReadModel objects

**Method Signature:**
```php
public function getAllPagesForUser(string $userId): array
```

**Responsibilities:**
- Accept user ID from controller
- Call repository to fetch pages
- Return array of PageReadModel objects
- Future: Add caching, filtering, or transformation logic if needed

**Return Type:**
- `PageReadModel[]` - Array of read models for JSON serialization

### Repository Layer

**File:** `/home/maciej/web/theme-builder/backend/src/Repository/PageRepository.php`

**Purpose:** Execute database queries for page retrieval

**Implementation Details:**
- Create new repository class (separate from DemoPageRepository)
- Extend `ServiceEntityRepository<Page>` from Doctrine
- Implement `findAllByUserId(string $userId): array` method
- Use raw SQL via DBAL connection for performance (bypass entity hydration)
- Join shops and pages tables to filter by user_id
- Order results by page type (home, catalog, product, contact)
- Transform results to PageReadModel objects
- Return empty array if user has no shop or shop has no pages

**Method Signature:**
```php
public function findAllByUserId(string $userId): array
```

**Query Strategy:**
```sql
SELECT p.type, p.layout, p.created_at, p.updated_at
FROM pages p
INNER JOIN shops s ON p.shop_id = s.id
WHERE s.user_id = :userId
ORDER BY p.type
```

**Performance Considerations:**
- Use raw SQL to avoid entity hydration overhead
- Index on `shops.user_id` ensures fast lookup (already exists)
- Index on `pages.shop_id` ensures fast join (foreign key creates index)
- JSONB column for layout retrieved as-is (no additional processing)

**Data Transformation:**
- Decode JSON layout column to PHP array
- Create PageReadModel for each row
- Format timestamps to ISO 8601 (e.g., `2025-10-15T10:30:00Z`)

### Read Model

**File:** `/home/maciej/web/theme-builder/backend/src/ReadModel/PageReadModel.php`

**Purpose:** Decouple API response from domain entity

**Implementation Details:**
- Create new read model class
- Mark as `final readonly` for immutability
- Implement `JsonSerializable` interface for automatic JSON conversion
- Include only fields for API exposure: type, layout, created_at, updated_at
- Exclude internal fields: id, shop_id, shop object
- Use constructor property promotion for concise code
- Format dates as ISO 8601 strings in `jsonSerialize()` method

**Properties:**
```php
public function __construct(
    private string $type,           // Page type (home, catalog, product, contact)
    private array $layout,          // Array of component definitions
    private string $createdAt,      // ISO 8601 formatted timestamp
    private string $updatedAt       // ISO 8601 formatted timestamp
) {}
```

**JSON Serialization:**
```php
public function jsonSerialize(): array
{
    return [
        'type' => $this->type,
        'layout' => $this->layout,
        'created_at' => $this->createdAt,
        'updated_at' => $this->updatedAt,
    ];
}
```

**Why Separate from DemoPageReadModel:**
- DemoPageReadModel is for public unauthenticated access (excludes timestamps)
- PageReadModel is for authenticated Theme Builder access (includes timestamps)
- Different use cases require different data shapes
- Maintains clear separation of concerns

## 5. Data Models

### Existing Entities (Reference Only)

**User Entity:** `App\Model\Entity\User`
- Located: `/home/maciej/web/theme-builder/backend/src/Model/Entity/User.php`
- Primary Key: `id` (string/GUID)
- Relationship: One-to-One with Shop

**Shop Entity:** `App\Model\Entity\Shop`
- Located: `/home/maciej/web/theme-builder/backend/src/Model/Entity/Shop.php`
- Primary Key: `id` (string/GUID)
- Foreign Key: `user_id` (references users.id, unique constraint)
- Relationship: One-to-Many with Page

**Page Entity:** `App\Model\Entity\Page`
- Located: `/home/maciej/web/theme-builder/backend/src/Model/Entity/Page.php`
- Primary Key: `id` (string/GUID)
- Foreign Key: `shop_id` (references shops.id, cascade delete)
- Unique Constraint: `idx_pages_shop_type` on (shop_id, type)
- Type: `type` column uses `PageType` enum (home, catalog, product, contact)
- Layout: Stored as JSONB via `Layout` embedded value object

### Database Schema (Reference)

**users table:**
- `id` (UUID, primary key)
- `email` (string, unique)
- `password` (string, hashed)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**shops table:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users.id, unique)
- `name` (string, max 60 chars)
- `theme_settings` (JSONB - colors and fonts)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**pages table:**
- `id` (UUID, primary key)
- `shop_id` (UUID, foreign key to shops.id, cascade delete)
- `type` (string enum: 'home', 'catalog', 'product', 'contact')
- `layout` (JSONB - array of component definitions)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Unique constraint: `idx_pages_shop_type` on (shop_id, type)

### Value Objects (Reference)

**Layout Value Object:** `App\Model\ValueObject\Layout`
- Embedded in Page entity
- Stored as JSON column in database
- Contains array of ComponentDefinition objects
- Methods: `toArray()`, `fromArray()`, `getComponents()`

**ComponentDefinition Value Object:** `App\Model\ValueObject\ComponentDefinition`
- Properties: id, type, variant, settings
- Methods: `toArray()`, `fromArray()`
- Validates required fields in constructor

**PageType Enum:** `App\Model\Enum\PageType`
- Values: HOME, CATALOG, PRODUCT, CONTACT
- Methods: `fromString()`, `toString()`

## 6. Authentication & Authorization

### JWT Authentication Flow

The endpoint uses LexikJWTAuthenticationBundle for stateless authentication:

1. **Token Validation:**
   - Frontend sends request with `Authorization: Bearer {token}` header
   - LexikJWTAuthenticationBundle intercepts request
   - Validates JWT signature using configured secret key
   - Verifies token expiration timestamp

2. **User Extraction:**
   - Extracts `user_id` from token payload
   - Loads User entity from database by ID
   - Creates Symfony SecurityUser wrapper
   - Stores in security context for request lifetime

3. **Authorization Check:**
   - Controller method requires `IS_AUTHENTICATED_FULLY` role
   - Symfony Security checks if user is authenticated
   - Returns 401 Unauthorized if token invalid or missing

4. **User Access:**
   - Controller accesses authenticated user via `$this->getUser()`
   - Retrieves user ID via `$this->getUser()->getId()`
   - Passes user ID to service layer

### Security Configuration

**Required Symfony Security Configuration:**
```yaml
# config/packages/security.yaml
security:
    firewalls:
        api:
            pattern: ^/api
            stateless: true
            jwt: ~

    access_control:
        - { path: ^/api/pages, roles: IS_AUTHENTICATED_FULLY }
```

**JWT Token Structure:**
```json
{
  "iat": 1634567890,
  "exp": 1634654290,
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

### Data Isolation Strategy

**User-to-Shop Relationship:**
- Each User has exactly one Shop (one-to-one relationship)
- Shop has unique constraint on `user_id` column
- Repository queries: `shops WHERE user_id = :userId`

**Shop-to-Pages Relationship:**
- Each Shop has exactly 4 Pages (one per page type)
- Pages have unique constraint on `(shop_id, type)`
- Repository queries: `pages WHERE shop_id = :shopId`

**Automatic Filtering:**
- No need for manual user_id checks in queries
- User can only access their own shop's pages by design
- Database constraints enforce data integrity

**Security Benefits:**
- No risk of cross-user data leakage
- No need for explicit authorization checks
- Simplified business logic (JWT user_id is source of truth)

## 7. Error Handling

### HTTP Status Codes

**200 OK:**
- Successful retrieval of pages
- Returns array of 0-4 pages (empty array if user has no shop)
- Always succeeds if authenticated (never 404 for missing data)

**401 Unauthorized:**
- Missing `Authorization` header
- Invalid JWT token (malformed, expired, invalid signature)
- Token for non-existent user
- Handled automatically by Symfony Security component

**500 Internal Server Error:**
- Database connection failure
- Unexpected exceptions during query execution
- JSON encoding errors
- Logged with full stack trace for debugging

### Exception Handling Strategy

**Controller-Level Try-Catch:**
```php
try {
    $userId = $this->getUser()->getId();
    $pages = $this->pageService->getAllPagesForUser($userId);

    return new JsonResponse(['pages' => $pages], JsonResponse::HTTP_OK);
} catch (\Throwable $exception) {
    $this->logger->error('Unexpected error retrieving pages', [
        'user_id' => $this->getUser()?->getId(),
        'exception' => $exception->getMessage(),
        'trace' => $exception->getTraceAsString(),
    ]);

    return new JsonResponse(
        ['error' => 'An unexpected error occurred'],
        JsonResponse::HTTP_INTERNAL_SERVER_ERROR
    );
}
```

**Logging Strategy:**
- Log all 500 errors with full context (user_id, exception, trace)
- Use PSR-3 LoggerInterface injected via constructor
- Include correlation data for troubleshooting
- Never expose internal error details to client

**Error Response Format:**
- Consistent JSON structure: `{"error": "type", "message": "description"}`
- Generic messages for security (no stack traces, SQL, internal paths)
- Detailed logging server-side for debugging

### Edge Cases

**User Has No Shop:**
- Service returns empty array `[]`
- Valid response (200 OK)
- Frontend can detect and handle appropriately

**Shop Has Fewer Than 4 Pages:**
- Returns only existing pages
- Valid response (200 OK)
- Frontend may display "no layout configured" for missing pages

**Empty Layout (No Components):**
- Page exists with empty layout array `[]`
- Valid response (200 OK)
- Frontend displays empty canvas for editing

**Malformed Layout JSON:**
- Should never occur (database constraint)
- If occurs: catch exception, log error, return 500

## 8. Testing Strategy

### Unit Tests

**PageService Tests:**
- ✅ Test successful page retrieval
- ✅ Test empty result when user has no pages
- ✅ Test repository method called with correct user ID
- ✅ Test return type (array of PageReadModel)

**PageRepository Tests (if needed):**
- ✅ Test SQL query execution
- ✅ Test data transformation to PageReadModel
- ✅ Test timestamp formatting
- ✅ Test empty result handling
- ✅ Test JSON layout decoding

**PageReadModel Tests:**
- ✅ Test JSON serialization format
- ✅ Test all fields included in output
- ✅ Test immutability (readonly class)

### Integration Tests

**PagesController Tests:**
- ✅ Test 401 response when not authenticated
- ✅ Test 401 response with invalid token
- ✅ Test 200 response with valid token
- ✅ Test response structure (pages array)
- ✅ Test response headers (Content-Type: application/json)
- ✅ Test empty pages array for new user
- ✅ Test 500 response on database error (if testable)

## 9. Performance Considerations

### Query Optimization

**Index Usage:**
- `shops.user_id` index for fast user lookup
- `pages.shop_id` foreign key index for fast join
- Composite index `idx_pages_shop_type` for unique constraint

**Query Performance:**
- Expected query time: <10ms for typical dataset
- JOIN on indexed columns (shop_id)
- WHERE clause on indexed column (user_id)
- No complex aggregations or subqueries

**JSONB Performance:**
- Layout stored as JSONB (efficient storage)
- No JSON parsing in database (returned as string)
- JSON decoding in PHP (fast for small payloads)

## 10. Security Considerations

### Authentication Security

**JWT Token Validation:**
- LexikJWTAuthenticationBundle validates signature
- Checks token expiration automatically
- Rejects tampered tokens

**Token Transmission:**
- HTTPS required in production (TLS 1.2+)
- Bearer token in Authorization header
- Never log token values

### Authorization Security

**User Data Isolation:**
- User can only access their own shop's pages
- Enforced via user_id → shop_id relationship
- No manual authorization checks needed

**SQL Injection Prevention:**
- Parameterized queries prevent SQL injection
- DBAL parameter binding (`['userId' => $userId]`)
- No string concatenation in SQL

**Information Disclosure:**
- Generic error messages (no stack traces to client)
- Detailed logging server-side only
- No exposure of internal IDs or shop relationships

## 11. Success Criteria

### Functional Requirements

- ✅ Endpoint returns all pages for authenticated user's shop
- ✅ Response includes type, layout, created_at, updated_at for each page
- ✅ Pages ordered by type for consistent frontend rendering
- ✅ Returns empty array if user has no shop or shop has no pages
- ✅ Authentication required (JWT token)
- ✅ 401 response for missing or invalid token
- ✅ 500 response with error message for unexpected errors
- ✅ Errors logged with full context for debugging

### Performance Requirements

- ✅ Query execution time <10ms (typical case)
- ✅ Total response time <50ms (p95)
- ✅ No N+1 query problems (single JOIN query)
- ✅ Efficient JSON decoding (no nested loops)

### Code Quality Requirements

- ✅ Clean Architecture: Controller → Service → Repository → ReadModel
- ✅ Type safety: All parameters and return types declared
- ✅ Immutability: ReadModel and Service marked as `readonly`
- ✅ Error handling: Try-catch with logging
- ✅ Documentation: PHPDoc comments on all public methods
- ✅ Testing: Unit tests for service, integration tests for controller
- ✅ Security: JWT authentication, parameterized queries

### API Specification Compliance

- ✅ Matches exact request/response format from specification
- ✅ Returns `pages` array wrapper
- ✅ Each page has type, layout, created_at, updated_at
- ✅ Layout is flat array of components (not nested)
- ✅ Timestamps in ISO 8601 format
- ✅ HTTP status codes match specification (200, 401, 500)

### Database Migration Reference

No database migrations required for this endpoint (uses existing schema).

**Existing Schema:**
- Created in migration: `20241015000001_create_pages_table.php`
- Pages table includes all necessary columns
- Indexes already exist for optimal query performance

### Environment Variables

**Required Configuration:**
```env
# JWT Authentication
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-passphrase

# Database Connection
DATABASE_URL=postgresql://user:password@postgres:5432/theme_builder
```

### Logging Configuration

**Monolog Configuration:**
```yaml
# config/packages/prod/monolog.yaml
monolog:
    handlers:
        main:
            type: stream
            path: "%kernel.logs_dir%/%kernel.environment%.log"
            level: error

        api_errors:
            type: stream
            path: "%kernel.logs_dir%/api_errors.log"
            level: error
            channels: ["app"]
```

### Developer Notes

**Common Issues:**
- **401 Unauthorized:** Check JWT token expiration and signature
- **Empty pages array:** Verify user has associated shop in database
- **500 Error:** Check logs for database connection or query errors
- **Performance:** Ensure indexes exist on user_id and shop_id columns

**Debugging Commands:**
```bash
# View Symfony routes
docker-compose exec backend php bin/console debug:router api_pages_list

# Check service autowiring
docker-compose exec backend php bin/console debug:autowiring PageService

# Test database connection
docker-compose exec backend php bin/console doctrine:query:sql "SELECT COUNT(*) FROM pages"
```
