# API Endpoint Implementation Plan: GET /api/pages

## 1. Endpoint Overview

Retrieves all pages for the authenticated user's shop. This endpoint provides the complete set of pages (home, catalog, product, contact) with their layout configurations and metadata. The endpoint requires JWT authentication and enforces data isolation by only returning pages belonging to the authenticated user's shop.

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/pages`
- **Parameters**: None
- **Request Body**: None
- **Authentication**: Required (JWT Bearer token via Authorization header)

The endpoint has no query parameters or path parameters. Authentication is handled through the JWT token which contains the user identifier. Symfony Security will automatically inject the authenticated User entity into the controller.

## 3. Request Class and Request Validation

**No Request DTO is needed** for this endpoint because:
- There are no query parameters to validate
- There is no request body
- Authentication is handled by Symfony Security and LexikJWTAuthenticationBundle

The User entity will be automatically injected by Symfony Security based on the JWT token.

## 4. Response Details

### Success Response (200 OK):

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
          "settings": {...}
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
    }
  ]
}
```

### Response Structure:
- `pages`: Array of page objects
- Each page object contains:
  - `type`: String (home, catalog, product, contact)
  - `layout`: Array of component definitions (directly from Layout value object's toArray())
  - `created_at`: ISO 8601 timestamp string
  - `updated_at`: ISO 8601 timestamp string

### Status Codes:
- **200 OK**: Successfully retrieved pages
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: User doesn't have an associated shop (edge case)
- **500 Internal Server Error**: Unexpected server errors

## 5. Data Flow

### Request Flow:
1. Client sends GET request to `/api/pages` with Authorization header containing JWT Bearer token
2. Symfony Security validates JWT token via LexikJWTAuthenticationBundle
3. If valid, Security component extracts user identifier and loads User entity
4. Controller receives authenticated User entity via dependency injection
5. Controller calls PageService with user_id
6. PageService queries ShopRepository to find Shop by user_id
7. If shop not found, return 404
8. PageService queries PageRepository to find all pages by shop_id
9. PageRepository returns array of PageReadModel instances (created at repository layer)
10. Controller wraps PageReadModel array in response structure and returns JSON

### Database Queries:
1. **Find Shop by User ID**:
   - Query: `SELECT * FROM shops WHERE user_id = :userId`
   - Returns: Shop entity or null

2. **Find All Pages by Shop ID**:
   - Query: `SELECT id, type, layout, created_at, updated_at FROM pages WHERE shop_id = :shopId ORDER BY type`
   - Returns: Array of PageReadModel instances
   - Note: Use plain SQL with array result for performance (similar to DemoPageRepository pattern)

### ReadModel Creation:
- Create **PageReadModel** class in `src/ReadModel/PageReadModel.php`
- Implements `JsonSerializable` interface
- Contains: type, layout, created_at, updated_at
- Repository creates PageReadModel instances to decouple entities from API responses

## 6. Security Considerations

### Authentication:
- JWT token validation handled by LexikJWTAuthenticationBundle
- Controller method secured with Symfony's Security attribute: `#[IsGranted('ROLE_USER')]`
- Invalid or missing tokens automatically result in 401 Unauthorized

### Authorization & Data Isolation:
- Only pages belonging to authenticated user's shop are returned
- User entity from JWT token used to query shop
- No ability to access other users' pages (enforced at service layer)

### Data Exposure Prevention:
- Use PageReadModel to expose only intended fields
- Do not expose internal IDs (shop_id, user relationships)
- Timestamps included as per API specification (not sensitive)
- Layout data is user-created content, safe to expose

### SQL Injection Prevention:
- Doctrine ORM uses parameterized queries
- All user-provided data (user_id from JWT) properly escaped
- No raw SQL with string concatenation

## 7. Error Handling

### 401 Unauthorized
- **Cause**: Missing, invalid, or expired JWT token
- **Handling**: Automatically handled by Symfony Security before reaching controller
- **Response**: `{"error": "Unauthorized"}` or similar (Symfony default)

### 404 Not Found
- **Cause**: Authenticated user doesn't have an associated shop
- **Handling**: Service returns null, controller returns 404
- **Response**: `{"error": "Shop not found for user"}`
- **Note**: This is an edge case that shouldn't occur in normal flow

### 500 Internal Server Error
- **Cause**: Database connection failures, unexpected exceptions
- **Handling**: Catch all `\Throwable` in controller, log error with context
- **Response**: `{"error": "An unexpected error occurred"}`
- **Logging**: Include user_id, exception message, stack trace

### Empty Pages Array
- **Not an error**: If shop has no pages, return empty array
- **Response**: `{"pages": []}`
- **HTTP Status**: 200 OK

## 8. Performance Considerations

### Query Optimization:
- Use plain SQL with array result instead of entity hydration (similar to DemoPageRepository)
- Single query to fetch all pages for shop (no N+1 problem)
- Pages ordered by type at database level
- Index on `shop_id` column in pages table (should already exist from foreign key)

### Caching Strategy:
- No caching implemented in MVP

### Data Volume:
- Maximum 4 pages per shop (home, catalog, product, contact)
- Layout JSON size varies but typically under 50KB per page
- Total response size: typically 50-200KB
- No pagination needed due to fixed maximum of 4 pages

## 9. Implementation Steps

### Step 1: Create PageReadModel
- Create `src/ReadModel/PageReadModel.php`
- Implement as `final readonly class`
- Implement `JsonSerializable` interface
- Include properties: type, layout, created_at, updated_at
- Add `jsonSerialize()` method to return array structure matching API specification
- Use ISO 8601 format for timestamps

### Step 2: Add Repository Method
- Add `findAllByShopId()` method to `PageRepository` (or create new repository if needed)
- Use plain SQL with connection for performance (similar to DemoPageRepository pattern)
- Query: `SELECT type, layout, created_at, updated_at FROM pages WHERE shop_id = :shopId ORDER BY type`
- Decode JSON layout column
- Format timestamps to ISO 8601
- Return array of PageReadModel instances
- Return empty array if no pages found

### Step 3: Create PageService
- Create `src/Service/PageService.php`
- Inject ShopRepository and PageRepository dependencies
- Implement `getPagesByUserId(string $userId): ?array` method
- Query ShopRepository to find shop by user_id
- If shop not found, return null
- Query PageRepository to find all pages by shop_id
- Return array of PageReadModel instances

### Step 4: Create PageController
- Create `src/Controller/PageController.php`
- Extend `AbstractController`
- Inject PageService and LoggerInterface dependencies
- Secure with `#[IsGranted('ROLE_USER')]` attribute
- Create route: `#[Route('/api/pages', name: 'api_pages_list', methods: ['GET'])]`
- Inject authenticated User via method parameter type hint
- Call service with user ID
- Handle null response (404 for missing shop)
- Wrap PageReadModel array in response structure: `{"pages": [...]}`
- Return JsonResponse with HTTP 200
- Implement try-catch for error handling
- Log errors with context (user_id, exception details)
- Return 500 error response for unexpected exceptions

### Step 5: Configure Security
- Verify security configuration in `config/packages/security.yaml`
- Ensure `/api/pages` route requires authentication
- Verify JWT token configuration in LexikJWTAuthenticationBundle
- Test token validation and user injection

### Step 6: Write Unit Tests
- Test PageReadModel serialization
- Test PageRepository method with mock data
- Test PageService with mocked repositories
- Test edge cases: no shop, empty pages, single page
- Use PHPUnit with mocks for dependencies

### Step 7: Write Integration Tests
- Test full request flow with authentication
- Test 200 response with valid token and pages
- Test 401 response with missing/invalid token
- Test 404 response when user has no shop
- Test response structure matches API specification
- Verify timestamps are ISO 8601 format
- Verify pages ordered by type
