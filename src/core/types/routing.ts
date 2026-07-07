export type AppSurface = "marketing" | "platform" | "admin" | "tenant-site";

export type TenantUrlMode = "path" | "subdomain" | "custom-domain";

export interface ResolvedRequest {
  surface: AppSurface;
  host: string;
  pathname: string;
  tenantHandle?: string;
  urlMode?: TenantUrlMode;
}