<conversation_summary>
<decisions>
1.  **Component Sharing:** Components will be shared between the `theme-builder` and `demo-shop` applications via a common directory (`/shared/components`) using TypeScript path mapping and bundler aliases for clean imports.
2.  **Styling:** Each component will be self-contained with its own co-located CSS module file. Global theme settings (colors, fonts) will be applied by the host applications using CSS Custom Properties.
3.  **Data Flow Architecture:** The project will use the **Container/Presentational Pattern**.
    *   **Presentational Components:** Dumb, reusable UI components located in `/shared/components`.
    *   **Container Components:** Smart components located in `/demo-shop/src/containers` that handle data fetching and pass data as props to presentational components.
4.  **Component Configuration:** For static pages, all configurable data will be stored as a single JSON `props` object in the database for each component instance. For the MVP, dynamic data configurations will be simple (e.g., a list of IDs).
5.  **Data Fetching:** Data fetching logic will be encapsulated in entity-specific reusable hooks (e.g., `useProducts`) within the `demo-shop`. These hooks will interact with a centralized API service layer that manages the actual `fetch` calls.
6.  **Component Structure:** A standardized file structure will be used for all shared components: `ComponentName/`, containing `ComponentName.tsx`, `types.ts`, and `ComponentName.module.css`. An `index.ts` will serve as the public export point.
7.  **Component Definition:** Each component's `types.ts` file will define its props via both a TypeScript `interface` for static analysis and a `Zod` schema for runtime validation.
8.  **Editor Integration:** A `meta` object will be defined for each component to inform the `theme-builder`'s editor UI, allowing for the dynamic generation of editing forms.
9.  **State & Performance:** The `theme-builder` will use local React state for editing modals. The `demo-shop` will feature parallel, component-level data fetching with loading states (skeletons) and error states handled by passing `isLoading` and `error` props to presentational components.
10. **Dynamic Pages:** The "Catalog" and "Product" pages are dynamic templates. Their primary data context (e.g., `categoryId`, `productId`) will be derived from the URL at runtime, not from static configuration.
</decisions>
<matched_recommendations>
1.  **TypeScript Path Mapping:** The decision was made to use TypeScript path aliases (`@shared/components`) combined with bundler-specific resolve aliases (Vite for `theme-builder`, React Router for `demo-shop`) to enable clean imports from the shared components directory without the overhead of package management.
2.  **Container/Presentational Pattern:** This recommendation was adopted as the core architectural pattern to separate UI concerns from data-fetching logic, enabling parallel data loading and high reusability.
3.  **Co-located Styles:** The recommendation to co-locate styles with component logic was approved to ensure components are self-contained and render consistently across applications.
4.  **Entity-Specific Data Hooks:** The strategy to create reusable hooks like `useProducts` in the `demo-shop` was confirmed to encapsulate API logic and state management cleanly.
5.  **Component Meta Manifest:** The proposal to have each component export a `meta` object to define its editable properties for the theme editor was accepted.
6.  **Unified Props Object:** The recommendation to treat all configurable data as a single props object was approved to simplify the data model and the editor's functionality.
7.  **Co-located Types and Schemas:** The decision was made to define the TypeScript interface and Zod schema together in each component's `types.ts` file for consistency and maintainability.
8.  **Central API Service Layer:** The recommendation to create a central API service in the `demo-shop` to abstract `fetch` calls was approved to keep data-fetching hooks clean and focused on state management.
</matched_recommendations>
<components_architecture_planning_summary>
### 1. Main Components Architecture Requirements
The architecture is designed around two types of pages: **static pages** (Home, Contact) composed of configurable content blocks, and **dynamic template pages** (Catalog, Product Details) that render data based on the URL. The core principles are **reusability**, **separation of concerns**, and **performance**.

### 2. Component Types
All 13 components are **Content Components** - reusable, configurable blocks that users can place on any page. Their content (e.g., text, image URLs, lists of product IDs) is stored in the database as part of the page layout.

The architecture treats all components uniformly - they all follow the same structure and rendering pattern, and can be used on any of the four page types (Home, Product Catalog, Product Detail, Contact).

### 3. Common Structure for All Components
Every component in the `/shared/components` library will adhere to the following structure and contract:
*   **File Structure:**
    ```
    /shared/components/ComponentName/
    ├── ComponentName.tsx       # The React component logic (presentational).
    ├── ComponentName.module.css # Co-located styles for the component.
    ├── types.ts                # Exports the TypeScript interface and Zod schema for props.
    ├── meta.ts                 # (For Content Components) Exports the meta object for the theme editor.
    └── index.ts                # Exports the component, types, meta, etc.
    ```
*   **Props Contract:** Every component will accept a props object that includes:
    *   `isLoading: boolean`: To render a skeleton state.
    *   `error: Error | null`: To render an error state.
    *   All other data required for rendering.

### 4. List of Components (MVP)

All 14 components are defined below, matching the spec exactly. Each component is a Content Component that can be placed on pages by users.

1.  **Heading:**
    *   **Data:** `text: string`, `level: string` (H1/H2/H3), `backgroundImageUrl?: string`.
    *   **Variants:** Text only, Text with background image, Text with backgrund color.
    *   **Editable:** Heading text, heading level (H1/H2/H3), height, background image (for variant with image), background color (for variant with color).

2.  **Header/Navigation:**
    *   **Data:** `logoUrl: string`, `logoPosition: string` (left/center).
    *   **Static data:** Menu links - built in the component to reflect the 4 available pages (Home, Product Catalog, Product Detail, Contact).
    *   **Variants:** Sticky/static, simple horizontal, slide-in left.
    *   **Editable:** Logo, logo position (left/center).

3.  **Footer:**
    *   **Data:** `sections: { title: string, links: { text: string, url: string }[] }[]`, `copyrightText: string`.
    *   **Variants:** 1/2/3/4 columns.
    *   **Editable:** Sections (About, Contact, Social media), links, copyright text.

4.  **Hero/Full-Width Banner:**
    *   **Data:** `title: string`, `subtitle: string`, `ctaButtonText: string`, `ctaButtonLink: string`, `backgroundImageUrl?: string`, `videoUrl?: string`.
    *   **Variants:** Full-width with background image, with video, split layout (image + text).
    *   **Editable:** Title, subtitle, CTA button, background image/video.

5.  **Text Section:**
    *   **Data:** `columns: { text: string, iconUrl?: string, imageUrl?: string }[]`.
    *   **Variants:** 1/2/3/4 columns, with icons, with images.
    *   **Editable:** Text content, optional images.

6.  **Call-to-Action (CTA) Block:**
    *   **Data:** `header: string`, `text: string`, `buttonText: string`, `buttonLink: string`, `backgroundImageUrl?: string`.
    *   **Variants:** Full-width, box with shadow, with background image.
    *   **Editable:** Header, text, button, background image.

7.  **Product List/Grid:**
    *   **Data:** `productsPerRow: number`
    *   **Variants:** 2/3/4/6 products per row.

8.  **Featured Products:**
    *   **Data:** `productIds: string[]` (max 8-12 products).
    *   **Variants:** Carousel, grid, list.
    *   **Editable:** Manual product selection from mock catalog (max 8-12 products).
    *   **Use:** Home page, promotional sections.

9.  **Product Detail View:**
    *   **Data:** `productId: string`, `visibleFields: string[]` (price, description, specs, reviews).
    *   **Variants:** Large image gallery, compact view, with quick specifications.
    *   **Editable:** Product selection, visible fields (price, description, specs, reviews).
    *   **Use:** Product detail page.

10. **Review/Testimonial Section:**
    *   **Data:** `reviews: { name: string, content: string, rating: number, avatarUrl?: string }[]`.
    *   **Variants:** Carousel, 2/3 column grid, list.
    *   **Editable:** Add reviews (name, content, rating, avatar).

11. **Contact Form:**
    *   **Data:** `title: string`, `infoText: string`, `visibleFields: string[]` (name, email, phone, message, subject).
    *   **Variants:** Simple (name, email, message), extended (+ phone, subject).
    *   **Editable:** Section title, info text, visible fields.

12. **Image Gallery:**
    *   **Data:** `images: { url: string, alt: string }[]`.
    *   **Variants:** Masonry, equal grid, carousel, lightbox.
    *   **Editable:** Upload images, alt descriptions.

13. **Map/Location Block:**
    *   **Data:** `address: string`, `coordinates?: { lat: number, lng: number }`, `infoText: string`, `zoomLevel: number`.
    *   **Variants:** Full-width map, split (map + info), compact embed.
    *   **Editable:** Address/coordinates, info text, map zoom level.

14. **CategoryPills:**
    *   **Data:** `categories: { id: number, name: string }[]`, `activeCategoryId?: number` (derived from URL).
    *   **Variants:** Align left, centered, full width (stretched)
    *   **Editable:** None - categories are automatically fetched from database via `GET /api/demo/categories`.
    *   **Use:** Catalog page for category navigation.
    *   **Behavior:** Displays product categories as clickable navigation elements. Clicking a category navigates to `/catalog/:categoryId` to filter products. Automatically highlights active category based on URL parameter. Includes "All Products" option for viewing unfiltered catalog.

### 5. Architectural and Performance Considerations
*   **Routing and Data Loading:** The `demo-shop` will use React Router v7 loaders to fetch the necessary data for dynamic pages (e.g., getting a `productId` from the URL and fetching the product, or a `categoryId` for filtering products by category).
*   **Parallel Data Fetching:** For static pages, the container/presentational model allows each Content Component to fetch its data needs in parallel.
*   **Code Splitting:** The page renderer should use `React.lazy()` to dynamically import only the components needed for a specific page, reducing the initial bundle size.
*   **Type Safety:** A dual approach of TypeScript for static analysis and Zod for runtime validation will be used to ensure data integrity from the API to the rendered component.

</components_architecture_planning_summary>
<unresolved_issues>
*   **Component Variants with Different Data:** It is currently assumed that variants are purely stylistic. The question of whether a variant can change the fundamental data schema of a component (e.g., a "Video Hero" variant needing a `videoUrl` instead of `backgroundImageUrl`) is unresolved. This needs to be clarified as components are implemented. If variants require different data, they may need to be treated as distinct components.
</unresolved_issues>
</conversation_summary>
