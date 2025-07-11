/**
 * Simple asset generation without Sharp dependency
 * Creates basic SVG files that can be used directly
 */

const fs = require('fs').promises;
const path = require('path');

// SVG definitions for app icons and images
const SVG_SOURCES = {
    logo: `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="512" height="512" rx="80" fill="url(#logoGradient)"/>
        <g fill="white" transform="translate(128, 128)">
            <rect x="0" y="0" width="256" height="256" rx="32" fill="none" stroke="white" stroke-width="16"/>
            <rect x="32" y="32" width="192" height="64" rx="8" fill="white" opacity="0.9"/>
            <g transform="translate(32, 120)">
                <rect x="0" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="20" y="28" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">📏</text>
                <rect x="56" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="76" y="28" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">⚖️</text>
                <rect x="112" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="132" y="28" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">🥤</text>
                <rect x="168" y="0" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="188" y="28" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">🌡️</text>
                <g transform="translate(80, 56)">
                    <path d="M0 20 L40 20 M30 10 L40 20 L30 30" stroke="white" stroke-width="4" fill="none"/>
                </g>
                <rect x="0" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="20" y="100" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">⏰</text>
                <rect x="56" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="76" y="100" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">🏃</text>
                <rect x="112" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="132" y="100" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">📐</text>
                <rect x="168" y="72" width="40" height="40" rx="8" fill="white" opacity="0.8"/>
                <text x="188" y="100" text-anchor="middle" font-family="Arial" font-size="20" fill="#2563eb">⚡</text>
            </g>
        </g>
    </svg>`,
    
    favicon: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
};

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

/**
 * Generate SVG files
 */
async function generateSVGAssets() {
    console.log('🎨 Generating SVG assets for Unit Converter Hub...\n');
    
    try {
        // Ensure images directory exists
        const imagesDir = path.join(__dirname, '..', 'public', 'images');
        await ensureDir(imagesDir);
        
        // Generate SVG files
        for (const [name, svgContent] of Object.entries(SVG_SOURCES)) {
            const filename = `${name}.svg`;
            const outputPath = path.join(imagesDir, filename);
            await fs.writeFile(outputPath, svgContent, 'utf8');
            console.log(`✅ Generated: ${filename}`);
        }
        
        // Create placeholder PNG files (can be replaced later with actual PNGs)
        const placeholderFiles = [
            'logo.png',
            'favicon.png', 
            'apple-touch-icon.png',
            'og-image.png',
            'twitter-card.png'
        ];
        
        for (const filename of placeholderFiles) {
            const outputPath = path.join(imagesDir, filename);
            // Create a simple placeholder file
            await fs.writeFile(outputPath, 'PNG placeholder - replace with actual PNG', 'utf8');
            console.log(`📝 Created placeholder: ${filename}`);
        }
        
        console.log('\n🎉 SVG asset generation completed successfully!');
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
    generateSVGAssets();
}

module.exports = { generateSVGAssets };
