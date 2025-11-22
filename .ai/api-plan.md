# REST API Plan - E-commerce Theme Builder

## 1. Resources

| Resource | Database Table(s) | Description |
|----------|------------------|-------------|
| **Auth** | users | User authentication and registration |
| **User** | users | Current authenticated user profile |
| **Shop** | shops | User's shop (singleton, 1:1 with user) |
| **Theme** | shops.theme_settings | Global theme settings (colors, fonts) |
| **Pages** | pages | Shop pages (home, catalog, product, contact) |
| **Images** | N/A (Cloudflare R2) | Image upload service |
| **Public Shops** | shops, pages | Read-only public access to shop data |
| **Demo Categories** | demo_categories | Static product categories |
| **Demo Products** | demo_products | Static product catalog |

## 2. Endpoints

### 2.1. Authentication

#### POST /api/auth/register

Creates a new user account, initializes shop with 4 default pages, and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "shop_name": "My Shop"
}
```

**Response (201 Created):**
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

**Error Responses:**
- **400 Bad Request** - Invalid email format or weak password
  ```json
  {
    "error": "validation_error",
    "message": "Invalid email format",
    "field": "email"
  }
  ```
- **409 Conflict** - Email already registered
  ```json
  {
    "error": "email_exists",
    "message": "An account with this email already exists"
  }
  ```
- **409 Conflict** - Shop already registered
  ```json
  {
    "error": "shop_exists",
    "message": "A shop with this name already exists"
  }
  ```

**Business Logic:**
1. Validate email format (RFC 5322)
2. Check email uniqueness
3. Check shop uniqueness
4. Hash password using Symfony PasswordHasher (bcrypt/argon2)
5. Create user record
6. Create shop record with provided name and default theme_settings (defined in code)
7. Create 4 pages (home, catalog, product, contact) with default layouts
8. Return user and shop data

---

#### POST /api/auth/login

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- **401 Unauthorized** - Invalid credentials
  ```json
  {
    "error": "invalid_credentials",
    "message": "Invalid email or password"
  }
  ```

**Business Logic:**
1. Validate email format
2. Lookup user by email
3. Verify password hash using Symfony PasswordHasher
4. Generate JWT token (1 hour expiration recommended)
5. Return token

**Security:**
- Generic error message to prevent user enumeration

---

### 2.2. Shop Management

#### GET /api/shop

Returns the authenticated user's shop data.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "My Awesome Store",
  "theme_settings": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "background": "#FFFFFF",
      "text": "#1F2937"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    }
  },
  "created_at": "2025-10-15T10:30:00Z",
  "updated_at": "2025-10-15T14:22:00Z"
}
```

**Error Responses:**
- **401 Unauthorized** - Missing or invalid token
- **404 Not Found** - Shop not found (should never happen if registration worked)

**Business Logic:**
1. Extract user_id from JWT token
2. Query shop by user_id
3. Return shop data including theme_settings JSONB

---

#### PUT /api/shop

Updates the shop name.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "My New Store Name"
}
```

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "My New Store Name",
  "theme_settings": {
    "colors": {
      "primary": "#3B82F6"
    }
  },
  "updated_at": "2025-10-15T15:00:00Z"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid input
  ```json
  {
    "error": "validation_error",
    "message": "Shop name must be between 1 and 60 characters",
    "field": "name"
  }
  ```
- **401 Unauthorized** - Missing or invalid token

**Validation:**
- name: Required, max 60 characters (per database schema)

**Business Logic:**
1. Extract user_id from JWT token
2. Find shop by user_id
3. Validate shop ownership (should always match)
4. Update shop name
5. Update updated_at timestamp (Doctrine lifecycle callback)
6. Return updated shop

---

### 2.3. Theme Settings

Theme settings are part of the shop but have dedicated endpoints to support the PRD requirement for independent save operations.

#### GET /api/theme

Returns current theme settings for authenticated user's shop.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
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

**Error Responses:**
- **401 Unauthorized** - Missing or invalid token

---

#### PUT /api/theme

Updates theme settings independently of page changes.

**Authentication:** Required (Bearer token)

**Request Body:**
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
    "heading": "Playfair Display",
    "body": "Inter"
  }
}
```

**Response (200 OK):**
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
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "updated_at": "2025-10-15T15:30:00Z"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid theme structure
  ```json
  {
    "error": "validation_error",
    "message": "Invalid color format. Expected hex color code.",
    "field": "colors.primary"
  }
  ```
- **401 Unauthorized** - Missing or invalid token

**Validation:**
- colors.* - Must be valid hex color codes (#RRGGBB)
- fonts.* - Must be valid font family names (string, max 100 chars)
- Additional fields allowed (flexibility for future extensions)

**Business Logic:**
1. Extract user_id from JWT token
2. Find shop by user_id
3. Validate theme_settings structure
4. Update shop.theme_settings JSONB field
5. Update shop.updated_at timestamp
6. Return updated theme_settings

---

#### POST /api/theme/reset

Resets theme settings to system defaults.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
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
  },
  "updated_at": "2025-10-15T16:00:00Z"
}
```

**Error Responses:**
- **401 Unauthorized** - Missing or invalid token

**Business Logic:**
1. Extract user_id from JWT token
2. Find shop by user_id
3. Load default theme settings from application configuration
4. Update shop.theme_settings with defaults
5. Update shop.updated_at timestamp
6. Return reset theme_settings

---

### 2.4. Pages

Pages use the page `type` as the resource identifier since the UNIQUE constraint on (shop_id, type) guarantees one page of each type per shop.

#### GET /api/pages

Returns all pages for the authenticated user's shop.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
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
- **401 Unauthorized** - Missing or invalid token

**Business Logic:**
1. Extract user_id from JWT token
2. Find shop by user_id
3. Query all pages for shop_id
4. Return array of pages ordered by type

---

#### GET /api/pages/{type}

Returns a specific page by type for the authenticated user's shop.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `type` - One of: `home`, `catalog`, `product`, `contact`

**Response (200 OK):**
```json
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
    }
  ],
  "created_at": "2025-10-15T10:30:00Z",
  "updated_at": "2025-10-15T14:30:00Z"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid page type
  ```json
  {
    "error": "invalid_page_type",
    "message": "Page type must be one of: home, catalog, product, contact"
  }
  ```
- **401 Unauthorized** - Missing or invalid token
- **404 Not Found** - Page not found
  ```json
  {
    "error": "page_not_found",
    "message": "Page of type 'home' not found"
  }
  ```

---

#### PUT /api/pages/{type}

Updates the layout for a specific page.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `type` - One of: `home`, `catalog`, `product`, `contact`

**Request Body:**
```json
{
  "layout": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "type": "hero",
      "variant": "with-image",
      "settings": {
        "heading": "New Heading",
        "subheading": "New Subheading",
        "ctaText": "Shop Now",
        "ctaLink": "/catalog",
        "imageUrl": "https://r2.example.com/new-hero.jpg"
      }
    },
    {
      "id": "d2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
      "type": "text-section",
      "variant": "single-column",
      "settings": {
        "content": "About our store..."
      }
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "type": "home",
  "layout": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "type": "hero",
      "variant": "with-image",
      "settings": {
        "heading": "New Heading",
        "subheading": "New Subheading",
        "ctaText": "Shop Now",
        "ctaLink": "/catalog",
        "imageUrl": "https://r2.example.com/new-hero.jpg"
      }
    },
    {
      "id": "d2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
      "type": "text-section",
      "variant": "single-column",
      "settings": {
        "content": "About our store..."
      }
    }
  ],
  "updated_at": "2025-10-15T16:45:00Z"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid layout structure
  ```json
  {
    "error": "validation_error",
    "message": "Each component must have id, type, variant, and settings fields",
    "field": "layout[0]"
  }
  ```
- **401 Unauthorized** - Missing or invalid token
- **404 Not Found** - Page not found

**Validation:**
- layout must be a JSON array
- Each component must have:
  - `id` (string, UUID format)
  - `type` (string, component type name)
  - `variant` (string, variant name)
  - `settings` (object, component-specific settings)
- Empty array is valid (allows clearing all components)

**Business Logic:**
1. Extract user_id from JWT token
2. Find shop by user_id
3. Find page by shop_id and type
4. Validate ownership
5. Validate layout structure
6. Update page.layout JSONB field
7. Update page.updated_at timestamp
8. Return updated page

---

#### POST /api/pages/{type}/reset

Resets a page to its default layout.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `type` - One of: `home`, `catalog`, `product`, `contact`

**Response (200 OK):**
```json
{
  "type": "home",
  "layout": [
    {
      "id": "default-hero-component",
      "type": "hero",
      "variant": "with-image",
      "settings": {
        "heading": "Welcome to Your Store",
        "subheading": "Customize this page to match your brand",
        "ctaText": "Get Started",
        "ctaLink": "/catalog"
      }
    }
  ],
  "updated_at": "2025-10-15T17:00:00Z"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid page type
- **401 Unauthorized** - Missing or invalid token
- **404 Not Found** - Page not found

**Business Logic:**
1. Extract user_id from JWT token
2. Find shop by user_id
3. Find page by shop_id and type
4. Validate ownership
5. Load default layout for page type from application configuration/service
6. Update page.layout with default (defined in the code)
7. Update page.updated_at timestamp
8. Return updated page

---

### 2.5. Images

#### POST /api/images

Uploads an image to Cloudflare R2 and returns the public URL.

**Authentication:** Required (Bearer token)

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`

**Request Example (curl):**
```bash
curl -X POST https://api.example.com/api/images \
  -H "Authorization: Bearer {token}" \
  -F "image=@/path/to/image.jpg"
```

**Response (201 Created):**
```json
{
  "url": "https://r2.cloudflare.com/bucket-name/550e8400/c1a2b3c4-d5e6-f7a8-b9c0.jpg",
  "filename": "c1a2b3c4-d5e6-f7a8-b9c0.jpg",
  "size": 245678,
  "mime_type": "image/jpeg"
}
```

**Error Responses:**
- **400 Bad Request** - Invalid file
  ```json
  {
    "error": "invalid_file_type",
    "message": "File must be an image (JPEG, PNG, WebP, or GIF)"
  }
  ```
- **400 Bad Request** - File too large
  ```json
  {
    "error": "file_too_large",
    "message": "File size exceeds maximum limit of 10MB"
  }
  ```
- **401 Unauthorized** - Missing or invalid token
- **429 Too Many Requests** - Rate limit exceeded
  ```json
  {
    "error": "rate_limit_exceeded",
    "message": "Too many upload requests. Please try again later."
  }
  ```
- **500 Internal Server Error** - Upload failed
  ```json
  {
    "error": "upload_failed",
    "message": "Failed to upload image. Please try again."
  }
  ```

**Validation:**
- File type: Must be image/jpeg, image/png, image/webp, or image/gif
- File size: Maximum 10MB
- MIME type validation (not just extension checking)

**Business Logic:**
1. Extract user_id from JWT token
2. Validate user is authenticated
3. Validate file exists in request
4. Validate MIME type (actual content, not just extension)
5. Validate file size (max 10MB)
6. Generate unique filename: `{shop_id}/{uuid}.{extension}`
7. Upload to Cloudflare R2 using AWS SDK for PHP
8. Return public URL

**Security:**
- Sanitize filename to prevent path traversal
- Store files in shop-specific folder ({shop_id}/) for isolation
- Use UUID for filenames to prevent collisions and guessing

---

### 2.6. Public Shop Access (for Demo Store)

These endpoints are public (no authentication required) and used by the Demo Shop application to render the saved shop state.

#### GET /api/public/shops/{shopId}

Returns basic shop information and theme settings.

**Authentication:** None required

**Path Parameters:**
- `shopId` - Shop UUID

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "My Awesome Store",
  "theme_settings": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "background": "#FFFFFF",
      "text": "#1F2937"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  }
}
```

**Error Responses:**
- **404 Not Found** - Shop not found
  ```json
  {
    "error": "shop_not_found",
    "message": "Shop not found"
  }
  ```

---

#### GET /api/public/shops/{shopId}/pages

Returns all pages for a shop.

**Authentication:** None required

**Path Parameters:**
- `shopId` - Shop UUID

**Response (200 OK):**
```json
{
  "pages": [
    {
      "type": "home",
      "layout": [...]
    },
    {
      "type": "catalog",
      "layout": [...]
    },
    {
      "type": "product",
      "layout": [...]
    },
    {
      "type": "contact",
      "layout": [...]
    }
  ]
}
```

**Error Responses:**
- **404 Not Found** - Shop not found

---

#### GET /api/public/shops/{shopId}/pages/{type}

Returns a specific page for a shop.

**Authentication:** None required

**Path Parameters:**
- `shopId` - Shop UUID
- `type` - One of: `home`, `catalog`, `product`, `contact`

**Response (200 OK):**
```json
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
    }
  ]
}
```

**Error Responses:**
- **400 Bad Request** - Invalid page type
- **404 Not Found** - Shop or page not found

---

### 2.7. Demo Product Catalog

These endpoints provide access to the static product catalog shared across all shops.

#### GET /api/demo/categories

Returns all product categories.

**Authentication:** None required

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics"
    },
    {
      "id": 2,
      "name": "Clothing"
    },
    {
      "id": 3,
      "name": "Books"
    },
    {
      "id": 4,
      "name": "Home & Garden"
    },
    {
      "id": 5,
      "name": "Sports & Outdoors"
    },
    {
      "id": 6,
      "name": "Beauty & Personal Care"
    }
  ]
}
```

**Business Logic:**
- Query all demo_categories
- Order alphabetically by name
- No pagination needed (small, static dataset)

**Use Cases:**
- **CategoryPills component:** Fetches all categories to display as navigation pills on the Catalog page
- **Category filtering:** Provides category list for filtering products by category ID

---

#### GET /api/demo/products

Returns demo products with optional filtering by category.

**Authentication:** None required

**Query Parameters:**
- `category_id` (optional) - Filter by category ID

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "Electronics",
      "name": "Wireless Headphones",
      "description": "Premium noise-cancelling wireless headphones with 30-hour battery life.",
      "price": 19999,
      "sale_price": 14999,
      "image_thumbnail": "https://r2.example.com/products/headphones-thumb.jpg",
      "image_medium": "https://r2.example.com/products/headphones-medium.jpg",
      "image_large": "https://r2.example.com/products/headphones-large.jpg"
    },
    {
      "id": 2,
      "category_id": 1,
      "category_name": "Electronics",
      "name": "Smart Watch",
      "description": "Feature-rich smartwatch with health tracking and notifications.",
      "price": 29999,
      "sale_price": null,
      "image_thumbnail": "https://r2.example.com/products/watch-thumb.jpg",
      "image_medium": "https://r2.example.com/products/watch-medium.jpg",
      "image_large": "https://r2.example.com/products/watch-large.jpg"
    }
  ]
}
```

**Business Logic:**
1. Parse query parameters (category_id)
2. Validate parameters (category exists)
3. Build query with optional category filter
4. Order alphabetically by name
5. Include category name via JOIN
6. Return products

**Notes:**
- Prices are in cents (e.g., 19999 = $199.99)
- `sale_price` is `null` if product is not on sale
- When `category_id` is provided, only products from that category are returned
- Used by Catalog page with CategoryPills component for category-based filtering (route: `/catalog/:categoryId`)

---

#### GET /api/demo/products/{id}

Returns details for a single demo product.

**Authentication:** None required

**Path Parameters:**
- `id` - Product ID (integer)

**Response (200 OK):**
```json
{
  "id": 1,
  "category_id": 1,
  "category_name": "Electronics",
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality. Features include Bluetooth 5.0, active noise cancellation, and comfortable over-ear design.",
  "price": 19999,
  "sale_price": 14999,
  "image_thumbnail": "https://r2.example.com/products/headphones-thumb.jpg",
  "image_medium": "https://r2.example.com/products/headphones-medium.jpg",
  "image_large": "https://r2.example.com/products/headphones-large.jpg"
}
```

**Error Responses:**
- **404 Not Found** - Product not found
  ```json
  {
    "error": "product_not_found",
    "message": "Product not found"
  }
  ```

---

#### GET /api/demo/products/batch

Fetches multiple products by their IDs in a single request. Used by Featured Products component to display user-selected products.

**Authentication:** None required

**Query Parameters:**
- `ids` (required) - Comma-separated list of product IDs (e.g., `1,5,12,8`)

**Example Request:**
```
GET /api/demo/products/batch?ids=1,5,12
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "Electronics",
      "name": "Wireless Headphones",
      "description": "Premium noise-cancelling wireless headphones with 30-hour battery life.",
      "price": 19999,
      "sale_price": 14999,
      "image_thumbnail": "https://r2.example.com/products/headphones-thumb.jpg",
      "image_medium": "https://r2.example.com/products/headphones-medium.jpg",
      "image_large": "https://r2.example.com/products/headphones-large.jpg"
    },
    {
      "id": 5,
      "category_id": 2,
      "category_name": "Clothing",
      "name": "Cotton T-Shirt",
      "description": "Comfortable cotton t-shirt available in multiple colors.",
      "price": 2999,
      "sale_price": null,
      "image_thumbnail": "https://r2.example.com/products/tshirt-thumb.jpg",
      "image_medium": "https://r2.example.com/products/tshirt-medium.jpg",
      "image_large": "https://r2.example.com/products/tshirt-large.jpg"
    },
    {
      "id": 12,
      "category_id": 3,
      "category_name": "Home & Garden",
      "name": "LED Desk Lamp",
      "description": "Adjustable LED desk lamp with touch controls.",
      "price": 4999,
      "sale_price": 3999,
      "image_thumbnail": "https://r2.example.com/products/lamp-thumb.jpg",
      "image_medium": "https://r2.example.com/products/lamp-medium.jpg",
      "image_large": "https://r2.example.com/products/lamp-large.jpg"
    }
  ]
}
```

**Error Responses:**
- **400 Bad Request** - Missing or invalid `ids` parameter
  ```json
  {
    "error": "invalid_parameter",
    "message": "Query parameter 'ids' is required and must contain comma-separated integers"
  }
  ```
- **400 Bad Request** - Too many IDs requested
  ```json
  {
    "error": "too_many_ids",
    "message": "Maximum 50 product IDs allowed per request"
  }
  ```

**Business Logic:**
1. Parse `ids` query parameter (comma-separated string)
2. Convert to array of integers, validate all are valid integers
3. Deduplicate IDs if duplicates exist
4. Validate array length ≤ 50 (prevent abuse)
5. Query: `SELECT p.*, c.name as category_name FROM demo_products p JOIN demo_categories c ON p.category_id = c.id WHERE p.id IN (ids)`
6. Return products in same order as requested IDs (use SQL ORDER BY FIELD or application-level sorting)
7. If some IDs don't exist, return only found products (no error, partial success)
8. If no products found, return empty array: `{"products": []}`

**Validation:**
- Maximum 50 IDs per request
- IDs must be valid integers
- Duplicate IDs are automatically deduplicated

**Use Cases:**
- **Featured Products component:** User selects 3-12 products in Theme Builder, settings stored as `{"productIds": [1, 5, 12]}`, Demo Shop fetches via this endpoint
- **Product recommendations:** Display related or handpicked products

**Notes:**
- Prices are in cents (e.g., 19999 = $199.99)
- `sale_price` is `null` if product is not on sale
- Products returned may be fewer than requested if some IDs don't exist (graceful degradation)

---


## 3. Authentication and Authorization

### 3.1. Authentication Mechanism

**JWT (JSON Web Token) Authentication:**
- Implemented using Symfony's LexikJWTAuthenticationBundle
- Tokens generated on successful login/registration
- Token structure:
  ```json
  {
    "iat": 1697364000,
    "exp": 1697367600,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
  ```
- Token expiration: 1 hour (3600 seconds) recommended
- Refresh tokens: Not in MVP scope (users must re-login after expiration)

**Token Usage:**
- All authenticated endpoints require `Authorization` header
- Format: `Authorization: Bearer {token}`
- Example:
  ```
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

**Token Validation:**
1. Extract token from Authorization header
2. Verify token signature using public key
3. Check token expiration
4. Extract user_id from token claims
5. Validate user exists in database

### 3.2. Authorization and Data Isolation

**User Data Isolation:**
- Every authenticated endpoint must enforce user data isolation
- Implementation approach:
  1. Extract `user_id` from JWT token
  2. Find user's shop via `shops.user_id`
  3. Filter all queries by `shop_id`
  4. Never expose data from other users' shops

**Ownership Validation:**
- For all write operations (PUT, POST, DELETE), validate:
  1. User is authenticated
  2. Target resource belongs to user's shop
  3. Return 403 Forbidden if ownership check fails

**Authorization Patterns:**

**Pattern 1: Shop Operations**
```php
// Extract user_id from JWT
$userId = $this->getUser()->getId();

// Find user's shop
$shop = $shopRepository->findOneBy(['userId' => $userId]);

// All operations scoped to this shop
```

**Pattern 2: Page Operations**
```php
// Extract user_id from JWT
$userId = $this->getUser()->getId();

// Find user's shop
$shop = $shopRepository->findOneBy(['userId' => $userId]);

// Find page for this shop
$page = $pageRepository->findOneBy([
    'shopId' => $shop->getId(),
    'type' => $pageType
]);
```

**Pattern 3: Public Endpoints**
- No authentication required
- Accessed by `shopId` parameter (public identifier)
- Read-only operations only
- No filtering by user

### 3.3. Security Headers

**Required Response Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**CORS Configuration:**
- Allow all origins
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization
- Allow credentials: true
- Max age: 86400 seconds

### 3.4. Error Response Standards

**All endpoints follow consistent error response format:**

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "field": "field_name" // Optional, for validation errors
}
```

**Common HTTP Status Codes:**
- 200 OK - Successful GET/PUT request
- 201 Created - Successful POST request creating a resource
- 400 Bad Request - Invalid input/validation error
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - Authenticated but not authorized
- 404 Not Found - Resource not found
- 409 Conflict - Resource conflict (e.g., duplicate email)
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server-side error

---

## 4. Validation and Business Logic

### 4.1. Validation Rules by Resource

#### User (Registration/Login)

**Email:**
- Required: Yes
- Format: Valid email (RFC 5322)
- Max length: 255 characters
- Unique: Yes (checked on registration)
- Example validation: `filter_var($email, FILTER_VALIDATE_EMAIL)`

**Password:**
- Required: Yes
- Min length: 8 characters
- Recommended: Uppercase + lowercase + number + special character
- Max length: 72 characters (bcrypt limitation)
- Stored: Hashed using Symfony PasswordHasher (bcrypt or argon2)
- Never returned in API responses

#### Shop

**Name:**
- Required: Yes
- Min length: 1 character
- Max length: 60 characters
- Type: String
- Validation: Trim whitespace, reject empty after trim

**Theme Settings (JSONB):**
- Type: JSON object
- Structure (optional fields):
  ```json
  {
    "colors": {
      "primary": "#RRGGBB",
      "secondary": "#RRGGBB",
      "accent": "#RRGGBB",
      "background": "#RRGGBB",
      "surface": "#RRGGBB",
      "text": "#RRGGBB",
      "textLight": "#RRGGBB"
    },
    "fonts": {
      "heading": "Font Family Name",
      "body": "Font Family Name"
    }
  }
  ```
- Validation rules:
  - colors.* must be valid hex color codes (regex: `/^#[0-9A-Fa-f]{6}$/`)
  - fonts.* must be strings, max 100 characters
  - Additional fields allowed for future extensibility
  - Empty object `{}` is valid (uses frontend defaults)

#### Pages

**Type (Enum):**
- Required: Yes
- Valid values: `home`, `catalog`, `product`, `contact`
- Case-sensitive
- Enforced by database enum type

**Layout (JSONB):**
- Type: JSON array
- Each component structure:
  ```json
  {
    "id": "uuid-string",        // Required, UUID format
    "type": "component-type",   // Required, string
    "variant": "variant-name",  // Required, string
    "settings": {               // Required, object
      // Component-specific fields
    }
  }
  ```
- Validation rules:
  - Must be valid JSON array
  - Each element must have: `id`, `type`, `variant`, `settings`
  - `id` must be valid UUID format (regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`)
  - `type` must be string (component type name validation in frontend)
  - `variant` must be string
  - `settings` must be object (structure validation in frontend)
  - Empty array `[]` is valid (allows clearing all components)
  - Max size: Consider limiting to prevent abuse (e.g., max 50 components per page)

#### Images

**File Type:**
- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
- Validation: Check actual MIME type using `finfo_file()`, not just extension

**File Size:**
- Maximum: 10 MB (10,485,760 bytes)
- Minimum: 1 KB (prevent empty file uploads)

**Filename:**
- Generated by server: `{shop_id}/{uuid}.{extension}`
- Original filename sanitized but not used in storage path
- Extension extracted from MIME type, not original filename

### 4.2. Business Logic Implementation

#### BL-1: User Registration Flow

**Endpoint:** POST /api/auth/register

**Steps:**
1. Validate email format and uniqueness
2. Validate password strength
3. Begin database transaction
4. Hash password using Symfony PasswordHasher
5. Create user record in `users` table
6. Create shop record with:
   - `user_id` = new user's ID
   - `name` = shop name provided with request
   - `theme_settings` = default settings stored in code
7. Create 4 page records:
   - home: Default header + Default hero + featured products layout + Dafault footer
   - catalog: Default header + Default category grid + product list layout + Default footer
   - product: Default header + Default product detail layout + Default footer
   - contact: Default header + Default contact form layout + Default footer
8. Commit transaction
9. Generate JWT token with user_id claim
10. Return token + user + shop data

**Error Handling:**
- If any step fails, rollback transaction
- Return appropriate error code (400, 409, 500)

**Default Layouts:**
Defined in application configuration or service class:
```php
class DefaultLayoutService {
    public function getDefaultLayout(string $pageType): array {
        return match($pageType) {
            'home' => $this->getHomeLayout(),
            'catalog' => $this->getCatalogLayout(),
            'product' => $this->getProductLayout(),
            'contact' => $this->getContactLayout(),
        };
    }
}
```

#### BL-2: Page Update with Validation

**Endpoint:** PUT /api/pages/{type}

**Steps:**
1. Extract user_id from JWT token
2. Find user's shop by user_id
3. Find page by shop_id and type
4. Validate page exists (404 if not)
5. Validate ownership (shop belongs to user)
6. Validate layout structure:
   - Is valid JSON array
   - Each component has required fields
   - IDs are valid UUIDs
   - Component count ≤ 50
7. Update page.layout JSONB field
8. Doctrine automatically updates page.updated_at via lifecycle callback
9. Return updated page data

**Validation Details:**
```php
foreach ($layout as $index => $component) {
    if (!isset($component['id'], $component['type'],
               $component['variant'], $component['settings'])) {
        throw new ValidationException(
            "Component at index $index missing required fields"
        );
    }

    if (!Uuid::isValid($component['id'])) {
        throw new ValidationException(
            "Component at index $index has invalid UUID"
        );
    }
}
```

#### BL-3: Theme Settings Update

**Endpoint:** PUT /api/theme

**Steps:**
1. Extract user_id from JWT token
2. Find user's shop by user_id
3. Validate theme_settings structure:
   - Is valid JSON object
   - Color values match hex format (#RRGGBB)
   - Font names are strings ≤ 100 chars
4. Update shop.theme_settings JSONB field
5. Doctrine updates shop.updated_at automatically
6. Return updated theme_settings + updated_at timestamp

**Color Validation:**
```php
if (isset($themeSettings['colors'])) {
    foreach ($themeSettings['colors'] as $key => $color) {
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $color)) {
            throw new ValidationException(
                "Invalid color format for colors.$key. Expected hex color (#RRGGBB)."
            );
        }
    }
}
```

#### BL-4: Image Upload to R2

**Endpoint:** POST /api/images

**Steps:**
1. Extract user_id from JWT token
2. Validate file exists in request
3. Validate MIME type using `finfo_file()`
4. Validate file size (1KB - 10MB)
5. Generate unique filename: `{shop_id}/{uuid}.{ext}`
6. Upload to Cloudflare R2 using AWS SDK:
   ```php
   $s3Client = new S3Client([
       'version' => 'latest',
       'region' => 'auto',
       'endpoint' => getenv('R2_ENDPOINT'),
       'credentials' => [
           'key' => getenv('R2_ACCESS_KEY'),
           'secret' => getenv('R2_SECRET_KEY'),
       ],
   ]);

   $result = $s3Client->putObject([
       'Bucket' => getenv('R2_BUCKET'),
       'Key' => $filename,
       'Body' => fopen($tmpFilePath, 'rb'),
       'ContentType' => $mimeType,
   ]);
   ```
7. Get public URL from result
8. Return URL + metadata

**Error Handling:**
- If upload fails, return 500 with generic error message
- Log detailed error for debugging
- Clean up temporary file

#### BL-5: Public Shop Access (Demo Store)

**Endpoint:** GET /api/public/shops/{shopId}/pages/{type}

**Steps:**
1. Validate shopId is valid UUID format
2. Page type is optional, if not provided defaults to "home"
3. Validate page type is valid enum value
4. Query page by shop_id and type
5. Return 404 if shop or page not found
6. Return page data (type, layout only)

**No Authentication Required:**
- These endpoints are intentionally public
- Demo Shop application needs read-only access
- No sensitive data exposed (email, password hashes not returned)
- Shop owner's email not exposed

#### BL-6: Demo Products

**Endpoint:** GET /api/demo/products

**Steps:**
1. Parse query parameters:
   - category_id (optional, integer)
2. Validate parameters
3. Build SQL query with optional category filter
4. Order by name ASC
5. Execute query and fetch products
6. Calculate total count and total_pages
7. Return products + pagination metadata

**SQL Example:**
```sql
SELECT p.*, c.name as category_name
FROM demo_products p
JOIN demo_categories c ON p.category_id = c.id
WHERE ($category_id IS NULL OR p.category_id = $category_id)
ORDER BY p.name ASC;
```

#### BL-7: Batch Product Fetch

**Endpoint:** GET /api/demo/products/batch

**Steps:**
1. Parse query parameters:
   - ids (required, comma-separated string)
2. Split ids by comma: `explode(',', $ids)`
3. Convert all values to integers: `array_map('intval', $idsArray)`
4. Validate all values are positive integers
5. Deduplicate IDs: `array_unique($idsArray)`
6. Validate count ≤ 50
7. Build SQL query with IN clause
8. Execute query and fetch products
9. Sort products in same order as requested IDs (application-level)
10. Return products array

**SQL Example:**
```sql
SELECT p.*, c.name as category_name
FROM demo_products p
JOIN demo_categories c ON p.category_id = c.id
WHERE p.id IN (1, 5, 12, 8)
ORDER BY FIELD(p.id, 1, 5, 12, 8);  -- MySQL
-- OR use application-level sorting for PostgreSQL
```

**PHP Sorting Example (PostgreSQL):**
```php
// After fetching products from database
$productsById = [];
foreach ($products as $product) {
    $productsById[$product['id']] = $product;
}

// Return in requested order
$orderedProducts = [];
foreach ($requestedIds as $id) {
    if (isset($productsById[$id])) {
        $orderedProducts[] = $productsById[$id];
    }
}

return ['products' => $orderedProducts];
```

### 4.3. Database Constraints Enforcement

**Application-Level vs. Database-Level:**

| Constraint | Enforcement Level | Notes |
|------------|------------------|-------|
| Email uniqueness | Database (UNIQUE index) | Prevents race conditions |
| One shop per user | Database (UNIQUE on user_id) | Enforced by schema |
| One page per type per shop | Database (UNIQUE on shop_id, type) | Enforced by schema |
| Page type enum | Database (page_type_enum) | Only 4 valid values |
| Foreign key integrity | Database (FK constraints) | CASCADE deletes |
| Email format | Application (validation) | Checked before insert |
| Password strength | Application (validation) | Checked before hashing |
| Layout structure | Application (validation) | JSONB not validated by DB |
| Theme settings structure | Application (validation) | JSONB not validated by DB |
| Image file type | Application (validation) | Checked before upload |

**Cascade Delete Behavior:**
- Delete user → Cascade deletes shop (via FK constraint)
- Delete shop → Cascade deletes all pages (via FK constraint)
- Result: Deleting a user removes all their data automatically

**Timestamp Management:**
- `created_at`: Set automatically by database DEFAULT now()
- `updated_at`: Updated by Doctrine lifecycle callbacks on entity change

### 4.4. Error Handling and Logging

**Error Categories:**

1. **Validation Errors (400)**
   - Log level: INFO
   - Return detailed field-level errors to client
   - Safe to expose to end user

2. **Authentication Errors (401)**
   - Log level: WARNING
   - Generic error messages to prevent enumeration
   - Log failed attempts for security monitoring

3. **Authorization Errors (403)**
   - Log level: WARNING
   - Generic error message: "Access denied"
   - Log attempt with user_id and resource for audit

4. **Not Found Errors (404)**
   - Log level: INFO
   - Safe to expose to client

5. **Server Errors (500)**
   - Log level: ERROR
   - Generic message to client: "Internal server error"
   - Log full exception with stack trace
   - Never expose internal details to client

**Logging Strategy:**
```php
// Success - no log needed or INFO level for important operations
$logger->info('User registered', ['user_id' => $userId]);

// Validation errors
$logger->info('Validation failed', ['field' => 'email', 'error' => 'Invalid format']);

// Authorization failures
$logger->warning('Unauthorized access attempt', [
    'user_id' => $userId,
    'resource' => 'shop',
    'resource_id' => $shopId,
]);

// Server errors
$logger->error('Image upload failed', [
    'exception' => $e->getMessage(),
    'trace' => $e->getTraceAsString(),
]);
```

---

## 5. Additional Considerations

### 5.1. API Versioning

**Strategy for MVP:**
- No version prefix in URLs (e.g., /api/v1/)
- Assume breaking changes acceptable during MVP
- If versioning needed post-MVP, use URL versioning: `/api/v2/...`

### 5.2. Response Time Targets

**Target Response Times:**
- Authentication: < 500ms
- Simple GET requests: < 200ms
- Complex GET with pagination: < 500ms
- PUT/POST operations: < 500ms
- Image upload: < 3s (depends on file size and R2 latency)

**Optimization Strategies:**
- Database connection pooling
- Efficient JSONB queries (avoid parsing in application when possible)
- R2 uploads: Use multipart for files > 5MB

### 5.3. Testing Strategy

**Unit Tests:**
- All validation logic
- Business logic services (e.g., DefaultLayoutService)
- Image upload logic (mocked R2 client)

**Integration Tests:**
- All API endpoints with real database (test DB)
- JWT token generation and validation
- CRUD operations on all resources

**E2E Tests (Playwright):**
- Full user registration → login → shop creation flow
- Page editing and saving flow
- Demo shop rendering with saved data

**Security Tests:**
- Attempt to access other users' data
- Invalid JWT tokens
- SQL injection attempts in query parameters
- XSS attempts in JSONB fields (should be sanitized by frontend)

---

## 6. Summary

This REST API plan provides a comprehensive, secure, and performant backend for the E-commerce Theme Builder MVP. Key highlights:

- **19 endpoints** covering authentication, shop management, page editing, theme customization, image uploads, and public demo access
- **JWT-based authentication** with strict user data isolation
- **Separate save mechanisms** for pages and theme settings (per PRD requirement)
- **Public read-only endpoints** for Demo Shop application
- **Comprehensive validation** at both application and database levels
- **Cloudflare R2 integration** for image storage
- **RESTful design principles** with consistent error handling

The API is designed to support the PRD requirements fully while maintaining security, performance, and maintainability standards for the Symfony 7.3 backend with PostgreSQL database.
