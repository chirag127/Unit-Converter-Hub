# Unit Converter Hub

A comprehensive unit converter application for students, professionals, and travelers. Convert units instantly across multiple categories with real-time calculations, responsive design, and a favorites system.

![Unit Converter Hub](public/images/og-image.png)

## 🌟 Features

- **Real-time Conversions**: Instant unit conversions as you type
- **Multiple Categories**: Length, weight, volume, temperature, area, time, speed, and energy
- **Responsive Design**: Mobile-first design that works on all devices
- **Favorites System**: Save frequently used conversions for quick access
- **Progressive Web App**: Install on your device for offline access
- **High Precision**: Accurate calculations with proper rounding
- **Export/Import**: Backup and share your favorite conversions
- **Touch-Friendly**: Optimized for mobile and tablet use

## 📱 Categories Supported

| Category | Units Available | Examples |
|----------|----------------|----------|
| 📏 **Length** | 12+ units | Meter, Foot, Inch, Kilometer, Mile |
| ⚖️ **Weight** | 8+ units | Kilogram, Pound, Ounce, Gram, Tonne |
| 🥤 **Volume** | 10+ units | Liter, Gallon, Cup, Milliliter, Quart |
| 🌡️ **Temperature** | 4 units | Celsius, Fahrenheit, Kelvin, Rankine |
| 📐 **Area** | 10+ units | Square Meter, Acre, Hectare, Square Foot |
| ⏰ **Time** | 10+ units | Second, Minute, Hour, Day, Week, Year |
| 🏃 **Speed** | 6+ units | m/s, km/h, mph, ft/s, knot, Mach |
| ⚡ **Energy** | 7+ units | Joule, Calorie, kWh, BTU, Watt Hour |

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chirag127/Unit-Converter-Hub.git
   cd Unit-Converter-Hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your preferred settings.

4. **Generate assets**
   ```bash
   npm run generate-assets
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🛠️ Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run build` - Build for production
- `npm run generate-assets` - Generate PNG assets from SVG sources

### Project Structure

```
Unit-Converter-Hub/
├── public/                 # Static files
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   ├── images/            # Generated images
│   ├── index.html         # Main HTML file
│   └── manifest.json      # PWA manifest
├── src/                   # Server-side code
│   ├── controllers/       # Route controllers
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── scripts/              # Build scripts
├── tests/                # Test files
├── server.js             # Main server file
└── package.json          # Dependencies and scripts
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `API_BASE_URL` | API base URL | `http://localhost:3000/api` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### Categories
- `GET /categories` - Get all unit categories
- `GET /categories/{category}` - Get units for a category
- `GET /categories/{category}/units/{unit}` - Get unit information
- `GET /categories/{category}/search?q={query}` - Search units

#### Conversions
- `POST /convert` - Convert units
- `POST /convert/batch` - Batch convert multiple values
- `GET /convert/formula/{category}/{from}/{to}` - Get conversion formula
- `POST /convert/validate` - Validate conversion parameters

#### Favorites
- `GET /favorites` - Get favorites information
- `POST /favorites/validate` - Validate favorite data
- `POST /favorites/export` - Export favorites
- `POST /favorites/import` - Import favorites
- `POST /favorites/stats` - Get favorites statistics

### Example API Usage

```javascript
// Convert 1 meter to centimeters
const response = await fetch('/api/v1/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: 1,
    fromUnit: 'meter',
    toUnit: 'centimeter',
    category: 'length'
  })
});

const result = await response.json();
console.log(result.convertedValue); // 100
```

## 🧪 Testing

The application includes comprehensive tests for:

- **Unit Conversion Logic**: Accuracy and edge cases
- **API Endpoints**: All routes and error handling
- **Frontend Functionality**: User interactions and UI components

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Progressive Web App

Unit Converter Hub can be installed as a PWA on supported devices:

1. Open the app in your browser
2. Look for the "Install" prompt or "Add to Home Screen"
3. Follow the installation instructions
4. Access the app from your home screen or app drawer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Chirag Singhal** ([@chirag127](https://github.com/chirag127))

- GitHub: [https://github.com/chirag127](https://github.com/chirag127)
- Project: [https://github.com/chirag127/Unit-Converter-Hub](https://github.com/chirag127/Unit-Converter-Hub)

## 🙏 Acknowledgments

- Built with Node.js and Express.js
- Icons and emojis for visual appeal
- Sharp library for image processing
- Jest and Supertest for testing

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: 2025-07-11T17:06:35.651Z
- **Maintenance**: Actively maintained

---

**Made with ❤️ for students, professionals, and travelers worldwide**
