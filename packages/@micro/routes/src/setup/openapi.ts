import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Ensure the Zod instance is extended with .openapi() in any import path
extendZodWithOpenApi(z);
