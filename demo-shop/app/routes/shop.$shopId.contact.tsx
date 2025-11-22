import { useEffect } from "react";
import { useLoaderData, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/shop.$shopId.contact";
import { buildApiUrl } from "~/lib/api";
import { isValidUuid } from "~/lib/validation";
import type { ShopPageLoaderData, PageLayoutData } from "~/types/shop";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import DynamicComponentRenderer from "~/components/DynamicComponentRenderer";

export async function loader({ params }: Route.LoaderArgs) {
  const { shopId } = params;

  // Validate shopId format before making API call
  if (!shopId || !isValidUuid(shopId)) {
    throw new Response("Invalid shop ID format", { status: 400 });
  }

  try {
    // Fetch contact page data from public API
    const response = await fetch(
      buildApiUrl(`/api/public/shops/${shopId}/pages/contact`)
    );

    // Handle non-success responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Contact page not found", { status: 404 });
      }
      throw new Response("Failed to load contact page data", { status: 500 });
    }

    // Parse JSON response
    const pageData: PageLayoutData = await response.json();

    // Return aggregated loader data
    const loaderData: ShopPageLoaderData = {
      shopId,
      page: pageData,
      theme: {}, // TODO: Fetch theme settings in future iteration
    };

    return loaderData;
  } catch (error) {
    // Handle network errors and re-throw Response errors
    if (error instanceof Response) {
      throw error;
    }
    console.error("Error loading contact page data:", error);
    throw new Response("Failed to load contact page data", { status: 500 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [
      { title: "Page Not Found" },
      { name: "description", content: "The requested page could not be found." },
    ];
  }
  return [
    { title: `Contact Us - Shop ${data.shopId}` },
    { name: "description", content: "Get in touch with us." },
  ];
}

export default function ShopContactRoute() {
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
      <DynamicComponentRenderer layout={data.page} themeSettings={data.theme} runtimeProps={{ shopId: data.shopId }} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Handle React Router HTTP errors
  if (isRouteErrorResponse(error)) {
    let title = "Error";
    let description = "An unexpected error occurred";

    switch (error.status) {
      case 400:
        title = "Invalid Shop ID";
        description = "The shop ID provided is not valid. Please check the URL and try again.";
        break;
      case 404:
        title = "Contact Page Not Found";
        description = "The contact page for this shop doesn't exist or has been removed.";
        break;
      case 500:
        title = "Server Error";
        description = "We're having trouble loading this contact page. Please try again later.";
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
