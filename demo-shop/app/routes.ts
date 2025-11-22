import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shop/:shopId", "routes/shop.$shopId.tsx"),
  route("shop/:shopId/catalog", "routes/shop.$shopId.catalog.tsx"),
  route("shop/:shopId/contact", "routes/shop.$shopId.contact.tsx"),
] satisfies RouteConfig;
