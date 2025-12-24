export const resultMessageTypes = ['info', 'warning', 'error'] as const;
export type ResultMessageType = typeof resultMessageTypes[number];