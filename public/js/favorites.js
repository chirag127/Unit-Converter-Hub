/**
 * Favorites management for Unit Converter Hub
 * Handles local storage of favorite conversions
 */

class FavoritesManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE.FAVORITES;
        this.maxFavorites = CONFIG.UI.MAX_FAVORITES;
        this.favorites = this.loadFavorites();
    }

    /**
     * Load favorites from local storage
     * @returns {Array} Favorites array
     */
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Save favorites to local storage
     */
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
            throw new Error('Failed to save favorites. Storage may be full.');
        }
    }

    /**
     * Get all favorites
     * @returns {Array} Favorites array
     */
    getFavorites() {
        return [...this.favorites];
    }

    /**
     * Add a favorite conversion
     * @param {string} name - Favorite name
     * @param {string} category - Unit category
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {Object} Added favorite
     */
    addFavorite(name, category, fromUnit, toUnit) {
        // Validate input
        if (!name || !category || !fromUnit || !toUnit) {
            throw new Error('All fields are required');
        }

        if (name.length > 100) {
            throw new Error('Name must be 100 characters or less');
        }

        if (fromUnit === toUnit) {
            throw new Error('From unit and to unit cannot be the same');
        }

        // Check if already exists
        const existing = this.favorites.find(fav => 
            fav.category === category && 
            fav.fromUnit === fromUnit && 
            fav.toUnit === toUnit
        );

        if (existing) {
            throw new Error('This conversion is already in your favorites');
        }

        // Check favorites limit
        if (this.favorites.length >= this.maxFavorites) {
            throw new Error(`Maximum ${this.maxFavorites} favorites allowed`);
        }

        const favorite = {
            id: CONFIG.generateId(),
            name: name.trim(),
            category,
            fromUnit,
            toUnit,
            createdAt: CONFIG.getTimestamp(),
            lastUsed: CONFIG.getTimestamp(),
            useCount: 0
        };

        this.favorites.unshift(favorite);
        this.saveFavorites();

        return favorite;
    }

    /**
     * Remove a favorite
     * @param {string} id - Favorite ID
     * @returns {boolean} True if removed
     */
    removeFavorite(id) {
        const index = this.favorites.findIndex(fav => fav.id === id);
        if (index === -1) {
            return false;
        }

        this.favorites.splice(index, 1);
        this.saveFavorites();
        return true;
    }

    /**
     * Update a favorite
     * @param {string} id - Favorite ID
     * @param {Object} updates - Updates object
     * @returns {Object|null} Updated favorite
     */
    updateFavorite(id, updates) {
        const favorite = this.favorites.find(fav => fav.id === id);
        if (!favorite) {
            return null;
        }

        Object.assign(favorite, updates);
        this.saveFavorites();
        return favorite;
    }

    /**
     * Use a favorite (increment use count and update last used)
     * @param {string} id - Favorite ID
     * @returns {Object|null} Updated favorite
     */
    useFavorite(id) {
        const favorite = this.favorites.find(fav => fav.id === id);
        if (!favorite) {
            return null;
        }

        favorite.useCount = (favorite.useCount || 0) + 1;
        favorite.lastUsed = CONFIG.getTimestamp();
        this.saveFavorites();
        return favorite;
    }

    /**
     * Check if a conversion is favorited
     * @param {string} category - Unit category
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {Object|null} Favorite if exists
     */
    isFavorited(category, fromUnit, toUnit) {
        return this.favorites.find(fav => 
            fav.category === category && 
            fav.fromUnit === fromUnit && 
            fav.toUnit === toUnit
        ) || null;
    }

    /**
     * Search favorites
     * @param {string} query - Search query
     * @returns {Array} Matching favorites
     */
    searchFavorites(query) {
        if (!query) {
            return this.getFavorites();
        }

        const searchTerm = query.toLowerCase();
        return this.favorites.filter(fav =>
            fav.name.toLowerCase().includes(searchTerm) ||
            fav.category.toLowerCase().includes(searchTerm) ||
            fav.fromUnit.toLowerCase().includes(searchTerm) ||
            fav.toUnit.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Get favorites sorted by usage
     * @returns {Array} Sorted favorites
     */
    getFavoritesByUsage() {
        return [...this.favorites].sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
    }

    /**
     * Get favorites sorted by date
     * @param {boolean} ascending - Sort order
     * @returns {Array} Sorted favorites
     */
    getFavoritesByDate(ascending = false) {
        return [...this.favorites].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    /**
     * Export favorites
     * @returns {Object} Export data
     */
    exportFavorites() {
        return {
            version: '1.0.0',
            exportedAt: CONFIG.getTimestamp(),
            appName: CONFIG.APP.NAME,
            favoritesCount: this.favorites.length,
            favorites: this.getFavorites()
        };
    }

    /**
     * Import favorites
     * @param {Object} exportData - Export data
     * @returns {Object} Import result
     */
    importFavorites(exportData) {
        if (!exportData || !Array.isArray(exportData.favorites)) {
            throw new Error('Invalid export data');
        }

        const imported = [];
        const errors = [];
        const existing = [];

        exportData.favorites.forEach((fav, index) => {
            try {
                // Validate favorite
                if (!fav.name || !fav.category || !fav.fromUnit || !fav.toUnit) {
                    errors.push(`Favorite at index ${index}: Missing required fields`);
                    return;
                }

                if (fav.fromUnit === fav.toUnit) {
                    errors.push(`Favorite at index ${index}: From unit and to unit cannot be the same`);
                    return;
                }

                // Check if already exists
                const existingFav = this.isFavorited(fav.category, fav.fromUnit, fav.toUnit);
                if (existingFav) {
                    existing.push(fav.name);
                    return;
                }

                // Check favorites limit
                if (this.favorites.length + imported.length >= this.maxFavorites) {
                    errors.push(`Maximum ${this.maxFavorites} favorites allowed`);
                    return;
                }

                const newFavorite = {
                    id: CONFIG.generateId(),
                    name: fav.name.trim(),
                    category: fav.category,
                    fromUnit: fav.fromUnit,
                    toUnit: fav.toUnit,
                    createdAt: fav.createdAt || CONFIG.getTimestamp(),
                    lastUsed: fav.lastUsed || CONFIG.getTimestamp(),
                    useCount: parseInt(fav.useCount) || 0
                };

                imported.push(newFavorite);

            } catch (error) {
                errors.push(`Favorite at index ${index}: ${error.message}`);
            }
        });

        // Add imported favorites
        this.favorites.unshift(...imported);
        this.saveFavorites();

        return {
            imported: imported.length,
            existing: existing.length,
            errors: errors.length,
            errorDetails: errors,
            existingNames: existing
        };
    }

    /**
     * Clear all favorites
     */
    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
    }

    /**
     * Get favorites statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        if (this.favorites.length === 0) {
            return {
                totalFavorites: 0,
                categoriesUsed: [],
                mostUsedCategory: null,
                mostUsedFavorite: null,
                totalUseCount: 0,
                averageUseCount: 0,
                oldestFavorite: null,
                newestFavorite: null,
                lastUsed: null
            };
        }

        const categoryCount = {};
        let totalUseCount = 0;

        this.favorites.forEach(fav => {
            categoryCount[fav.category] = (categoryCount[fav.category] || 0) + 1;
            totalUseCount += (fav.useCount || 0);
        });

        const mostUsedCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b
        );

        const mostUsedFavorite = this.favorites.reduce((prev, current) => 
            (current.useCount || 0) > (prev.useCount || 0) ? current : prev
        );

        const sortedByCreated = [...this.favorites].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        const sortedByUsed = [...this.favorites].sort((a, b) => 
            new Date(b.lastUsed) - new Date(a.lastUsed)
        );

        return {
            totalFavorites: this.favorites.length,
            categoriesUsed: Object.keys(categoryCount),
            mostUsedCategory,
            mostUsedFavorite,
            totalUseCount,
            averageUseCount: Math.round(totalUseCount / this.favorites.length * 100) / 100,
            oldestFavorite: sortedByCreated[0],
            newestFavorite: sortedByCreated[sortedByCreated.length - 1],
            lastUsed: sortedByUsed[0]
        };
    }
}

// Create global favorites manager instance
window.favoritesManager = new FavoritesManager();
