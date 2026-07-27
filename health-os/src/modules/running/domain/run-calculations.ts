export function calculateAveragePaceSecondsPerKm(distanceMeters: number, durationSeconds: number) {
  const distanceKm = distanceMeters / 1000;

  return Math.round(durationSeconds / distanceKm);
}
