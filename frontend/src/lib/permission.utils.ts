import type { PermissionMatrixItem } from "@/modules/users/types/permission.interface";

/** * Groups permission slugs by their resource prefix (e.g. "assignment", "user")
 */
export function groupByResource(items: PermissionMatrixItem[]) {
  const groups = new Map<string, PermissionMatrixItem[]>();
  for (const item of items) {
    const [resource] = item.slug.split(":");
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource)!.push(item);
  }
  return groups;
}

/** * Formats a permission slug into a readable action (e.g., "assignment:create" → "Create")
 */
export function formatAction(slug: string): string {
  const action = slug.split(":")[1] || slug;
  return action
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** * Capitalizes the resource part of a slug (e.g., "assignment" → "Assignment")
 */
export function formatResource(resource: string): string {
  if (!resource) return "";
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}
