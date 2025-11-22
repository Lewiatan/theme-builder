# Implementation Plan: PUT /api/pages/{type} Endpoint

**Endpoint:** `PUT /api/pages/{type}`
**Purpose:** Update the layout for a specific page type for the authenticated user's shop

---

## 1. Requirements Analysis

### Business Requirements
- Allow authenticated users to update the layout of their shop's pages
- Support four page types: home, catalog, product, contact
- Validate layout structure to prevent corrupted data
- Enforce data isolation (users can only update their own shop's pages)
- Return updated page data immediately after successful update

### Technical Requirements
- JWT authentication required
- Path parameter validation (page type)
- Request body validation (layout structure)
- Ownership verification via Shop → User relationship
- Atomic database update with timestamp
- Consistent error responses with appropriate HTTP status codes

### Constraints
- Must follow existing Clean Architecture patterns in codebase
- Use Doctrine ORM for persistence
- Leverage existing Page entity with `updateLayout()` method
- Return PageReadModel for consistency with GET endpoints
- Use ReadModel pattern to prevent accidental data exposure
- Use automatic Symfony request payload mapping to route Request object

---

## 2. Architectural Overview

### Design Decisions

**1. Leverage Existing Architecture**
- The Page entity already has `updateLayout(Layout $layout)` method
- ShopRepository and PageRepository already exist with needed query methods
- PageService pattern established for business logic orchestration
- ReadModel pattern already in use for decoupling entity from API responses

**2. Request DTO Pattern**
- Create `UpdatePageLayoutRequest` DTO for input validation
- Use automated request validation with mapping to `UpdatePageLayoutRequest`
- Separate validation concerns from controller logic

**3. Clean Architecture Layers**
```
Controller (PageController)
    ↓
Request DTO (UpdatePageLayoutRequest) → Validation
    ↓
Service Layer (PageService)
    ↓
Repository Layer (PageRepository, ShopRepository)
    ↓
Entity Layer (Page, Layout ValueObject)
    ↓
Database (PostgreSQL)
```

**4. Error Handling Strategy**
- Invalid page type → 400 Bad Request
- Invalid layout structure → 400 Bad Request with field details
- User not authenticated → 401 Unauthorized
- Shop not found → 404 Not Found
- Page not found → 404 Not Found
- Unexpected errors → 500 Internal Server Error

---

## 3. Technical Specification

### 3.1 Request DTO

**Location:** `backend/src/Request/UpdatePageLayoutRequest.php`

**Responsibilities:**
- Deserialize JSON request body
- Validate layout structure
- Transform array data to Layout ValueObject

**Validation Rules:**
- `layout` must be an array (can be empty)
- Each component must have: id (UUID), type (string), variant (string), settings (object)
- Empty array is valid (allows clearing all components)

### 3.2 Controller Method

**Location:** `backend/src/Controller/PageController.php`

**Method Signature:**
```php
#[Route('/api/pages/{type}', name: 'api_pages_update_by_type', methods: ['PUT'])]
#[IsGranted('ROLE_USER')]
public function updatePageByType(
    string $type,
    #[MapRequestPayload] UpdatePageLayoutRequest $request
): JsonResponse
```

**Responsibilities:**
- Validate path parameter (page type)
- Extract authenticated user from security context
- Delegate to PageService for business logic
- Handle exceptions and return appropriate responses
- Log errors for debugging

**Response Codes:**
- 200 OK: Page updated successfully
- 400 Bad Request: Invalid page type or layout structure
- 401 Unauthorized: Missing or invalid JWT token
- 404 Not Found: Shop or page not found
- 500 Internal Server Error: Unexpected error

### 3.3 Service Layer

**Location:** `backend/src/Service/PageService.php`

**New Method:**
```php
public function updatePageLayout(
    string $userId,
    PageType $type,
    Layout $layout
): PageReadModel
```

**Business Logic:**
1. Find shop by user ID
2. Throw ShopNotFoundException if shop doesn't exist
3. Find page by shop ID and page type
4. Throw PageNotFoundException if page doesn't exist
5. Update page layout using entity method
6. Persist changes to database
7. Return updated PageReadModel

**Data Isolation:**
- Only operates on pages belonging to user's shop
- No direct user input to queries (prevents injection)
- Uses entity methods for domain logic

### 3.4 Repository Layer

**Location:** `backend/src/Repository/PageRepository.php`

**Existing Methods (No changes needed):**
- `findByShopIdAndType(string $shopId, PageType $type): ?Page` - Retrieve entity for update
- `save(Page $page): void` - Persist changes

**New Method (for optimized read after write):**
```php
public function findOneByShopIdAndTypeForUpdate(
    string $shopId,
    PageType $type
): ?Page
```

This method retrieves the entity (not ReadModel) for updating, then we convert to ReadModel after save.

**Alternative Approach:**
Reuse existing `findByShopIdAndType()` for entity retrieval and manually construct ReadModel after save. This avoids adding another repository method.

### 3.5 Database Schema

**No changes needed.** Existing schema supports the update operation:

```sql
CREATE TABLE pages (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    layout JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(shop_id, type)
);
```

The `layout` JSONB column stores the component array structure.

---

## 4. Implementation Phases

### Phase 1: Request DTO & Validation
**Priority:** High
**Estimated Effort:** 30 minutes

**Tasks:**
1. Create `UpdatePageLayoutRequest` DTO in `backend/src/Request/`
2. Add Symfony validation constraints for layout structure
3. Implement `getLayout()` method to transform array to Layout ValueObject
4. Write unit tests for DTO validation

**Acceptance Criteria:**
- DTO validates layout array structure correctly
- Empty array is accepted (allows clearing components)
- Invalid structures (missing fields, wrong types) are rejected
- Unit tests cover all validation scenarios

### Phase 2: Service Layer Logic
**Priority:** High
**Estimated Effort:** 45 minutes

**Tasks:**
1. Add `updatePageLayout()` method to `PageService`
2. Implement business logic: find shop → find page → update → save
3. Handle edge cases (shop not found, page not found)
4. Return PageReadModel after successful update
5. Write unit tests with mocked repositories

**Acceptance Criteria:**
- Method successfully updates page layout
- Throws ShopNotFoundException when user has no shop
- Throws PageNotFoundException when page doesn't exist
- Returns updated PageReadModel with new timestamp
- Unit tests achieve >90% code coverage

### Phase 3: Controller Integration
**Priority:** High
**Estimated Effort:** 45 minutes

**Tasks:**
1. Add `updatePageByType()` method to `PageController`
2. Integrate with `UpdatePageLayoutRequest` via MapRequestPayload
3. Implement exception handling for all error scenarios
4. Add comprehensive logging
5. Write integration tests for all response codes

**Acceptance Criteria:**
- Controller properly validates path parameter and request body
- Returns 200 OK with updated page data on success
- Returns 400 Bad Request for invalid input
- Returns 404 Not Found for missing resources
- Returns 500 Internal Server Error for unexpected errors
- All exceptions are logged appropriately
- Integration tests cover happy path and error scenarios

---

## 5. Testing Strategy

### 5.1 Unit Tests

**UpdatePageLayoutRequestTest.php**
- Test valid layout structure passes validation
- Test empty layout array is accepted
- Test missing required fields are rejected
- Test invalid UUIDs are rejected
- Test invalid data types are rejected
- Test Layout ValueObject transformation

**PageServiceTest.php (updatePageLayout method)**
- Test successful page layout update
- Test ShopNotFoundException when user has no shop
- Test PageNotFoundException when page doesn't exist
- Test Layout ValueObject is passed to entity method
- Test PageReadModel is returned with updated timestamp
- Mock all repository dependencies

### 5.2 Integration Tests

**PageControllerTest.php (updatePageByType method)**
- Test 200 OK response with valid request
- Test 400 Bad Request with invalid page type
- Test 400 Bad Request with invalid layout structure
- Test 401 Unauthorized without JWT token
- Test 404 Not Found when shop doesn't exist
- Test 404 Not Found when page doesn't exist
- Test response body matches PageReadModel structure
- Test updated_at timestamp changes after update

---

## 6. Risks & Considerations

### 6.1 Validation Complexity
**Risk:** Complex nested validation of layout structure may be brittle
**Mitigation:**
- Layout ValueObject already handles validation in `ComponentDefinition::fromArray()`
- Symfony validator provides first line of defense for structure
- Domain ValueObject provides second line of defense for business rules
- Clear error messages guide users to fix validation errors

### 6.2 Large Layouts
**Risk:** Very large layouts (100+ components) may cause performance issues
**Mitigation:**
- PostgreSQL JSONB handles large documents efficiently
- Add upper limit validation (e.g., max 100 components) if needed
- Monitor query performance in production
- Consider pagination or lazy loading in frontend if layouts grow large

### 6.3 Race Conditions
**Risk:** Concurrent updates to same page may cause lost updates
**Mitigation:**
- Current implementation uses last-write-wins strategy
- Database unique constraint prevents duplicate pages
- If optimistic locking needed, add version field to Page entity
- For MVP, last-write-wins is acceptable (single user per shop)

### 6.4 Data Exposure
**Risk:** Accidentally exposing internal IDs or sensitive data
**Mitigation:**
- Use PageReadModel for responses (already established pattern)
- ReadModel only includes: type, layout, created_at, updated_at
- No shop_id, user_id, or internal Page entity ID exposed
- Review serialization logic to prevent accidental data leakage

### 6.5 Security
**Risk:** Layout data may contain malicious content (XSS via user-generated content)
**Mitigation:**
- Backend stores layout as-is (JSON structure validation only)
- Frontend responsible for sanitizing content before rendering
- Settings fields are stored as-is (no HTML sanitization in backend)
- Consider Content Security Policy (CSP) headers in frontend

---

## 8. Definition of Done

- [ ] UpdatePageLayoutRequest DTO created with validation
- [ ] PageService.updatePageLayout() method implemented
- [ ] PageController.updatePageByType() method implemented
- [ ] All unit tests written and passing (>90% coverage)
- [ ] All integration tests written and passing
- [ ] Error handling covers all edge cases
- [ ] Logging added for debugging
- [ ] Code reviewed and approved
- [ ] API endpoint tested manually via Postman/curl
- [ ] Documentation updated (if applicable)
- [ ] No regressions in existing tests

---

## 9. Implementation Checklist

### Files to Create
- [ ] `backend/src/Request/UpdatePageLayoutRequest.php`
- [ ] `backend/tests/Unit/Request/UpdatePageLayoutRequestTest.php`
- [ ] `backend/tests/Unit/Service/PageServiceTest.php` (add test method)
- [ ] `backend/tests/Integration/Controller/PageControllerTest.php` (add test method)

### Files to Modify
- [ ] `backend/src/Controller/PageController.php` (add updatePageByType method)
- [ ] `backend/src/Service/PageService.php` (add updatePageLayout method)

### Files to Review (No changes expected)
- [ ] `backend/src/Model/Entity/Page.php` (confirm updateLayout method works)
- [ ] `backend/src/Model/ValueObject/Layout.php` (confirm fromArray validation)
- [ ] `backend/src/Repository/PageRepository.php` (confirm save method works)
- [ ] `backend/src/Repository/ShopRepository.php` (confirm findByUserId works)
