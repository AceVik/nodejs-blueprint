import type { RouteParamType } from './route-param-types.type.js';

/**
 * Common metadata shared across all parameter types.
 */
export type ParamMetaCommon = {
  /**
   * A brief description of the parameter.
   */
  description?: string;

  /**
   * Indicates if the parameter is deprecated.
   */
  deprecated?: boolean;
};

/**
 * Enforces mutually exclusive usage of `example` or `examples`.
 */
export type ParamExampleXOR =
  | {
  example?: unknown;
  examples?: never;
}
  | {
  examples?: Record<
    string,
    {
      summary?: string;
      description?: string;
      value?: unknown;
      externalValue?: string;
    }
  >;
  example?: never;
};

/**
 * Metadata specific to Path parameters.
 * Path parameters have restricted styles and cannot be optional (handled by route logic) or have empty values.
 */
export type PathParamMeta = ParamMetaCommon & {
  style?: 'matrix' | 'label' | 'simple';
  explode?: boolean;
} & ParamExampleXOR;

/**
 * Metadata specific to Query parameters.
 * Query parameters support the widest range of serialization styles and flags.
 */
export type QueryParamMeta = ParamMetaCommon & {
  style?: 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
  explode?: boolean;
  allowReserved?: boolean;
  allowEmptyValue?: boolean;
} & ParamExampleXOR;

/**
 * Metadata specific to Header parameters.
 * Header parameters strictly use the 'simple' style.
 */
export type HeaderParamMeta = ParamMetaCommon & {
  style?: 'simple';
  explode?: boolean;
} & ParamExampleXOR;

/**
 * Metadata specific to Cookie parameters.
 */
export type CookieParamMeta = ParamMetaCommon & {
  style?: 'form';
  explode?: boolean;
} & ParamExampleXOR;

/**
 * Conditional type that selects the correct metadata shape based on the parameter type.
 * This enables strict type checking in .openapi() based on the parameter source.
 */
export type RouteParamMeta<PT extends RouteParamType = RouteParamType> =
  PT extends 'path' ? PathParamMeta :
    PT extends 'query' ? QueryParamMeta :
      PT extends 'header' ? HeaderParamMeta :
        PT extends 'cookie' ? CookieParamMeta :
          (ParamMetaCommon & ParamExampleXOR); // Fallback