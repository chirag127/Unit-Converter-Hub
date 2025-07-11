const express = require('express');
const router = express.Router();
const { convert, getConversionFormula } = require('../utils/conversionUtils');

/**
 * POST /api/v1/convert
 * Convert units
 */
router.post('/', (req, res) => {
    try {
        const { value, fromUnit, toUnit, category } = req.body;
        
        // Validate required fields
        if (value === undefined || value === null) {
            return res.status(400).json({
                error: 'Value is required',
                code: 'MISSING_VALUE'
            });
        }
        
        if (!fromUnit) {
            return res.status(400).json({
                error: 'From unit is required',
                code: 'MISSING_FROM_UNIT'
            });
        }
        
        if (!toUnit) {
            return res.status(400).json({
                error: 'To unit is required',
                code: 'MISSING_TO_UNIT'
            });
        }
        
        if (!category) {
            return res.status(400).json({
                error: 'Category is required',
                code: 'MISSING_CATEGORY'
            });
        }
        
        // Convert value to number
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            return res.status(400).json({
                error: 'Value must be a valid number',
                code: 'INVALID_VALUE'
            });
        }
        
        // Perform conversion
        const result = convert(numericValue, fromUnit, toUnit, category);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json({
                error: result.error,
                code: 'CONVERSION_ERROR',
                details: result
            });
        }
        
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            error: 'Internal server error during conversion',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * GET /api/v1/convert/batch
 * Convert multiple values at once
 */
router.post('/batch', (req, res) => {
    try {
        const { conversions } = req.body;
        
        if (!Array.isArray(conversions)) {
            return res.status(400).json({
                error: 'Conversions must be an array',
                code: 'INVALID_CONVERSIONS_FORMAT'
            });
        }
        
        if (conversions.length === 0) {
            return res.status(400).json({
                error: 'At least one conversion is required',
                code: 'EMPTY_CONVERSIONS'
            });
        }
        
        if (conversions.length > 100) {
            return res.status(400).json({
                error: 'Maximum 100 conversions allowed per batch',
                code: 'TOO_MANY_CONVERSIONS'
            });
        }
        
        const results = conversions.map((conversion, index) => {
            try {
                const { value, fromUnit, toUnit, category } = conversion;
                const numericValue = parseFloat(value);
                
                if (isNaN(numericValue)) {
                    return {
                        index,
                        success: false,
                        error: 'Invalid value',
                        conversion
                    };
                }
                
                const result = convert(numericValue, fromUnit, toUnit, category);
                return {
                    index,
                    ...result
                };
                
            } catch (error) {
                return {
                    index,
                    success: false,
                    error: error.message,
                    conversion
                };
            }
        });
        
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.length - successCount;
        
        res.json({
            success: true,
            totalConversions: results.length,
            successfulConversions: successCount,
            failedConversions: errorCount,
            results: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Batch conversion error:', error);
        res.status(500).json({
            error: 'Internal server error during batch conversion',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * GET /api/v1/convert/formula/:category/:fromUnit/:toUnit
 * Get conversion formula for specific units
 */
router.get('/formula/:category/:fromUnit/:toUnit', (req, res) => {
    try {
        const { category, fromUnit, toUnit } = req.params;
        
        const formula = getConversionFormula(1, fromUnit, toUnit, category);
        
        res.json({
            success: true,
            category,
            fromUnit,
            toUnit,
            formula,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Formula error:', error);
        res.status(400).json({
            error: error.message,
            code: 'FORMULA_ERROR'
        });
    }
});

/**
 * GET /api/v1/convert/validate
 * Validate conversion parameters
 */
router.post('/validate', (req, res) => {
    try {
        const { value, fromUnit, toUnit, category } = req.body;
        
        const errors = [];
        
        if (value === undefined || value === null) {
            errors.push('Value is required');
        } else {
            const numericValue = parseFloat(value);
            if (isNaN(numericValue)) {
                errors.push('Value must be a valid number');
            }
        }
        
        if (!fromUnit) {
            errors.push('From unit is required');
        }
        
        if (!toUnit) {
            errors.push('To unit is required');
        }
        
        if (!category) {
            errors.push('Category is required');
        }
        
        // Test conversion if no basic errors
        let conversionValid = false;
        let conversionError = null;
        
        if (errors.length === 0) {
            try {
                const numericValue = parseFloat(value);
                const result = convert(numericValue, fromUnit, toUnit, category);
                conversionValid = result.success;
                if (!result.success) {
                    conversionError = result.error;
                }
            } catch (error) {
                conversionValid = false;
                conversionError = error.message;
            }
        }
        
        res.json({
            valid: errors.length === 0 && conversionValid,
            errors: errors,
            conversionValid,
            conversionError,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            error: 'Internal server error during validation',
            code: 'INTERNAL_ERROR'
        });
    }
});

module.exports = router;
