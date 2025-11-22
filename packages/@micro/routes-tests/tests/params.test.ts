import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
    fromPath,
    fromQuery,
    lastFromQuery,
    allFromQuery,
    fromHeader,
    lastFromHeader,
    allFromHeader
} from '@micro/routes/param';

describe('RouteParam Factories', () => {
    describe('Path Params', () => {
        it('should create a path param', () => {
            const p = fromPath(z.string());
            expect(p.type).toBe('path');
            expect(p.readType).toBe('first');
        });

        it('should create a path param with name', () => {
            const p = fromPath('id', z.string());
            expect(p.names).toEqual(['id']);
        });
    });

    describe('Query Params', () => {
        it('should create a query param (first)', () => {
            const p = fromQuery(z.string());
            expect(p.type).toBe('query');
            expect(p.readType).toBe('first');
        });

        it('should create a query param (last)', () => {
            const p = lastFromQuery(z.string());
            expect(p.type).toBe('query');
            expect(p.readType).toBe('last');
        });

        it('should create a query param (all)', () => {
            const p = allFromQuery(z.array(z.string()));
            expect(p.type).toBe('query');
            expect(p.readType).toBe('all');
        });
    });

    describe('Header Params', () => {
        it('should create a header param', () => {
            const p = fromHeader(z.string());
            expect(p.type).toBe('header');
        });

        it('should create a header param (last)', () => {
            const p = lastFromHeader(z.string());
            expect(p.type).toBe('header');
            expect(p.readType).toBe('last');
        });

        it('should create a header param (all)', () => {
            const p = allFromHeader(z.array(z.string()));
            expect(p.type).toBe('header');
            expect(p.readType).toBe('all');
        });
    });
});
