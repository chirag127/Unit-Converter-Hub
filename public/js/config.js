/**
 * Configuration file for Unit Converter Hub
 * Centralized API endpoints and application settings
 */

const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: window.location.origin + '/api/v1',
        ENDPOINTS: {
            CONVERT: '/convert',
            CONVERT_BATCH: '/convert/batch',
            CONVERT_FORMULA: '/convert/formula',
            CONVERT_VALIDATE: '/convert/validate',
            CATEGORIES: '/categories',
            CATEGORY_UNITS: '/categories/{category}',
            CATEGORY_UNIT_INFO: '/categories/{category}/units/{unit}',
            CATEGORY_SEARCH: '/categories/{category}/search',
            FAVORITES: '/favorites',
            FAVORITES_VALIDATE: '/favorites/validate',
            FAVORITES_EXPORT: '/favorites/export',
            FAVORITES_IMPORT: '/favorites/import',
            FAVORITES_STATS: '/favorites/stats',
            HEALTH: '/health'
        }
    },
    
    // Application Settings
    APP: {
        NAME: 'Unit Converter Hub',
        VERSION: '1.0.0',
        AUTHOR: 'Chirag Singhal',
        GITHUB_URL: 'https://github.com/chirag127/Unit-Converter-Hub'
    },
    
    // Local Storage Keys
    STORAGE: {
        FAVORITES: 'unitConverterFavorites',
        SETTINGS: 'unitConverterSettings',
        RECENT_CONVERSIONS: 'unitConverterRecent'
    },
    
    // UI Settings
    UI: {
        TOAST_DURATION: 5000,
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500,
        MAX_RECENT_CONVERSIONS: 10,
        MAX_FAVORITES: 50
    },
    
    // Conversion Settings
    CONVERSION: {
        DECIMAL_PLACES: 10,
        SCIENTIFIC_NOTATION_THRESHOLD: 1e6,
        MIN_VALUE: -1e15,
        MAX_VALUE: 1e15
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection and try again.',
        SERVER: 'Server error. Please try again later.',
        VALIDATION: 'Please check your input and try again.',
        NOT_FOUND: 'The requested resource was not found.',
        RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
        GENERIC: 'An unexpected error occurred. Please try again.'
    },
    
    // Success Messages
    SUCCESS: {
        CONVERSION: 'Conversion completed successfully',
        FAVORITE_ADDED: 'Added to favorites',
        FAVORITE_REMOVED: 'Removed from favorites',
        FAVORITES_EXPORTED: 'Favorites exported successfully',
        FAVORITES_IMPORTED: 'Favorites imported successfully',
        COPIED: 'Copied to clipboard'
    }
};

/**
 * Build API URL with parameters
 * @param {string} endpoint - Endpoint path
 * @param {Object} params - URL parameters
 * @returns {string} Complete URL
 */
CONFIG.buildApiUrl = function(endpoint, params = {}) {
    let url = this.API.BASE_URL + endpoint;
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, encodeURIComponent(params[key]));
    });
    
    return url;
};

/**
 * Get endpoint URL
 * @param {string} name - Endpoint name
 * @param {Object} params - URL parameters
 * @returns {string} Complete URL
 */
CONFIG.getEndpoint = function(name, params = {}) {
    const endpoint = this.API.ENDPOINTS[name];
    if (!endpoint) {
        throw new Error(`Unknown endpoint: ${name}`);
    }
    return this.buildApiUrl(endpoint, params);
};

/**
 * Format number for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
CONFIG.formatNumber = function(value, decimals = this.CONVERSION.DECIMAL_PLACES) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'Invalid';
    }
    
    // Handle very large or very small numbers
    if (Math.abs(value) >= this.CONVERSION.SCIENTIFIC_NOTATION_THRESHOLD || 
        (Math.abs(value) < 1e-6 && value !== 0)) {
        return value.toExponential(6);
    }
    
    // Remove trailing zeros
    const formatted = value.toFixed(decimals);
    return parseFloat(formatted).toString();
};

/**
 * Validate conversion value
 * @param {any} value - Value to validate
 * @returns {Object} Validation result
 */
CONFIG.validateValue = function(value) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        return {
            valid: false,
            error: 'Please enter a valid number'
        };
    }
    
    if (numValue < this.CONVERSION.MIN_VALUE || numValue > this.CONVERSION.MAX_VALUE) {
        return {
            valid: false,
            error: `Value must be between ${this.CONVERSION.MIN_VALUE} and ${this.CONVERSION.MAX_VALUE}`
        };
    }
    
    return {
        valid: true,
        value: numValue
    };
};

/**
 * Get error message for HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} Error message
 */
CONFIG.getErrorMessage = function(status) {
    switch (status) {
        case 400:
            return this.ERRORS.VALIDATION;
        case 404:
            return this.ERRORS.NOT_FOUND;
        case 429:
            return this.ERRORS.RATE_LIMIT;
        case 500:
        case 502:
        case 503:
        case 504:
            return this.ERRORS.SERVER;
        default:
            if (status >= 400 && status < 500) {
                return this.ERRORS.VALIDATION;
            } else if (status >= 500) {
                return this.ERRORS.SERVER;
            }
            return this.ERRORS.GENERIC;
    }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
CONFIG.debounce = function(func, wait = this.UI.DEBOUNCE_DELAY) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
CONFIG.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Get current timestamp
 * @returns {string} ISO timestamp
 */
CONFIG.getTimestamp = function() {
    return new Date().toISOString();
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
