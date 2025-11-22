# Implementation Plan: POST /api/pages/{type}/reset

**Endpoint**: `POST /api/pages/{type}/reset`
**Purpose**: Reset a page to its default layout for the authenticated user's shop

---

## 1. Requirements Analysis

### Business Requirements
- Allow authenticated users to reset any page (home, catalog, product, contact) to its default layout
- Maintain ownership validation to ensure users can only reset pages from their own shop
- Preserve the page entity (no deletion/recreation) by updating the layout field
- Automatically update the `updated_at` timestamp when resetting

### Functional Requirements
- **Authentication**: JWT bearer token required (ROLE_USER)
- **Authorization**: User must own the shop that contains the page
- **Validation**: Page type must be one of: home, catalog, product, contact
- **Business Logic**:
  1. Extract user_id from JWT token (handled by Symfony Security)
  2. Find shop by user_id
  3. Find page by shop_id and type
  4. Validate ownership (implicit via shop lookup)
  5. Load default layout for page type from DefaultLayoutService
  6. Update page.layout with default layout
  7. Update page.updated_at timestamp (automatic via entity method)
  8. Return updated page as PageReadModel

### Non-Functional Requirements
- Follow existing Clean Architecture patterns in the codebase
- Maintain data isolation (users can only access their own data)
- Provide clear error messages for invalid states
- Log important events and errors

---

## 2. Architectural Overview

### Design Decisions

**Pattern**: MVC with Service Layer (consistent with existing PageController)

**Layers**:
- **Controller** (`PageController`): Handle HTTP concerns, authentication, validation, error responses
- **Service** (`PageService`): Orchestrate business logic, coordinate between repositories
- **Repository** (`PageRepository`, `ShopRepository`): Data access and ReadModel construction
- **Domain** (`Page`, `Shop`, `Layout`, `PageType`): Business entities and value objects

**Key Design Choices**:
1. **No Request DTO needed**: Endpoint accepts no request body (POST is used for semantic correctness - it's a state-changing operation)
2. **Reuse existing services**: Leverage `DefaultLayoutService` to get default layouts (single source of truth)
3. **Reuse existing patterns**: Follow the exact pattern from `updatePageByType()` for consistency
4. **No new repository methods**: All required repository methods already exist
5. **Add method to PageService**: `resetPageToDefault()` to encapsulate reset logic

### Comparison with Existing Endpoints

This endpoint follows the same architectural pattern as:
- `GET /api/pages/{type}` - Similar authentication, validation, and error handling
- `PUT /api/pages/{type}` - Similar service orchestration and entity updates

---

## 3. Technical Specification

### 3.1 Database Schema

**No changes required**. The existing schema already supports this operation:
- `pages` table with `layout` JSONB column
- `updated_at` timestamp column for tracking changes

### 3.2 API Endpoint

#### Route Definition
```php
#[Route('/api/pages/{type}/reset', name: 'api_pages_reset', methods: ['POST'])]
#[IsGranted('ROLE_USER')]
public function resetPage(string $type): JsonResponse
```

#### Request
- **Method**: POST
- **Path**: `/api/pages/{type}/reset`
- **Path Parameter**: `type` (string) - One of: home, catalog, product, contact
- **Headers**: `Authorization: Bearer {jwt_token}`
- **Body**: None (empty)

#### Response (200 OK)
```json
{
  "type": "home",
  "layout": [
    {
      "id": "component-uuid",
      "type": "hero",
      "variant": "with-image",
      "settings": {
        "heading": "Welcome to Your Store",
        "subheading": "Customize this page to match your brand"
      }
    }
  ],
  "created_at": "2025-10-15T14:30:00+00:00",
  "updated_at": "2025-10-29T17:00:00+00:00"
}
```

#### Error Responses

**400 Bad Request** - Invalid page type
```json
{
  "error": "invalid_page_type",
  "message": "Page type must be one of: home, catalog, product, contact"
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "error": "Authentication error"
}
```

**404 Not Found** - Shop not found
```json
{
  "error": "shop_not_found",
  "message": "Shop not found for user {userId}"
}
```

**404 Not Found** - Page not found
```json
{
  "error": "page_not_found",
  "message": "Page of type '{type}' not found for user {userId}"
}
```

**500 Internal Server Error** - Unexpected error
```json
{
  "error": "An unexpected error occurred"
}
```

### 3.3 Backend Implementation

#### Controller: PageController

**New Method**: `resetPage(string $type): JsonResponse`

**Location**: `backend/src/Controller/PageController.php`

**Responsibilities**:
- Validate and convert `type` parameter to PageType enum (throws ValueError if invalid)
- Extract authenticated user from security context
- Call `PageService::resetPageToDefault()`
- Handle exceptions and return appropriate HTTP responses
- Log errors and important events

**Error Handling**:
- `ValueError` → 400 Bad Request (invalid page type)
- `ShopNotFoundException` → 404 Not Found
- `PageNotFoundException` → 404 Not Found
- Authentication failure → 401 Unauthorized
- `\Throwable` → 500 Internal Server Error

**Implementation Pattern**: Follow exact pattern from `updatePageByType()` method for consistency

#### Service: PageService

**New Method**: `resetPageToDefault(string $userId, PageType $type): PageReadModel`

**Location**: `backend/src/Service/PageService.php`

**Dependencies** (injected):
- `ShopRepository` (existing)
- `PageRepository` (existing)
- `DefaultLayoutService` (existing)

**Business Logic Flow**:
```php
1. Find shop by user ID using ShopRepository::findByUserId()
   - If null → throw ShopNotFoundException

2. Find page entity by shop ID and type using PageRepository::findByShopIdAndType()
   - If null → throw PageNotFoundException

3. Get default layout using DefaultLayoutService::getDefaultLayout($type)

4. Update page layout using Page::updateLayout($defaultLayout)
   - This automatically updates the updated_at timestamp

5. Persist changes using PageRepository::save($page)

6. Construct and return PageReadModel from updated entity
```

**Return**: `PageReadModel` with updated layout and new timestamp

**Exceptions Thrown**:
- `ShopNotFoundException` - User has no shop
- `PageNotFoundException` - Page doesn't exist for shop

#### Repository: PageRepository

**No changes required**. Existing methods cover all needs:
- `findByShopIdAndType(string $shopId, PageType $type): ?Page` - Retrieve entity for updating
- `save(Page $page): void` - Persist changes

#### Repository: ShopRepository

**No changes required**. Existing methods cover all needs:
- `findByUserId(string $userId): ?Shop` - Find user's shop

#### Domain: Page Entity

**No changes required**. Existing methods cover all needs:
- `updateLayout(Layout $layout): void` - Update layout and timestamp

#### Service: DefaultLayoutService

**No changes required**. Existing methods cover all needs:
- `getDefaultLayout(PageType $pageType): Layout` - Get default layout for page type

---

## 4. Implementation Phases

### Phase 1: Service Layer (Core Business Logic)
**Priority**: High
**Estimated Time**: 15 minutes

**Tasks**:
1. Add `DefaultLayoutService` dependency to `PageService` constructor
2. Implement `resetPageToDefault()` method in `PageService`
3. Follow existing patterns from `updatePageLayout()` for consistency

**Acceptance Criteria**:
- Method correctly finds shop by user ID
- Method correctly finds page entity by shop ID and type
- Method loads default layout from DefaultLayoutService
- Method updates page entity using `updateLayout()`
- Method persists changes to database
- Method returns PageReadModel with updated data
- Appropriate exceptions are thrown for error cases

### Phase 2: Controller Layer (HTTP Interface)
**Priority**: High
**Estimated Time**: 20 minutes

**Tasks**:
1. Add route annotation for `POST /api/pages/{type}/reset`
2. Implement `resetPage()` method in `PageController`
3. Follow exact pattern from `updatePageByType()` for consistency
4. Add authentication check with `#[IsGranted('ROLE_USER')]`
5. Implement error handling for all exception types
6. Add comprehensive PHPDoc comments

**Acceptance Criteria**:
- Route is correctly defined with POST method
- Authentication is enforced via IsGranted attribute
- Type parameter is validated and converted to PageType enum
- Service method is called with correct parameters
- All exception types are caught and mapped to appropriate HTTP responses
- Error responses match the specification
- Success response returns PageReadModel as JSON with 200 status
- Comprehensive logging for errors and edge cases

### Phase 3: Testing
**Priority**: Medium
**Estimated Time**: 30 minutes

**Tasks**:
1. Write unit tests for `PageService::resetPageToDefault()`
2. Write unit tests for `PageController::resetPage()`
3. Manual API testing with valid and invalid requests

**Test Scenarios**:

**Service Tests** (`tests/Unit/Service/PageServiceTest.php`):
- ✅ Successfully resets page to default layout
- ✅ Throws ShopNotFoundException when shop not found
- ✅ Throws PageNotFoundException when page not found
- ✅ Updates page timestamp automatically
- ✅ Persists changes to repository

**Manual API Tests**:
- ✅ Reset home page with valid token
- ✅ Reset catalog page with valid token
- ✅ Reset product page with valid token
- ✅ Reset contact page with valid token
- ✅ Attempt reset with invalid page type (should return 400)
- ✅ Attempt reset without authentication (should return 401)
- ✅ Verify layout matches default from DefaultLayoutService
- ✅ Verify updated_at timestamp is updated

---

## 5. Testing Strategy

### Unit Tests

**PageService Unit Tests** (`backend/tests/Unit/Service/PageServiceTest.php`):

```php
final class PageServiceTest extends TestCase
{
    private ShopRepository $shopRepository;
    private PageRepository $pageRepository;
    private DefaultLayoutService $defaultLayoutService;
    private PageService $pageService;

    protected function setUp(): void
    {
        $this->shopRepository = $this->createMock(ShopRepository::class);
        $this->pageRepository = $this->createMock(PageRepository::class);
        $this->defaultLayoutService = $this->createMock(DefaultLayoutService::class);

        $this->pageService = new PageService(
            $this->shopRepository,
            $this->pageRepository,
            $this->defaultLayoutService
        );
    }

    #[Test]
    public function it_resets_page_to_default_layout(): void
    {
        // Test implementation details...
    }

    #[Test]
    public function it_throws_exception_when_shop_not_found(): void
    {
        // Test implementation details...
    }

    #[Test]
    public function it_throws_exception_when_page_not_found(): void
    {
        // Test implementation details...
    }
}
```

### Integration Tests

**Manual API Testing with curl**:

```bash
# Get JWT token first
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# Test 1: Reset home page
curl -X POST http://localhost:8000/api/pages/home/reset \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test 2: Reset with invalid type
curl -X POST http://localhost:8000/api/pages/invalid/reset \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test 3: Reset without authentication
curl -X POST http://localhost:8000/api/pages/home/reset \
  -H "Content-Type: application/json"
```
---

## 6. Risks & Considerations

### Technical Risks

1. **Data Loss Risk**:
   - **Risk**: User accidentally resets page losing all customizations
   - **Mitigation**: Frontend should show confirmation dialog before calling endpoint
   - **Future Enhancement**: Consider implementing undo/redo or version history

2. **Concurrent Updates**:
   - **Risk**: User resets page while another tab is editing the same page
   - **Mitigation**: Frontend should refresh page data after reset operation
   - **Current State**: No optimistic locking implemented (acceptable for MVP)

3. **Default Layout Changes**:
   - **Risk**: If default layouts change in code, existing pages won't be affected
   - **Mitigation**: This is expected behavior - reset uses current defaults
   - **Documentation**: Document that reset always uses latest default layouts

### Performance Considerations

- **Database Operations**: Single UPDATE query (fast)
- **Transaction Scope**: Single entity update (low risk of deadlock)
- **Response Time**: Expected < 100ms (typical for similar endpoints)

### Security Considerations

1. **Authentication**: JWT token required (enforced by Symfony Security)
2. **Authorization**: Ownership validated via shop lookup (data isolation maintained)
3. **Input Validation**: Page type validated via enum (SQL injection not possible)
4. **Rate Limiting**: Not implemented in MVP (consider for production)

### Backwards Compatibility

- **No breaking changes**: New endpoint doesn't modify existing endpoints
- **No database migrations**: Uses existing schema
- **No API version changes**: Additive change only

---

## 8. Implementation Checklist

### Phase 1: Service Layer
- [ ] Add `DefaultLayoutService` dependency to `PageService` constructor
- [ ] Implement `resetPageToDefault()` method
- [ ] Handle shop not found scenario
- [ ] Handle page not found scenario
- [ ] Load default layout from service
- [ ] Update page entity and persist changes
- [ ] Return PageReadModel

### Phase 2: Controller Layer
- [ ] Add route annotation `POST /api/pages/{type}/reset`
- [ ] Add `#[IsGranted('ROLE_USER')]` attribute
- [ ] Implement `resetPage()` method
- [ ] Validate and convert type parameter to enum
- [ ] Extract authenticated user from security context
- [ ] Call service method with correct parameters
- [ ] Handle ValueError (invalid type) → 400
- [ ] Handle ShopNotFoundException → 404
- [ ] Handle PageNotFoundException → 404
- [ ] Handle authentication errors → 401
- [ ] Handle unexpected errors → 500
- [ ] Add comprehensive PHPDoc comments
- [ ] Add logging for errors and important events

### Phase 3: Testing
- [ ] Write unit tests for `PageService::resetPageToDefault()`
- [ ] Write unit tests for `PageController::resetPage()`
- [ ] Test successful reset for each page type
- [ ] Test error scenarios (invalid type, not found, etc.)
- [ ] Manual API testing with curl
- [ ] Verify layout matches default from DefaultLayoutService
- [ ] Verify timestamp is updated

---

## 9. Dependencies

### Existing Code (No Modifications Required)
- `App\Model\Entity\Page` - Page entity with `updateLayout()` method
- `App\Model\Entity\Shop` - Shop entity
- `App\Model\Enum\PageType` - Enum with all page types
- `App\Model\ValueObject\Layout` - Layout value object
- `App\Repository\PageRepository` - Provides `findByShopIdAndType()` and `save()`
- `App\Repository\ShopRepository` - Provides `findByUserId()`
- `App\Service\DefaultLayoutService` - Provides `getDefaultLayout()`
- `App\ReadModel\PageReadModel` - Read model for API responses
- `App\Exception\PageNotFoundException` - Exception for page not found
- `App\Exception\ShopNotFoundException` - Exception for shop not found

### New Code (To Be Implemented)
- `PageService::resetPageToDefault()` - New method in existing service
- `PageController::resetPage()` - New method in existing controller

### External Dependencies
- Symfony Security (JWT authentication) - Already configured
- Doctrine ORM - Already configured
- PSR-3 Logger - Already injected in controller

---

## 10. Success Criteria

### Functional Success Criteria
✅ Endpoint accepts POST requests at `/api/pages/{type}/reset`
✅ Endpoint requires JWT authentication
✅ Endpoint validates page type (home, catalog, product, contact)
✅ Endpoint resets page layout to default from DefaultLayoutService
✅ Endpoint updates page timestamp automatically
✅ Endpoint returns updated PageReadModel with 200 status
✅ Endpoint returns appropriate error responses (400, 401, 404, 500)
✅ All error cases are properly logged

### Technical Success Criteria
✅ Follows existing Clean Architecture patterns
✅ Maintains data isolation (users access only their data)
✅ Reuses existing services and repositories
✅ No database schema changes required
✅ Code is well-documented with PHPDoc
✅ Unit tests cover all scenarios
✅ Manual testing passes all test cases

### Quality Criteria
✅ Code follows PHP 8.3+ standards and project conventions
✅ Error messages are clear and actionable
✅ Logging provides sufficient debugging information
✅ Response format is consistent with existing endpoints
✅ No performance regressions

---

## Appendix A: File Locations

```
backend/
├── src/
│   ├── Controller/
│   │   └── PageController.php          # ADD: resetPage() method
│   ├── Service/
│   │   ├── PageService.php             # ADD: resetPageToDefault() method
│   │   └── DefaultLayoutService.php    # EXISTING: use getDefaultLayout()
│   ├── Repository/
│   │   ├── PageRepository.php          # EXISTING: use findByShopIdAndType(), save()
│   │   └── ShopRepository.php          # EXISTING: use findByUserId()
│   ├── Model/
│   │   ├── Entity/
│   │   │   ├── Page.php                # EXISTING: use updateLayout()
│   │   │   └── Shop.php                # EXISTING
│   │   ├── Enum/
│   │   │   └── PageType.php            # EXISTING: use fromString()
│   │   └── ValueObject/
│   │       └── Layout.php              # EXISTING
│   ├── ReadModel/
│   │   └── PageReadModel.php           # EXISTING
│   └── Exception/
│       ├── PageNotFoundException.php   # EXISTING
│       └── ShopNotFoundException.php   # EXISTING
└── tests/
    └── Unit/
        ├── Service/
        │   └── PageServiceTest.php     # ADD: tests for resetPageToDefault()
        └── Controller/
            └── PageControllerTest.php  # ADD: tests for resetPage()
```

---

## Document Version

- **Version**: 1.0
- **Created**: 2025-10-29
- **Last Updated**: 2025-10-29
- **Author**: Claude (Architect)
- **Status**: Ready for Implementation
