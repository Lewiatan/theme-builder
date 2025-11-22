# Product Requirements Document (PRD) - E-commerce Theme Builder

## 1. Product Overview
The E-commerce Theme Builder is a Minimum Viable Product (MVP) application that allows non-technical shop owners to create and customize the appearance of their online store through a visual drag-and-drop interface. Users can build pages using a library of predefined, responsive components, customize their content, and change the global look and feel of the theme, such as colors and fonts.

The system consists of three separate applications:
- **Theme Builder**: A React-based visual editor where authenticated users design and customize their shop pages
- **Demo Shop**: A separate React Router v7 application where users can preview their published shop as customers would see it
- **Backend API**: A Symfony REST API that manages data persistence, authentication, and business logic

The primary goal of this project is to create a functional product MVP while also becoming the part for a future E-commerce SaaS platform. The application emphasizes intuitiveness and ease of use, enabling users to quickly achieve their desired results without writing any code.

## 2. User Problem
Many owners of small and medium-sized e-commerce businesses lack the technical skills or budget to hire developers to create or modify a professional-looking online store. Existing platforms can be too complex, limited in customization options, or require coding knowledge, which presents a barrier to entry. As a result, entrepreneurs spend too much time struggling with tools instead of focusing on growing their business.

The E-commerce Theme Builder solves this problem by offering a fully visual environment where building a page is like assembling blocks. The target user, the "non-technical shop owner," needs a tool that is simple, intuitive, and allows them to independently manage their store's appearance, giving them full control over their brand and customer experience.

## 3. Functional Requirements

### 3.1. User Interface and Workspace
- The Theme Builder application is a React Single Page Application (SPA) consisting of four main sections:
  - Top Navigation Bar: Contains a page selection menu, an unsaved changes indicator, and action buttons (Reset, Save, Demo, Theme Settings).
  - Left Sidebar: A library of available components that can be dragged into the workspace.
  - Central Workspace (Canvas): The main area where the user arranges and edits components. It functions as a live preview.
  - Right Sidebar: A collapsible panel for managing global theme settings (colors, fonts).
- All data operations are performed via REST API calls to the backend.

### 3.2. Component System
- Users can build pages by dragging components from the left panel onto the workspace.
- Components can only be stacked vertically (one below another).
- Hovering over a component in the workspace reveals controls: a settings icon (cogwheel), a delete button, and drag handles.
- Components can have predefined variants (e.g., a text section with 1, 2, or 3 columns) that the user can select in its settings.
- Editing component content (text, images, links) is done in a modal window that opens after clicking the settings icon.

### 3.3. Editing Modals
- Changes made in the modal window are temporary and are not reflected live in the workspace.
- Changes are applied to the workspace only after clicking the "Apply" button.
- The "Cancel" button closes the modal, discarding all changes. If changes have been made, a confirmation prompt will appear.
- The modal cannot be closed by clicking the background to prevent accidental loss of changes.

### 3.4. Page Management
- Upon first registration, four pages are automatically created for the user: Home, Catalog, Product, and Contact.
- Each of these pages is pre-populated with a default component layout.
- The user can switch between pages using a dropdown menu in the top bar.

### 3.5. Theme Settings
- The user can modify global theme settings (color palette, font family) in the collapsible right sidebar.
- Changes to theme settings are immediately visible in the workspace.
- Saving theme settings is done independently of saving page changes, via a dedicated "Save" button in the panel.

### 3.6. Saving and Resetting
- Changes to the page layout and content are saved using the "Save" button in the top bar.
- The "Reset" button in the top bar discards unsaved page changes and restores the last saved state.
- The theme settings panel has a separate button to reset unsaved theme changes.
- All reset actions require user confirmation.
- If the workspace is empty (all components have been deleted), a "Restore Default Layout" button will appear.
- Restoring the layout works only for the currently edited page.

### 3.7. Unsaved Changes Protection
- If the user attempts to navigate away (e.g., by switching pages, logging out, closing the browser tab) with unsaved changes (to the page, theme, or both), a dialog box will appear with a warning and options to "Stay" or "Leave without saving."

### 3.8. Preview (Demo Store)
- The "Demo" button opens a separate application (Demo Shop) in a new tab, which renders only the saved state of the pages and theme.
- The Demo Shop is a standalone React Router v7 application, completely separate from the Theme Builder.
- The Demo Shop uses the **same React component library** as the Theme Builder workspace to ensure visual consistency.
- React Router loaders fetch saved theme/page layout data (JSON) and mock products from the backend API.
- The shared component registry maps the JSON layout configuration to rendered React components.
- Mock product catalog is stored in the database and accessed via REST API endpoints.
- **Category Navigation:** The Catalog page includes category filtering via a CategoryPills component that displays product categories and allows visitors to browse products by category using URL-based navigation (`/catalog/:categoryId`).
- **Technical Note:** Demo Shop uses client-side rendering in MVP (no Server-Side Rendering).

### 3.9. Authentication
- The system requires user registration and login via JWT-based authentication.
- Authentication is handled by the backend API (Symfony with LexikJWTAuthenticationBundle).
- Each user has access only to their own templates and data.
- Theme Builder requires authentication; Demo Shop is publicly accessible (read-only).

### 3.10. Image Handling
- In the MVP, there is no central media library. The user must upload images individually for each component that requires one.
- Images are uploaded via the backend API to Cloudflare R2 (S3-compatible storage).
- The API validates user permissions and file types before storing images.

## 4. Product Boundaries

### Features Included in MVP:
- Full drag-and-drop functionality for managing components on a page.
- All 14 defined components with their variants and content editing options.
- User authentication system (registration, login) via JWT tokens.
- Separate save mechanisms for page layout and global theme settings.
- Functionality to reset changes to the last saved state.
- Protection against losing unsaved changes.
- A separate Demo Shop application for previewing the saved store with mock data from database.
- REST API backend for all data operations and authentication.
- Automatic creation of 4 default pages with a predefined layout for new users.
- All components must be responsive and display correctly on mobile devices, tablets, and desktops.

### Features Excluded from MVP:
- "Forgot password" functionality.
- A global media library.
- The ability to set Header and Footer components as global (in the MVP, they are page-specific).
- Undo/Redo functionality.
- Auto-saving.
- Creation of custom components or modification of their structure.
- Viewport switcher (desktop/tablet/mobile) in the editor.
- Integration with a real product database.
- Server-Side Rendering (SSR) for Demo Shop (client-side rendering only in MVP).
- Template versioning.

## 5. User Stories

### Authentication and Onboarding
---
- ID: US-001
- Title: New user registration
- Description: As a new user, I want to be able to create an account using an email and password to access the application.
- Acceptance Criteria:
  - The registration form includes fields for email and password.
  - Validation checks if the email is in a correct format and if the password meets minimum security requirements.
  - After successful registration, I receive a success message and am redirected to the login page.
  - The system automatically creates 4 pages for me (Home, Catalog, Product, Contact) with a predefined layout.
  - After my first login, I am redirected directly to the workspace with the home page and a default layout loaded.

- ID: US-002
- Title: User login
- Description: As an existing user, I want to be able to log into my account to continue working on my store.
- Acceptance Criteria:
  - The login form includes fields for email and password.
  - A clear error message is displayed if incorrect credentials are provided.
  - Upon successful login, I am redirected to the workspace.

- ID: US-003
- Title: User logout
- Description: As a logged-in user, I want to be able to log out to securely end my session.
- Acceptance Criteria:
  - There is a "Logout" button in the interface.
  - After clicking the button, my session is terminated, and I am redirected to the login page.

### Page and Component Management
---
- ID: US-004
- Title: Adding a component to the page
- Description: As a user, I want to be able to drag a component from the left panel and drop it in a chosen location on the page to add a new element.
- Acceptance Criteria:
  - While dragging a component over the workspace, an indicator shows where it will be dropped.
  - After dropping, the component appears on the page with default content.
  - Adding a new component activates the "Unsaved changes" status.

- ID: US-005
- Title: Reordering components
- Description: As a user, I want to be able to reorder components on the page by dragging and dropping them to customize the layout.
- Acceptance Criteria:
  - A drag handle appears when I hover over a component.
  - While dragging, an indicator of the potential new position is visible.
  - After dropping the component, the page layout updates.
  - Reordering components activates the "Unsaved changes" status.

- ID: US-006
- Title: Deleting a component from the page
- Description: As a user, I want to be able to delete a component from the page to remove unwanted elements.
- Acceptance Criteria:
  - A delete icon appears when I hover over a component.
  - A confirmation dialog appears after clicking the icon.
  - After confirmation, the component is removed from the page.
  - Deleting a component activates the "Unsaved changes" status.

- ID: US-007
- Title: Editing component content
- Description: As a user, I want to be able to edit the content of a component (texts, images, links) to personalize my page.
- Acceptance Criteria:
  - Clicking the settings icon on a component opens a modal window with editing fields.
  - After making changes and clicking "Apply," the changes are visible in the workspace.
  - Applying changes activates the "Unsaved changes" status.
  - Clicking "Cancel" closes the modal without applying changes.

- ID: US-008
- Title: Changing a component variant
- Description: As a user, I want to be able to change the variant of a component (e.g., from a 2 to 3-column layout) to fit my needs.
- Acceptance Criteria:
  - The component settings modal includes an option to select a variant.
  - After selecting a new variant and clicking "Apply," the component in the workspace changes its appearance.
  - Common data (e.g., a heading) is preserved when changing the variant, if possible.
  - Changing a variant activates the "Unsaved changes" status.

### Saving and Resetting Progress
---
- ID: US-009
- Title: Saving page changes
- Description: As a user, I want to be able to save the changes to the layout and content of the page so I don't lose my work.
- Acceptance Criteria:
  - When there are unsaved changes on the page, the "Save" button in the top bar is active.
  - After clicking the "Save" button, the changes are saved to the database.
  - A toast notification appears after a successful save (e.g., "Changes have been saved").
  - After saving, the "Unsaved changes" status disappears, and the "Save" button becomes inactive.

- ID: US-010
- Title: Resetting page changes
- Description: As a user, I want to be able to discard all unsaved changes on the page and restore its last saved state.
- Acceptance Criteria:
  - When there are unsaved changes on the page, the "Reset" button is active.
  - A confirmation prompt appears after clicking the "Reset" button.
  - After confirmation, the workspace is refreshed to the last saved state.
  - The "Unsaved changes" status disappears, and the "Reset" buttons become inactive.

- ID: US-011
- Title: Protection against losing unsaved page changes
- Description: As a user, I want to be warned when I try to leave the editor with unsaved page changes to avoid accidentally losing them.
- Acceptance Criteria:
  - If I have unsaved changes and try to switch pages in the editor, a warning dialog appears.
  - If I have unsaved changes and try to close the tab or navigate to another page in the application, the browser displays a native warning.
  - The dialog gives me the choice to "Stay" or "Leave without saving."

### Theme Settings
---
- ID: US-012
- Title: Customizing the global theme
- Description: As a user, I want to be able to change the global color palette and fonts to match my store's brand.
- Acceptance Criteria:
  - Clicking the cogwheel icon in the top bar opens the right sidebar with theme settings.
  - Changing the color or font in the panel is immediately reflected on all components in the workspace.
  - Making a change to the theme activates the "Save" button in the panel.

- ID: US-013
- Title: Saving theme settings
- Description: As a user, I want to be able to save changes to the theme settings so they are applied throughout my store.
- Acceptance Criteria:
  - After clicking "Save" button, the changes are saved to the database.
  - A "toast" notification confirms the successful save.
  - The save button becomes inactive.
  - Saving the theme is independent of saving page changes.

- ID: US-014
- Title: Resetting unsaved theme changes
- Description: As a user, I want to be able to discard unsaved changes to the theme to restore the previous settings.
- Acceptance Criteria:
  - The theme settings panel includes a "Reset" button.
  - After clicking and confirming, the theme settings revert to the last saved state, and the changes in the workspace are undone.

- ID: US-015
- Title: Protection against losing unsaved theme changes
- Description: As a user, I want to be warned when I try to leave the editor with unsaved theme changes.
- Acceptance Criteria:
  - If I have unsaved theme changes (and only theme changes) and try to leave the page, a dialog box appears with the message "You have unsaved theme settings."
  - If I have unsaved changes to both the page and the theme, the message reads: "You have unsaved page changes and theme settings."

### Preview
---
- ID: US-016
- Title: Previewing the saved store
- Description: As a user, I want to be able to see what my store will look like to customers to verify the changes I have made and saved.
- Acceptance Criteria:
  - Clicking the "Demo" button in the top bar opens a new browser tab.
  - The opened page (Demo Store) renders the store's home page.
  - The Demo Store view reflects only the last saved state of the page and theme.
  - Product components in the Demo Store are populated with mock data.
  - Navigation in the Demo Store (e.g., the header menu) allows moving between the saved versions of pages (Home, Catalog, etc.).

- ID: US-017
- Title: Browsing products by category in Demo Store
- Description: As a store visitor viewing the Demo Store, I want to browse products by category to easily find products that interest me.
- Acceptance Criteria:
  - The Catalog page displays category navigation via a CategoryPills component.
  - Clicking a category pill navigates to `/catalog/:categoryId` and filters products to show only items in that category.
  - Clicking "All Products" pill shows all products without category filtering.
  - The active category is visually highlighted in the category navigation.
  - Categories are automatically fetched from the database with no manual configuration required.

## 6. Success Metrics

### Functional Metrics:
- All 14 defined components are fully functional, including variant selection and content editing.
- The save and reset mechanisms for pages and the theme work reliably and according to specification.
- The authentication system correctly manages user sessions and isolates their data via JWT tokens.
- The CI/CD pipeline is fully operational, automating testing and deployment.
- Both frontend applications (Theme Builder and Demo Shop) are deployed and publicly accessible on Cloudflare Pages.
- Backend API is deployed and accessible on Render.

### User-Centric Metrics:
- Primary Metric: A new, non-technical user is able to create, customize, and save a complete page within 20 minutes of their first registration.
- Low churn rate during the onboarding process and first-page creation.
- Positive user feedback regarding ease of use and interface intuitiveness.

### Technical Metrics:
- The final appearance of the store in Demo Shop application is fully responsive and renders correctly on popular browsers and on mobile, tablet, and desktop devices.
- The loading time for the Theme Builder and Demo Shop is acceptable to the user.
- Component rendering is consistent between Theme Builder workspace preview and Demo Shop (achieved through shared component library).
- API response times are within acceptable limits.
- No critical errors are reported by the monitoring system.
