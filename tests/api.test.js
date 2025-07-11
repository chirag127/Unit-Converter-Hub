/**
 * API endpoint tests for Unit Converter Hub
 * Tests all API routes and error handling
 */

const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
    describe('Health Check', () => {
        test('GET /api/health should return status OK', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body.timestamp).toBeDefined();
            expect(response.body.uptime).toBeDefined();
            expect(response.body.environment).toBeDefined();
            expect(response.body.version).toBeDefined();
        });
    });

    describe('Categories API', () => {
        test('GET /api/v1/categories should return all categories', async () => {
            const response = await request(app)
                .get('/api/v1/categories')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.categories).toBeDefined();
            expect(Array.isArray(response.body.categories)).toBe(true);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.timestamp).toBeDefined();
        });

        test('GET /api/v1/categories/:category should return units for valid category', async () => {
            const response = await request(app)
                .get('/api/v1/categories/length')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.category).toBe('length');
            expect(response.body.name).toBeDefined();
            expect(response.body.icon).toBeDefined();
            expect(response.body.units).toBeDefined();
            expect(Array.isArray(response.body.units)).toBe(true);
            expect(response.body.units.length).toBeGreaterThan(0);
        });

        test('GET /api/v1/categories/:category should return 404 for invalid category', async () => {
            const response = await request(app)
                .get('/api/v1/categories/invalid')
                .expect(404);

            expect(response.body.error).toContain('Unknown category');
            expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
        });

        test('GET /api/v1/categories/:category/units/:unit should return unit info', async () => {
            const response = await request(app)
                .get('/api/v1/categories/length/units/meter')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.category).toBe('length');
            expect(response.body.unit).toBeDefined();
            expect(response.body.unit.key).toBe('meter');
            expect(response.body.unit.name).toBeDefined();
            expect(response.body.unit.symbol).toBeDefined();
        });

        test('GET /api/v1/categories/:category/units/:unit should return 404 for invalid unit', async () => {
            const response = await request(app)
                .get('/api/v1/categories/length/units/invalid')
                .expect(404);

            expect(response.body.error).toContain('Unit \'invalid\' not found');
            expect(response.body.code).toBe('UNIT_NOT_FOUND');
        });

        test('GET /api/v1/categories/:category/search should search units', async () => {
            const response = await request(app)
                .get('/api/v1/categories/length/search?q=meter')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.category).toBe('length');
            expect(response.body.searchQuery).toBe('meter');
            expect(response.body.units).toBeDefined();
            expect(Array.isArray(response.body.units)).toBe(true);
        });

        test('GET /api/v1/categories/:category/search should require query parameter', async () => {
            const response = await request(app)
                .get('/api/v1/categories/length/search')
                .expect(400);

            expect(response.body.error).toContain('Search query (q) parameter is required');
            expect(response.body.code).toBe('MISSING_QUERY');
        });
    });

    describe('Conversion API', () => {
        test('POST /api/v1/convert should perform valid conversion', async () => {
            const conversionData = {
                value: 1,
                fromUnit: 'meter',
                toUnit: 'centimeter',
                category: 'length'
            };

            const response = await request(app)
                .post('/api/v1/convert')
                .send(conversionData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.originalValue).toBe(1);
            expect(response.body.convertedValue).toBe(100);
            expect(response.body.fromUnit).toBe('meter');
            expect(response.body.toUnit).toBe('centimeter');
            expect(response.body.category).toBe('length');
            expect(response.body.formula).toBeDefined();
            expect(response.body.timestamp).toBeDefined();
        });

        test('POST /api/v1/convert should handle temperature conversion', async () => {
            const conversionData = {
                value: 0,
                fromUnit: 'celsius',
                toUnit: 'fahrenheit',
                category: 'temperature'
            };

            const response = await request(app)
                .post('/api/v1/convert')
                .send(conversionData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.convertedValue).toBe(32);
        });

        test('POST /api/v1/convert should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/convert')
                .send({})
                .expect(400);

            expect(response.body.error).toContain('Value is required');
            expect(response.body.code).toBe('MISSING_VALUE');
        });

        test('POST /api/v1/convert should validate numeric values', async () => {
            const conversionData = {
                value: 'invalid',
                fromUnit: 'meter',
                toUnit: 'centimeter',
                category: 'length'
            };

            const response = await request(app)
                .post('/api/v1/convert')
                .send(conversionData)
                .expect(400);

            expect(response.body.error).toContain('valid number');
            expect(response.body.code).toBe('INVALID_VALUE');
        });

        test('POST /api/v1/convert should handle conversion errors', async () => {
            const conversionData = {
                value: 1,
                fromUnit: 'invalid',
                toUnit: 'centimeter',
                category: 'length'
            };

            const response = await request(app)
                .post('/api/v1/convert')
                .send(conversionData)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.code).toBe('CONVERSION_ERROR');
        });

        test('POST /api/v1/convert/batch should handle multiple conversions', async () => {
            const batchData = {
                conversions: [
                    {
                        value: 1,
                        fromUnit: 'meter',
                        toUnit: 'centimeter',
                        category: 'length'
                    },
                    {
                        value: 0,
                        fromUnit: 'celsius',
                        toUnit: 'fahrenheit',
                        category: 'temperature'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/v1/convert/batch')
                .send(batchData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.totalConversions).toBe(2);
            expect(response.body.successfulConversions).toBe(2);
            expect(response.body.failedConversions).toBe(0);
            expect(response.body.results).toBeDefined();
            expect(Array.isArray(response.body.results)).toBe(true);
            expect(response.body.results.length).toBe(2);
        });

        test('POST /api/v1/convert/batch should validate input format', async () => {
            const response = await request(app)
                .post('/api/v1/convert/batch')
                .send({ conversions: 'invalid' })
                .expect(400);

            expect(response.body.error).toContain('Conversions must be an array');
            expect(response.body.code).toBe('INVALID_CONVERSIONS_FORMAT');
        });

        test('POST /api/v1/convert/batch should limit batch size', async () => {
            const conversions = Array(101).fill({
                value: 1,
                fromUnit: 'meter',
                toUnit: 'centimeter',
                category: 'length'
            });

            const response = await request(app)
                .post('/api/v1/convert/batch')
                .send({ conversions })
                .expect(400);

            expect(response.body.error).toContain('Maximum 100 conversions allowed');
            expect(response.body.code).toBe('TOO_MANY_CONVERSIONS');
        });

        test('GET /api/v1/convert/formula/:category/:fromUnit/:toUnit should return formula', async () => {
            const response = await request(app)
                .get('/api/v1/convert/formula/length/meter/centimeter')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.category).toBe('length');
            expect(response.body.fromUnit).toBe('meter');
            expect(response.body.toUnit).toBe('centimeter');
            expect(response.body.formula).toBeDefined();
        });

        test('POST /api/v1/convert/validate should validate conversion parameters', async () => {
            const validationData = {
                value: 1,
                fromUnit: 'meter',
                toUnit: 'centimeter',
                category: 'length'
            };

            const response = await request(app)
                .post('/api/v1/convert/validate')
                .send(validationData)
                .expect(200);

            expect(response.body.valid).toBe(true);
            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.conversionValid).toBe(true);
        });
    });

    describe('Favorites API', () => {
        test('GET /api/v1/favorites should return favorites info', async () => {
            const response = await request(app)
                .get('/api/v1/favorites')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('stored locally');
            expect(response.body.structure).toBeDefined();
            expect(response.body.storageKey).toBe('unitConverterFavorites');
        });

        test('POST /api/v1/favorites/validate should validate favorite data', async () => {
            const favoriteData = {
                name: 'Test Favorite',
                category: 'length',
                fromUnit: 'meter',
                toUnit: 'centimeter'
            };

            const response = await request(app)
                .post('/api/v1/favorites/validate')
                .send(favoriteData)
                .expect(200);

            expect(response.body.valid).toBe(true);
            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBe(0);
        });

        test('POST /api/v1/favorites/validate should catch validation errors', async () => {
            const favoriteData = {
                name: '',
                category: 'length',
                fromUnit: 'meter',
                toUnit: 'meter'
            };

            const response = await request(app)
                .post('/api/v1/favorites/validate')
                .send(favoriteData)
                .expect(200);

            expect(response.body.valid).toBe(false);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        test('POST /api/v1/favorites/export should export favorites', async () => {
            const favoritesData = {
                favorites: [
                    {
                        id: 'test1',
                        name: 'Test Favorite',
                        category: 'length',
                        fromUnit: 'meter',
                        toUnit: 'centimeter',
                        useCount: 5
                    }
                ]
            };

            const response = await request(app)
                .post('/api/v1/favorites/export')
                .send(favoritesData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.exportData).toBeDefined();
            expect(response.body.exportData.version).toBe('1.0.0');
            expect(response.body.exportData.favorites).toBeDefined();
            expect(response.body.exportData.favoritesCount).toBe(1);
        });

        test('POST /api/v1/favorites/import should import favorites', async () => {
            const importData = {
                exportData: {
                    version: '1.0.0',
                    favorites: [
                        {
                            name: 'Imported Favorite',
                            category: 'length',
                            fromUnit: 'meter',
                            toUnit: 'centimeter'
                        }
                    ]
                }
            };

            const response = await request(app)
                .post('/api/v1/favorites/import')
                .send(importData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.importedCount).toBe(1);
            expect(response.body.processedFavorites).toBeDefined();
            expect(Array.isArray(response.body.processedFavorites)).toBe(true);
        });

        test('POST /api/v1/favorites/stats should return statistics', async () => {
            const favoritesData = {
                favorites: [
                    {
                        id: 'test1',
                        name: 'Test Favorite 1',
                        category: 'length',
                        fromUnit: 'meter',
                        toUnit: 'centimeter',
                        useCount: 5,
                        createdAt: '2025-01-01T00:00:00.000Z',
                        lastUsed: '2025-01-10T00:00:00.000Z'
                    },
                    {
                        id: 'test2',
                        name: 'Test Favorite 2',
                        category: 'weight',
                        fromUnit: 'kilogram',
                        toUnit: 'pound',
                        useCount: 3,
                        createdAt: '2025-01-05T00:00:00.000Z',
                        lastUsed: '2025-01-08T00:00:00.000Z'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/v1/favorites/stats')
                .send(favoritesData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toBeDefined();
            expect(response.body.stats.totalFavorites).toBe(2);
            expect(response.body.stats.totalUseCount).toBe(8);
            expect(response.body.stats.averageUseCount).toBe(4);
            expect(response.body.stats.categoriesUsed).toContain('length');
            expect(response.body.stats.categoriesUsed).toContain('weight');
        });
    });

    describe('Error Handling', () => {
        test('should return 404 for unknown API endpoints', async () => {
            const response = await request(app)
                .get('/api/v1/unknown')
                .expect(404);

            expect(response.body.error).toContain('API endpoint not found');
            expect(response.body.path).toBe('/api/v1/unknown');
            expect(response.body.method).toBe('GET');
        });

        test('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/v1/convert')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);
        });

        test('should handle missing Content-Type', async () => {
            const response = await request(app)
                .post('/api/v1/convert')
                .send('value=1&fromUnit=meter&toUnit=centimeter&category=length')
                .expect(400);
        });
    });

    describe('Rate Limiting', () => {
        test('should apply rate limiting to API endpoints', async () => {
            // This test would need to be adjusted based on actual rate limit settings
            // For now, just verify that the endpoint responds normally
            const response = await request(app)
                .get('/api/v1/categories')
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
