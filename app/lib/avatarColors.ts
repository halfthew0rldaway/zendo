const COLORS = [
  "#0c56d0", // Primary Blue
  "#008a7b", // Teal
  "#7b1fa2", // Purple
  "#c62828", // Red
  "#ef6c00", // Orange
  "#2e7d32", // Green
  "#00838f", // Cyan
  "#4527a0", // Deep Purple
  "#ad1457", // Pink
  "#283593", // Indigo
];

export function getUserColor(username: string = "") {
  if (!username) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
