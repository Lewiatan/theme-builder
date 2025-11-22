# Implementation Plan: GET /api/demo/products Endpoint

## 1. Requirements Analysis

### Functional Requirements
- Create a public REST API endpoint that returns demo products for the Demo Shop
- Support optional category filtering via query parameter `category_id`
- Return product data including category name (requires JOIN with demo_categories)
- Order products alphabetically by name (ascending)
- No authentication required (public endpoint)
- Prices stored and returned in cents (e.g., 19999 = $199.99)
- Support `sale_price` as nullable field (null when product is not on sale)

### Non-Functional Requirements
- **Performance**: Optimize database query to minimize N+1 problems through JOINs
- **Validation**: Validate category_id parameter (must be positive integer if provided)
- **Error Handling**: Return appropriate HTTP status codes and error messages
- **Data Integrity**: Verify category exists before filtering (prevent SQL injection, invalid references)
- **Consistency**: Follow existing codebase patterns (ReadModel, Service layer, attribute routing)

### Business Context
The Demo Shop application needs to display mock product data to demonstrate the theme builder's capabilities. Products are categorized and may have sale prices. This endpoint serves as a data source for product listing pages and catalog components in the themed shop frontend.

---

## 2. Architectural Overview

### Design Pattern Selection

**ReadModel Pattern**: Following established codebase convention (see PageReadModel), create a DemoProductReadModel to decouple domain entities from API responses. This prevents accidental exposure of internal data structures and provides explicit control over the JSON response format.

**Service Layer**: Introduce DemoProductService to orchestrate business logic between the controller and repository, maintaining clean separation of concerns (Controller → Service → Repository → Database).

**Repository Pattern**: Create DemoProductRepository to handle data access and query construction. The repository will be responsible for building optimized SQL queries with JOINs and constructing ReadModel instances.

**Request DTO Pattern**: Already exists (GetDemoProductsRequest) with Symfony validation attributes. This validates and type-casts query parameters before business logic execution.

### Layered Architecture

```
Controller Layer (PublicShopController or new DemoController)
    ↓ (delegates to)
Service Layer (DemoProductService)
    ↓ (orchestrates)
Repository Layer (DemoProductRepository)
    ↓ (queries)
Database (PostgreSQL)
    ↓ (returns raw data)
Repository Layer (constructs ReadModels)
    ↓ (returns ReadModels)
Service Layer (passes through)
    ↓ (returns ReadModels)
Controller Layer (serializes to JSON)
```

### Key Architectural Decisions

1. **No Entity Classes**: Demo products/categories are read-only reference data. Creating Doctrine entities would add unnecessary complexity. Use raw SQL queries with array hydration similar to PageRepository::findPublicPageByShopAndType().

2. **ReadModel Construction in Repository**: Following the codebase pattern, the repository constructs ReadModel objects from raw query results, not the service or controller.

3. **Value Objects for Complex Types**: Leverage existing ProductImages and Money value objects to encapsulate image URLs and price handling respectively. These provide validation and type safety.

4. **Category Validation Strategy**: Execute a separate EXISTS check when category_id is provided to return meaningful 404 errors vs. empty product lists.

5. **Controller Location**: Add the endpoint to existing PublicShopController (or create DemoController if preferred) since this is another public, unauthenticated Demo Shop endpoint.

---

## 3. Technical Specification

### Database Schema (Existing)

**demo_categories table**:
- `id` (integer, PK, auto-increment)
- `name` (varchar(255))

**demo_products table**:
- `id` (integer, PK, auto-increment)
- `category_id` (integer, FK → demo_categories.id)
- `name` (varchar(255))
- `description` (text)
- `price` (integer, cents)
- `sale_price` (integer, nullable, cents)
- `image_thumbnail` (varchar(255))
- `image_medium` (varchar(255))
- `image_large` (varchar(255))

**Index**: `idx_demo_products_category_id` exists for efficient category filtering.

No migration required - schema already exists.

### API Contract

**Endpoint**: `GET /api/demo/products`

**Route Attribute**:
```
#[Route('/api/demo/products', name: 'demo_products_list', methods: ['GET'])]
```

**Query Parameters**:
- `category_id` (optional, integer, must be positive)

**Success Response (200 OK)**:
```json
{
  "products": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "Electronics",
      "name": "Smart Watch",
      "description": "Feature-rich smartwatch...",
      "price": 29999,
      "sale_price": null,
      "image_thumbnail": "https://r2.example.com/...",
      "image_medium": "https://r2.example.com/...",
      "image_large": "https://r2.example.com/..."
    }
  ]
}
```

**Error Response (400 Bad Request)** - Invalid category_id:
```json
{
  "errors": {
    "category_id": ["Category ID must be a positive integer"]
  }
}
```

**Error Response (404 Not Found)** - Category doesn't exist:
```json
{
  "error": "Category not found"
}
```

**Error Response (500 Internal Server Error)** - Unexpected failure:
```json
{
  "error": "An unexpected error occurred"
}
```

### Component Specifications

#### 1. DemoProductReadModel (src/ReadModel/DemoProductReadModel.php)

**Responsibility**: Immutable data structure representing a single product for API response serialization.

**Properties**:
- `id` (int)
- `categoryId` (int)
- `categoryName` (string)
- `name` (string)
- `description` (string)
- `price` (int, cents)
- `salePrice` (?int, cents)
- `imageThumbnail` (string)
- `imageMedium` (string)
- `imageLarge` (string)

**Interface**: Implements `JsonSerializable`

**Method**: `jsonSerialize(): array` - Returns associative array matching API contract (snake_case keys)

**Design Notes**:
- Use `final readonly class` for immutability
- Constructor accepts all properties
- No validation needed (data comes from trusted database source)
- Properties use camelCase PHP convention, `jsonSerialize()` converts to snake_case for API

#### 2. DemoProductRepository (src/Repository/DemoProductRepository.php)

**Responsibility**: Data access layer for demo products. Constructs optimized SQL queries and transforms results into ReadModels.

**Methods**:

**`findAllProducts(): array<DemoProductReadModel>`**
- Fetches all products with category names
- Uses INNER JOIN between demo_products and demo_categories
- Orders by product name ASC
- Returns array of DemoProductReadModel instances

**`findProductsByCategoryId(int $categoryId): array<DemoProductReadModel>`**
- Fetches products filtered by category_id
- Uses INNER JOIN and WHERE clause
- Orders by product name ASC
- Returns array of DemoProductReadModel instances

**`categoryExists(int $categoryId): bool`**
- Checks if a category exists in the database
- Uses simple SELECT COUNT(*) or EXISTS query
- Returns boolean result

**SQL Query Structure**:
```sql
SELECT
    p.id,
    p.category_id,
    c.name AS category_name,
    p.name,
    p.description,
    p.price,
    p.sale_price,
    p.image_thumbnail,
    p.image_medium,
    p.image_large
FROM demo_products p
INNER JOIN demo_categories c ON p.category_id = c.id
[WHERE p.category_id = :categoryId]
ORDER BY p.name ASC
```

**Design Notes**:
- Extend `ServiceEntityRepository` (even without Doctrine entity) for consistency, or inject `ManagerRegistry` to access connection
- Use `$conn->fetchAllAssociative()` for result sets
- Map each row to DemoProductReadModel in private helper method
- Use parameterized queries to prevent SQL injection
- Handle empty result sets gracefully (return empty array)

#### 3. DemoProductService (src/Service/DemoProductService.php)

**Responsibility**: Business logic orchestration for demo product operations. Validates category existence and delegates to repository.

**Constructor Dependencies**:
- `DemoProductRepository $repository`

**Methods**:

**`getProducts(?int $categoryId): array<DemoProductReadModel>`**
- Orchestrates product retrieval with optional category filtering
- If categoryId provided, validates category exists (throws exception if not)
- Delegates to appropriate repository method
- Returns array of DemoProductReadModel instances

**Business Logic**:
1. If `$categoryId` is null, call `$repository->findAllProducts()`
2. If `$categoryId` is provided:
   - Call `$repository->categoryExists($categoryId)`
   - If false, throw custom `CategoryNotFoundException`
   - If true, call `$repository->findProductsByCategoryId($categoryId)`
3. Return results

**Exception Handling**:
- Define `CategoryNotFoundException` extending Symfony's `NotFoundHttpException` or custom domain exception
- Service throws exception, controller catches and converts to 404 response

#### 4. Controller Method (src/Controller/PublicShopController.php or new DemoController)

**Recommendation**: Add to existing `PublicShopController` since this is another public Demo Shop endpoint. Alternatively, create separate `DemoController` if there will be many demo-related endpoints.

**Method Signature**:
```php
#[Route('/api/demo/products', name: 'demo_products_list', methods: ['GET'])]
public function getDemoProducts(Request $request): JsonResponse
```

**Responsibilities**:
1. Extract query parameters from Request
2. Create GetDemoProductsRequest DTO
3. Validate DTO using Symfony Validator
4. Call DemoProductService
5. Handle exceptions (CategoryNotFoundException → 404, others → 500)
6. Return JsonResponse with array of ReadModels

**Request Handling Flow**:
1. Extract `category_id` from `$request->query->get('category_id')`
2. Cast to int if present, otherwise null
3. Instantiate `GetDemoProductsRequest` with category_id
4. Validate using `ValidatorInterface`
5. If validation fails, return 400 with error details
6. If validation succeeds, call service
7. Wrap results in `["products" => $readModels]` structure
8. Return `JsonResponse` with 200 status

**Error Handling**:
- Validation errors → 400 Bad Request with structured error array
- CategoryNotFoundException → 404 Not Found
- Other exceptions → 500 Internal Server Error (log exception details)

**Logging**:
- Log validation failures with context (category_id value)
- Log CategoryNotFoundException with category_id
- Log unexpected exceptions with full stack trace

#### 5. GetDemoProductsRequest (src/Request/GetDemoProductsRequest.php)

**Status**: Already exists and correctly implemented.

**Validation Rules**:
- `categoryId` must be integer type
- `categoryId` must be positive if provided
- `categoryId` is nullable (optional parameter)

**No changes required** - existing implementation matches requirements.

### Dependency Injection Configuration

**services.yaml**: No explicit configuration needed. Symfony's autowiring and autoconfiguration will automatically:
- Register DemoProductService as a service
- Register DemoProductRepository as a service
- Inject dependencies into constructors

**Verification**: Ensure `App\` namespace is configured with `autowire: true` and `autoconfigure: true` (already confirmed in existing services.yaml).

### Routing Configuration

**routes.yaml**: Already configured to load controllers via attributes:
```yaml
controllers:
    resource:
        path: ../src/Controller/
        namespace: App\Controller
    type: attribute
```

**No changes required** - new route attribute will be automatically discovered.

---

## 4. Implementation Phases

### Phase 1: ReadModel Foundation
**Priority**: Critical (foundation for all subsequent work)

**Tasks**:
1. Create `src/ReadModel/DemoProductReadModel.php`
2. Define all properties matching API contract
3. Implement `JsonSerializable` interface
4. Implement `jsonSerialize()` method with snake_case key conversion
5. Add comprehensive PHPDoc annotations

**Acceptance Criteria**:
- ReadModel is immutable (final readonly class)
- JSON serialization produces correct structure
- All properties have correct types
- PHPDoc includes property descriptions

**Testing Strategy**:
- Unit test: Verify jsonSerialize() output structure
- Unit test: Verify property types and immutability

---

### Phase 2: Repository Implementation
**Priority**: Critical (data access layer)

**Tasks**:
1. Create `src/Repository/DemoProductRepository.php`
2. Extend `ServiceEntityRepository` or use `ManagerRegistry`
3. Implement `findAllProducts()` method with JOIN query
4. Implement `findProductsByCategoryId()` method with WHERE clause
5. Implement `categoryExists()` method
6. Create private helper method to map row arrays to ReadModels
7. Add SQL query documentation in method PHPDoc

**Acceptance Criteria**:
- All methods use parameterized queries (SQL injection safe)
- Queries use INNER JOIN for category name
- Results ordered by product name ASC
- Empty results return empty array (not null)
- Helper method validates row data before ReadModel construction

**Testing Strategy**:
- Unit test (with database): Verify findAllProducts() returns all products sorted by name
- Unit test (with database): Verify findProductsByCategoryId() filters correctly
- Unit test (with database): Verify categoryExists() returns true/false correctly
- Test with empty database tables
- Test with multiple products in same category
- Test with products without sale prices (null handling)

---

### Phase 3: Service Layer
**Priority**: High (business logic orchestration)

**Tasks**:
1. Create `src/Service/DemoProductService.php`
2. Inject DemoProductRepository dependency
3. Implement `getProducts(?int $categoryId)` method
4. Implement category existence validation logic
5. Create custom `CategoryNotFoundException` exception
6. Add comprehensive error handling

**Acceptance Criteria**:
- Service validates category existence before filtering
- CategoryNotFoundException is thrown for invalid categories
- Service has no direct database access (delegates to repository)
- Method signatures use type hints and return types
- PHPDoc includes @throws annotations

**Testing Strategy**:
- Unit test (mocked repository): Verify getProducts(null) calls findAllProducts()
- Unit test (mocked repository): Verify getProducts(1) validates category and calls findProductsByCategoryId()
- Unit test (mocked repository): Verify CategoryNotFoundException thrown when category doesn't exist
- Unit test: Verify service passes through repository results unchanged

---

### Phase 4: Controller Integration
**Priority**: High (API endpoint exposure)

**Tasks**:
1. Add method to PublicShopController (or create DemoController)
2. Define route with #[Route] attribute
3. Implement request parameter extraction
4. Integrate GetDemoProductsRequest DTO
5. Implement Symfony validation
6. Call DemoProductService
7. Implement error handling (validation, CategoryNotFoundException, generic exceptions)
8. Wrap results in `{"products": [...]}` structure
9. Add logging for errors and validation failures

**Acceptance Criteria**:
- Endpoint accessible at GET /api/demo/products
- Query parameter category_id is optional
- Validation errors return 400 with structured error JSON
- CategoryNotFoundException returns 404 with error message
- Other exceptions return 500 with generic error message
- Success returns 200 with products array
- Response JSON matches API contract specification

**Testing Strategy**:
- Integration test: GET /api/demo/products returns all products
- Integration test: GET /api/demo/products?category_id=1 returns filtered products
- Integration test: GET /api/demo/products?category_id=999 returns 404
- Integration test: GET /api/demo/products?category_id=-1 returns 400 validation error
- Integration test: GET /api/demo/products?category_id=abc returns 400 validation error
- Verify JSON response structure matches specification
- Verify products ordered alphabetically by name

---

### Phase 5: Testing & Documentation
**Priority**: Medium (quality assurance)

**Tasks**:
1. Write comprehensive unit tests for all components
2. Write integration tests for full API endpoint
3. Test edge cases (empty database, invalid parameters, boundary values)
4. Update API documentation with new endpoint
5. Update CHANGELOG.md with feature addition
6. Verify performance with larger datasets (simulate 100+ products)

**Acceptance Criteria**:
- Test coverage meets project standards
- All edge cases covered
- Documentation updated and accurate
- Performance acceptable (query execution < 100ms)

**Testing Strategy**:
- PHPUnit unit tests for ReadModel, Repository, Service, Controller
- Integration tests for full request/response cycle
- Test with sample data seeding
- Verify SQL query efficiency (EXPLAIN ANALYZE)

---

## 5. Testing Strategy

### Unit Testing (PHPUnit)

**DemoProductReadModel Tests**:
- Test jsonSerialize() output structure
- Test property immutability
- Test null sale_price handling

**DemoProductRepository Tests** (with test database):
- Test findAllProducts() with empty database → empty array
- Test findAllProducts() with multiple products → sorted by name
- Test findProductsByCategoryId() with valid category → filtered results
- Test findProductsByCategoryId() with category having no products → empty array
- Test categoryExists() with valid category → true
- Test categoryExists() with invalid category → false
- Test INNER JOIN excludes products with orphaned category_id (data integrity)

**DemoProductService Tests** (mocked dependencies):
- Test getProducts(null) delegates to findAllProducts()
- Test getProducts(validId) checks categoryExists() then calls findProductsByCategoryId()
- Test getProducts(invalidId) throws CategoryNotFoundException
- Test repository results passed through unchanged

**Controller Tests** (mocked service):
- Test valid request with no category_id → 200 with all products
- Test valid request with category_id → 200 with filtered products
- Test invalid category_id (negative) → 400 validation error
- Test invalid category_id (non-integer) → 400 validation error
- Test CategoryNotFoundException → 404 error response
- Test generic exception → 500 error response
- Test response JSON structure matches contract

### Integration Testing (PHPUnit)

**Full Request/Response Cycle**:
- Seed test database with demo categories and products
- Test GET /api/demo/products → verify all products returned, sorted by name
- Test GET /api/demo/products?category_id=1 → verify only category 1 products returned
- Test GET /api/demo/products?category_id=999 → verify 404 response
- Test GET /api/demo/products?category_id=-5 → verify 400 validation error
- Test response JSON structure exactly matches specification
- Test category_name is correctly populated from JOIN
- Test sale_price null handling in JSON

### E2E Testing (Playwright)

**Recommendation**: E2E tests should focus on Demo Shop frontend consuming this API, not on API testing directly. API testing is better handled by PHPUnit integration tests.

**Potential E2E Scenario** (if integrated with frontend):
- Navigate to Demo Shop product catalog page
- Verify products load and display correctly
- Filter by category via UI
- Verify filtered products match category

---

## 6. Risks & Considerations

### Performance Risks

**Risk**: N+1 query problem if not using JOIN
- **Mitigation**: Use INNER JOIN in SQL query to fetch category names in single query
- **Verification**: Monitor query logs; should see single SELECT with JOIN, not separate queries per product

**Risk**: Large result sets causing memory issues
- **Mitigation**: For MVP with demo data (~20-50 products), this is not a concern
- **Future Consideration**: Implement pagination if product count grows significantly (>1000 products)

**Risk**: Missing index on category_id causing slow filtering
- **Status**: Index already exists (`idx_demo_products_category_id`)
- **Verification**: Run EXPLAIN ANALYZE on query to confirm index usage

### Security Considerations

**SQL Injection**:
- **Mitigation**: Use parameterized queries exclusively (Doctrine DBAL parameter binding)
- **Verification**: Code review all repository methods for parameter binding

**Data Exposure**:
- **Mitigation**: ReadModel pattern ensures only intended fields are exposed
- **Verification**: Review ReadModel::jsonSerialize() to confirm no sensitive fields included

**Input Validation**:
- **Mitigation**: Symfony Validator validates category_id type and range
- **Verification**: Test with various invalid inputs (negative, non-integer, SQL injection attempts)

### Data Integrity Risks

**Risk**: Orphaned products with invalid category_id
- **Mitigation**: INNER JOIN automatically excludes orphaned products
- **Database Constraint**: Foreign key constraint on demo_products.category_id prevents orphans at database level
- **Verification**: Test with intentionally corrupted data (if FK constraint disabled in test environment)

**Risk**: Products with missing image URLs
- **Mitigation**: Database schema requires NOT NULL on image columns
- **Additional Safety**: ReadModel construction could validate non-empty strings (defensive programming)

### Maintainability Considerations

**Code Duplication**:
- **Risk**: Similar JOIN queries in findAllProducts() and findProductsByCategoryId()
- **Mitigation**: Extract common query building to private method, parameterize WHERE clause
- **Trade-off**: Slight increase in complexity for DRY principle adherence

**Error Message Consistency**:
- **Risk**: Inconsistent error message format across endpoints
- **Mitigation**: Review PublicShopController::getPage() error handling and match format
- **Consideration**: Define error response format convention in documentation

### Edge Cases

**Empty Categories**:
- Filtering by empty category returns empty products array (not an error)
- Frontend should display "No products found" message

**Products with $0.00 Price**:
- Valid use case (free products, giveaways)
- price=0 is valid according to Money value object (only negative is invalid)

**Very Long Product Names/Descriptions**:
- Database schema limits: name=varchar(255), description=text
- JSON serialization handles strings of any length
- Frontend should implement text truncation for display

**Special Characters in Product Data**:
- JSON encoding automatically escapes special characters
- No additional sanitization needed for JSON responses

---

## 7. Follow-Up Considerations

### Immediate Follow-Ups (Within MVP Scope)

**Demo Data Seeding**:
- Create Phinx seeder to populate demo_categories and demo_products tables
- Ensure realistic product data with varied categories, prices, descriptions
- Include products with and without sale prices
- Priority: High (required for testing and demo)

**GET /api/demo/categories Endpoint**:
- Complementary endpoint to list all categories
- Useful for category filter UI in Demo Shop
- Simple implementation following same patterns
- Priority: Medium (useful but not critical if categories hardcoded in frontend)

---

## 9. Success Metrics

### Implementation Success Criteria

- [ ] All unit tests passing with >80% code coverage
- [ ] All integration tests passing
- [ ] API contract matches specification exactly
- [ ] No N+1 query issues (verified via query logs)
- [ ] Category filtering works correctly
- [ ] Validation errors return proper 400 responses
- [ ] Invalid category returns 404 response
- [ ] Products ordered alphabetically by name
- [ ] sale_price null handling works correctly
- [ ] Code follows PSR-12 style guidelines
- [ ] PHPDoc annotations complete and accurate

### Performance Benchmarks

- Query execution time: <50ms for findAllProducts() with 100 products
- Query execution time: <30ms for findProductsByCategoryId() with 50 products
- Total API response time: <100ms (including JSON serialization)
- Memory usage: <10MB per request

### Code Quality Metrics

- PHPStan level 6 or higher (no errors)
- PHP CS Fixer passes with project ruleset
- No code duplication beyond acceptable threshold
- Cyclomatic complexity <10 for all methods
- All public methods have PHPDoc annotations

---

## 10. Implementation Checklist

### Prerequisites
- [ ] Verify database tables exist (demo_categories, demo_products)
- [ ] Verify index exists (idx_demo_products_category_id)
- [ ] Review existing codebase patterns (ReadModel, Service, Repository)
- [ ] Set up local development environment

### Phase 1: ReadModel
- [ ] Create DemoProductReadModel.php
- [ ] Implement JsonSerializable interface
- [ ] Add PHPDoc annotations
- [ ] Write unit tests
- [ ] Verify immutability and type safety

### Phase 2: Repository
- [ ] Create DemoProductRepository.php
- [ ] Implement findAllProducts() with JOIN query
- [ ] Implement findProductsByCategoryId() with WHERE clause
- [ ] Implement categoryExists() method
- [ ] Create private ReadModel mapping helper
- [ ] Write unit tests with test database
- [ ] Verify query efficiency with EXPLAIN

### Phase 3: Service
- [ ] Create DemoProductService.php
- [ ] Create CategoryNotFoundException.php
- [ ] Implement getProducts() method
- [ ] Implement category validation logic
- [ ] Write unit tests with mocked repository
- [ ] Verify exception handling

### Phase 4: Controller
- [ ] Add getDemoProducts() method to controller
- [ ] Define route attribute
- [ ] Implement request parameter handling
- [ ] Integrate validation
- [ ] Implement error handling
- [ ] Add logging
- [ ] Write integration tests
- [ ] Verify endpoint accessibility

### Phase 5: Testing & Documentation
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Test edge cases
- [ ] Verify API contract compliance
- [ ] Update API documentation
- [ ] Update CHANGELOG.md
- [ ] Code review
- [ ] Merge to main branch

---

## 11. Estimated Implementation Timeline

**Total Estimated Time**: 4-6 hours for experienced Symfony developer

**Phase 1 (ReadModel)**: 30-45 minutes
- Model creation: 15 minutes
- Testing: 15-30 minutes

**Phase 2 (Repository)**: 1.5-2 hours
- Repository implementation: 45-60 minutes
- SQL query optimization: 15-30 minutes
- Testing: 30-45 minutes

**Phase 3 (Service)**: 45-60 minutes
- Service implementation: 20-30 minutes
- Exception handling: 10-15 minutes
- Testing: 15-20 minutes

**Phase 4 (Controller)**: 1-1.5 hours
- Controller implementation: 30-45 minutes
- Error handling and logging: 15-30 minutes
- Integration testing: 15-30 minutes

**Phase 5 (Testing & Docs)**: 30-45 minutes
- Additional edge case testing: 15-20 minutes
- Documentation updates: 15-25 minutes

**Buffer for unforeseen issues**: +30 minutes

---

## 12. Dependencies & Prerequisites

### External Dependencies
- **Symfony 7.3**: Already installed
- **Doctrine DBAL**: Already installed (for database queries)
- **Symfony Validator**: Already installed (for input validation)
- **PHPUnit**: Already installed (for testing)

### Internal Dependencies
- **Database Schema**: demo_categories and demo_products tables must exist (already exist per migration)
- **GetDemoProductsRequest**: Already implemented
- **Existing Patterns**: Follow PageRepository and PublicShopController patterns

### Development Environment Requirements
- PHP 8.3+
- PostgreSQL 16
- Docker (if using docker-compose setup)
- Composer

### No Additional Package Installation Required
