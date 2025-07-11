const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Asset generation script for Unit Converter Hub
 * Generates PNG images from SVG sources using Sharp
 */

// SVG definitions for app icons and images
const SVG_SOURCES = {
    logo: `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="512" height="512" rx="80" fill="url(#logoGradient)"/>
            <g fill="white" transform="translate(128, 128)">
                <!-- Calculator/Converter Icon -->
                <rect x="0" y="0" width="256" height="256" rx="32" fill="none" stroke="white" stroke-width="16"/>
                <rect x="32" y="32" width="192" height="64" rx="8" fill="white" opacity="0.9"/>
                
                <!-- Grid of conversion symbols -->
                <g transform="translate(32, 120)">
                    <!-- Length -->
                    <rect x="0" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="20" y="28" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">📏</text>
                    
                    <!-- Weight -->
                    <rect x="56" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="76" y="28" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">⚖️</text>
                    
                    <!-- Volume -->
                    <rect x="112" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="132" y="28" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">🥤</text>
                    
                    <!-- Temperature -->
                    <rect x="168" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="188" y="28" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">🌡️</text>
                    
                    <!-- Arrow indicating conversion -->
                    <g transform="translate(80, 56)">
                        <path d="M0 20 L40 20 M30 10 L40 20 L30 30" stroke="white" stroke-width="4" fill="none"/>
                    </g>
                    
                    <!-- Time -->
                    <rect x="0" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="20" y="100" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">⏰</text>
                    
                    <!-- Speed -->
                    <rect x="56" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="76" y="100" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">🏃</text>
                    
                    <!-- Area -->
                    <rect x="112" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="132" y="100" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">📐</text>
                    
                    <!-- Energy -->
                    <rect x="168" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                    <text x="188" y="100" text-anchor="middle" font-family="Arial" font-size="24" fill="#2563eb">⚡</text>
                </g>
            </g>
        </svg>
    `,
    
    favicon: `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="6" fill="url(#faviconGradient)"/>
            <g fill="white" transform="translate(4, 4)">
                <rect x="0" y="0" width="24" height="24" rx="3" fill="none" stroke="white" stroke-width="1.5"/>
                <rect x="3" y="3" width="18" height="6" rx="1" fill="white" opacity="0.9"/>
                <g transform="translate(3, 12)">
                    <rect x="0" y="0" width="4" height="4" rx="1" fill="white" opacity="0.8"/>
                    <rect x="5" y="0" width="4" height="4" rx="1" fill="white" opacity="0.8"/>
                    <rect x="10" y="0" width="4" height="4" rx="1" fill="white" opacity="0.8"/>
                    <rect x="15" y="0" width="3" height="4" rx="1" fill="white" opacity="0.8"/>
                    <path d="M7 6 L11 6 M10 5 L11 6 L10 7" stroke="white" stroke-width="0.5" fill="none"/>
                    <rect x="0" y="6" width="4" height="4" rx="1" fill="white" opacity="0.8"/>
                    <rect x="5" y="6" width="4" height="4" rx="1" fill="white" opacity="0.8"/>
                    <rect x="10" y="6" width="4" height="4" rx="1" fill="white" opacity="0.8"/>
                    <rect x="15" y="6" width="3" height="4" rx="1" fill="white" opacity="0.8"/>
                </g>
            </g>
        </svg>
    `,
    
    ogImage: `
        <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="1200" height="630" fill="url(#ogGradient)"/>
            
            <!-- Main content -->
            <g fill="white">
                <!-- Title -->
                <text x="600" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold">
                    Unit Converter Hub
                </text>
                
                <!-- Subtitle -->
                <text x="600" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" opacity="0.9">
                    Convert units instantly for length, weight, volume, temperature, and more
                </text>
                
                <!-- Features -->
                <g transform="translate(200, 320)">
                    <g transform="translate(0, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">📏</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Length</text>
                    </g>
                    <g transform="translate(200, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">⚖️</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Weight</text>
                    </g>
                    <g transform="translate(400, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">🥤</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Volume</text>
                    </g>
                    <g transform="translate(600, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">🌡️</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Temperature</text>
                    </g>
                </g>
                
                <g transform="translate(200, 420)">
                    <g transform="translate(0, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">📐</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Area</text>
                    </g>
                    <g transform="translate(200, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">⏰</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Time</text>
                    </g>
                    <g transform="translate(400, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">🏃</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Speed</text>
                    </g>
                    <g transform="translate(600, 0)">
                        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48">⚡</text>
                        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24">Energy</text>
                    </g>
                </g>
                
                <!-- Footer -->
                <text x="600" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" opacity="0.8">
                    Perfect for students, professionals, and travelers
                </text>
            </g>
        </svg>
    `
};

// Image specifications
const IMAGE_SPECS = {
    'logo.png': { svg: 'logo', width: 512, height: 512 },
    'favicon.png': { svg: 'favicon', width: 32, height: 32 },
    'apple-touch-icon.png': { svg: 'logo', width: 180, height: 180 },
    'og-image.png': { svg: 'ogImage', width: 1200, height: 630 },
    'twitter-card.png': { svg: 'ogImage', width: 1200, height: 630 }
};

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

/**
 * Generate PNG from SVG
 * @param {string} svgContent - SVG content
 * @param {string} outputPath - Output file path
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
async function generatePNG(svgContent, outputPath, width, height) {
    try {
        const buffer = Buffer.from(svgContent);
        
        await sharp(buffer)
            .resize(width, height)
            .png({ quality: 100, compressionLevel: 9 })
            .toFile(outputPath);
            
        console.log(`✅ Generated: ${outputPath} (${width}x${height})`);
    } catch (error) {
        console.error(`❌ Failed to generate ${outputPath}:`, error.message);
        throw error;
    }
}

/**
 * Generate all assets
 */
async function generateAssets() {
    console.log('🎨 Starting asset generation for Unit Converter Hub...\n');
    
    try {
        // Ensure images directory exists
        const imagesDir = path.join(__dirname, '..', 'public', 'images');
        await ensureDir(imagesDir);
        
        // Generate all images
        for (const [filename, spec] of Object.entries(IMAGE_SPECS)) {
            const svgContent = SVG_SOURCES[spec.svg];
            if (!svgContent) {
                console.error(`❌ SVG source '${spec.svg}' not found for ${filename}`);
                continue;
            }
            
            const outputPath = path.join(imagesDir, filename);
            await generatePNG(svgContent, outputPath, spec.width, spec.height);
        }
        
        console.log('\n🎉 Asset generation completed successfully!');
        console.log(`📁 Assets saved to: ${imagesDir}`);
        
    } catch (error) {
        console.error('\n💥 Asset generation failed:', error.message);
        process.exit(1);
    }
}

/**
 * Main execution
 */
if (require.main === module) {
    generateAssets();
}

module.exports = { generateAssets, SVG_SOURCES, IMAGE_SPECS };
