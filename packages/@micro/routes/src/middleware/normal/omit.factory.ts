export type OmitMarker = { readonly __omit: true; readonly target: string | symbol };

export function omit(target: string | symbol): OmitMarker {
  return { __omit: true, target } as const;
}

export function isOmitMarker(v: unknown): v is OmitMarker {
  return !!v && typeof v === 'object' && (v as any).__omit === true && ('target' in (v as any));
}
