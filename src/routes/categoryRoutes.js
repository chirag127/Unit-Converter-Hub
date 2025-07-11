const express = require('express');
const router = express.Router();
const { getAllCategories, getUnitsForCategory } = require('../utils/conversionUtils');

/**
 * GET /api/v1/categories
 * Get all available unit categories
 */
router.get('/', (req, res) => {
    try {
        const categories = getAllCategories();
        
        res.json({
            success: true,
            count: categories.length,
            categories: categories,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching categories',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * GET /api/v1/categories/:category
 * Get units for a specific category
 */
router.get('/:category', (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.status(400).json({
                error: 'Category parameter is required',
                code: 'MISSING_CATEGORY'
            });
        }
        
        const categoryData = getUnitsForCategory(category);
        
        res.json({
            success: true,
            ...categoryData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Category units error:', error);
        
        if (error.message.includes('Unknown category')) {
            res.status(404).json({
                error: error.message,
                code: 'CATEGORY_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error while fetching category units',
                code: 'INTERNAL_ERROR'
            });
        }
    }
});

/**
 * GET /api/v1/categories/:category/units/:unit
 * Get information about a specific unit
 */
router.get('/:category/units/:unit', (req, res) => {
    try {
        const { category, unit } = req.params;
        
        if (!category) {
            return res.status(400).json({
                error: 'Category parameter is required',
                code: 'MISSING_CATEGORY'
            });
        }
        
        if (!unit) {
            return res.status(400).json({
                error: 'Unit parameter is required',
                code: 'MISSING_UNIT'
            });
        }
        
        const categoryData = getUnitsForCategory(category);
        const unitData = categoryData.units.find(u => u.key === unit);
        
        if (!unitData) {
            return res.status(404).json({
                error: `Unit '${unit}' not found in category '${category}'`,
                code: 'UNIT_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            category: category,
            categoryName: categoryData.name,
            categoryIcon: categoryData.icon,
            unit: unitData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Unit info error:', error);
        
        if (error.message.includes('Unknown category')) {
            res.status(404).json({
                error: error.message,
                code: 'CATEGORY_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error while fetching unit information',
                code: 'INTERNAL_ERROR'
            });
        }
    }
});

/**
 * GET /api/v1/categories/:category/search
 * Search units within a category
 */
router.get('/:category/search', (req, res) => {
    try {
        const { category } = req.params;
        const { q, limit = 10 } = req.query;
        
        if (!category) {
            return res.status(400).json({
                error: 'Category parameter is required',
                code: 'MISSING_CATEGORY'
            });
        }
        
        if (!q) {
            return res.status(400).json({
                error: 'Search query (q) parameter is required',
                code: 'MISSING_QUERY'
            });
        }
        
        const categoryData = getUnitsForCategory(category);
        const searchTerm = q.toLowerCase();
        const maxResults = Math.min(parseInt(limit) || 10, 50);
        
        const matchingUnits = categoryData.units.filter(unit => 
            unit.name.toLowerCase().includes(searchTerm) ||
            unit.symbol.toLowerCase().includes(searchTerm) ||
            unit.key.toLowerCase().includes(searchTerm)
        ).slice(0, maxResults);
        
        res.json({
            success: true,
            category: category,
            categoryName: categoryData.name,
            searchQuery: q,
            resultCount: matchingUnits.length,
            units: matchingUnits,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Unit search error:', error);
        
        if (error.message.includes('Unknown category')) {
            res.status(404).json({
                error: error.message,
                code: 'CATEGORY_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error while searching units',
                code: 'INTERNAL_ERROR'
            });
        }
    }
});

module.exports = router;
