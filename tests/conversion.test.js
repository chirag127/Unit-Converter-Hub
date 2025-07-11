/**
 * Unit tests for conversion utilities
 * Tests the accuracy and reliability of unit conversions
 */

const { convert, convertTemperature, convertWithFactors, roundToPrecision } = require('../src/utils/conversionUtils');

describe('Conversion Utilities', () => {
    describe('roundToPrecision', () => {
        test('should round numbers to specified precision', () => {
            expect(roundToPrecision(3.14159265359, 2)).toBe(3.14);
            expect(roundToPrecision(3.14159265359, 4)).toBe(3.1416);
            expect(roundToPrecision(1000.123456789, 3)).toBe(1000.123);
        });

        test('should handle edge cases', () => {
            expect(roundToPrecision(0, 5)).toBe(0);
            expect(roundToPrecision(-3.14159, 2)).toBe(-3.14);
            expect(roundToPrecision(1.999999, 0)).toBe(2);
        });
    });

    describe('convertTemperature', () => {
        test('should convert Celsius to Fahrenheit', () => {
            expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
            expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
            expect(convertTemperature(-40, 'celsius', 'fahrenheit')).toBe(-40);
        });

        test('should convert Fahrenheit to Celsius', () => {
            expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
            expect(convertTemperature(212, 'fahrenheit', 'celsius')).toBe(100);
            expect(convertTemperature(-40, 'fahrenheit', 'celsius')).toBe(-40);
        });

        test('should convert Celsius to Kelvin', () => {
            expect(convertTemperature(0, 'celsius', 'kelvin')).toBe(273.15);
            expect(convertTemperature(100, 'celsius', 'kelvin')).toBe(373.15);
            expect(convertTemperature(-273.15, 'celsius', 'kelvin')).toBe(0);
        });

        test('should convert Kelvin to Celsius', () => {
            expect(convertTemperature(273.15, 'kelvin', 'celsius')).toBe(0);
            expect(convertTemperature(373.15, 'kelvin', 'celsius')).toBe(100);
            expect(convertTemperature(0, 'kelvin', 'celsius')).toBe(-273.15);
        });

        test('should handle same unit conversion', () => {
            expect(convertTemperature(25, 'celsius', 'celsius')).toBe(25);
            expect(convertTemperature(77, 'fahrenheit', 'fahrenheit')).toBe(77);
        });

        test('should throw error for unknown units', () => {
            expect(() => convertTemperature(25, 'unknown', 'celsius')).toThrow();
            expect(() => convertTemperature(25, 'celsius', 'unknown')).toThrow();
        });
    });

    describe('convertWithFactors', () => {
        test('should convert length units', () => {
            // 1 meter = 100 centimeters
            expect(convertWithFactors(1, 'meter', 'centimeter', 'length')).toBe(100);
            // 1 kilometer = 1000 meters
            expect(convertWithFactors(1, 'kilometer', 'meter', 'length')).toBe(1000);
            // 1 inch = 2.54 centimeters
            expect(convertWithFactors(1, 'inch', 'centimeter', 'length')).toBeCloseTo(2.54, 2);
        });

        test('should convert weight units', () => {
            // 1 kilogram = 1000 grams
            expect(convertWithFactors(1, 'kilogram', 'gram', 'weight')).toBe(1000);
            // 1 pound ≈ 453.592 grams
            expect(convertWithFactors(1, 'pound', 'gram', 'weight')).toBeCloseTo(453.592, 2);
        });

        test('should convert volume units', () => {
            // 1 liter = 1000 milliliters
            expect(convertWithFactors(1, 'liter', 'milliliter', 'volume')).toBe(1000);
            // 1 gallon ≈ 3.78541 liters
            expect(convertWithFactors(1, 'gallon', 'liter', 'volume')).toBeCloseTo(3.78541, 4);
        });

        test('should handle same unit conversion', () => {
            expect(convertWithFactors(5, 'meter', 'meter', 'length')).toBe(5);
            expect(convertWithFactors(10, 'kilogram', 'kilogram', 'weight')).toBe(10);
        });

        test('should throw error for unknown category', () => {
            expect(() => convertWithFactors(1, 'meter', 'foot', 'unknown')).toThrow();
        });

        test('should throw error for unknown units', () => {
            expect(() => convertWithFactors(1, 'unknown', 'meter', 'length')).toThrow();
            expect(() => convertWithFactors(1, 'meter', 'unknown', 'length')).toThrow();
        });
    });

    describe('convert', () => {
        test('should perform successful conversions', () => {
            const result = convert(1, 'meter', 'centimeter', 'length');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBe(100);
            expect(result.originalValue).toBe(1);
            expect(result.fromUnit).toBe('meter');
            expect(result.toUnit).toBe('centimeter');
            expect(result.category).toBe('length');
        });

        test('should handle temperature conversions', () => {
            const result = convert(0, 'celsius', 'fahrenheit', 'temperature');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBe(32);
        });

        test('should validate input values', () => {
            const result1 = convert('invalid', 'meter', 'centimeter', 'length');
            expect(result1.success).toBe(false);
            expect(result1.error).toContain('valid number');

            const result2 = convert(NaN, 'meter', 'centimeter', 'length');
            expect(result2.success).toBe(false);
            expect(result2.error).toContain('valid number');
        });

        test('should validate required parameters', () => {
            const result1 = convert(1, '', 'centimeter', 'length');
            expect(result1.success).toBe(false);

            const result2 = convert(1, 'meter', '', 'length');
            expect(result2.success).toBe(false);

            const result3 = convert(1, 'meter', 'centimeter', '');
            expect(result3.success).toBe(false);
        });

        test('should handle unknown categories', () => {
            const result = convert(1, 'meter', 'centimeter', 'unknown');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown category');
        });

        test('should include timestamp in result', () => {
            const result = convert(1, 'meter', 'centimeter', 'length');
            expect(result.timestamp).toBeDefined();
            expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        });

        test('should include formula in successful conversions', () => {
            const result = convert(1, 'meter', 'centimeter', 'length');
            expect(result.success).toBe(true);
            expect(result.formula).toBeDefined();
            expect(typeof result.formula).toBe('string');
        });
    });

    describe('Edge Cases and Precision', () => {
        test('should handle very large numbers', () => {
            const result = convert(1e10, 'meter', 'millimeter', 'length');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBe(1e13);
        });

        test('should handle very small numbers', () => {
            const result = convert(1e-6, 'meter', 'millimeter', 'length');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBe(1e-3);
        });

        test('should handle zero values', () => {
            const result = convert(0, 'meter', 'centimeter', 'length');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBe(0);
        });

        test('should handle negative values', () => {
            const result = convert(-10, 'celsius', 'fahrenheit', 'temperature');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBe(14);
        });

        test('should maintain precision for complex conversions', () => {
            // Test precision with multiple decimal places
            const result = convert(3.14159265359, 'meter', 'inch', 'length');
            expect(result.success).toBe(true);
            // 1 meter = 39.3701 inches approximately
            expect(result.convertedValue).toBeCloseTo(123.7, 1);
        });
    });

    describe('Real-world Conversion Examples', () => {
        test('should convert common cooking measurements', () => {
            // 1 cup = 236.588 ml
            const result = convert(1, 'cup', 'milliliter', 'volume');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBeCloseTo(236.588, 2);
        });

        test('should convert body temperature', () => {
            // Normal body temperature: 98.6°F = 37°C
            const result = convert(98.6, 'fahrenheit', 'celsius', 'temperature');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBeCloseTo(37, 1);
        });

        test('should convert travel distances', () => {
            // 100 miles to kilometers
            const result = convert(100, 'mile', 'kilometer', 'length');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBeCloseTo(160.934, 2);
        });

        test('should convert weight for international shipping', () => {
            // 5 pounds to kilograms
            const result = convert(5, 'pound', 'kilogram', 'weight');
            expect(result.success).toBe(true);
            expect(result.convertedValue).toBeCloseTo(2.268, 2);
        });
    });
});
