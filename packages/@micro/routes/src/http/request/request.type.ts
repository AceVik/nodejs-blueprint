import { KeyValueAdapter } from '@micro/routes/adapters/key-value.adapter';

export type Request = {
  pathParams: KeyValueAdapter<string, string | string[]>;
  queryParams: KeyValueAdapter<string, string | string[]>;
  headers: KeyValueAdapter<string, string | string[]>;
  cookies: KeyValueAdapter<string, string>;
  body: any;
};