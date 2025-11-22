### Backend Architecture (Symfony)

The backend is a Symfony 7.3 installation with Doctrine ORM:

- **Framework**: Symfony 7.3 with PHP 8.3 (via php:8.3-fpm Docker image)
- **Database**: PostgreSQL 16 (accessed via Doctrine ORM)
- **Migrations**: Phinx (robmorgan/phinx) - NOT Doctrine migrations
- **Server**: Nginx proxying to PHP-FPM

The backend structure follows standard Symfony conventions:
- `src/Controller/` - API controllers
- `src/Model/` - Application model
- `src/Repository/` - Database repositories
- `src/Service/` - Business logic services
- `src/Security/` - Authentication & authorization
- `src/Kernel.php` - Application kernel
- `config/` - Configuration files (services, routes, packages)
- `bin/console` - Symfony console commands
- `public/index.php` - Entry point

### Individual Service Commands

```bash
# Run inside backend container or locally with PHP 8.3+
composer install                    # Install dependencies
php bin/console cache:clear         # Clear Symfony cache
php bin/console debug:router        # List all routes

# Database migrations (using Phinx)
vendor/bin/phinx migrate           # Run migrations
vendor/bin/phinx create MigrationName  # Create new migration
```

### Backend Standards

#### PHP

**PHP Version**: 8.3+ features are encouraged

- Use constructor property promotion to reduce boilerplate code in classes
- Leverage readonly properties for immutable value objects and entities
- Always use strict typing with `declare(strict_types=1)` at the top of every file
- Use typed properties for all class properties (prefer strict types over mixed)
- Implement named arguments for better readability when calling functions with many parameters
- Use PHP 8.1+ enums for fixed sets of values instead of class constants
- Extract validation logic into private methods to avoid duplication
- Use class constants for configuration values (e.g., MAX_LENGTH) instead of magic numbers
- Prefer final classes by default to encourage composition over inheritance
- Use null coalescing operator (??) and nullsafe operator (?->) for concise null handling

#### Symfony

- Follow Symfony best practices and conventions for directory structure
- Use Symfony's dependency injection container for service management
- Implement custom console commands for administrative tasks
- Use Symfony's validation component for input validation in controllers
- Leverage Symfony's security component for authentication and authorization
- Configure services in YAML files under config/services.yaml
- Use environment variables for configuration with proper .env files
- Implement custom event listeners for cross-cutting concerns

#### ReadModel Pattern

- Use ReadModels to decouple API responses from domain entities
- Create ReadModels in `src/ReadModel/` directory
- ReadModels should be `final readonly class` for immutability
- Implement `\JsonSerializable` for automatic JSON conversion
- Create ReadModels in the repository layer, not in services or controllers
- Only include fields intended for public API exposure in ReadModels
- Never include sensitive data (timestamps, IDs, related entities) unless explicitly needed
- Use ReadModels to prevent accidental exposure of entity data through serialization

### Database Standards

#### PostgreSQL

- Use connection pooling to manage database connections efficiently
- Implement JSONB columns for semi-structured data instead of creating many tables for flexible data
- Use materialized views for complex, frequently accessed read-only data

**Migration Tool**: Phinx (NOT Doctrine migrations)

### Testing Standards

#### PHPUnit (Unit Testing)
- **File & Naming**: Test classes end with `Test` (e.g., `MyServiceTest.php`) and mirror the source directory structure (e.g., `tests/Unit/Service/MyServiceTest.php` for `src/Service/MyService.php`).
- **Test Methods**: Use `snake_case` for test method names to describe the behavior under test (e.g., `it_throws_exception_when_invalid()`).
- **Structure**:
    - Follow the Arrange-Act-Assert pattern, often explicitly with comments (`// Arrange`, `// Act`, `// Assert`).
    - Test classes should be `final` and extend `PHPUnit\Framework\TestCase`.
    - Use the `setUp()` method for initializing mocks and the class under test.
- **Attributes**: Use PHPUnit's attribute syntax (`#[Test]`, `#[CoversClass(MyClass::class)]`) instead of annotations.
- **Mocking**:
    - Leverage `createMock()` for creating test doubles.
    - Use `expects()` with `once()`, `never()`, etc., to assert method call expectations on mocks.
- **Assertions**: Use specific assertions (`assertSame`, `assertCount`, `assertInstanceOf`) over generic ones. For exceptions, use `expectException()` and `expectExceptionMessage()`.
- **Execution**: Run tests via the Docker container: `docker compose exec backend vendor/bin/phpunit`.
