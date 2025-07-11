/**
 * Simple server for Unit Converter Hub
 * Basic HTTP server without external dependencies for demonstration
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// Simple unit categories data
const UNIT_CATEGORIES = {
    length: {
        name: 'Length',
        icon: '📏',
        baseUnit: 'meter',
        units: {
            meter: { name: 'Meter', symbol: 'm', factor: 1 },
            centimeter: { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
            millimeter: { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
            kilometer: { name: 'Kilometer', symbol: 'km', factor: 1000 },
            inch: { name: 'Inch', symbol: 'in', factor: 0.0254 },
            foot: { name: 'Foot', symbol: 'ft', factor: 0.3048 },
            yard: { name: 'Yard', symbol: 'yd', factor: 0.9144 },
            mile: { name: 'Mile', symbol: 'mi', factor: 1609.344 }
        }
    },
    weight: {
        name: 'Weight',
        icon: '⚖️',
        baseUnit: 'kilogram',
        units: {
            kilogram: { name: 'Kilogram', symbol: 'kg', factor: 1 },
            gram: { name: 'Gram', symbol: 'g', factor: 0.001 },
            pound: { name: 'Pound', symbol: 'lb', factor: 0.453592 },
            ounce: { name: 'Ounce', symbol: 'oz', factor: 0.0283495 }
        }
    },
    temperature: {
        name: 'Temperature',
        icon: '🌡️',
        baseUnit: 'celsius',
        units: {
            celsius: { name: 'Celsius', symbol: '°C', factor: 1 },
            fahrenheit: { name: 'Fahrenheit', symbol: '°F', factor: 1 },
            kelvin: { name: 'Kelvin', symbol: 'K', factor: 1 }
        }
    }
};

/**
 * Convert temperature between units
 */
function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    let celsius;
    switch (fromUnit) {
        case 'celsius': celsius = value; break;
        case 'fahrenheit': celsius = (value - 32) * 5/9; break;
        case 'kelvin': celsius = value - 273.15; break;
        default: throw new Error(`Unknown temperature unit: ${fromUnit}`);
    }
    
    switch (toUnit) {
        case 'celsius': return celsius;
        case 'fahrenheit': return celsius * 9/5 + 32;
        case 'kelvin': return celsius + 273.15;
        default: throw new Error(`Unknown temperature unit: ${toUnit}`);
    }
}

/**
 * Convert units using factors
 */
function convertWithFactors(value, fromUnit, toUnit, category) {
    if (fromUnit === toUnit) return value;
    
    const categoryData = UNIT_CATEGORIES[category];
    if (!categoryData) throw new Error(`Unknown category: ${category}`);
    
    const fromUnitData = categoryData.units[fromUnit];
    const toUnitData = categoryData.units[toUnit];
    
    if (!fromUnitData || !toUnitData) {
        throw new Error(`Unknown unit in category ${category}`);
    }
    
    const baseValue = value * fromUnitData.factor;
    return baseValue / toUnitData.factor;
}

/**
 * Main conversion function
 */
function convert(value, fromUnit, toUnit, category) {
    try {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Value must be a valid number');
        }
        
        let result;
        if (category === 'temperature') {
            result = convertTemperature(value, fromUnit, toUnit);
        } else {
            result = convertWithFactors(value, fromUnit, toUnit, category);
        }
        
        return {
            success: true,
            originalValue: value,
            convertedValue: Math.round(result * 1e10) / 1e10, // Round to 10 decimal places
            fromUnit,
            toUnit,
            category,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            originalValue: value,
            fromUnit,
            toUnit,
            category,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Serve static files
 */
function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

/**
 * Handle API requests
 */
function handleApiRequest(pathname, query, body, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        if (pathname === '/api/health') {
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: 'development',
                version: '1.0.0'
            }));
            return;
        }
        
        if (pathname === '/api/v1/categories') {
            const categories = Object.keys(UNIT_CATEGORIES).map(key => ({
                key,
                name: UNIT_CATEGORIES[key].name,
                icon: UNIT_CATEGORIES[key].icon,
                baseUnit: UNIT_CATEGORIES[key].baseUnit,
                unitCount: Object.keys(UNIT_CATEGORIES[key].units).length
            }));
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                count: categories.length,
                categories,
                timestamp: new Date().toISOString()
            }));
            return;
        }
        
        if (pathname.startsWith('/api/v1/categories/')) {
            const parts = pathname.split('/');
            const category = parts[4];
            
            if (UNIT_CATEGORIES[category]) {
                const categoryData = UNIT_CATEGORIES[category];
                const units = Object.keys(categoryData.units).map(key => ({
                    key,
                    ...categoryData.units[key]
                }));
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    category,
                    name: categoryData.name,
                    icon: categoryData.icon,
                    baseUnit: categoryData.baseUnit,
                    units,
                    timestamp: new Date().toISOString()
                }));
                return;
            }
        }
        
        if (pathname === '/api/v1/convert' && body) {
            const { value, fromUnit, toUnit, category } = JSON.parse(body);
            const result = convert(parseFloat(value), fromUnit, toUnit, category);
            
            res.writeHead(200);
            res.end(JSON.stringify(result));
            return;
        }
        
        // Default 404 for unknown API endpoints
        res.writeHead(404);
        res.end(JSON.stringify({
            error: 'API endpoint not found',
            path: pathname
        }));
        
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }));
    }
}

/**
 * Create HTTP server
 */
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle API requests
    if (pathname.startsWith('/api/')) {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                handleApiRequest(pathname, parsedUrl.query, body, res);
            });
        } else {
            handleApiRequest(pathname, parsedUrl.query, null, res);
        }
        return;
    }
    
    // Serve static files
    let filePath;
    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else {
        filePath = path.join(__dirname, 'public', pathname);
    }
    
    serveStaticFile(filePath, res);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Unit Converter Hub server running on port ${PORT}`);
    console.log(`📱 Environment: development`);
    console.log(`🌐 Access the app at: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n✨ Features available:`);
    console.log(`   - Real-time unit conversions`);
    console.log(`   - Multiple unit categories`);
    console.log(`   - Responsive mobile design`);
    console.log(`   - Progressive Web App support`);
    console.log(`   - Local favorites system`);
    console.log(`\n🎯 Ready to convert units!`);
});

module.exports = server;
