import { useEffect } from "react";
import { useLoaderData, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/shop.$shopId.catalog";
import { buildApiUrl } from "~/lib/api";
import { isValidUuid } from "~/lib/validation";
import type { ShopPageLoaderData, PageLayoutData } from "~/types/shop";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import DynamicComponentRenderer from "~/components/DynamicComponentRenderer";

/**
 * Loader function that fetches catalog page layout from the API
 *
 * Note: Product data is now fetched client-side by ProductListGridContainer
 * using the useProducts hook, which automatically responds to URL category
 * parameter changes. This provides a consistent pattern with CategoryPillsContainer.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const { shopId } = params;

  // Validate shopId format
  if (!shopId || !isValidUuid(shopId)) {
    throw new Response("Invalid shop ID format", { status: 400 });
  }

  try {
    // Fetch page layout
    const response = await fetch(buildApiUrl(`/api/public/shops/${shopId}/pages/catalog`));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Catalog page not found", { status: 404 });
      }
      throw new Response("Failed to load catalog page", { status: 500 });
    }

    const pageData: PageLayoutData = await response.json();

    // Return aggregated loader data
    const loaderData: ShopPageLoaderData = {
      shopId,
      page: pageData,
      theme: {}, // TODO: Fetch theme settings in future iteration
    };

    return loaderData;
  } catch (error) {
    // Handle React Router Response errors
    if (error instanceof Response) {
      throw error;
    }

    // Handle network errors
    console.error("Error loading catalog data:", error);
    throw new Response("Failed to load catalog data", { status: 500 });
  }
}

/**
 * Shop Catalog Route Component
 * Displays the catalog page with dynamic components
 *
 * Category filtering is handled client-side by ProductListGridContainer
 * which uses the useProducts hook to fetch filtered data based on URL params.
 */
export default function ShopCatalogRoute() {
  const data = useLoaderData<typeof loader>();

  // Apply theme settings via CSS custom properties
  useEffect(() => {
    if (data.theme.colors) {
      const root = document.documentElement;
      if (data.theme.colors.primary) {
        root.style.setProperty('--color-primary', data.theme.colors.primary);
      }
      if (data.theme.colors.secondary) {
        root.style.setProperty('--color-secondary', data.theme.colors.secondary);
      }
      if (data.theme.colors.background) {
        root.style.setProperty('--color-background', data.theme.colors.background);
      }
      if (data.theme.colors.text) {
        root.style.setProperty('--color-text', data.theme.colors.text);
      }
    }

    if (data.theme.fonts) {
      const root = document.documentElement;
      if (data.theme.fonts.heading) {
        root.style.setProperty('--font-heading', data.theme.fonts.heading);
      }
      if (data.theme.fonts.body) {
        root.style.setProperty('--font-body', data.theme.fonts.body);
      }
    }
  }, [data.theme]);

  return (
    <div className="min-h-screen">
      <DynamicComponentRenderer
        layout={data.page}
        themeSettings={data.theme}
        runtimeProps={{ shopId: data.shopId }}
      />
    </div>
  );
}

/**
 * Error Boundary Component
 * Displays user-friendly error messages for different error scenarios
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Handle React Router HTTP errors
  if (isRouteErrorResponse(error)) {
    let title = "Error";
    let description = "An unexpected error occurred";

    switch (error.status) {
      case 400:
        title = "Invalid Request";
        description = "The request is not valid. Please check the URL and try again.";
        break;
      case 404:
        title = "Catalog Not Found";
        description = "The catalog page doesn't exist or has been removed.";
        break;
      case 500:
        title = "Server Error";
        description = "We're having trouble loading the catalog. Please try again later.";
        break;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTitle className="text-lg font-semibold mb-2">
              {title}
            </AlertTitle>
            <AlertDescription className="mb-4">
              {description}
            </AlertDescription>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
                Status: {error.status}
                {"\n"}
                {error.data}
              </pre>
            )}
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle unexpected React rendering errors
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertTitle className="text-lg font-semibold mb-2">
            Unexpected Error
          </AlertTitle>
          <AlertDescription className="mb-4">
            Something went wrong while rendering this page. Please try refreshing.
          </AlertDescription>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          )}
        </Alert>
        <div className="mt-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Prevent loader from re-running when only search params change
 * This ensures SPA-like behavior for category filtering without page re-renders
 */
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: { currentUrl: URL; nextUrl: URL; defaultShouldRevalidate: boolean }) {
  // Only revalidate if the pathname changes (not search params)
  // This prevents loader re-runs when category filter changes via URL params
  if (currentUrl.pathname !== nextUrl.pathname) {
    return defaultShouldRevalidate;
  }

  return false;
}

/**
 * Meta function for SEO
 */
export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [
      { title: "Catalog Not Found" },
      { name: "description", content: "The requested catalog could not be found." },
    ];
  }

  return [
    { title: "Product Catalog" },
    { name: "description", content: "Browse our extensive collection of quality products" },
  ];
}
