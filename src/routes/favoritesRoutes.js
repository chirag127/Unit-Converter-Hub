const express = require('express');
const router = express.Router();

/**
 * GET /api/v1/favorites
 * Get user's favorite conversions (client-side storage)
 * This endpoint provides structure for favorites but actual storage is client-side
 */
router.get('/', (req, res) => {
    try {
        // Since we're using client-side storage, this endpoint provides the structure
        res.json({
            success: true,
            message: 'Favorites are stored locally in your browser',
            structure: {
                favorites: [
                    {
                        id: 'string',
                        name: 'string',
                        category: 'string',
                        fromUnit: 'string',
                        toUnit: 'string',
                        lastUsed: 'ISO date string',
                        createdAt: 'ISO date string',
                        useCount: 'number'
                    }
                ]
            },
            storageKey: 'unitConverterFavorites',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Favorites info error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching favorites info',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * POST /api/v1/favorites/validate
 * Validate favorite conversion data
 */
router.post('/validate', (req, res) => {
    try {
        const { name, category, fromUnit, toUnit } = req.body;
        
        const errors = [];
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Name is required and must be a non-empty string');
        } else if (name.length > 100) {
            errors.push('Name must be 100 characters or less');
        }
        
        if (!category || typeof category !== 'string') {
            errors.push('Category is required and must be a string');
        }
        
        if (!fromUnit || typeof fromUnit !== 'string') {
            errors.push('From unit is required and must be a string');
        }
        
        if (!toUnit || typeof toUnit !== 'string') {
            errors.push('To unit is required and must be a string');
        }
        
        // Check if units are the same
        if (fromUnit && toUnit && fromUnit === toUnit) {
            errors.push('From unit and to unit cannot be the same');
        }
        
        res.json({
            valid: errors.length === 0,
            errors: errors,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Favorite validation error:', error);
        res.status(500).json({
            error: 'Internal server error during validation',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * POST /api/v1/favorites/export
 * Export favorites data (for backup/sharing)
 */
router.post('/export', (req, res) => {
    try {
        const { favorites } = req.body;
        
        if (!Array.isArray(favorites)) {
            return res.status(400).json({
                error: 'Favorites must be an array',
                code: 'INVALID_FAVORITES_FORMAT'
            });
        }
        
        // Validate and clean favorites data
        const cleanedFavorites = favorites.map((fav, index) => {
            const cleaned = {
                id: fav.id || `fav_${Date.now()}_${index}`,
                name: (fav.name || '').trim(),
                category: fav.category || '',
                fromUnit: fav.fromUnit || '',
                toUnit: fav.toUnit || '',
                lastUsed: fav.lastUsed || new Date().toISOString(),
                createdAt: fav.createdAt || new Date().toISOString(),
                useCount: parseInt(fav.useCount) || 0
            };
            
            return cleaned;
        }).filter(fav => fav.name && fav.category && fav.fromUnit && fav.toUnit);
        
        const exportData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            appName: 'Unit Converter Hub',
            favoritesCount: cleanedFavorites.length,
            favorites: cleanedFavorites
        };
        
        res.json({
            success: true,
            exportData: exportData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Favorites export error:', error);
        res.status(500).json({
            error: 'Internal server error during export',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * POST /api/v1/favorites/import
 * Import and validate favorites data
 */
router.post('/import', (req, res) => {
    try {
        const { exportData } = req.body;
        
        if (!exportData || typeof exportData !== 'object') {
            return res.status(400).json({
                error: 'Export data is required and must be an object',
                code: 'INVALID_EXPORT_DATA'
            });
        }
        
        if (!Array.isArray(exportData.favorites)) {
            return res.status(400).json({
                error: 'Export data must contain a favorites array',
                code: 'INVALID_FAVORITES_ARRAY'
            });
        }
        
        // Validate and process imported favorites
        const processedFavorites = [];
        const errors = [];
        
        exportData.favorites.forEach((fav, index) => {
            try {
                if (!fav.name || !fav.category || !fav.fromUnit || !fav.toUnit) {
                    errors.push(`Favorite at index ${index}: Missing required fields`);
                    return;
                }
                
                if (fav.fromUnit === fav.toUnit) {
                    errors.push(`Favorite at index ${index}: From unit and to unit cannot be the same`);
                    return;
                }
                
                processedFavorites.push({
                    id: fav.id || `imported_${Date.now()}_${index}`,
                    name: fav.name.trim(),
                    category: fav.category,
                    fromUnit: fav.fromUnit,
                    toUnit: fav.toUnit,
                    lastUsed: fav.lastUsed || new Date().toISOString(),
                    createdAt: fav.createdAt || new Date().toISOString(),
                    useCount: parseInt(fav.useCount) || 0
                });
                
            } catch (error) {
                errors.push(`Favorite at index ${index}: ${error.message}`);
            }
        });
        
        res.json({
            success: true,
            importedCount: processedFavorites.length,
            totalCount: exportData.favorites.length,
            errorCount: errors.length,
            errors: errors,
            processedFavorites: processedFavorites,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Favorites import error:', error);
        res.status(500).json({
            error: 'Internal server error during import',
            code: 'INTERNAL_ERROR'
        });
    }
});

/**
 * GET /api/v1/favorites/stats
 * Get statistics about favorites usage patterns
 */
router.post('/stats', (req, res) => {
    try {
        const { favorites } = req.body;
        
        if (!Array.isArray(favorites)) {
            return res.status(400).json({
                error: 'Favorites must be an array',
                code: 'INVALID_FAVORITES_FORMAT'
            });
        }
        
        const stats = {
            totalFavorites: favorites.length,
            categoriesUsed: [...new Set(favorites.map(f => f.category))],
            mostUsedCategory: null,
            mostUsedFavorite: null,
            totalUseCount: favorites.reduce((sum, f) => sum + (parseInt(f.useCount) || 0), 0),
            averageUseCount: 0,
            oldestFavorite: null,
            newestFavorite: null,
            lastUsed: null
        };
        
        if (favorites.length > 0) {
            // Category usage
            const categoryCount = {};
            favorites.forEach(f => {
                categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
            });
            
            stats.mostUsedCategory = Object.keys(categoryCount).reduce((a, b) => 
                categoryCount[a] > categoryCount[b] ? a : b
            );
            
            // Most used favorite
            stats.mostUsedFavorite = favorites.reduce((prev, current) => 
                (parseInt(current.useCount) || 0) > (parseInt(prev.useCount) || 0) ? current : prev
            );
            
            // Average use count
            stats.averageUseCount = Math.round(stats.totalUseCount / favorites.length * 100) / 100;
            
            // Date statistics
            const sortedByCreated = [...favorites].sort((a, b) => 
                new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            );
            stats.oldestFavorite = sortedByCreated[0];
            stats.newestFavorite = sortedByCreated[sortedByCreated.length - 1];
            
            const sortedByUsed = [...favorites].sort((a, b) => 
                new Date(b.lastUsed || 0) - new Date(a.lastUsed || 0)
            );
            stats.lastUsed = sortedByUsed[0];
        }
        
        res.json({
            success: true,
            stats: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Favorites stats error:', error);
        res.status(500).json({
            error: 'Internal server error while calculating stats',
            code: 'INTERNAL_ERROR'
        });
    }
});

module.exports = router;
