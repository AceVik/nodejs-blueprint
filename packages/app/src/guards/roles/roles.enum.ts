export const roles = ['user', 'moderator', 'admin'] as const;
export type Role = typeof roles[number];