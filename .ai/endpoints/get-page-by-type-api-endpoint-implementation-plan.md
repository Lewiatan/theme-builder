# Implementation Plan: GET /api/pages/{type} Endpoint

## 1. Requirements Analysis

### Business Objective
Provide authenticated users the ability to retrieve a specific page by type (home, catalog, product, contact) for their shop, enabling the Theme Builder editor to load individual page configurations for editing.

### Key Requirements
- **Authentication**: JWT bearer token required
- **Authorization**: Users can only access pages from their own shop
- **Input**: Path parameter `type` must be one of: home, catalog, product, contact
- **Output**: Single page with type, layout array, created_at, updated_at timestamps
- **Error Handling**:
  - 400 for invalid page type
  - 401 for missing/invalid authentication
  - 404 for page not found

### Technical Constraints
- Symfony 7.3 with PHP 8.3
- JWT authentication via LexikJWTAuthenticationBundle
- PostgreSQL database with Doctrine ORM
- Must follow Clean Architecture principles
- Must use ReadModel pattern to decouple API response from entity

## 2. Architectural Overview

### Design Decisions
1. **Extend existing PageController** - Add new method to existing controller for page operations
2. **Reuse existing PageRepository** - Repository already has method structure for page retrieval
3. **Leverage existing PageReadModel** - Already provides the exact response structure needed
4. **Add new repository method** - Create `findOneByShopIdAndType()` for single page retrieval
5. **Validation at controller level** - Validate PageType enum conversion with try-catch for invalid values
6. **Exception handling** - Use custom PageNotFoundException for 404 responses

### Patterns Applied
- **Clean Architecture**: Controller → Service → Repository → Entity flow
- **ReadModel Pattern**: Decouple response from domain entity
- **Dependency Injection**: Services injected via constructor
- **Value Objects**: PageType enum for type safety

## 3. Technical Specification

### Database Schema
**No changes required** - Existing `pages` table has all necessary data:
- Unique constraint on (shop_id, type) ensures one page per type per shop
- JSON layout column stores component array
- Timestamps for created_at and updated_at

### API Endpoint

**Route**: `GET /api/pages/{type}`

**Controller**: `App\Controller\PageController::getPageByType()`

**Security**: `#[IsGranted('ROLE_USER')]`

**Path Parameter**:
- `type` (string) - Must be one of: home, catalog, product, contact

**Response Format**:
```json
{
  "type": "home",
  "layout": [
    {
      "id": "uuid",
      "type": "hero",
      "variant": "with-image",
      "settings": {...}
    }
  ],
  "created_at": "2025-10-15T10:30:00+00:00",
  "updated_at": "2025-10-15T14:30:00+00:00"
}
```

**Error Responses**:
- **400**: `{"error": "invalid_page_type", "message": "Page type must be one of: home, catalog, product, contact"}`
- **401**: Handled by Symfony Security (missing/invalid JWT)
- **404**: `{"error": "page_not_found", "message": "Page of type 'home' not found"}`
- **500**: `{"error": "An unexpected error occurred"}` (logged with full details)

### Backend Components

#### 1. PageController (Update)
**Location**: `backend/src/Controller/PageController.php`

**New Method**: `getPageByType(string $type): JsonResponse`

**Responsibilities**:
- Validate path parameter and convert to PageType enum
- Get authenticated user from security context
- Call PageService to retrieve page
- Handle exceptions and return appropriate HTTP responses
- Log errors for debugging

**Exception Handling**:
- `ValueError`: Invalid page type → 400 Bad Request
- `PageNotFoundException`: Page not found → 404 Not Found
- `ShopNotFoundException`: User has no shop → 404 Not Found
- `Throwable`: Unexpected errors → 500 Internal Server Error (logged)

#### 2. PageService (Update)
**Location**: `backend/src/Service/PageService.php`

**New Method**: `getPageByType(string $userId, PageType $type): PageReadModel`

**Responsibilities**:
- Get shop ID for the authenticated user
- Call repository to fetch page by shop ID and type
- Throw PageNotFoundException if page doesn't exist
- Return PageReadModel for response serialization

**Business Logic**:
- Enforces data isolation (users can only access their own shop's pages)
- Validates that user has a shop (throws ShopNotFoundException)

#### 3. PageRepository (Update)
**Location**: `backend/src/Repository/PageRepository.php`

**New Method**: `findOneByShopIdAndType(string $shopId, PageType $type): ?PageReadModel`

**Implementation Strategy**:
- Use direct SQL query via DBAL connection (performance optimization)
- Bypass entity hydration since we only need read-only data
- Select only necessary columns: type, layout, created_at, updated_at
- Return PageReadModel instance or null if not found

**Query**:
```sql
SELECT p.type, p.layout, p.created_at, p.updated_at
FROM pages p
WHERE p.shop_id = :shopId AND p.type = :type
```

#### 4. PageNotFoundException (New)
**Location**: `backend/src/Exception/PageNotFoundException.php`

**Extends**: `Symfony\Component\HttpKernel\Exception\NotFoundHttpException`

**Constructor Parameters**:
- `string $userId` - For logging/debugging
- `string $type` - The page type that wasn't found

**Message Format**: `"Page of type '{type}' not found for user {userId}"`

**Purpose**: Provides meaningful error message and automatically returns 404 status

#### 5. PageReadModel (Existing)
**Location**: `backend/src/ReadModel/PageReadModel.php`

**No changes needed** - Already implements:
- `JsonSerializable` interface
- Correct response structure with type, layout, created_at, updated_at
- ISO 8601 timestamp formatting

### Request Flow

```
1. HTTP Request: GET /api/pages/home + JWT Bearer Token
   ↓
2. Symfony Security: Validates JWT, loads User entity
   ↓
3. PageController::getPageByType('home')
   - Validates 'home' → PageType::HOME
   - Gets authenticated User
   ↓
4. PageService::getPageByType(userId, PageType::HOME)
   - Finds user's shop (throws ShopNotFoundException if missing)
   - Gets shop ID
   ↓
5. PageRepository::findOneByShopIdAndType(shopId, PageType::HOME)
   - Executes SQL query
   - Returns PageReadModel or null
   ↓
6. Service validates result exists (throws PageNotFoundException if null)
   ↓
7. Controller returns JsonResponse with PageReadModel
   - PageReadModel auto-serializes via jsonSerialize()
   ↓
8. HTTP Response: 200 OK + JSON body
```

## 4. Implementation Phases

### Phase 1: Exception Class
**Files**:
- `backend/src/Exception/PageNotFoundException.php` (create)

**Tasks**:
1. Create PageNotFoundException extending NotFoundHttpException
2. Implement constructor accepting userId and type parameters
3. Format meaningful error message
4. Add PHPDoc comments

**Acceptance Criteria**:
- Exception can be instantiated with userId and type
- Error message includes page type
- Extends NotFoundHttpException for automatic 404 response

---

### Phase 2: Repository Method
**Files**:
- `backend/src/Repository/PageRepository.php` (update)

**Tasks**:
1. Add `findOneByShopIdAndType(string $shopId, PageType $type): ?PageReadModel` method
2. Implement SQL query using DBAL connection
3. Parse JSON layout column
4. Format timestamps to ISO 8601
5. Return PageReadModel instance or null
6. Add comprehensive PHPDoc with performance notes

**Acceptance Criteria**:
- Method returns PageReadModel when page exists
- Method returns null when page doesn't exist
- Timestamps formatted as ISO 8601 (format 'c')
- Layout JSON properly decoded to array
- Query properly parameterized to prevent SQL injection

---

### Phase 3: Service Method
**Files**:
- `backend/src/Service/PageService.php` (update)

**Tasks**:
1. Inject ShopRepository via constructor (if not already present)
2. Add `getPageByType(string $userId, PageType $type): PageReadModel` method
3. Find user's shop via ShopRepository
4. Throw ShopNotFoundException if no shop found
5. Call PageRepository::findOneByShopIdAndType
6. Throw PageNotFoundException if page doesn't exist
7. Return PageReadModel
8. Add comprehensive PHPDoc

**Acceptance Criteria**:
- Method throws ShopNotFoundException when user has no shop
- Method throws PageNotFoundException when page doesn't exist
- Method returns PageReadModel when page exists
- Data isolation enforced (shop belongs to user)

---

### Phase 4: Controller Endpoint
**Files**:
- `backend/src/Controller/PageController.php` (update)

**Tasks**:
1. Add route attribute: `#[Route('/api/pages/{type}', name: 'api_pages_get_by_type', methods: ['GET'])]`
2. Add security attribute: `#[IsGranted('ROLE_USER')]`
3. Implement `getPageByType(string $type): JsonResponse` method
4. Validate type parameter with try-catch for ValueError
5. Get authenticated user from security context
6. Call PageService::getPageByType
7. Handle all exceptions with appropriate HTTP status codes
8. Log errors with context
9. Return JsonResponse (direct PageReadModel, not wrapped)
10. Add comprehensive PHPDoc with examples

**Exception Handling**:
```php
try {
    $pageType = PageType::fromString($type);
    // ... business logic
} catch (\ValueError $e) {
    return new JsonResponse(
        ['error' => 'invalid_page_type', 'message' => 'Page type must be one of: home, catalog, product, contact'],
        400
    );
} catch (PageNotFoundException $e) {
    return new JsonResponse(
        ['error' => 'page_not_found', 'message' => $e->getMessage()],
        404
    );
} catch (ShopNotFoundException $e) {
    return new JsonResponse(
        ['error' => 'shop_not_found', 'message' => $e->getMessage()],
        404
    );
} catch (\Throwable $e) {
    $this->logger->error('Error retrieving page by type', [
        'user_id' => $user->getId(),
        'type' => $type,
        'exception' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    return new JsonResponse(['error' => 'An unexpected error occurred'], 500);
}
```

**Acceptance Criteria**:
- Endpoint accessible at GET /api/pages/{type}
- Requires authentication (401 if missing/invalid JWT)
- Returns 400 for invalid page types
- Returns 404 for non-existent pages
- Returns 404 when user has no shop
- Returns 200 with correct JSON structure when successful
- All errors logged with context
- Response matches specification exactly

---

### Phase 5: Unit Tests
**Files**:
- `backend/tests/Unit/Repository/PageRepositoryTest.php` (update)
- `backend/tests/Unit/Service/PageServiceTest.php` (update)
- `backend/tests/Unit/Controller/PageControllerTest.php` (update)

**Tasks**:

**PageRepositoryTest**:
1. Test `findOneByShopIdAndType()` returns PageReadModel when page exists
2. Test returns null when page doesn't exist
3. Test layout JSON properly decoded
4. Test timestamps formatted correctly

**PageServiceTest**:
1. Mock ShopRepository and PageRepository
2. Test successful page retrieval returns PageReadModel
3. Test throws ShopNotFoundException when user has no shop
4. Test throws PageNotFoundException when page doesn't exist
5. Test correct parameters passed to repository

**PageControllerTest**:
1. Mock PageService and LoggerInterface
2. Test successful page retrieval returns 200 with correct JSON
3. Test invalid page type returns 400 with error structure
4. Test PageNotFoundException returns 404 with error structure
5. Test ShopNotFoundException returns 404 with error structure
6. Test unexpected exception returns 500 and logs error
7. Verify logger called with appropriate context on errors

**Acceptance Criteria**:
- All tests follow PHPUnit best practices (snake_case, #[Test] attribute, #[CoversClass])
- Tests use arrange-act-assert pattern with comments
- Mocks properly configured with expects()
- All edge cases covered
- Tests can be run via `docker compose exec backend vendor/bin/phpunit`

## 5. Testing Strategy

### Unit Testing
**Scope**: Individual components in isolation

**PageNotFoundException**:
- Exception message includes page type and user ID
- Exception extends NotFoundHttpException
- Exception returns 404 status code

**PageRepository**:
- Query execution with valid shop ID and type
- Return PageReadModel with correct data
- Return null for non-existent page
- JSON layout properly decoded
- Timestamps properly formatted

**PageService**:
- User has shop and page exists → Returns PageReadModel
- User has no shop → Throws ShopNotFoundException
- User has shop but page doesn't exist → Throws PageNotFoundException
- Correct data passed between layers

**PageController**:
- Valid type and page exists → 200 with JSON
- Invalid type → 400 with error
- Valid type but page not found → 404 with error
- User has no shop → 404 with error
- Unexpected error → 500 with error, logged
- Logger called on errors

### Manual Testing Checklist
- [ ] Endpoint returns 200 for valid requests with correct data
- [ ] Endpoint returns 400 for invalid page types (test: home, catalog, product, contact, invalid)
- [ ] Endpoint returns 404 for non-existent pages
- [ ] Endpoint returns 401 without authentication
- [ ] Response structure matches specification exactly
- [ ] Timestamps in ISO 8601 format with timezone
- [ ] Layout array properly structured with component objects
- [ ] Error messages user-friendly and informative
- [ ] Logs contain sufficient debugging information
- [ ] Performance acceptable (< 100ms for typical request)

## 6. Risks & Considerations

### Performance Implications
**Query Performance**:
- Direct SQL query bypasses Doctrine hydration overhead (~30% faster)
- Indexed query on shop_id and type (unique constraint provides index)
- Expected response time: < 50ms for typical request

**Optimization Opportunities**:
- Consider Redis caching for frequently accessed pages (future enhancement)
- Monitor query performance in production
- Add slow query logging threshold

### Security Considerations
**Data Isolation**:
- Service layer enforces user can only access their shop
- Shop retrieved via authenticated user ID, not from request parameter
- No user-controlled shop_id in query parameters

**Input Validation**:
- PageType enum provides type safety and prevents injection
- Path parameter validated before business logic execution
- All database queries use parameterized queries

**Error Information Disclosure**:
- Generic error messages in production (no stack traces)
- Detailed logging for debugging (server-side only)
- Error codes provide actionable information without exposing internals

### Maintainability Considerations
**Code Reuse**:
- Leverages existing PageController, PageService, PageRepository
- Reuses existing PageReadModel and exception patterns
- Consistent with existing GET /api/pages endpoint

### Edge Cases
1. **User has no shop**: Throws ShopNotFoundException → 404 response
2. **Page not created yet**: Throws PageNotFoundException → 404 response
3. **Invalid type parameter**: ValueError caught → 400 response
4. **Database connection failure**: Throwable caught → 500 response, logged
5. **Malformed JWT**: Handled by Symfony Security → 401 response
6. **Case sensitivity**: PageType::fromString() is case-sensitive (home ≠ Home)

---

## Implementation Checklist

- [ ] Phase 1: Create PageNotFoundException
- [ ] Phase 2: Add PageRepository::findOneByShopIdAndType()
- [ ] Phase 3: Add PageService::getPageByType()
- [ ] Phase 4: Add PageController::getPageByType() endpoint
- [ ] Phase 5: Write unit tests for all components
- [ ] Manual testing of all scenarios
- [ ] Code review
