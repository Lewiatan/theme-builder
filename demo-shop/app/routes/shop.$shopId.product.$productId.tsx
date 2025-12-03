import { useEffect } from "react";
import { useLoaderData, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/shop.$shopId.product.$productId";
import { buildApiUrl } from "~/lib/api";
import { isValidUuid } from "~/lib/validation";
import { fetchProductById } from "~/lib/api-products";
import type { PageLayoutData } from "~/types/shop";
import type { Product } from "@shared/components/ProductListGrid/types";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import DynamicComponentRenderer from "~/components/DynamicComponentRenderer";

/**
 * Loader data shape for the product page
 */
interface ShopProductPageLoaderData {
  shopId: string;
  page: PageLayoutData;
  product: Product;
  theme: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
  };
}

/**
 * Loader function that fetches product page layout and product data from the API
 *
 * Validates URL parameters, fetches page layout and product data in parallel,
 * and returns combined data for the route component.
 */
export async function loader({ params }: Route.LoaderArgs): Promise<ShopProductPageLoaderData> {
  const { shopId, productId } = params;

  // Validate shopId format
  if (!shopId || !isValidUuid(shopId)) {
    throw new Response("Invalid shop ID format", { status: 400 });
  }

  // Validate and parse productId
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId) || parsedProductId <= 0) {
    throw new Response("Invalid product ID", { status: 400 });
  }

  try {
    // Fetch page layout and product data in parallel
    const [pageResponse, product] = await Promise.all([
      fetch(buildApiUrl(`/api/public/shops/${shopId}/pages/product`)),
      fetchProductById(parsedProductId),
    ]);

    // Handle page layout response
    if (!pageResponse.ok) {
      if (pageResponse.status === 404) {
        throw new Response("Product page not found", { status: 404 });
      }
      throw new Response("Failed to load product page", { status: 500 });
    }

    const pageData: PageLayoutData = await pageResponse.json();

    // Return aggregated loader data
    const loaderData: ShopProductPageLoaderData = {
      shopId,
      page: pageData,
      product,
      theme: {}, // TODO: Fetch theme settings in future iteration
    };

    return loaderData;
  } catch (error) {
    // Handle React Router Response errors
    if (error instanceof Response) {
      throw error;
    }

    // Handle product not found errors from fetchProductById
    if (error instanceof Error && error.message.includes('not found')) {
      throw new Response(error.message, { status: 404 });
    }

    // Handle network errors
    console.error("Error loading product data:", error);
    throw new Response("Failed to load product data", { status: 500 });
  }
}

/**
 * Shop Product Route Component
 * Displays the product page with dynamic components
 *
 * Product data is injected into components via runtimeProps
 */
export default function ShopProductRoute() {
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
        runtimeProps={{ shopId: data.shopId, product: data.product }}
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
        title = "Product Not Found";
        description = "This product doesn't exist or has been removed.";
        break;
      case 500:
        title = "Server Error";
        description = "We're having trouble loading this product. Please try again later.";
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
          <div className="flex gap-4 mt-6">
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
            An unexpected error occurred while loading the product page.
          </AlertDescription>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          )}
        </Alert>
        <div className="flex gap-4 mt-6">
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
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Meta function to set page title and description
 */
export function meta({ data }: Route.MetaArgs) {
  if (!data || !('product' in data)) {
    return [
      { title: "Product Not Found" },
      { name: "description", content: "The requested product could not be found." },
    ];
  }

  const productData = data as ShopProductPageLoaderData;

  return [
    { title: `${productData.product.name} | Demo Shop` },
    { name: "description", content: productData.product.description },
  ];
}
