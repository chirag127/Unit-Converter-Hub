/**
 * API service for Unit Converter Hub
 * Handles all HTTP requests to the backend API
 */

class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Make HTTP request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async request(url, options = {}) {
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(
                    data.error || CONFIG.getErrorMessage(response.status),
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            // Network or other errors
            throw new ApiError(
                CONFIG.ERRORS.NETWORK,
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * GET request
     * @param {string} url - Request URL
     * @param {Object} params - Query parameters
     * @returns {Promise} Response promise
     */
    async get(url, params = {}) {
        const searchParams = new URLSearchParams(params);
        const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url;
        return this.request(fullUrl, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} url - Request URL
     * @param {Object} data - Request body
     * @returns {Promise} Response promise
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Convert units
     * @param {number} value - Value to convert
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @param {string} category - Unit category
     * @returns {Promise} Conversion result
     */
    async convert(value, fromUnit, toUnit, category) {
        const url = CONFIG.getEndpoint('CONVERT');
        return this.post(url, { value, fromUnit, toUnit, category });
    }

    /**
     * Batch convert multiple values
     * @param {Array} conversions - Array of conversion objects
     * @returns {Promise} Batch conversion result
     */
    async convertBatch(conversions) {
        const url = CONFIG.getEndpoint('CONVERT_BATCH');
        return this.post(url, { conversions });
    }

    /**
     * Get conversion formula
     * @param {string} category - Unit category
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {Promise} Formula result
     */
    async getFormula(category, fromUnit, toUnit) {
        const url = CONFIG.getEndpoint('CONVERT_FORMULA', { category, fromUnit, toUnit });
        return this.get(url);
    }

    /**
     * Validate conversion parameters
     * @param {number} value - Value to validate
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @param {string} category - Unit category
     * @returns {Promise} Validation result
     */
    async validateConversion(value, fromUnit, toUnit, category) {
        const url = CONFIG.getEndpoint('CONVERT_VALIDATE');
        return this.post(url, { value, fromUnit, toUnit, category });
    }

    /**
     * Get all categories
     * @returns {Promise} Categories list
     */
    async getCategories() {
        const url = CONFIG.getEndpoint('CATEGORIES');
        return this.get(url);
    }

    /**
     * Get units for a category
     * @param {string} category - Category name
     * @returns {Promise} Units list
     */
    async getCategoryUnits(category) {
        const url = CONFIG.getEndpoint('CATEGORY_UNITS', { category });
        return this.get(url);
    }

    /**
     * Get unit information
     * @param {string} category - Category name
     * @param {string} unit - Unit name
     * @returns {Promise} Unit information
     */
    async getUnitInfo(category, unit) {
        const url = CONFIG.getEndpoint('CATEGORY_UNIT_INFO', { category, unit });
        return this.get(url);
    }

    /**
     * Search units in a category
     * @param {string} category - Category name
     * @param {string} query - Search query
     * @param {number} limit - Result limit
     * @returns {Promise} Search results
     */
    async searchUnits(category, query, limit = 10) {
        const url = CONFIG.getEndpoint('CATEGORY_SEARCH', { category });
        return this.get(url, { q: query, limit });
    }

    /**
     * Get favorites info
     * @returns {Promise} Favorites info
     */
    async getFavoritesInfo() {
        const url = CONFIG.getEndpoint('FAVORITES');
        return this.get(url);
    }

    /**
     * Validate favorite data
     * @param {Object} favorite - Favorite object
     * @returns {Promise} Validation result
     */
    async validateFavorite(favorite) {
        const url = CONFIG.getEndpoint('FAVORITES_VALIDATE');
        return this.post(url, favorite);
    }

    /**
     * Export favorites
     * @param {Array} favorites - Favorites array
     * @returns {Promise} Export data
     */
    async exportFavorites(favorites) {
        const url = CONFIG.getEndpoint('FAVORITES_EXPORT');
        return this.post(url, { favorites });
    }

    /**
     * Import favorites
     * @param {Object} exportData - Export data
     * @returns {Promise} Import result
     */
    async importFavorites(exportData) {
        const url = CONFIG.getEndpoint('FAVORITES_IMPORT');
        return this.post(url, { exportData });
    }

    /**
     * Get favorites statistics
     * @param {Array} favorites - Favorites array
     * @returns {Promise} Statistics
     */
    async getFavoritesStats(favorites) {
        const url = CONFIG.getEndpoint('FAVORITES_STATS');
        return this.post(url, { favorites });
    }

    /**
     * Check API health
     * @returns {Promise} Health status
     */
    async checkHealth() {
        const url = CONFIG.buildApiUrl('/health');
        return this.get(url);
    }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }

    /**
     * Check if error is a network error
     * @returns {boolean} True if network error
     */
    isNetworkError() {
        return this.status === 0;
    }

    /**
     * Check if error is a client error (4xx)
     * @returns {boolean} True if client error
     */
    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Check if error is a server error (5xx)
     * @returns {boolean} True if server error
     */
    isServerError() {
        return this.status >= 500;
    }

    /**
     * Get user-friendly error message
     * @returns {string} Error message
     */
    getUserMessage() {
        if (this.isNetworkError()) {
            return CONFIG.ERRORS.NETWORK;
        }
        
        if (this.status === 429) {
            return CONFIG.ERRORS.RATE_LIMIT;
        }
        
        if (this.isServerError()) {
            return CONFIG.ERRORS.SERVER;
        }
        
        return this.message || CONFIG.ERRORS.GENERIC;
    }
}

// Create global API instance
window.api = new ApiService();
window.ApiError = ApiError;
