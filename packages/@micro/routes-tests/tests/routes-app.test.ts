import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { createRoutesApp } from '@micro/routes';
import { route } from '@micro/routes/route';
import { z } from 'zod';
import { fromQuery } from '@micro/routes/param';
import type { Route } from '@micro/routes/route';

function createRoute(path: string, r: Route<any>) {
    Object.defineProperty(r, 'path', { value: path });
    return r;
}

describe('RoutesApp Integration', () => {
    const port = 3000 + Math.floor(Math.random() * 1000);
    const baseUrl = `http://127.0.0.1:${port}`;
    const app = createRoutesApp();

    beforeAll(async () => {
        app.use(createRoute('/hello', route({ method: 'GET' }, ({ res }) => {
            res.send('Hello World');
        })));

        app.use(createRoute('/greet', route({
            method: 'GET',
            params: {
                name: fromQuery(z.string()),
            }
        }, ({ params, res }) => {
            res.send(`Hello ${params.name}`);
        })));

        app.use(createRoute('/async', route({ method: 'GET' }, async ({ res }) => {
            await new Promise(r => setTimeout(r, 10));
            res.send('Async Hello');
        })));

        return new Promise<void>((resolve, reject) => {
            app.listen(port, (token) => {
                if (token) {
                    resolve();
                } else {
                    reject(new Error('Failed to listen'));
                }
            });
        });
    });

    afterAll(() => {
        (app as any).rawApp.close();
    });

    it('should handle a simple GET request', async () => {
        const res = await fetch(`${baseUrl}/hello`);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe('Hello World');
    }, 10000);

    it('should handle parameters', async () => {
        const res = await fetch(`${baseUrl}/greet?name=Viktor`);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe('Hello Viktor');
    }, 10000);

    it('should return 400 for invalid parameters', async () => {
        const res = await fetch(`${baseUrl}/greet`);
        expect(res.status).toBe(400);
    }, 10000);

    it('should handle async handlers', async () => {
        const res = await fetch(`${baseUrl}/async`);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe('Async Hello');
    }, 10000);
});
