# Registration View Implementation Plan

## 1. Overview

The Registration View is the user onboarding entry point for the Theme Builder application. It provides a form-based interface where new users can create an account using their email, password, and shop name to gain access to the application. The view handles input validation (both client-side and server-side), communicates with the backend registration endpoint, manages error states, and navigates users to the login page upon successful registration. The backend automatically creates 4 default pages (Home, Catalog, Product, Contact) with predefined layouts and seeds default products and categories for each new user during the registration process.

This implementation follows the same patterns as the existing LoginForm component and integrates seamlessly with the application's JWT-based authentication flow.

## 2. View Routing

**Path**: `/register`

**Authentication**: Not required - Public route

**Access Control**:
- If user is already authenticated (has valid JWT token), redirect to `/` (workspace)
- Implemented via protected route logic in App.tsx (similar to login route)

**Navigation Behavior**:
- On successful registration: Navigate to `/login` with success state/message
- Entry point for new users
- Accessible from login page via "Don't have an account? Register" link

## 3. Component Structure

```
RegistrationView (Page Container)
├── CenteredCard (Layout)
│   ├── BrandHeader
│   │   ├── Logo (optional)
│   │   └── Heading "Create Your Account"
│   ├── RegistrationForm
│   │   ├── FormField (Email)
│   │   │   ├── Label
│   │   │   ├── Input (type="email")
│   │   │   └── FieldError (conditional)
│   │   ├── FormField (Password)
│   │   │   ├── Label
│   │   │   ├── Input (type="password")
│   │   │   ├── PasswordStrengthIndicator (optional)
│   │   │   └── FieldError (conditional)
│   │   ├── FormField (Shop Name)
│   │   │   ├── Label
│   │   │   ├── Input (type="text")
│   │   │   └── FieldError (conditional)
│   │   ├── ErrorAlert (conditional, form-level API errors)
│   │   ├── SuccessMessage (conditional, post-registration)
│   │   └── SubmitButton (with loading state)
│   └── FooterLinks
│       └── Link "Already have an account? Log in"
```

## 4. Component Details

### RegistrationView (Page Container)

**Component description**: Top-level container component that provides the layout structure for the registration page. Renders a centered card with the RegistrationForm and handles the overall page styling (background, centering, responsive behavior). Matches the visual design of the LoginForm for consistency.

**Main elements**:
- `<div className="flex min-h-screen items-center justify-center bg-gray-100">` - Full viewport container with centered content
- `<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">` - Card container for form
- `<h1>` - Page heading "Create Your Account"
- `<RegistrationForm />` - Form component
- Footer link to login page

**Handled events**: None (delegated to child components)

**Validation conditions**: None at this level

**Types**:
- No props (root component for the route)

**Props**: None

### RegistrationForm

**Component description**: Core registration form component that manages form state for three fields (email, password, shop name), handles user input, performs comprehensive client-side validation, calls the registration API endpoint, and manages the registration flow. Provides real-time validation feedback, password strength indication, and displays appropriate error messages for different failure scenarios (validation errors, email already exists, shop name already exists, server errors).

**Main elements**:
- `<form onSubmit={handleSubmit}>` - Form element with submit handler
- Email input field: `<input type="email" id="email" required />`
- Password input field: `<input type="password" id="password" required />`
- Shop name input field: `<input type="text" id="shopName" required />`
- `<Button type="submit" disabled={isLoading}>` - Submit button with loading state
- Conditional success message after successful registration
- Conditional error alert for API errors
- Field-level error messages for validation

**Handled events**:
- `onChange` for email input: Update email state, clear field error
- `onChange` for password input: Update password state, clear field error, update password strength indicator
- `onChange` for shop name input: Update shop name state, clear field error
- `onSubmit` for form: Validate all inputs, call registration API, handle response

**Validation conditions**:
- **Email validation**:
  - Required: Must not be empty
  - Format: Must be valid email format (RFC 5322 compatible regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Display error: "Email is required" or "Please enter a valid email address"
- **Password validation**:
  - Required: Must not be empty
  - Minimum length: At least 8 characters
  - Complexity: Must contain uppercase letter, lowercase letter, number, and special character
  - Display errors: "Password is required", "Password must be at least 8 characters", "Password must include uppercase, lowercase, number, and special character"
- **Shop name validation**:
  - Required: Must not be empty
  - Minimum length: At least 3 characters
  - Maximum length: At most 50 characters
  - Pattern: Alphanumeric with spaces, hyphens, and underscores allowed
  - Display errors: "Shop name is required", "Shop name must be at least 3 characters", "Shop name must be at most 50 characters", "Shop name contains invalid characters"
- **Form-level validation**: All fields must be valid before API call

**Types**:
- `RegistrationFormData` - Form state
- `RegisterRequest` - API request DTO
- `RegisterResponse` - API response DTO
- `RegisterError` - API error DTO
- `ValidationErrors` - Client-side validation errors

**Props**: None (self-contained component)

**State variables**:
- `email: string` - Email input value
- `password: string` - Password input value
- `shopName: string` - Shop name input value
- `validationErrors: ValidationErrors` - Client-side validation errors
- `apiError: string | null` - Error message from API
- `isLoading: boolean` - Form submission state
- `isSuccess: boolean` - Successful registration state

### FormField (Email/Password/ShopName)

**Component description**: Reusable form field wrapper that combines label, input, and error message display. Used for all three input fields (email, password, shop name) to maintain consistency. Can be implemented as a separate component or inline in RegistrationForm for MVP simplicity.

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
  placeholder?: string;
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
    placeholder={placeholder}
    className={error ? 'border-red-500' : ''}
    required={required}
    disabled={disabled}
  />
  {error && <p className="text-sm text-red-600">{error}</p>}
</div>
```

### ErrorAlert

**Component description**: Alert component for displaying form-level error messages (API errors, network errors). Uses the Alert component from shadcn/ui with destructive variant for error styling. Displays different messages based on error type (email exists, shop exists, validation error, server error).

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

### SuccessMessage

**Component description**: Success message component displayed after successful registration. Shows a confirmation message and automatically redirects to login page after a brief delay (2-3 seconds). Uses shadcn/ui Alert component with success/default variant for positive feedback styling.

**Main elements**:
- `<Alert>` - Alert container from shadcn/ui (default or success variant)
- `<AlertDescription>` - Success message wrapper
- Success icon (optional, checkmark)
- Redirect countdown or "Redirecting to login..." text

**Handled events**: None (display only, triggers automatic redirect via useEffect)

**Validation conditions**: Only rendered when `isSuccess === true`

**Types**:
- `message: string`
- `onComplete?: () => void` - Callback for redirect

**Props**:
```typescript
interface SuccessMessageProps {
  message: string;
  onComplete?: () => void;
}
```

**Implementation Note**: Display success message and redirect after 2-3 seconds:
```tsx
{isSuccess && (
  <Alert>
    <AlertDescription>
      Account created successfully! You may now log in.
    </AlertDescription>
  </Alert>
)}
```

### SubmitButton

**Component description**: Form submit button with loading state indication. Uses shadcn/ui Button component with disabled state during API call to prevent double submission. Button text changes to indicate loading state.

**Main elements**:
- `<Button type="submit" disabled={isLoading || isSuccess} className="w-full">` - Submit button
- Loading spinner icon (optional, when isLoading is true)
- Button text: "Create Account" or "Creating Account..." based on loading state

**Handled events**: Form submission (handled by form's onSubmit)

**Validation conditions**: Disabled when `isLoading === true` or `isSuccess === true`

**Types**: Uses Button component from shadcn/ui

**Props**:
```typescript
interface SubmitButtonProps {
  isLoading: boolean;
  isSuccess: boolean;
}
```

### LoginLink

**Component description**: Link component that navigates to the login page. Displayed at the bottom of the registration form for users who already have an account. Uses react-router-dom Link component for client-side navigation.

**Main elements**:
- `<Link to="/login">` - React Router Link component
- Text: "Already have an account? Log in"

**Handled events**: Click (handled by React Router Link)

**Validation conditions**: None

**Types**: Standard React Router Link

**Props**: None (hardcoded route)

## 5. Types

### RegistrationFormData
```typescript
interface RegistrationFormData {
  email: string;
  password: string;
  shopName: string;
}
```
Local component state representing current form input values.

### RegisterRequest
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  shop_name: string;
}
```
DTO for POST /api/auth/register request body. Matches backend expectations (note: snake_case for shop_name to match API contract).

### RegisterResponse
```typescript
interface RegisterResponse {
  userId: string;
}
```
DTO for successful registration response. Contains only userId based on actual AuthController implementation (line 61).

**Note**: The endpoint description mentions returning full user and shop objects, but the actual implementation (AuthController.php:61) only returns `userId`. This plan uses the actual implementation.

### RegisterError
```typescript
interface RegisterError {
  error: 'email_exists' | 'shop_exists' | 'validation_error' | 'registration_failed';
  message: string;
  field?: string; // Optional, for field-specific validation errors (e.g., "email", "password", "shop_name")
  exception?: string; // Optional, in development mode only
  file?: string; // Optional, in development mode only
}
```
DTO for error responses from the registration endpoint. Matches backend error format from AuthController.

### ValidationErrors
```typescript
interface ValidationErrors {
  email?: string;
  password?: string;
  shopName?: string;
}
```
Client-side validation errors mapped by field name.

## 6. State Management

### Local Component State

The RegistrationForm component manages its own state using React hooks:

**State Variables**:
1. `email: string` - Controlled input value for email field
2. `password: string` - Controlled input value for password field
3. `shopName: string` - Controlled input value for shop name field
4. `validationErrors: ValidationErrors` - Client-side validation errors
5. `apiError: string | null` - Error message from API responses
6. `isLoading: boolean` - Tracks form submission state
7. `isSuccess: boolean` - Tracks successful registration state for success message and redirect

**State Updates**:
- Email/password/shopName: Updated on input `onChange` events
- Validation errors: Set during client-side validation, cleared when user types
- API error: Set on API error response, cleared on new submission
- Loading: Set to `true` on form submit, set to `false` on response (success or error)
- Success: Set to `true` on successful registration, triggers success message and redirect

### Application-Level Authentication State

Authentication state is managed at the App component level (already implemented in App.tsx):

**Current Implementation**:
- `isAuthenticated: boolean | null` state in App.tsx
- Token stored in localStorage with key `'jwt_token'`
- Custom event `'auth-change'` dispatched when authentication changes
- App component listens to both `'storage'` and `'auth-change'` events
- Routes conditionally render based on `isAuthenticated` state

**Integration**:
- RegistrationForm does NOT store token on successful registration (unlike login)
- RegistrationForm navigates to `/login` with success state after registration
- User must log in separately after registration
- App component's protected route logic prevents authenticated users from accessing `/register`

**No custom hook needed**: The existing authentication infrastructure in App.tsx is sufficient for MVP. The registration flow is simpler than login (no token storage), so no additional state management is required.

## 7. API Integration

### Registration Endpoint

**Endpoint**: `POST /api/auth/register`

**Request**:
```typescript
// Type: RegisterRequest
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "shop_name": "My Shop"
}
```

**Success Response (201 Created)**:
```typescript
// Type: RegisterResponse (based on actual implementation)
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note**: The actual implementation (AuthController.php:61) returns only `userId`, not full user and shop objects as described in the endpoint documentation.

**Error Responses**:

1. **400 Bad Request** - Validation error:
```json
{
  "error": "validation_error",
  "message": "Invalid email format",
  "field": "email"
}
```

2. **409 Conflict** - Email already exists:
```json
{
  "error": "email_exists",
  "message": "An account with this email already exists"
}
```

3. **409 Conflict** - Shop name already exists:
```json
{
  "error": "shop_exists",
  "message": "A shop with this name already exists"
}
```

4. **500 Internal Server Error** - Server error:
```json
{
  "error": "registration_failed",
  "message": "Registration failed. Please try again."
}
```

### API Call Implementation

Add to existing file: `src/lib/api/auth.ts` (extends existing login implementation)

```typescript
import type {
  LoginRequest,
  LoginResponse,
  LoginError,
  RegisterRequest,
  RegisterResponse,
  RegisterError
} from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Existing AuthenticationError class (reuse for registration)
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

// Existing login function...

/**
 * Registers a new user with shop and default pages
 *
 * @param credentials - User email, password, and shop name
 * @returns Promise resolving to RegisterResponse with userId
 * @throws AuthenticationError for registration failures or network errors
 *
 * @example
 * ```typescript
 * try {
 *   const response = await register({
 *     email: 'user@example.com',
 *     password: 'SecurePass123!',
 *     shop_name: 'My Shop'
 *   });
 *   console.log('User ID:', response.userId);
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     console.error('Registration failed:', error.message, error.code);
 *   }
 * }
 * ```
 */
export async function register(credentials: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorData: RegisterError;

    try {
      errorData = await response.json();
    } catch {
      // If response body is not JSON, throw network error
      throw new AuthenticationError(
        'Network error. Please try again.',
        'network_error'
      );
    }

    // Throw authentication error with message and code from API
    throw new AuthenticationError(
      errorData.message,
      errorData.error,
      errorData.field
    );
  }

  return response.json();
}
```

**Note**: This function reuses the existing `AuthenticationError` class from the login implementation for consistency.

### Backend Processing (automatic, handled server-side)

**What happens on successful registration** (backend/src/Service/AuthService.php):
1. Validate email format and uniqueness
2. Validate password strength
3. Validate shop name uniqueness
4. Hash password using Symfony PasswordHasher
5. Create user record in database
6. Create shop record with provided name and default theme_settings
7. Create 4 default pages (Home, Catalog, Product, Contact) with predefined layouts
8. Seed default products and categories
9. Return userId

**Frontend does not need to handle** any of the above - it's all automatic server-side processing.

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
3. Optional: Update password strength indicator (real-time feedback)
4. No API call (input only)

### Interaction 3: User enters shop name

**Trigger**: User types in shop name input field

**Handler**: `onChange` event on shop name input

**Behavior**:
1. Update shop name state with current input value
2. If validation error exists for shop name field, clear it
3. No API call (input only)

### Interaction 4: User submits form (clicks button or presses Enter)

**Trigger**: Form submission (button click or Enter key in input field)

**Handler**: `onSubmit` event on form element

**Behavior**:
1. **Prevent default form submission**: `e.preventDefault()`
2. **Clear previous errors**: Reset `apiError` and `validationErrors`
3. **Client-side validation**:
   - Validate email is not empty and matches format
   - Validate password meets all requirements (length, complexity)
   - Validate shop name meets requirements (length, pattern)
   - If validation fails: Set `validationErrors` and return early
4. **API call**:
   - Set `isLoading = true`
   - Call `register({ email, password, shop_name: shopName })`
   - Wait for response
5. **Success path** (201 Created):
   - Set `isSuccess = true`
   - Display success message
   - Navigate to `/login` (no token storage, user must log in)
6. **Error path** (4xx/5xx):
   - Set `isLoading = false`
   - Parse error response
   - Set `apiError` with appropriate message based on error code
   - If field-specific error, also set `validationErrors[field]`
   - Display error to user
7. **Network error path**:
   - Set `isLoading = false`
   - Set `apiError = "Unable to connect. Please check your internet connection."`

### Interaction 5: User clicks "Already have an account? Log in" link

**Trigger**: Click on login link

**Handler**: React Router Link navigation

**Behavior**:
- Navigate to `/login` route
- Implemented via `<Link to="/login">` component

### Interaction 6: Successful registration - automatic redirect

**Trigger**: `isSuccess` state changes to `true`

**Handler**: `useEffect` hook watching `isSuccess` state

**Behavior**:
1. Display success message
2. Set timeout for 2-3 seconds
3. Call `navigate('/login')` to redirect to login page
4. User can now log in with newly created credentials

## 9. Conditions and Validation

### Client-Side Validation

Performed before API call to provide immediate feedback and prevent unnecessary requests.

**Email Field Validation**:
- **Condition**: Email is not empty
  - **Check**: `email.trim().length > 0`
  - **Error message**: "Email is required"
  - **UI effect**: Display error message below email field, add red border to input
- **Condition**: Email matches valid format
  - **Check**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)`
  - **Error message**: "Please enter a valid email address"
  - **UI effect**: Display error message below email field, add red border to input

**Password Field Validation**:
- **Condition**: Password is not empty
  - **Check**: `password.trim().length > 0`
  - **Error message**: "Password is required"
  - **UI effect**: Display error message below password field, add red border to input

**Shop Name Field Validation**:
- **Condition**: Shop name is not empty
  - **Check**: `shopName.trim().length > 0`
  - **Error message**: "Shop name is required"
  - **UI effect**: Display error message below shop name field, add red border to input
- **Condition**: Shop name meets minimum length
  - **Check**: `shopName.trim().length >= 3`
  - **Error message**: "Shop name must be at least 3 characters"
  - **UI effect**: Display error message below shop name field, add red border to input
- **Condition**: Shop name doesn't exceed maximum length
  - **Check**: `shopName.trim().length <= 50`
  - **Error message**: "Shop name must be at most 50 characters"
  - **UI effect**: Display error message below shop name field, add red border to input
- **Condition**: Shop name contains only valid characters
  - **Check**: `/^[a-zA-Z0-9\s\-_]+$/.test(shopName)`
  - **Error message**: "Shop name can only contain letters, numbers, spaces, hyphens, and underscores"
  - **UI effect**: Display error message below shop name field, add red border to input

**Form Submission Validation**:
- **Condition**: All fields are valid
  - **Check**: No validation errors exist
  - **Effect**: If validation fails, prevent API call and display errors
  - **Effect**: If validation passes, proceed with API call

### API Validation

Performed by backend and handled via error responses.

**Backend Validation** (from AuthController.php):
1. **Request payload validation** - Symfony MapRequestPayload attribute with RegisterRequest DTO
   - Validates email format (RFC 5322)
   - Validates required fields
   - Validates password strength (minimum security requirements)
   - Returns 400 Bad Request with field-specific errors
2. **Email uniqueness** - AuthService checks database
   - Returns 409 Conflict with `error: "email_exists"`
3. **Shop name uniqueness** - AuthService checks database
   - Returns 409 Conflict with `error: "shop_exists"`
4. **Password hashing** - Symfony PasswordHasher
   - Server-side only, no client involvement

**Frontend Handling**:
- **400 Bad Request**: Display message from API, map to field error if `field` property exists
- **409 Conflict (email_exists)**: Display "An account with this email already exists" in form-level alert
- **409 Conflict (shop_exists)**: Display "A shop with this name already exists" in form-level alert
- **500 Internal Server Error**: Display "Registration failed. Please try again."

### UI State Conditions

**Submit Button State**:
- **Enabled**: When `isLoading === false && isSuccess === false`
- **Disabled**: When `isLoading === true || isSuccess === true`
- **Text**: "Create Account" when not loading, "Creating Account..." when loading

**Error Alert Display**:
- **Visible**: When `apiError !== null`
- **Hidden**: When `apiError === null`
- **Cleared**: On new form submission or when user starts typing

**Success Message Display**:
- **Visible**: When `isSuccess === true`
- **Hidden**: When `isSuccess === false`
- **Triggers redirect**: After 2-3 seconds delay

**Field Error Display**:
- **Visible**: When `validationErrors[fieldName]` exists
- **Hidden**: When no validation error for that field
- **Cleared**: When user types in that field or on new submission

**Form Disabled State**:
- **All inputs disabled**: When `isSuccess === true` (after successful registration, during redirect countdown)
- **All inputs enabled**: When `isSuccess === false`

## 10. Error Handling

### Error Categories

**1. Client-Side Validation Errors**
- **Scenario**: User submits form with invalid data
- **Detection**: Before API call, during form validation
- **Handling**: Display field-specific error messages below inputs
- **Recovery**: User corrects input and resubmits
- **Examples**:
  - Empty email → "Email is required"
  - Invalid email format → "Please enter a valid email address"
  - Empty password → "Password is required"
  - Weak password → "Password must be at least 8 characters" or "Password must include uppercase, lowercase, number, and special character"
  - Empty shop name → "Shop name is required"
  - Short shop name → "Shop name must be at least 3 characters"
  - Long shop name → "Shop name must be at most 50 characters"
  - Invalid shop name characters → "Shop name can only contain letters, numbers, spaces, hyphens, and underscores"

**2. Conflict Errors (409) - Email Already Exists**
- **Scenario**: User tries to register with an email that already exists in the database
- **Detection**: API returns 409 Conflict with `error: "email_exists"`
- **Handling**: Display "An account with this email already exists" in form-level alert
- **Recovery**: User tries a different email or navigates to login page
- **Security**: Revealing email existence is acceptable for registration (not for login)

**3. Conflict Errors (409) - Shop Name Already Exists**
- **Scenario**: User tries to register with a shop name that already exists in the database
- **Detection**: API returns 409 Conflict with `error: "shop_exists"`
- **Handling**: Display "A shop with this name already exists" in form-level alert
- **Recovery**: User tries a different shop name and resubmits
- **UX Note**: Suggest modifications to shop name (e.g., add numbers or location)

**4. Validation Errors from API (400)**
- **Scenario**: Backend validation rejects request (e.g., malformed email, weak password that passed client validation but failed server validation)
- **Detection**: API returns 400 Bad Request with `error: "validation_error"`
- **Handling**: Display API error message, map to field error if `field` property provided
- **Recovery**: User corrects input based on error message
- **Note**: Should be rare if client-side validation is comprehensive

**5. Server Errors (500)**
- **Scenario**: Backend experiences unexpected error during registration (database failure, service error, etc.)
- **Detection**: API returns 500 Internal Server Error
- **Handling**: Display "Registration failed. Please try again." in form-level alert
- **Recovery**: User retries submission, may need to contact support if persistent
- **Logging**: Backend logs full error details for debugging

**6. Network Errors**
- **Scenario**: Network connection fails, request timeout, CORS issues, DNS resolution failure
- **Detection**: Fetch throws error or promise rejects
- **Handling**: Display "Unable to connect. Please check your internet connection."
- **Recovery**: User checks connection and retries
- **UX**: Consider adding retry button or automatic retry logic

### Error Display Strategy

**Field-Level Errors** (client-side validation):
- Displayed below respective input field
- Red text color (`text-red-600`)
- Input border color changes to red (`border-red-500`)
- Cleared when user starts typing in that field
- Displayed immediately on form submit if validation fails

**Form-Level Errors** (API errors):
- Displayed at top of form, above inputs
- shadcn/ui Alert component with destructive variant (red background/border/text)
- Cleared on new form submission
- Persistent until user takes action (submit again or start typing)
- Different messages based on error type (email exists, shop exists, validation, server)

**Success Message**:
- Displayed at top of form after successful registration
- shadcn/ui Alert component with default or success variant
- Includes redirect countdown or "Redirecting to login..." text
- Form inputs disabled during success state
- Automatically triggers redirect after 2-3 seconds

**Loading State Management**:
- Set `isLoading = true` at start of API call
- Always set `isLoading = false` in both success and error handlers
- Prevents double submission via disabled button
- Button text changes to indicate loading ("Creating Account...")

### Error Recovery

**Automatic Recovery**:
- Clear field errors on user input (onChange)
- Clear API error on new form submission
- Reset loading state after API response
- Clear all errors when navigating away from page

**User-Initiated Recovery**:
- User corrects validation errors and resubmits
- User tries different email if email exists error
- User tries different shop name if shop name exists error
- User retries on network or server errors
- User can navigate to login page if they realize they already have an account

**Edge Cases**:
- **Multiple rapid submissions**: Button disabled during loading prevents this
- **Browser back button**: No special handling needed (form state resets)
- **Page refresh during submission**: Request completes or fails, no stored state
- **Token already exists**: Protected route logic in App.tsx redirects to workspace
- **User closes tab during submission**: Backend completes registration, user can log in later
- **Partial registration failure** (user created but pages not created): Backend should handle atomically or rollback

## 11. Implementation Steps

### Phase 1: Setup and Types (Foundation)

**Step 1.1**: Extend authentication types file
- Open existing `src/types/auth.ts`
- Add `RegistrationFormData`, `RegisterRequest`, `RegisterResponse`, `RegisterError` interfaces
- Extend `ValidationErrors` to include `shopName?: string`
- Export all new types for use in components and API layer

**Step 1.2**: Verify UI components are installed
- Check if Input component exists in `src/components/ui/input.tsx` (already installed for login)
- Check if Alert component exists in `src/components/ui/alert.tsx` (already installed for login)
- Check if Label component exists in `src/components/ui/label.tsx` (already installed for login)
- If any missing, install: `npx shadcn-ui@latest add input alert label`

### Phase 2: API Integration Layer

**Step 2.1**: Extend authentication API module
- Open existing `src/lib/api/auth.ts`
- Reuse existing `AuthenticationError` class (no changes needed)
- Implement `register(credentials: RegisterRequest): Promise<RegisterResponse>` function
- Add proper error handling for all response codes (400, 409, 500)
- Add network error handling
- Follow same pattern as existing `login()` function

**Step 2.2**: Test API integration (optional)
- Create test file or use Vitest
- Mock fetch to test success response (201 Created with userId)
- Mock error responses (400, 409 for email_exists, 409 for shop_exists, 500)
- Verify error handling for different scenarios
- Verify AuthenticationError is thrown correctly with code and field

### Phase 3: RegistrationForm Component Implementation

**Step 3.1**: Create RegistrationForm component file
- Create `src/components/auth/RegistrationForm.tsx`
- Set up component structure similar to LoginForm
- Set up component state: `email`, `password`, `shopName`, `validationErrors`, `apiError`, `isLoading`, `isSuccess`
- Import necessary UI components (Button, Label, Input, Alert)
- Import auth types and API function
- Import useNavigate from react-router-dom

**Step 3.2**: Implement form UI with shadcn/ui components
- Create page container with centered card layout (match LoginForm styling)
- Add page heading "Create Your Account"
- Create form layout with three fields (email, password, shop name)
- Add Label components from shadcn/ui for each field
- Add Input components from shadcn/ui with proper types and placeholders
- Add conditional error message displays for each field
- Add conditional Alert component for form-level API errors (destructive variant)
- Add conditional Alert component for success message (default variant)
- Add submit Button from shadcn/ui with loading state
- Add Link to login page at bottom ("Already have an account? Log in")

**Step 3.3**: Implement input handlers
- Create `handleEmailChange` function to update email state and clear email error
- Create `handlePasswordChange` function to update password state and clear password error
- Create `handleShopNameChange` function to update shop name state and clear shop name error
- Wire up onChange handlers to input fields

**Step 3.4**: Implement validation logic
- Create `validateForm()` function for comprehensive client-side validation
- Validate email is not empty and matches format
- Validate password is not empty, meets length requirement (8+ chars)
- Validate password contains uppercase, lowercase, number, special character
- Validate shop name is not empty, meets length requirements (3-50 chars)
- Validate shop name contains only valid characters (alphanumeric, spaces, hyphens, underscores)
- Return validation errors object or null if all valid
- Create helper functions for password complexity checks if needed

**Step 3.5**: Implement form submission handler
- Create `handleSubmit` async function
- Prevent default form submission
- Clear previous errors (apiError, validationErrors)
- Call `validateForm()` and return early if validation fails
- Set `isLoading = true`
- Call `register()` API function with credentials (email, password, shop_name)
- Handle success: set `isSuccess = true`, display success message
- Handle errors: set API error message based on error code, set loading to false
- Handle specific error codes: email_exists, shop_exists, validation_error, registration_failed
- Map field-specific errors to validationErrors if field provided
- Add try-catch for network errors

**Step 3.6**: Implement success state and redirect
- Use `useEffect` hook to watch `isSuccess` state
- When `isSuccess` becomes true, set timeout for 2-3 seconds
- After timeout, call `navigate('/login')` to redirect to login page
- Clean up timeout on component unmount
- Disable all form inputs when `isSuccess === true`

**Step 3.7**: Add loading state to button
- Update button text based on `isLoading` state ("Create Account" vs "Creating Account...")
- Disable button when `isLoading === true` or `isSuccess === true`
- Optional: Add loading spinner icon during submission

### Phase 4: Routing Integration

**Step 4.1**: Add registration route to App.tsx
- Open `src/App.tsx`
- Import RegistrationForm component
- Add new route: `<Route path="/register" element={...} />`
- Apply same protected route logic as login (redirect to `/` if authenticated)
- Ensure route is accessible when not authenticated

**Step 4.2**: Add link to registration from login page
- Open `src/components/auth/LoginForm.tsx`
- Add Link component at bottom of form
- Text: "Don't have an account? Register"
- Links to `/register` route
- Style consistently with registration's login link

### Phase 5: Integration and Testing

**Step 5.1**: Test registration flow with backend
- Start backend server with Docker Compose (`docker compose up`)
- Ensure backend API is running on expected URL (http://localhost:8000)
- Navigate to `/register` route
- Test successful registration with valid data
- Verify userId is returned in response
- Verify success message is displayed
- Verify automatic redirect to login page after 2-3 seconds
- Test logging in with newly created account

**Step 5.2**: Test validation scenarios
- Test with empty fields (all required errors)
- Test with invalid email format (client validation)
- Test with weak password (various requirements)
- Test with short shop name (<3 chars)
- Test with long shop name (>50 chars)
- Test with invalid shop name characters (special chars)
- Verify all error messages display correctly
- Verify errors clear when user starts typing

**Step 5.3**: Test error scenarios with backend
- Test with existing email (409 email_exists error)
- Test with existing shop name (409 shop_exists error)
- Test network error (disconnect network or wrong API URL)
- Verify server error handling (if possible to trigger 500)
- Verify error messages are clear and actionable

**Step 5.4**: Test user experience flow
- Test complete flow: register → success message → redirect → login → workspace
- Verify navigation between login and registration forms
- Verify loading state during API call
- Verify button disable prevents double submission
- Verify Enter key submits form
- Test responsive design on mobile viewport
- Verify all transitions are smooth and clear

**Step 5.5**: Test edge cases
- Test with spaces in email (trimmed)
- Test with spaces in shop name (allowed)
- Test with shop name edge cases (exactly 3 chars, exactly 50 chars)
- Test rapid form submission (button should prevent)
- Test browser back button behavior
- Test already authenticated user trying to access /register (should redirect)

**Step 5.6**: Update environment configuration
- Verify `VITE_API_URL` environment variable points to correct backend
- Test with both development and production API URLs
- Update `.env.example` if needed

### Phase 6: Cleanup and Documentation

**Step 6.1**: Code cleanup
- Remove any debug console.logs
- Clean up unused imports
- Verify consistent code formatting
- Check for TypeScript errors

**Step 6.2**: Add code comments
- Add JSDoc comments to exported functions
- Document complex validation logic
- Document error handling strategy
- Add comments explaining business logic (4 pages created, products seeded, etc.)

**Step 6.3**: Update related files
- Verify App.tsx routing logic is correct
- Verify LoginForm has link to registration
- Update any documentation referencing authentication flow
- Update API documentation if discrepancies were found

### Phase 7: Unit Testing (Vitest + React Testing Library)

**Step 7.1**: Set up test file structure
- Create `theme-builder/tests/unit/components/auth/RegistrationForm.test.tsx`
- Create or update `theme-builder/tests/unit/lib/api/auth.test.ts` to include register function tests
- Update `theme-builder/tests/mocks/handlers.ts` to include register endpoint mocks
- Import necessary testing utilities (render, screen, userEvent, waitFor)
- Verify `theme-builder/vitest.config.ts` includes test pattern

**Step 7.2**: Test RegistrationForm component rendering
- Test that form renders with all three input fields (email, password, shop name)
- Test that labels are correctly associated with inputs
- Test that submit button is rendered with correct text
- Test initial state (no errors, button enabled, no success message)
- Test that login link is rendered and points to /login
- Verify proper accessibility attributes (labels, ARIA attributes)

**Step 7.3**: Test form validation
- Test email required validation
- Test email format validation
- Test password required validation
- Test password minimum length validation (8 chars)
- Test password complexity validation (uppercase, lowercase, number, special char)
- Test shop name required validation
- Test shop name minimum length validation (3 chars)
- Test shop name maximum length validation (50 chars)
- Test shop name invalid characters validation
- Test validation errors clear when user types
- Test form submission is prevented when validation fails

**Step 7.4**: Test successful registration flow
- Mock successful API response (201 Created with userId)
- Fill form with valid data
- Submit form
- Verify API called with correct payload (email, password, shop_name)
- Verify success message displayed
- Verify form inputs disabled after success
- Verify navigation to /login called after delay
- Verify no token stored in localStorage (unlike login)

**Step 7.5**: Test error scenarios
- Test 409 Conflict (email_exists)
  - Mock 409 API response
  - Submit form
  - Verify "An account with this email already exists" message displayed
  - Verify form remains interactive
- Test 409 Conflict (shop_exists)
  - Mock 409 API response
  - Verify "A shop with this name already exists" message displayed
- Test 400 Bad Request (validation error from API)
  - Mock 400 API response with field error
  - Submit form
  - Verify error message displayed
  - Verify field error mapped if field provided
- Test 500 Server Error
  - Mock 500 API response
  - Verify "Registration failed. Please try again." message displayed
- Test network error
  - Mock fetch rejection
  - Verify network error message displayed

**Step 7.6**: Test loading state
- Test submit button disabled during API call
- Test loading text displayed during submission ("Creating Account...")
- Test loading state clears after response (success or error)
- Test form inputs remain enabled during loading (only button disabled)

**Step 7.7**: Test register API function
- Create unit tests for `register()` function in auth.test.ts
- Test successful registration returns userId
- Test error responses throw AuthenticationError with correct code
- Test error code and message extraction (email_exists, shop_exists, validation_error, registration_failed)
- Test network errors handled correctly
- Test field parameter extraction for validation errors

**Step 7.8**: Run and verify all unit tests
- Run from theme-builder directory: `npm run test`
- Verify all tests pass
- Check test coverage: `npm run test:coverage`
- Aim for >80% coverage on RegistrationForm and register API function
- Fix any failing tests

### Phase 8: E2E Testing (Playwright)

**Step 8.1**: Set up Playwright test file
- Create `e2e/auth/registration.spec.ts` in existing e2e directory at project root
- Import Playwright test utilities
- Review existing E2E patterns from login.spec.ts and demo-shop-navigation.spec.ts
- Set up test fixtures if needed
- Configure base URL and test data

**Step 8.2**: Write E2E test - Successful registration flow
```typescript
test('user can register with valid credentials', async ({ page }) => {
  // Navigate to registration page
  // Fill email input with unique email
  // Fill password input with strong password
  // Fill shop name input with unique shop name
  // Click submit button
  // Wait for success message
  // Verify success message contains "Account created successfully"
  // Wait for navigation to /login
  // Verify URL is /login
  // Verify can login with new credentials
});
```

**Step 8.3**: Write E2E test - Client-side validation
```typescript
test('shows validation errors for empty fields', async ({ page }) => {
  // Navigate to registration page
  // Click submit without filling fields
  // Verify email, password, and shop name error messages visible
  // Verify no navigation occurred
});

test('shows validation error for weak password', async ({ page }) => {
  // Navigate to registration page
  // Fill email and shop name
  // Fill password with weak password (e.g., "pass")
  // Submit form
  // Verify password validation errors displayed
});

test('shows validation error for invalid shop name', async ({ page }) => {
  // Fill form but use shop name with invalid characters
  // Verify shop name validation error
});
```

**Step 8.4**: Write E2E test - Email already exists
```typescript
test('shows error when email already exists', async ({ page }) => {
  // Register first user
  // Try to register again with same email
  // Verify "An account with this email already exists" displayed
  // Verify still on registration page
  // Verify form is still interactive
});
```

**Step 8.5**: Write E2E test - Shop name already exists
```typescript
test('shows error when shop name already exists', async ({ page }) => {
  // Register first user
  // Try to register different email but same shop name
  // Verify "A shop with this name already exists" displayed
});
```

**Step 8.6**: Write E2E test - Loading state
```typescript
test('shows loading state during registration', async ({ page }) => {
  // Navigate to registration page
  // Fill valid credentials
  // Click submit
  // Verify button shows loading text
  // Verify button is disabled
  // Wait for response
});
```

**Step 8.7**: Write E2E test - Navigation between login and registration
```typescript
test('can navigate from registration to login', async ({ page }) => {
  // Navigate to /register
  // Click "Already have an account? Log in" link
  // Verify navigation to /login
});

test('can navigate from login to registration', async ({ page }) => {
  // Navigate to /login
  // Click "Don't have an account? Register" link
  // Verify navigation to /register
});
```

**Step 8.8**: Write E2E test - Already authenticated redirect
```typescript
test('redirects to workspace if already authenticated', async ({ page }) => {
  // Login first to get token
  // Try to navigate to /register
  // Verify automatic redirect to /
  // Verify workspace is displayed
});
```

**Step 8.9**: Write E2E test - Complete user journey
```typescript
test('complete registration and login flow', async ({ page }) => {
  // Register new user
  // Wait for redirect to login
  // Login with new credentials
  // Verify workspace loads
  // Verify default pages exist (Home, Catalog, Product, Contact)
});
```

**Step 8.10**: Write E2E test - Responsive behavior
```typescript
test('registration form works on mobile viewport', async ({ page }) => {
  // Set mobile viewport
  // Navigate to registration page
  // Verify form is visible and properly sized
  // Complete registration flow
  // Verify successful registration on mobile
});
```

**Step 8.11**: Run and verify E2E tests
- Start backend server: `docker compose up`
- Run Playwright tests: `npx playwright test e2e/auth/registration.spec.ts`
- Verify all tests pass
- Review test report
- Fix any failing tests
- Run all auth tests together: `npx playwright test e2e/auth/`

**Step 8.12**: Add E2E tests to CI/CD
- Verify GitHub Actions workflow runs Playwright tests
- Ensure backend is available in CI environment
- Add test artifacts upload for failure screenshots
- Configure test retry strategy if needed
- Verify tests run on push to main branch

### Phase 9: Future Enhancements (Post-MVP)

**Not included in MVP but document for future**:
- Email verification (send confirmation email before account activation)
- Password strength indicator with real-time visual feedback
- "Show/hide password" toggle in password field
- Username field (separate from email)
- Terms of service and privacy policy checkboxes
- CAPTCHA or anti-bot protection
- Social registration (Google, GitHub, etc.)
- Shop name availability check (real-time, before form submission)
- Custom shop subdomain or URL
- Profile picture upload during registration
- Welcome email after successful registration
- Onboarding tutorial after first login

## 12. Testing Strategy

### Overview

The Registration View requires comprehensive test coverage across multiple layers:
1. **Unit Tests** - Test individual components and functions in isolation
2. **E2E Tests** - Test the complete user flow from registration to login to workspace

### Unit Testing with Vitest and React Testing Library

**Testing Philosophy**:
- Follow Arrange-Act-Assert pattern
- Test behavior, not implementation details
- Mock external dependencies (API calls, navigation)
- Use accessible queries (getByLabelText, getByRole) over test IDs
- Test user interactions, not internal state

**Test File Structure**:
```
theme-builder/
├── src/                           # Source code
└── tests/                         # Unit tests (app-specific)
    ├── unit/
    │   ├── components/
    │   │   └── auth/
    │   │       ├── LoginForm.test.tsx (existing)
    │   │       └── RegistrationForm.test.tsx (new)
    │   └── lib/
    │       └── api/
    │           └── auth.test.ts (update to include register function)
    └── mocks/
        ├── handlers.ts (update to include register endpoint)
        └── server.ts (existing)

e2e/                               # E2E tests (project root, shared)
└── auth/
    ├── login.spec.ts (existing)
    └── registration.spec.ts (new)
```

**Note**: Unit tests are centralized in `theme-builder/tests/` directory (app-specific). E2E tests use the existing `e2e/` directory at the project root (shared across all apps).

**Vitest Configuration**:
Ensure `theme-builder/vitest.config.ts` includes the correct test pattern:
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

**Key Testing Utilities**:
- `@testing-library/react` - render, screen, waitFor
- `@testing-library/user-event` - Simulate user interactions
- `vitest` - Test runner and assertions (vi.fn(), vi.mock())
- `msw` - Mock Service Worker for API mocking

**RegistrationForm Component Tests**:

1. **Rendering Tests**:
   - Verify all form elements render correctly (email, password, shop name inputs)
   - Check accessibility (labels correctly associated, ARIA attributes)
   - Verify initial state (no errors, button enabled, no success message)
   - Verify login link renders and points to /login

2. **Validation Tests - Email**:
   - Empty email triggers "Email is required" error
   - Invalid email format triggers "Please enter a valid email address" error
   - Valid email passes validation
   - Typing in email field clears email error

3. **Validation Tests - Password**:
   - Empty password triggers "Password is required" error
   - Typing in password field clears password error

4. **Validation Tests - Shop Name**:
   - Empty shop name triggers "Shop name is required" error
   - Short shop name (<3 chars) triggers "Shop name must be at least 3 characters" error
   - Long shop name (>50 chars) triggers "Shop name must be at most 50 characters" error
   - Shop name with invalid characters triggers "Shop name can only contain letters, numbers, spaces, hyphens, and underscores" error
   - Valid shop name passes validation
   - Typing in shop name field clears shop name error

5. **Validation Tests - Form Submission**:
   - Form submission blocked if any validation fails
   - All validation errors displayed when submitting invalid form
   - Form submission proceeds when all fields valid

6. **Successful Registration Tests**:
   - Mock 201 Created API response with userId
   - Fill form with valid data and submit
   - Verify `register()` called with correct payload (email, password, shop_name)
   - Verify success message displayed
   - Verify form inputs disabled after success
   - Verify navigation called to /login after delay
   - Verify NO token saved to localStorage (unlike login)

7. **Error Handling Tests - API Errors**:
   - Mock 409 email_exists → verify "An account with this email already exists" displayed
   - Mock 409 shop_exists → verify "A shop with this name already exists" displayed
   - Mock 400 validation_error → verify API error message displayed
   - Mock 400 with field → verify error mapped to field validation
   - Mock 500 registration_failed → verify "Registration failed. Please try again." displayed
   - Mock network error → verify connection error message displayed
   - Verify form remains interactive after errors

8. **Loading State Tests**:
   - Submit form → verify button disabled
   - Verify button text changes to "Creating Account..."
   - After response → verify loading cleared
   - Verify form inputs enabled during loading (only button disabled)

**Register API Function Tests**:

1. **Successful Registration**:
   - Mock fetch response with 201 and userId
   - Call `register()` with credentials
   - Verify returns `{ userId: '...' }`

2. **Error Responses**:
   - Mock 409 email_exists → verify throws AuthenticationError with code "email_exists"
   - Mock 409 shop_exists → verify throws AuthenticationError with code "shop_exists"
   - Mock 400 validation_error → verify throws with field information if provided
   - Mock 500 → verify throws with generic error message

3. **Network Errors**:
   - Mock fetch rejection → verify throws network error
   - Verify error message is user-friendly

### E2E Testing with Playwright

**Testing Philosophy**:
- Test real user workflows end-to-end
- Use actual backend API (or staging environment)
- Test cross-browser compatibility (Chromium primary)
- Verify visual behavior and navigation
- Test responsive designs on different viewports
- Rely on `data-testid` attributes for element identification

**Test File Location**:
```
e2e/                               # Project root (existing directory)
├── auth/
│   ├── login.spec.ts             # Existing login E2E tests
│   └── registration.spec.ts      # New registration E2E tests
├── demo-shop-navigation.spec.ts  # Existing E2E test
├── global-setup.ts               # Existing global setup
└── helpers/                       # Existing helpers
```

**Note**: E2E tests use the existing `e2e/` directory at the project root. This directory is shared across all apps.

**Playwright Configuration**:
Existing `playwright.config.ts` at project root:
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

**Configuration Details**:
- Base URL: `http://localhost:5173` (or test environment)
- Browsers: Chromium (primary), Firefox, WebKit (optional)
- Viewport: Desktop (1280x720) and Mobile (375x667)
- Test data: Generate unique emails and shop names for each test run

**Key E2E Test Scenarios**:

1. **Happy Path - Successful Registration**:
   - Navigate to `/register`
   - Fill email, password, and shop name with valid data
   - Click submit button
   - Wait for success message
   - Assert success message contains "Account created successfully"
   - Wait for navigation to `/login` (after 2-3 second delay)
   - Verify can log in with new credentials
   - Verify workspace loads after login

2. **Validation Errors**:
   - Navigate to registration page
   - Submit empty form → verify all error messages displayed
   - Fill invalid email → verify format error
   - Fill invalid shop name → verify pattern error
   - Verify errors prevent form submission and navigation

3. **Email Already Exists**:
   - Register first user successfully
   - Try to register again with same email (different shop name)
   - Wait for error alert with "An account with this email already exists"
   - Verify still on registration page
   - Verify can retry with different email

4. **Shop Name Already Exists**:
   - Register first user successfully
   - Try to register with different email but same shop name
   - Wait for error alert with "A shop with this name already exists"
   - Verify still on registration page
   - Verify can retry with different shop name

5. **Loading States**:
   - Fill form and submit
   - Assert button is disabled during request
   - Assert loading text is visible ("Creating Account...")
   - Wait for completion (success or error)

6. **Navigation Between Login and Registration**:
   - Navigate to `/register`
   - Click "Already have an account? Log in" link
   - Verify navigation to `/login`
   - Click "Don't have an account? Register" link
   - Verify navigation back to `/register`

7. **Already Authenticated**:
   - Login first to get token
   - Try to navigate to `/register`
   - Assert automatic redirect to `/`
   - Verify workspace loads

8. **Error Recovery**:
   - Submit with existing email → error shown
   - Clear email field
   - Enter different email → successful registration
   - Verify error cleared on retry

9. **Complete User Journey**:
   - Register new user
   - Wait for redirect to login
   - Login with new credentials
   - Verify workspace loads
   - Verify default pages exist in page selector (Home, Catalog, Product, Contact)
   - Optional: Verify default products exist (requires additional API or UI checks)

10. **Responsive Design**:
    - Set mobile viewport (375x667)
    - Complete entire registration flow on mobile
    - Verify form is usable and properly sized
    - Verify layout doesn't break
    - Verify all interactions work on touch devices

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
npm run test tests/unit/components/auth/RegistrationForm.test.tsx

# Run all auth component tests
npm run test tests/unit/components/auth/
```

**E2E Tests** (run from project root):
```bash
# Run all Playwright tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth/registration.spec.ts

# Run all auth E2E tests
npx playwright test e2e/auth/

# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui

# Generate test report
npx playwright show-report
```

## Implementation Checklist

### Setup and Types
- [ ] Extend `src/types/auth.ts` with registration type definitions
- [ ] Add `RegistrationFormData`, `RegisterRequest`, `RegisterResponse`, `RegisterError`
- [ ] Extend `ValidationErrors` to include `shopName?: string`
- [ ] Verify shadcn/ui components are installed (Input, Alert, Label, Button)

### API Integration
- [ ] Extend `src/lib/api/auth.ts` with register function
- [ ] Reuse existing `AuthenticationError` custom error class
- [ ] Add proper error handling for all response codes (400, 409, 500)
- [ ] Add network error handling

### Component Implementation
- [ ] Create `src/components/auth/RegistrationForm.tsx`
- [ ] Implement form state management (email, password, shopName, errors, loading, success)
- [ ] Implement input change handlers for all three fields
- [ ] Implement comprehensive client-side validation logic (email, password, shop name)
- [ ] Implement form submission handler with API integration
- [ ] Implement error handling for all scenarios (email exists, shop exists, validation, server, network)
- [ ] Implement success state and automatic redirect to login
- [ ] Add loading state to submit button
- [ ] Add link to login page

### Routing Integration
- [ ] Add `/register` route to `src/App.tsx`
- [ ] Apply protected route logic (redirect if authenticated)
- [ ] Add link to registration from `src/components/auth/LoginForm.tsx`

### Manual Testing
- [ ] Test successful registration flow end-to-end with backend
- [ ] Test all validation scenarios (email, password, shop name)
- [ ] Test all error scenarios (email exists, shop exists, validation, server, network)
- [ ] Test success message and automatic redirect
- [ ] Test navigation between login and registration
- [ ] Test responsive design and user experience
- [ ] Verify environment configuration
- [ ] Test complete user journey (register → login → workspace)

### Unit Tests (Vitest)
- [ ] Verify `theme-builder/vitest.config.ts` includes test pattern
- [ ] Create `theme-builder/tests/unit/components/auth/RegistrationForm.test.tsx`
- [ ] Update `theme-builder/tests/unit/lib/api/auth.test.ts` to include register function
- [ ] Update `theme-builder/tests/mocks/handlers.ts` to include register endpoint mock
- [ ] Test RegistrationForm rendering and initial state
- [ ] Test all validation scenarios (email, password, shop name)
- [ ] Test successful registration flow (API call, success message, redirect)
- [ ] Test all error scenarios (email exists, shop exists, validation, server, network)
- [ ] Test loading state behavior
- [ ] Test register API function
- [ ] Run tests and verify >80% coverage

### E2E Tests (Playwright)
- [ ] Verify `playwright.config.ts` has `testDir: './e2e'`
- [ ] Create `e2e/auth/registration.spec.ts`
- [ ] Write test: Successful registration and login flow
- [ ] Write test: Client-side validation errors
- [ ] Write test: Email already exists error
- [ ] Write test: Shop name already exists error
- [ ] Write test: Loading state during submission
- [ ] Write test: Navigation between login and registration
- [ ] Write test: Already authenticated redirect
- [ ] Write test: Error recovery and retry
- [ ] Write test: Responsive behavior on mobile
- [ ] Write test: Complete user journey (register → login → workspace)
- [ ] Run Playwright tests and verify all pass
- [ ] Add E2E tests to CI/CD pipeline (if not already configured)

### Cleanup and Documentation
- [ ] Remove temporary test code and debug logs
- [ ] Add code comments and JSDoc
- [ ] Update documentation (README, API docs, etc.)
- [ ] Verify all tests pass in CI/CD
- [ ] Document any discrepancies found (e.g., API response format)
