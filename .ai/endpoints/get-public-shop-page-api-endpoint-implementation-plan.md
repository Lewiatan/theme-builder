# API Endpoint Implementation Plan: Get Public Shop Page

## 1. Endpoint Overview

This endpoint retrieves page configuration (type and layout) for a specific shop and page. It is designed for public access to support the Demo Shop application, which needs to fetch page layouts to render themed storefronts without authentication.

**Key characteristics**:
- Public endpoint (no authentication required)
- Read-only operation
- Returns non-sensitive data only (page type and layout components)
- Supports optional page type parameter with sensible default

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/public/shops/{shopId}/pages/{type}`
- **Path Parameters**:
  - **Required**:
    - `shopId` (string): UUID identifier for the shop
  - **Optional**:
    - `type` (string): Page type identifier (home, catalog, product, contact)
      - Default: `home`
      - Case-insensitive
- **Request Body**: None (GET request)
- **Headers**: None required

**Example requests**:
```
GET /api/public/shops/550e8400-e29b-41d4-a716-446655440000/pages/home
GET /api/public/shops/550e8400-e29b-41d4-a716-446655440000/pages/catalog
GET /api/public/shops/550e8400-e29b-41d4-a716-446655440000/pages (defaults to home)
```

## 3. Request Class and Request Validation

### Request DTO: `GetDemoShopPageRequest`

**Location**: `/backend/src/Request/GetDemoShopPageRequest.php` *(already implemented)*

This request DTO is already implemented and includes:
- **shopId** validation (UUID format, not blank)
- **type** validation (Choice constraint for home, catalog, product, contact)
- **Default value**: 'home' for type parameter
- **Helper method**: `getPageType()` to convert string to PageType enum

### Validation Behavior

The Symfony Validator will automatically:
1. Extract path parameters from the route
2. Hydrate the Request DTO
3. Run validation constraints
4. Return 400 Bad Request with validation errors if invalid
5. Pass validated DTO to controller action if valid

## 3a. Response ReadModel

### PageReadModel

**Location**: `/backend/src/ReadModel/PageReadModel.php` *(to be created)*

**Purpose**: Read model for public page data that decouples the domain entity from the API response structure.

**Key characteristics**:
- `final readonly class`: Immutable data transfer object
- `JsonSerializable`: Explicit control over JSON output
- Contains only two fields: `type` (string) and `layout` (Layout value object)
- No reference to domain entities (Page, Shop)
- No sensitive data (timestamps, IDs, shop details)
- Created in the repository layer, not in the service or controller
- Layout is serialized via its `toArray()` method

## 4. Response Details

### Success Response (200 OK)

```json
{
  "type": "home",
  "layout": {
    "components": [
      {
        "id": "cmp_550e8400e29b41d4a716446655440001",
        "type": "hero",
        "variant": "default",
        "settings": {
          "title": "Welcome to Our Store",
          "backgroundColor": "#ffffff"
        }
      }
    ]
  }
}
```

**Response structure**:
- `type` (string): The page type (home, catalog, product, contact)
- `layout` (object): The layout configuration
  - `components` (array): Ordered list of component definitions
    - `id` (string): Unique component identifier
    - `type` (string): Component type (hero, product-grid, etc.)
    - `variant` (string): Component variant (default, alternate, etc.)
    - `settings` (object): Component-specific configuration

### Error Responses

**400 Bad Request - Invalid UUID**:
```json
{
  "error": "Validation failed",
  "details": {
    "shopId": ["Shop ID must be a valid UUID"]
  }
}
```

**400 Bad Request - Invalid Page Type**:
```json
{
  "error": "Validation failed",
  "details": {
    "type": ["Page type must be one of: home, catalog, product, contact"]
  }
}
```

**404 Not Found - Shop Not Found**:
```json
{
  "error": "Shop not found"
}
```

**404 Not Found - Page Not Found**:
```json
{
  "error": "Page not found for this shop"
}
```

**500 Internal Server Error**:
```json
{
  "error": "An unexpected error occurred"
}
```

## 5. Data Flow

### High-Level Flow

```
Client (Demo Shop)
    ↓ GET /api/public/shops/{shopId}/pages/{type}
Symfony Routing
    ↓ Extract path parameters
Request DTO Creation & Validation
    ↓ Validated GetDemoShopPageRequest
PublicShopController
    ↓ Call PageService
PageService
    ↓ Query PageRepository
PageRepository
    ↓ Doctrine QueryBuilder with Page entity
PostgreSQL Database
    ↓ Page entity (or null)
PageRepository
    ↓ Transform to PageReadModel (in repository)
PageService
    ↓ Return PageReadModel (or null)
PublicShopController
    ↓ JSON response via JsonSerializable
Client (Demo Shop)
```

### Detailed Steps

1. **Request Reception**:
   - Nginx receives request, forwards to PHP-FPM
   - Symfony routing matches route pattern
   - Path parameters extracted: {shopId}, {type}

2. **Request Validation**:
   - GetDemoShopPageRequest instantiated with path parameters
   - Symfony Validator runs constraint validation
   - If invalid: return 400 with validation errors
   - If valid: proceed to controller

3. **Controller Processing**:
   - PublicShopController::getPage() method invoked
   - Receives validated GetDemoShopPageRequest
   - Uses automatic mapping of the request in order to run the request validation automatically
   - Calls PageService::getPublicPage()

4. **Service Layer**:
   - PageService receives shopId and PageType
   - Calls PageRepository::findPublicPageByShopAndType()
   - Returns PageReadModel or null

5. **Repository Layer**:
   - PageRepository constructs Doctrine QueryBuilder
   - Joins Shop entity to verify shop exists
   - Filters by shop_id and type
   - Fetches Page entity from database
   - If found: transforms Page entity to PageReadModel
   - Returns PageReadModel or null

6. **Database Query**:
   - Doctrine QueryBuilder generates SQL with JOIN to shops table
   - WHERE clause filters by shop_id and page type
   - Parameterized query for security

7. **ReadModel Transformation** (in repository):
   - Extract type and layout from Page entity
   - Create new PageReadModel instance
   - No sensitive data included (shop details, timestamps, etc.)

8. **Response Construction** (in controller):
   - If PageReadModel is null: return 404
   - If found: return JsonResponse with PageReadModel
   - JsonSerializable interface handles serialization automatically
   - Returns only: type, layout fields

9. **Response Delivery**:
   - JSON response with appropriate status code
   - Content-Type: application/json
   - CORS headers (if configured)

## 6. Security Considerations

### Public Access

- **No authentication required**: Intentional design for Demo Shop preview
- **No sensitive data exposure**:
  - User emails not included in response
  - Password hashes not included
  - Shop owner details not included
  - Only layout and type returned

### Potential Threats & Mitigations

**1. Shop UUID Enumeration**:
- **Threat**: Attackers could enumerate all shop UUIDs by trying random values
- **Mitigation**:
  - UUIDs are non-sequential and cryptographically random (v4)
  - 2^122 possible values make brute force impractical
  - Rate limiting should be considered for production (out of MVP scope)

**2. Data Exposure**:
- **Threat**: Layout JSON could contain sensitive data
- **Mitigation**:
  - Layout contains only component definitions (type, variant, settings)
  - No user data stored in layout
  - PageReadModel explicitly controls exposed fields (only type and layout)
  - ReadModel pattern prevents accidental exposure of entity data

**3. SQL Injection**:
- **Threat**: Malicious input in shopId or type parameters
- **Mitigation**:
  - Doctrine ORM uses parameterized queries
  - UUID validation prevents non-UUID characters
  - PageType enum validation prevents injection

**4. XSS via Layout Data**:
- **Threat**: Malicious JavaScript in component settings
- **Mitigation**:
  - Backend responsibility: validate structure, not content
  - Frontend responsibility: sanitize when rendering
  - Content Security Policy headers (CSP) recommended

### Data Exposure Prevention via ReadModel

The ReadModel pattern ensures data safety by explicitly defining what data can be exposed:

**Safe fields in PageReadModel**:
- `type`: Page type enum value (home, catalog, product, contact)
- `layout`: Component definitions only (no user data)

**Entity fields that are NEVER exposed**:
- Shop entity (contains user email)
- Page ID (internal identifier)
- createdAt, updatedAt timestamps
- Any other sensitive data

## 7. Error Handling

### Error Handling Strategy

| Error Type | HTTP Status | Response Body | Logging |
|------------|-------------|---------------|---------|
| Invalid UUID format | 400 | `{"error": "Validation failed", "details": {...}}` | Warning |
| Invalid page type | 400 | `{"error": "Validation failed", "details": {...}}` | Warning |
| Shop not found | 404 | `{"error": "Shop not found"}` | Info |
| Page not found | 404 | `{"error": "Page not found for this shop"}` | Info |
| Database connection error | 500 | `{"error": "An unexpected error occurred"}` | Error |
| Unexpected exception | 500 | `{"error": "An unexpected error occurred"}` | Critical |

### Error Response Format

**Validation Errors (400)**:
```json
{
  "error": "Validation failed",
  "details": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

**Not Found Errors (404)**:
```json
{
  "error": "Descriptive error message"
}
```

**Server Errors (500)**:
```json
{
  "error": "An unexpected error occurred"
}
```

### Controller Error Handling

**Approach**:
1. Call PageService::getPublicPage() with shopId and PageType
2. If null returned: return 404 with error message
3. If PageReadModel returned: return 200 with JSON response
4. Catch database exceptions: log error details and return 500
5. PageReadModel implements JsonSerializable for automatic serialization

**Error logging**:
- Include shopId and type in log context
- Log exception message and trace for debugging
- Use appropriate log levels per error type

### Logging Strategy

- **Info level**: Normal 404s (shop/page not found)
- **Warning level**: Validation failures (bad input)
- **Error level**: Database connection issues
- **Critical level**: Unexpected exceptions

## 8. Performance Considerations

### Database Indexing

**Existing indexes**:
- Composite unique index on `(shop_id, type)` - optimal for this query
- Foreign key index on `shop_id`

**Query optimization**:
- Single JOIN to verify shop exists
- Parameterized queries via Doctrine
- No N+1 problems (single entity fetch)

### Performance Targets

- **Response time**: <100ms (p95) for uncached requests
- **Response time**: <10ms (p95) for cached requests
- **Database query time**: <20ms (p95)
- **Throughput**: 1000+ requests/second (with caching)

## 9. Implementation Steps

### Step 1: Create PageReadModel

**File**: `/backend/src/ReadModel/PageReadModel.php`

**Requirements**:
- `final readonly class`
- Implements `\JsonSerializable`
- Constructor accepts `string $type` and `Layout $layout`
- `jsonSerialize()` method returns array with type and layout (using `$layout->toArray()`)

**Purpose**: Decouples API response from domain entity

### Step 2: Create PageRepository

**File**: `/backend/src/Repository/PageRepository.php`

**Requirements**:
- Extend `ServiceEntityRepository` for Page entity
- Method: `findPublicPageByShopAndType(string $shopId, PageType $type): ?PageReadModel`
- Use Doctrine QueryBuilder with INNER JOIN to Shop
- Filter by shopId and type parameters
- If Page found: transform to PageReadModel
- If not found: return null

**Testing**:
- Unit test with in-memory database
- Test cases: page exists, page not found, shop not found

### Step 3: Create PageService

**File**: `/backend/src/Service/PageService.php`

**Requirements**:
- `final readonly class`
- Constructor injects PageRepository
- Method: `getPublicPage(string $shopId, PageType $type): ?PageReadModel`
- Delegates to repository method
- Returns PageReadModel or null

**Testing**:
- Mock PageRepository
- Test null handling
- Verify correct parameters passed to repository

### Step 4: Create PublicShopController

**File**: `/backend/src/Controller/PublicShopController.php`

**Requirements**:
- Route: `/api/public/shops/{shopId}/pages/{type}` with default `type='home'`
- Method parameter: `GetDemoShopPageRequest` (already exists)
- Use `#[MapQueryString]` in order to automatically map request parameters to Request and to run the validation automatically
- Inject PageService and LoggerInterface
- Call service with validated parameters
- Return 404 if null, 200 with PageReadModel if found
- Catch database exceptions and return 500 with logging
- Use JsonResponse with PageReadModel (automatic serialization)

**Testing**:
- Functional test with TestClient
- Test successful response (200)
- Test page not found (404)
- Test shop not found (404)
- Test invalid UUID (400)
- Test invalid page type (400)
- Test default page type

### Step 5: Add Integration Tests

**File**: `/backend/tests/Functional/Controller/PublicShopControllerTest.php`

**Test cases**:
- Success case with valid shop and page
- 404 when shop doesn't exist
- 404 when page doesn't exist for shop
- 400 when invalid UUID format
- 400 when invalid page type
- Default to 'home' when type not provided
- Verify response structure (type and layout fields)

### Step 6: Add Unit Tests

**Repository test** (`/backend/tests/Unit/Repository/PageRepositoryTest.php`):
- Test `findPublicPageByShopAndType()` with existing page
- Test with non-existent shop
- Test with non-existent page
- Verify PageReadModel structure

**Service test** (`/backend/tests/Unit/Service/PageServiceTest.php`):
- Mock PageRepository
- Test `getPublicPage()` returns PageReadModel
- Test null handling
- Verify correct parameters passed

### Step 7: Manual Testing

1. Start development environment
2. Create test data (shop + pages) via database
3. Test with curl:
   - Valid shop and page type
   - Invalid UUID
   - Invalid page type
   - Missing page type (should default to home)
   - Non-existent shop
   - Non-existent page

### Step 8: Documentation

1. Update API documentation (if using OpenAPI/Swagger)
2. Add endpoint to API collection (Postman/Insomnia)
3. Document in project README or API docs

### Implementation Checklist

- [ ] Create PageReadModel class
- [ ] Create PageRepository with `findPublicPageByShopAndType()` method
- [ ] Create PageService with `getPublicPage()` method
- [ ] Create PublicShopController with getPage() action (uses existing GetDemoShopPageRequest)
- [ ] Write unit tests for repository
- [ ] Write unit tests for service
- [ ] Write functional tests for controller
- [ ] Manual testing with curl
- [ ] Update API documentation
- [ ] Code review
- [ ] Deploy to staging environment
- [ ] QA testing
- [ ] Deploy to production

### Estimated Time

- ReadModel: 15 minutes
- Repository: 30 minutes
- Service: 15 minutes
- Controller: 30 minutes
- Unit tests: 1 hour
- Functional tests: 1 hour
- Manual testing: 30 minutes
- Documentation: 30 minutes

**Total**: ~4 hours
