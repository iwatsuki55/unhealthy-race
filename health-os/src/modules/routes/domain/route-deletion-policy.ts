export interface RouteUsage {
  routeId: string | null;
}

export function shouldDeactivateRouteOnDelete(routeId: string, routeUsages: RouteUsage[]) {
  return routeUsages.some((usage) => usage.routeId === routeId);
}
