# Login View Implementation Plan

## 1. Overview

The Login View is the authentication entry point for the Theme Builder application. It provides a form-based interface where existing users can authenticate using their email and password credentials to access the workspace. The view handles credential validation, communicates with the backend authentication endpoint, manages JWT token storage, and navigates users to the workspace upon successful login. Error handling provides clear feedback for various failure scenarios including invalid credentials, validation errors, and network issues.

This implementation will replace the current temporary LoginForm component (which accepts JWT tokens directly) with a production-ready email/password authentication form that integrates with the POST /api/auth/login endpoint.

## 2. View Routing

**Path**: `/login`

**Authentication**: Not required - Public route

**Access Control**:
- If user is already authenticated (has valid JWT token), redirect to `/` (workspace)
- Implemented via protected route logic in App.tsx (already exists)

**Navigation Behavior**:
- On successful login: Navigate to `/` (workspace) with `replace: true` to prevent back navigation to login
- Entry point for unauthenticated users (redirected from `/` if not authenticated)

## 3. Component Structure

```
LoginView (Page Container)
├── CenteredCard (Layout)
│   ├── BrandHeader
│   │   ├── Logo (optional)
│   │   └── Heading "Theme Builder Login"
│   ├── LoginForm
│   │   ├── FormField (Email)
│   │   │   ├── Label
│   │   │   ├── Input (type="email")
│   │   │   └── FieldError (conditional)
│   │   ├── FormField (Password)
│   │   │   ├── Label
│   │   │   ├── Input (type="password")
│   │   │   └── FieldError (conditional)
│   │   ├── ErrorAlert (conditional, form-level API errors)
│   │   └── SubmitButton (with loading state)
│   └── FooterLinks (optional)
│       └── Link "Don't have an account? Register" (future)
```

## 4. Component Details

### LoginView (Page Container)

**Component description**: Top-level container component that provides the layout structure for the login page. Renders a centered card with the LoginForm and handles the overall page styling (background, centering, responsive behavior).

**Main elements**:
- `<div className="flex min-h-screen items-center justify-center bg-gray-100">` - Full viewport container with centered content
- `<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">` - Card container for form
- `<h1>` - Page heading "Theme Builder Login"
- `<LoginForm />` - Form component

**Handled events**: None (delegated to child components)

**Validation conditions**: None at this level

**Types**:
- No props (root component for the route)

**Props**: None

### LoginForm

**Component description**: Core authentication form component that manages form state, handles user input, performs client-side validation, calls the login API endpoint, and manages the authentication flow. Provides real-time validation feedback and displays appropriate error messages for different failure scenarios.

**Main elements**:
- `<form onSubmit={handleSubmit}>` - Form element with submit handler
- Email input field: `<input type="email" id="email" required />`
- Password input field: `<input type="password" id="password" required />`
- `<Button type="submit" disabled={isLoading}>` - Submit button with loading state
- Conditional error alert for API errors
- Field-level error messages for validation

**Handled events**:
- `onChange` for email input: Update email state, clear field error
- `onChange` for password input: Update password state, clear field error
- `onSubmit` for form: Validate inputs, call login API, handle response

**Validation conditions**:
- **Email validation**:
  - Required: Must not be empty
  - Format: Must be valid email format (use HTML5 validation or regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Display error: "Email is required" or "Please enter a valid email address"
- **Password validation**:
  - Required: Must not be empty
  - Display error: "Password is required"
- **Form-level validation**: Both fields must be valid before API call

**Types**:
- `LoginFormData` - Form state
- `LoginRequest` - API request DTO
- `LoginResponse` - API response DTO
- `LoginError` - API error DTO
- `ValidationErrors` - Client-side validation errors

**Props**: None (self-contained component)

**State variables**:
- `email: string` - Email input value
- `password: string` - Password input value
- `validationErrors: ValidationErrors` - Client-side validation errors
- `apiError: string | null` - Error message from API
- `isLoading: boolean` - Form submission state

### FormField (Email/Password)

**Component description**: Reusable form field wrapper that combines label, input, and error message display. Can be implemented as a separate component or inline in LoginForm for MVP simplicity.

**Main elements**:
- `<div className="space-y-2">` - Field container
- `<Label htmlFor={id}>{label}</Label>` - Field label from shadcn/ui
- `<Input />` - Input component from shadcn/ui
- `{error && <p className="text-sm text-red-600">{error}</p>}` - Field error message

**Handled events**: Input onChange (propagated to parent)

**Validation conditions**: Display error if validation error exists for this field

**Types**:
- `value: string`
- `onChange: (value: string) => void`
- `error?: string`
- `type: 'email' | 'password' | 'text'`
- `id: string`
- `label: string`

**Props**:
```typescript
interface FormFieldProps {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

**Implementation Note**: Use shadcn/ui `Label` and `Input` components:
```tsx
<div className="space-y-2">
  <Label htmlFor={id}>{label}</Label>
  <Input
    id={id}
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={error ? 'border-red-500' : ''}
    required={required}
    disabled={disabled}
  />
  {error && <p className="text-sm text-red-600">{error}</p>}
</div>
```

### ErrorAlert

**Component description**: Alert component for displaying form-level error messages (API errors, network errors). Uses the Alert component from shadcn/ui with destructive variant for error styling.

**Main elements**:
- `<Alert variant="destructive">` - Alert container from shadcn/ui
- `<AlertDescription>` - Error message wrapper from shadcn/ui
- Error icon (included automatically via shadcn/ui Alert component)

**Handled events**: None (display only)

**Validation conditions**: Only rendered when `apiError` is not null

**Types**:
- `message: string`

**Props**:
```typescript
interface ErrorAlertProps {
  message: string;
}
```

**Implementation Note**: Use shadcn/ui `Alert` and `AlertDescription` components:
```tsx
<Alert variant="destructive">
  <AlertDescription>{message}</AlertDescription>
</Alert>
```

### SubmitButton

**Component description**: Form submit button with loading state indication. Uses shadcn/ui Button component with disabled state during API call to prevent double submission.

**Main elements**:
- `<Button type="submit" disabled={isLoading} className="w-full">` - Submit button
- Loading spinner icon (optional, when isLoading is true)
- Button text: "Login" or "Logging in..." based on loading state

**Handled events**: Form submission (handled by form's onSubmit)

**Validation conditions**: Disabled when `isLoading === true`

**Types**: Uses Button component from shadcn/ui

**Props**:
```typescript
interface SubmitButtonProps {
  isLoading: boolean;
}
```

## 5. Types

### LoginFormData
```typescript
interface LoginFormData {
  email: string;
  password: string;
}
```
Local component state representing current form input values.

### LoginRequest
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```
DTO for POST /api/auth/login request body. Matches backend expectations.

### LoginResponse
```typescript
interface LoginResponse {
  token: string;
}
```
DTO for successful login response. Contains JWT token returned by backend.
**Note**: Based on actual AuthController implementation (line 132), response only contains token, not user object.

### LoginError
```typescript
interface LoginError {
  error: string; // "invalid_credentials" | "validation_error" | "login_failed"
  message: string;
  field?: string; // Optional, for field-specific validation errors
  exception?: string; // Optional, in development mode only
  file?: string; // Optional, in development mode only
}
```
DTO for error responses from the login endpoint. Matches backend error format from AuthController.

### ValidationErrors
```typescript
interface ValidationErrors {
  email?: string;
  password?: string;
}
```
Client-side validation errors mapped by field name.

### UserInfo
```typescript
interface UserInfo {
  id: string;
  email: string;
  shopId?: string;
}
```
User information decoded from JWT token payload. Extracted using existing `decodeJWT` utility from `lib/auth.ts`.

## 6. State Management

### Local Component State

The LoginForm component manages its own state using React hooks:

**State Variables**:
1. `email: string` - Controlled input value for email field
2. `password: string` - Controlled input value for password field
3. `validationErrors: ValidationErrors` - Client-side validation errors
4. `apiError: string | null` - Error message from API responses
5. `isLoading: boolean` - Tracks form submission state

**State Updates**:
- Email/password: Updated on input `onChange` events
- Validation errors: Set during client-side validation, cleared when user types
- API error: Set on API error response, cleared on new submission
- Loading: Set to `true` on form submit, set to `false` on response (success or error)

### Application-Level Authentication State

Authentication state is managed at the App component level (already implemented in App.tsx):

**Current Implementation**:
- `isAuthenticated: boolean | null` state in App.tsx
- Token stored in localStorage with key `'jwt_token'`
- Custom event `'auth-change'` dispatched when authentication changes
- App component listens to both `'storage'` and `'auth-change'` events
- Routes conditionally render based on `isAuthenticated` state

**Integration**:
- LoginForm stores token in localStorage on successful login
- LoginForm dispatches `'auth-change'` event to notify App component
- LoginForm uses `useNavigate()` to navigate to `/` (workspace)
- App component detects auth change and updates `isAuthenticated` state
- Protected route logic redirects to workspace

**No custom hook needed**: The existing authentication infrastructure in App.tsx is sufficient for MVP. Future enhancement could extract this into a `useAuth()` custom hook with context.

## 7. API Integration

### Login Endpoint

**Endpoint**: `POST /api/auth/login`

**Request**:
```typescript
// Type: LoginRequest
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK)**:
```typescript
// Type: LoginResponse
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

1. **400 Bad Request** - Validation error:
```json
{
  "error": "validation_error",
  "message": "Invalid email format",
  "field": "email"
}
```

2. **401 Unauthorized** - Invalid credentials:
```json
{
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}
```

3. **500 Internal Server Error** - Server error:
```json
{
  "error": "login_failed",
  "message": "Login failed. Please try again."
}
```

### API Call Implementation

Create new file: `src/lib/api/auth.ts`

```typescript
import { LoginRequest, LoginResponse, LoginError } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorData: LoginError;

    try {
      errorData = await response.json();
    } catch {
      throw new AuthenticationError(
        'Network error. Please try again.',
        'network_error'
      );
    }

    throw new AuthenticationError(
      errorData.message,
      errorData.error,
      errorData.field
    );
  }

  return response.json();
}
```

**Note**: This function does NOT use the existing `apiRequest` helper from `lib/api/client.ts` because:
1. Login endpoint doesn't require authentication (no Bearer token)
2. Error handling is specific to authentication flow
3. Simpler to keep authentication API separate

### Token Management

**Storage Strategy**:
- Store JWT token in localStorage with key `'jwt_token'`
- Use existing pattern from current implementation

**Token Extraction**:
- Use existing `decodeJWT()` function from `lib/auth.ts` to extract user info
- Extract `userId`, `email`, and `shopId` from token payload

**Post-Login Flow**:
1. Call `login()` API function with credentials
2. On success, receive `LoginResponse` with token
3. Store token: `localStorage.setItem('jwt_token', response.token)`
4. Decode token to verify validity (optional for MVP)
5. Dispatch `'auth-change'` event: `window.dispatchEvent(new Event('auth-change'))`
6. Navigate to workspace: `navigate('/', { replace: true })`

## 8. User Interactions

### Interaction 1: User enters email

**Trigger**: User types in email input field

**Handler**: `onChange` event on email input

**Behavior**:
1. Update email state with current input value
2. If validation error exists for email field, clear it
3. No API call (input only)

### Interaction 2: User enters password

**Trigger**: User types in password input field

**Handler**: `onChange` event on password input

**Behavior**:
1. Update password state with current input value
2. If validation error exists for password field, clear it
3. No API call (input only)

### Interaction 3: User submits form (clicks button or presses Enter)

**Trigger**: Form submission (button click or Enter key in input field)

**Handler**: `onSubmit` event on form element

**Behavior**:
1. **Prevent default form submission**: `e.preventDefault()`
2. **Clear previous errors**: Reset `apiError` and `validationErrors`
3. **Client-side validation**:
   - Validate email is not empty
   - Validate email format (regex or HTML5 validation)
   - Validate password is not empty
   - If validation fails: Set `validationErrors` and return early
4. **API call**:
   - Set `isLoading = true`
   - Call `login({ email, password })`
   - Wait for response
5. **Success path** (200 OK):
   - Store token in localStorage
   - Dispatch 'auth-change' event
   - Navigate to '/' with `replace: true`
6. **Error path** (4xx/5xx):
   - Set `isLoading = false`
   - Parse error response
   - Set `apiError` with error message
   - If field-specific error, also set `validationErrors[field]`
   - Display error to user
7. **Network error path**:
   - Set `isLoading = false`
   - Set `apiError = "Unable to connect. Please check your internet connection."`

### Interaction 4: User clicks "Register" link (future enhancement)

**Trigger**: Click on "Don't have an account? Register" link

**Handler**: Link click or navigation

**Behavior**:
- Navigate to `/register` route
- Not implemented in MVP (login and registration are separate features)

## 9. Conditions and Validation

### Client-Side Validation

Performed before API call to provide immediate feedback and prevent unnecessary requests.

**Email Field Validation**:
- **Condition**: Email is not empty
  - **Check**: `email.trim().length > 0`
  - **Error message**: "Email is required"
  - **UI effect**: Display error message below email field, add red border to input
- **Condition**: Email matches valid format
  - **Check**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)` or use HTML5 `type="email"` validation
  - **Error message**: "Please enter a valid email address"
  - **UI effect**: Display error message below email field, add red border to input

**Password Field Validation**:
- **Condition**: Password is not empty
  - **Check**: `password.trim().length > 0`
  - **Error message**: "Password is required"
  - **UI effect**: Display error message below password field, add red border to input

**Form Submission Validation**:
- **Condition**: All fields are valid
  - **Check**: No validation errors exist
  - **Effect**: If validation fails, prevent API call and display errors
  - **Effect**: If validation passes, proceed with API call

### API Validation

Performed by backend and handled via error responses.

**Backend Validation** (from AuthController.php):
1. **Request payload validation** - Symfony MapRequestPayload attribute
   - Validates email format
   - Validates required fields
   - Returns 400 Bad Request with field-specific errors
2. **Credential verification** - AuthService
   - Checks if user exists with provided email
   - Verifies password hash
   - Returns 401 Unauthorized if invalid

**Frontend Handling**:
- **400 Bad Request**: Display message from API, optionally map to field error if `field` property exists
- **401 Unauthorized**: Display "Invalid email or password" in form-level alert
- **500 Internal Server Error**: Display "Login failed. Please try again."

### UI State Conditions

**Submit Button State**:
- **Enabled**: When `isLoading === false`
- **Disabled**: When `isLoading === true`
- **Text**: "Login" when not loading, "Logging in..." when loading

**Error Alert Display**:
- **Visible**: When `apiError !== null`
- **Hidden**: When `apiError === null`
- **Cleared**: On new form submission or when user starts typing

**Field Error Display**:
- **Visible**: When `validationErrors[fieldName]` exists
- **Hidden**: When no validation error for that field
- **Cleared**: When user types in that field or on new submission

## 10. Error Handling

### Error Categories

**1. Client-Side Validation Errors**
- **Scenario**: User submits form with invalid data
- **Detection**: Before API call, during form validation
- **Handling**: Display field-specific error messages below inputs
- **Recovery**: User corrects input and resubmits

**2. Authentication Errors (401)**
- **Scenario**: User provides incorrect email or password
- **Detection**: API returns 401 Unauthorized with `error: "invalid_credentials"`
- **Handling**: Display "Invalid email or password" in form-level alert
- **Recovery**: User re-enters credentials and resubmits
- **Security**: Generic message prevents user enumeration

**3. Validation Errors from API (400)**
- **Scenario**: Backend validation rejects request (e.g., malformed email)
- **Detection**: API returns 400 Bad Request with `error: "validation_error"`
- **Handling**: Display API error message, map to field error if `field` property provided
- **Recovery**: User corrects input based on error message

**4. Server Errors (500)**
- **Scenario**: Backend experiences unexpected error during login
- **Detection**: API returns 500 Internal Server Error
- **Handling**: Display "Login failed. Please try again." in form-level alert
- **Recovery**: User retries submission, may need to contact support if persistent

**5. Network Errors**
- **Scenario**: Network connection fails, request timeout, CORS issues
- **Detection**: Fetch throws error or promise rejects
- **Handling**: Display "Unable to connect. Please check your internet connection."
- **Recovery**: User checks connection and retries

### Error Display Strategy

**Field-Level Errors** (client-side validation):
- Displayed below respective input field
- Red text color
- Input border color changes to red
- Cleared when user starts typing in that field

**Form-Level Errors** (API errors):
- Displayed at top of form, above inputs
- shadcn/ui Alert component with destructive variant (red background/border/text)
- Cleared on new form submission
- Persistent until user takes action

**Loading State Management**:
- Set `isLoading = true` at start of API call
- Always set `isLoading = false` in both success and error handlers
- Prevents double submission via disabled button

### Error Recovery

**Automatic Recovery**:
- Clear field errors on user input (onChange)
- Clear API error on new form submission
- Reset loading state after API response

**User-Initiated Recovery**:
- User corrects validation errors and resubmits
- User re-enters credentials for authentication errors
- User retries on network or server errors

**Edge Cases**:
- **Multiple rapid submissions**: Button disabled during loading prevents this
- **Browser back button**: No special handling needed (form state resets)
- **Page refresh during submission**: Request completes or fails, no stored state
- **Token already exists**: Protected route logic in App.tsx redirects to workspace

## 11. Implementation Steps

### Phase 1: Setup and Types (Foundation)

**Step 1.1**: Create authentication types file
- Create `src/types/auth.ts`
- Define `LoginFormData`, `LoginRequest`, `LoginResponse`, `LoginError`, `ValidationErrors`, `UserInfo` interfaces
- Export all types for use in components and API layer

**Step 1.2**: Install Input component from shadcn/ui
- Check if Input component exists in `src/components/ui/input.tsx`
- If missing, install shadcn/ui Input component: `npx shadcn-ui@latest add input`
- Verify the component is properly configured with Tailwind styling

**Step 1.3**: Install Alert component from shadcn/ui
- Check if Alert component exists in `src/components/ui/alert.tsx`
- If missing, install shadcn/ui Alert component: `npx shadcn-ui@latest add alert`
- Verify the destructive variant is available for error display

### Phase 2: API Integration Layer

**Step 2.1**: Create authentication API module
- Create `src/lib/api/auth.ts`
- Implement `AuthenticationError` custom error class
- Implement `login(credentials: LoginRequest): Promise<LoginResponse>` function
- Add proper error handling for different response codes
- Add network error handling

**Step 2.2**: Test API integration (optional)
- Create simple test file or use Vitest
- Mock fetch to test success and error responses
- Verify error handling for different scenarios

### Phase 3: LoginForm Component Implementation

**Step 3.1**: Update LoginForm component structure
- Open `src/components/auth/LoginForm.tsx`
- Replace temporary token input implementation
- Set up component state: `email`, `password`, `validationErrors`, `apiError`, `isLoading`
- Import necessary UI components (Button, Label, Input, Alert)
- Import auth types and API function

**Step 3.2**: Implement form UI with shadcn/ui components
- Create form layout with email and password fields
- Add Label components from shadcn/ui for each field
- Add Input components from shadcn/ui with proper types (email, password)
- Add conditional error message displays for each field
- Add conditional Alert component from shadcn/ui with destructive variant for form-level API errors
- Add submit Button from shadcn/ui with loading state

**Step 3.3**: Implement input handlers
- Create `handleEmailChange` function to update email state and clear email error
- Create `handlePasswordChange` function to update password state and clear password error
- Wire up onChange handlers to input fields

**Step 3.4**: Implement validation logic
- Create `validateForm()` function for client-side validation
- Check email is not empty and matches valid format
- Check password is not empty
- Return validation errors object or null if valid

**Step 3.5**: Implement form submission handler
- Create `handleSubmit` async function
- Prevent default form submission
- Clear previous errors
- Call `validateForm()` and return early if validation fails
- Set `isLoading = true`
- Call `login()` API function with credentials
- Handle success: store token, dispatch event, navigate to workspace
- Handle errors: set API error message, set loading to false
- Add try-catch for network errors

**Step 3.6**: Add loading state to button
- Update button text based on `isLoading` state
- Disable button when `isLoading === true`
- Optional: Add loading spinner icon

### Phase 4: Integration and Testing

**Step 4.1**: Test login flow with backend
- Start backend server with Docker Compose
- Ensure backend API is running on expected URL
- Test successful login with valid credentials
- Verify token is stored in localStorage
- Verify navigation to workspace occurs
- Verify App.tsx detects auth change

**Step 4.2**: Test error scenarios
- Test with invalid email format (client validation)
- Test with empty fields (client validation)
- Test with incorrect credentials (401 error)
- Test with non-existent user (401 error)
- Test network error (disconnect network or wrong API URL)

**Step 4.3**: Test user experience
- Verify error messages are clear and helpful
- Verify errors clear when user starts typing
- Verify loading state during API call
- Verify button disable prevents double submission
- Verify Enter key submits form
- Test responsive design on mobile viewport

**Step 4.4**: Update environment configuration
- Verify `VITE_API_URL` environment variable points to correct backend
- Test with both development and production API URLs
- Update `.env.example` if needed

### Phase 5: Cleanup and Documentation

**Step 5.1**: Remove temporary test code
- Remove `VITE_DEFAULT_JWT_TOKEN` environment variable reference (if exists)
- Remove any debug console.logs
- Clean up unused imports

**Step 5.2**: Add code comments
- Document complex validation logic
- Add JSDoc comments to exported functions
- Document error handling strategy

**Step 5.3**: Update related files
- Ensure App.tsx routing logic is correct for login flow
- Verify protected route logic works with new login implementation
- Update any documentation referencing the old temporary login

### Phase 6: Unit Testing (Vitest + React Testing Library)

**Step 6.1**: Set up test file structure
- Create `theme-builder/tests/unit/components/auth/LoginForm.test.tsx`
- Create `theme-builder/tests/unit/lib/api/auth.test.ts`
- Create `theme-builder/tests/mocks/handlers.ts` for MSW API mocking
- Create `theme-builder/tests/mocks/server.ts` for MSW server setup
- Import necessary testing utilities (render, screen, userEvent, waitFor)
- Verify `theme-builder/vitest.config.ts` includes `tests/**/*.test.{ts,tsx}` in test file pattern

**Step 6.2**: Test LoginForm component rendering
- Test that form renders with email and password fields
- Test that labels are correctly associated with inputs
- Test that submit button is rendered
- Test initial state (no errors, button enabled)
- Verify proper accessibility attributes (labels, ARIA attributes)

**Step 6.3**: Test form validation
- Test email required validation (empty email shows error)
- Test email format validation (invalid format shows error)
- Test password required validation (empty password shows error)
- Test validation errors clear when user types
- Test form submission is prevented when validation fails

**Step 6.4**: Test successful login flow
- Mock successful API response (200 OK with token)
- Fill form with valid credentials
- Submit form
- Verify API called with correct payload
- Verify token stored in localStorage
- Verify navigation to workspace
- Verify auth-change event dispatched

**Step 6.5**: Test error scenarios
- Test 401 Unauthorized (invalid credentials)
  - Mock 401 API response
  - Submit form
  - Verify error message displayed
  - Verify form remains interactive
- Test 400 Bad Request (validation error from API)
  - Mock 400 API response with field error
  - Submit form
  - Verify error message displayed
- Test 500 Server Error
  - Mock 500 API response
  - Verify generic error message displayed
- Test network error
  - Mock fetch rejection
  - Verify network error message displayed

**Step 6.6**: Test loading state
- Test submit button disabled during API call
- Test loading text displayed during submission
- Test loading state clears after response

**Step 6.7**: Test auth API functions
- Create unit tests for `login()` function
- Test successful login returns token
- Test error responses throw AuthenticationError
- Test network errors handled correctly
- Test error code and message extraction

**Step 6.8**: Run and verify all unit tests
- Run: `npm run test` or `vitest`
- Verify all tests pass
- Check test coverage: `npm run test:coverage`
- Aim for >80% coverage on LoginForm and auth API

### Phase 7: E2E Testing (Playwright)

**Step 7.1**: Set up Playwright test file
- Create `e2e/auth/login.spec.ts` in the existing e2e directory at project root
- Import Playwright test utilities
- Review existing E2E test patterns (e.g., `demo-shop-navigation.spec.ts`)
- Set up test fixtures if needed
- Configure base URL and test user credentials

**Step 7.2**: Write E2E test - Successful login flow
```typescript
test('user can log in with valid credentials', async ({ page }) => {
  // Navigate to login page
  // Fill email input
  // Fill password input
  // Click submit button
  // Wait for navigation to workspace
  // Verify URL is '/'
  // Verify workspace elements are visible
  // Verify localStorage contains jwt_token
});
```

**Step 7.3**: Write E2E test - Client-side validation
```typescript
test('shows validation errors for empty fields', async ({ page }) => {
  // Navigate to login page
  // Click submit without filling fields
  // Verify email error message visible
  // Verify password error message visible
  // Verify no navigation occurred
});

test('shows validation error for invalid email format', async ({ page }) => {
  // Navigate to login page
  // Fill email with invalid format
  // Fill password
  // Submit form
  // Verify email format error displayed
});
```

**Step 7.4**: Write E2E test - Invalid credentials
```typescript
test('shows error for invalid credentials', async ({ page }) => {
  // Navigate to login page
  // Fill email with non-existent user
  // Fill password
  // Submit form
  // Wait for error alert
  // Verify "Invalid email or password" message displayed
  // Verify still on login page
  // Verify form is still interactive
});
```

**Step 7.5**: Write E2E test - Loading state
```typescript
test('shows loading state during login', async ({ page }) => {
  // Navigate to login page
  // Fill valid credentials
  // Click submit
  // Verify button shows loading text
  // Verify button is disabled
  // Wait for navigation
});
```

**Step 7.6**: Write E2E test - Already authenticated redirect
```typescript
test('redirects to workspace if already authenticated', async ({ page, context }) => {
  // Manually set jwt_token in localStorage
  // Navigate to /login
  // Verify automatic redirect to /
  // Verify workspace is displayed
});
```

**Step 7.7**: Write E2E test - Error recovery
```typescript
test('user can retry after error', async ({ page }) => {
  // Submit with invalid credentials
  // Wait for error message
  // Clear inputs
  // Fill with valid credentials
  // Submit form
  // Verify successful login
});

test('error clears when user starts typing', async ({ page }) => {
  // Submit with invalid credentials
  // Wait for error message
  // Type in email field
  // Verify error message cleared or removed
});
```

**Step 7.8**: Write E2E test - Responsive behavior
```typescript
test('login form works on mobile viewport', async ({ page }) => {
  // Set mobile viewport
  // Navigate to login page
  // Verify form is visible and properly sized
  // Complete login flow
  // Verify successful login on mobile
});
```

**Step 7.9**: Run and verify E2E tests
- Start backend server: `docker compose up`
- Run Playwright tests: `npx playwright test`
- Verify all tests pass
- Review test report
- Fix any failing tests

**Step 7.10**: Add E2E tests to CI/CD
- Update GitHub Actions workflow to run Playwright tests
- Ensure backend is available in CI environment
- Add test artifacts upload for failure screenshots
- Configure test retry strategy

### Phase 8: Future Enhancements (Post-MVP)

**Not included in MVP but document for future**:
- "Remember me" functionality (longer-lived tokens)
- "Show/hide password" toggle
- Link to registration page (when registration is implemented)
- "Forgot password" link (when password reset is implemented)
- Rate limiting indication (if backend implements it)
- Redirect to originally requested page after login (if user was redirected from protected route)
- Password strength indicator (on registration)
- Social authentication (Google, GitHub, etc.)
- Multi-factor authentication (MFA)

## 12. Testing Strategy

### Overview

The Login View requires comprehensive test coverage across multiple layers:
1. **Unit Tests** - Test individual components and functions in isolation
2. **E2E Tests** - Test the complete user flow from login page to workspace

### Unit Testing with Vitest and React Testing Library

**Testing Philosophy**:
- Follow Arrange-Act-Assert pattern
- Test behavior, not implementation details
- Mock external dependencies (API calls, navigation)
- Use data-testid attributes sparingly, prefer accessible queries

**Test File Structure**:
```
theme-builder/
├── src/                           # Source code
└── tests/                         # Unit tests (app-specific)
    ├── unit/
    │   ├── components/
    │   │   └── auth/
    │   │       └── LoginForm.test.tsx
    │   └── lib/
    │       └── api/
    │           └── auth.test.ts
    └── mocks/
        ├── handlers.ts
        └── server.ts

e2e/                               # E2E tests (project root, shared)
└── auth/
    └── login.spec.ts
```

**Note**: Unit tests are centralized in `theme-builder/tests/` directory (app-specific). E2E tests use the existing `e2e/` directory at the project root (shared across all apps). This keeps unit tests close to the app they test while E2E tests remain at the project level.

**Vitest Configuration**:
Ensure `theme-builder/vitest.config.ts` is configured to discover tests in the tests directory:
```typescript
export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // ... other config
  }
});
```

**Note**: The path `tests/**/*.test.{ts,tsx}` is relative to the `theme-builder/` directory.

**Key Testing Utilities**:
- `@testing-library/react` - render, screen, waitFor
- `@testing-library/user-event` - Simulate user interactions
- `vitest` - Test runner and assertions (vi.fn(), vi.mock())
- `msw` - Mock Service Worker for API mocking

**LoginForm Component Tests**:

1. **Rendering Tests**:
   - Verify form elements render correctly
   - Check accessibility (labels, ARIA attributes)
   - Verify initial state (no errors, button enabled)

2. **Validation Tests**:
   - Empty email triggers "Email is required" error
   - Invalid email format triggers "Please enter a valid email address" error
   - Empty password triggers "Password is required" error
   - Typing clears validation errors
   - Form submission blocked if validation fails

3. **Successful Login Tests**:
   - Mock 200 OK API response with token
   - Fill form and submit
   - Verify `login()` called with correct credentials
   - Verify token saved to localStorage
   - Verify navigation called with `('/', { replace: true })`
   - Verify `auth-change` event dispatched

4. **Error Handling Tests**:
   - Mock 401 response → verify "Invalid email or password" displayed
   - Mock 400 response → verify API error message displayed
   - Mock 500 response → verify "Login failed" message displayed
   - Mock network error → verify connection error message displayed
   - Verify form remains interactive after errors

5. **Loading State Tests**:
   - Submit form → verify button disabled
   - Verify button text changes to "Logging in..."
   - After response → verify loading cleared

**Auth API Function Tests**:

1. **Successful Login**:
   - Mock fetch response with 200 and token
   - Call `login()` with credentials
   - Verify returns `{ token: '...' }`

2. **Error Responses**:
   - Mock 401 → verify throws AuthenticationError with correct message
   - Mock 400 → verify throws with field information
   - Mock 500 → verify throws with generic error

3. **Network Errors**:
   - Mock fetch rejection → verify throws network error
   - Verify error message is user-friendly

**Example Unit Test** (`theme-builder/tests/unit/components/auth/LoginForm.test.tsx`):
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import * as authApi from '@/lib/api/auth';

// Mock the auth API
vi.mock('@/lib/api/auth');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders email and password fields', () => {
    render(<LoginForm />, { wrapper: BrowserRouter });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: BrowserRouter });

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('successfully logs in with valid credentials', async () => {
    const user = userEvent.setup();
    const mockToken = 'mock-jwt-token';

    vi.mocked(authApi.login).mockResolvedValue({ token: mockToken });

    render(<LoginForm />, { wrapper: BrowserRouter });

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('jwt_token')).toBe(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('displays error message for invalid credentials', async () => {
    const user = userEvent.setup();

    vi.mocked(authApi.login).mockRejectedValue(
      new authApi.AuthenticationError('Invalid email or password', 'invalid_credentials')
    );

    render(<LoginForm />, { wrapper: BrowserRouter });

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Testing with Playwright

**Testing Philosophy**:
- Test real user workflows end-to-end
- Use actual backend API (or staging environment)
- Test cross-browser compatibility
- Verify visual behavior and navigation
- Test responsive designs on different viewports

**Test File Location**:
```
e2e/                               # Project root (existing directory)
├── auth/
│   └── login.spec.ts             # New login E2E tests
├── demo-shop-navigation.spec.ts  # Existing E2E test
├── global-setup.ts               # Existing global setup
└── helpers/                       # Existing helpers
```

**Note**: E2E tests use the existing `e2e/` directory at the project root. This directory is shared across all apps (theme-builder, demo-shop) and already contains E2E tests.

**Playwright Configuration**:
The existing `playwright.config.ts` at project root should point to the `e2e/` directory:
```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',  // Theme Builder URL
    // ... other config
  },
  // ... other config
});
```

**Note**: Playwright config is at project root level and already configured. Verify `testDir` points to `./e2e`.

**Configuration Details**:
- Base URL: `http://localhost:5173` (or test environment)
- Browsers: Chromium (primary), Firefox, WebKit (optional)
- Viewport: Desktop (1280x720) and Mobile (375x667)
- Test user credentials: Configure in environment variables

**Key E2E Test Scenarios**:

1. **Happy Path - Successful Login**:
   - Navigate to `/login`
   - Fill email and password with valid credentials
   - Click submit button
   - Wait for navigation to `/`
   - Assert workspace elements are visible
   - Verify localStorage contains jwt_token

2. **Validation Errors**:
   - Navigate to login page
   - Submit empty form → verify error messages displayed
   - Fill invalid email → verify format error
   - Verify errors prevent navigation

3. **Authentication Failures**:
   - Navigate to login page
   - Enter invalid credentials
   - Submit form
   - Wait for error alert with "Invalid email or password"
   - Verify still on login page
   - Verify can retry with different credentials

4. **Loading States**:
   - Fill form and submit
   - Assert button is disabled during request
   - Assert loading text is visible
   - Wait for completion

5. **Already Authenticated**:
   - Set jwt_token in localStorage (valid token)
   - Navigate to `/login`
   - Assert automatic redirect to `/`
   - Verify workspace loads

6. **Error Recovery**:
   - Submit with invalid credentials → error shown
   - Clear form
   - Enter valid credentials → successful login
   - Verify error cleared on retry

7. **Responsive Design**:
   - Set mobile viewport (375x667)
   - Complete entire login flow
   - Verify form is usable on mobile
   - Verify layout doesn't break

**Example E2E Test** (`e2e/auth/login.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('user can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to workspace
    await expect(page).toHaveURL('/');

    // Verify workspace loaded
    await expect(page.locator('text=Theme Builder')).toBeVisible();

    // Verify token stored
    const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(token).toBeTruthy();
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    // Submit without filling fields
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator('text=/email is required/i')).toBeVisible();
    await expect(page.locator('text=/password is required/i')).toBeVisible();

    // Verify no navigation occurred
    expect(page.url()).toContain('/login');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=/invalid email or password/i')).toBeVisible();

    // Verify still on login page
    expect(page.url()).toContain('/login');
  });

  test('redirects if already authenticated', async ({ page }) => {
    // Set a mock token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('jwt_token', 'mock-token-for-testing');
    });

    // Try to navigate to login
    await page.goto('/login');

    // Should redirect to workspace
    await expect(page).toHaveURL('/');
  });

  test('works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');

    // Verify form is visible and properly sized
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Complete login flow
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL('/');
  });
});
```

### Test Coverage Goals

**Unit Test Coverage**:
- **LoginForm component**: >90% coverage
  - All branches (validation, errors, success)
  - All event handlers
  - All state transitions
- **Auth API functions**: 100% coverage
  - All response codes
  - All error paths
  - Network errors

**E2E Test Coverage**:
- ✅ Happy path (successful login)
- ✅ Validation errors (client-side)
- ✅ Authentication errors (401)
- ✅ Loading states
- ✅ Already authenticated redirect
- ✅ Error recovery
- ✅ Responsive design (mobile)

### Running Tests

**Unit Tests** (run from `theme-builder/` directory):
```bash
# Run all unit tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test tests/unit/components/auth/LoginForm.test.tsx

# Run all tests in a specific directory
npm run test tests/unit/components/
```

**E2E Tests** (run from project root):
```bash
# Run all Playwright tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# Run all auth E2E tests
npx playwright test e2e/auth/

# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui

# Generate test report
npx playwright show-report
```

### CI/CD Integration

**GitHub Actions Workflow**:
1. Install dependencies
2. Run unit tests with coverage
3. Build application
4. Start backend services (Docker Compose)
5. Start frontend dev server
6. Run Playwright tests
7. Upload test artifacts (screenshots, videos on failure)
8. Report test results

**Coverage Requirements**:
- Unit test coverage: >80% required to pass CI
- E2E tests: All tests must pass
- No failing tests allowed in main branch

## Implementation Checklist

### Setup and Types
- [ ] Create `src/types/auth.ts` with all type definitions
- [ ] Install shadcn/ui Input component (`npx shadcn-ui@latest add input`)
- [ ] Install shadcn/ui Alert component (`npx shadcn-ui@latest add alert`)

### API Integration
- [ ] Create `src/lib/api/auth.ts` with login function
- [ ] Implement `AuthenticationError` custom error class
- [ ] Add proper error handling for all response codes

### Component Implementation
- [ ] Update `src/components/auth/LoginForm.tsx` with email/password form
- [ ] Implement form state management (email, password, errors, loading)
- [ ] Implement input change handlers
- [ ] Implement client-side validation logic
- [ ] Implement form submission handler with API integration
- [ ] Implement error handling for all scenarios
- [ ] Add loading state to submit button

### Manual Testing
- [ ] Test successful login flow end-to-end with backend
- [ ] Test all error scenarios (validation, 401, 500, network)
- [ ] Test responsive design and user experience
- [ ] Verify environment configuration

### Unit Tests (Vitest)
- [ ] Verify `theme-builder/vitest.config.ts` includes `tests/**/*.test.{ts,tsx}` pattern
- [ ] Create `theme-builder/tests/unit/components/auth/LoginForm.test.tsx`
- [ ] Create `theme-builder/tests/unit/lib/api/auth.test.ts`
- [ ] Create `theme-builder/tests/mocks/handlers.ts` and `server.ts` for MSW
- [ ] Test LoginForm rendering and initial state
- [ ] Test form validation (email, password, format)
- [ ] Test successful login flow (API call, token storage, navigation)
- [ ] Test error scenarios (401, 400, 500, network)
- [ ] Test loading state behavior
- [ ] Test auth API functions
- [ ] Run tests from `theme-builder/` directory and verify >80% coverage

### E2E Tests (Playwright)
- [ ] Verify `playwright.config.ts` (project root) has `testDir: './e2e'`
- [ ] Create `e2e/auth/login.spec.ts`
- [ ] Review existing E2E patterns in `e2e/demo-shop-navigation.spec.ts`
- [ ] Write test: Successful login flow
- [ ] Write test: Client-side validation errors
- [ ] Write test: Invalid credentials error
- [ ] Write test: Loading state during submission
- [ ] Write test: Already authenticated redirect
- [ ] Write test: Error recovery and retry
- [ ] Write test: Responsive behavior on mobile
- [ ] Run Playwright tests from project root and verify all pass
- [ ] Verify E2E tests work with existing `e2e/global-setup.ts` if needed
- [ ] Add E2E tests to CI/CD pipeline (if not already configured)

### Cleanup
- [ ] Remove temporary test code and debug logs
- [ ] Add code comments and JSDoc
- [ ] Update documentation
- [ ] Verify all tests pass in CI/CD
