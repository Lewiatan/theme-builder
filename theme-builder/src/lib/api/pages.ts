import { apiRequest } from './client';
import type {
  PagesResponse,
  PageData,
  PageType,
  ComponentDefinition,
} from '../../types/api';
import { PagesResponseSchema, PageDataSchema } from '../../types/api';

// GET /api/pages
export async function fetchAllPages(): Promise<PagesResponse> {
  const data = await apiRequest<PagesResponse>('/api/pages', {
    method: 'GET',
  });

  // Validate response with Zod
  const validated = PagesResponseSchema.parse(data);
  return validated;
}

// GET /api/pages/{type}
export async function fetchPageByType(type: PageType): Promise<PageData> {
  const data = await apiRequest<PageData>(`/api/pages/${type}`, {
    method: 'GET',
  });

  // Validate response with Zod
  const validated = PageDataSchema.parse(data);
  return validated;
}

// PUT /api/pages/{type}
export async function updatePageLayout(
  type: PageType,
  layout: ComponentDefinition[]
): Promise<PageData> {
  const data = await apiRequest<PageData>(`/api/pages/${type}`, {
    method: 'PUT',
    body: JSON.stringify({ layout }),
  });

  // Validate response with Zod
  const validated = PageDataSchema.parse(data);
  return validated;
}

// POST /api/pages/{type}/reset
export async function resetPageToDefault(type: PageType): Promise<PageData> {
  const data = await apiRequest<PageData>(`/api/pages/${type}/reset`, {
    method: 'POST',
  });

  // Validate response with Zod
  const validated = PageDataSchema.parse(data);
  return validated;
}
