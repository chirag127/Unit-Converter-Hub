const UNIT_CATEGORIES = require('../models/unitCategories');

/**
 * Precision for floating point calculations
 */
const PRECISION = 15;

/**
 * Round number to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
function roundToPrecision(num, decimals = 10) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Convert temperature between different units
 * @param {number} value - Temperature value
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted temperature
 */
function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    // Convert to Celsius first
    let celsius;
    switch (fromUnit) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
        case 'rankine':
            celsius = (value - 491.67) * 5/9;
            break;
        default:
            throw new Error(`Unknown temperature unit: ${fromUnit}`);
    }
    
    // Convert from Celsius to target unit
    let result;
    switch (toUnit) {
        case 'celsius':
            result = celsius;
            break;
        case 'fahrenheit':
            result = celsius * 9/5 + 32;
            break;
        case 'kelvin':
            result = celsius + 273.15;
            break;
        case 'rankine':
            result = celsius * 9/5 + 491.67;
            break;
        default:
            throw new Error(`Unknown temperature unit: ${toUnit}`);
    }
    
    return roundToPrecision(result);
}

/**
 * Convert units using conversion factors
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @param {string} category - Unit category
 * @returns {number} Converted value
 */
function convertWithFactors(value, fromUnit, toUnit, category) {
    if (fromUnit === toUnit) return value;
    
    const categoryData = UNIT_CATEGORIES[category];
    if (!categoryData) {
        throw new Error(`Unknown category: ${category}`);
    }
    
    const fromUnitData = categoryData.units[fromUnit];
    const toUnitData = categoryData.units[toUnit];
    
    if (!fromUnitData) {
        throw new Error(`Unknown unit '${fromUnit}' in category '${category}'`);
    }
    
    if (!toUnitData) {
        throw new Error(`Unknown unit '${toUnit}' in category '${category}'`);
    }
    
    // Convert to base unit, then to target unit
    const baseValue = value * fromUnitData.factor;
    const result = baseValue / toUnitData.factor;
    
    return roundToPrecision(result);
}

/**
 * Main conversion function
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @param {string} category - Unit category
 * @returns {Object} Conversion result
 */
function convert(value, fromUnit, toUnit, category) {
    try {
        // Validate input
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Value must be a valid number');
        }
        
        if (!fromUnit || !toUnit || !category) {
            throw new Error('From unit, to unit, and category are required');
        }
        
        // Check if category exists
        if (!UNIT_CATEGORIES[category]) {
            throw new Error(`Unknown category: ${category}`);
        }
        
        let result;
        
        // Special handling for temperature
        if (category === 'temperature') {
            result = convertTemperature(value, fromUnit, toUnit);
        } else {
            result = convertWithFactors(value, fromUnit, toUnit, category);
        }
        
        return {
            success: true,
            originalValue: value,
            convertedValue: result,
            fromUnit: fromUnit,
            toUnit: toUnit,
            category: category,
            formula: getConversionFormula(value, fromUnit, toUnit, category),
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            originalValue: value,
            fromUnit: fromUnit,
            toUnit: toUnit,
            category: category,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Get conversion formula for display
 * @param {number} value - Original value
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @param {string} category - Unit category
 * @returns {string} Formula string
 */
function getConversionFormula(value, fromUnit, toUnit, category) {
    const categoryData = UNIT_CATEGORIES[category];
    if (!categoryData) return '';
    
    const fromUnitData = categoryData.units[fromUnit];
    const toUnitData = categoryData.units[toUnit];
    
    if (!fromUnitData || !toUnitData) return '';
    
    if (category === 'temperature') {
        return getTemperatureFormula(fromUnit, toUnit);
    }
    
    const factor = fromUnitData.factor / toUnitData.factor;
    return `${value} ${fromUnitData.symbol} = ${value} × ${factor} = ${roundToPrecision(value * factor)} ${toUnitData.symbol}`;
}

/**
 * Get temperature conversion formula
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {string} Formula string
 */
function getTemperatureFormula(fromUnit, toUnit) {
    const formulas = {
        'celsius-fahrenheit': '°C × 9/5 + 32 = °F',
        'fahrenheit-celsius': '(°F - 32) × 5/9 = °C',
        'celsius-kelvin': '°C + 273.15 = K',
        'kelvin-celsius': 'K - 273.15 = °C',
        'fahrenheit-kelvin': '(°F - 32) × 5/9 + 273.15 = K',
        'kelvin-fahrenheit': '(K - 273.15) × 9/5 + 32 = °F',
        'celsius-rankine': '°C × 9/5 + 491.67 = °R',
        'rankine-celsius': '(°R - 491.67) × 5/9 = °C',
        'fahrenheit-rankine': '°F + 459.67 = °R',
        'rankine-fahrenheit': '°R - 459.67 = °F',
        'kelvin-rankine': 'K × 9/5 = °R',
        'rankine-kelvin': '°R × 5/9 = K'
    };
    
    return formulas[`${fromUnit}-${toUnit}`] || '';
}

/**
 * Get all available units for a category
 * @param {string} category - Unit category
 * @returns {Object} Units data
 */
function getUnitsForCategory(category) {
    const categoryData = UNIT_CATEGORIES[category];
    if (!categoryData) {
        throw new Error(`Unknown category: ${category}`);
    }
    
    return {
        category: category,
        name: categoryData.name,
        icon: categoryData.icon,
        baseUnit: categoryData.baseUnit,
        units: Object.keys(categoryData.units).map(key => ({
            key: key,
            ...categoryData.units[key]
        }))
    };
}

/**
 * Get all available categories
 * @returns {Array} Categories list
 */
function getAllCategories() {
    return Object.keys(UNIT_CATEGORIES).map(key => ({
        key: key,
        name: UNIT_CATEGORIES[key].name,
        icon: UNIT_CATEGORIES[key].icon,
        baseUnit: UNIT_CATEGORIES[key].baseUnit,
        unitCount: Object.keys(UNIT_CATEGORIES[key].units).length
    }));
}

module.exports = {
    convert,
    getUnitsForCategory,
    getAllCategories,
    convertTemperature,
    convertWithFactors,
    roundToPrecision,
    getConversionFormula
};
