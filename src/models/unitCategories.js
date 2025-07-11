/**
 * Unit Categories and Conversion Factors
 * All conversion factors are relative to the base unit for each category
 */

const UNIT_CATEGORIES = {
    length: {
        name: 'Length',
        icon: '📏',
        baseUnit: 'meter',
        units: {
            // Metric
            nanometer: { name: 'Nanometer', symbol: 'nm', factor: 1e-9, category: 'metric' },
            micrometer: { name: 'Micrometer', symbol: 'μm', factor: 1e-6, category: 'metric' },
            millimeter: { name: 'Millimeter', symbol: 'mm', factor: 0.001, category: 'metric' },
            centimeter: { name: 'Centimeter', symbol: 'cm', factor: 0.01, category: 'metric' },
            meter: { name: 'Meter', symbol: 'm', factor: 1, category: 'metric' },
            kilometer: { name: 'Kilometer', symbol: 'km', factor: 1000, category: 'metric' },

            // Imperial
            inch: { name: 'Inch', symbol: 'in', factor: 0.0254, category: 'imperial' },
            foot: { name: 'Foot', symbol: 'ft', factor: 0.3048, category: 'imperial' },
            yard: { name: 'Yard', symbol: 'yd', factor: 0.9144, category: 'imperial' },
            mile: { name: 'Mile', symbol: 'mi', factor: 1609.344, category: 'imperial' },

            // Nautical
            nauticalMile: { name: 'Nautical Mile', symbol: 'nmi', factor: 1852, category: 'nautical' },

            // Other
            lightYear: { name: 'Light Year', symbol: 'ly', factor: 9.461e15, category: 'astronomical' }
        }
    },

    weight: {
        name: 'Weight',
        icon: '⚖️',
        baseUnit: 'kilogram',
        units: {
            // Metric
            milligram: { name: 'Milligram', symbol: 'mg', factor: 1e-6, category: 'metric' },
            gram: { name: 'Gram', symbol: 'g', factor: 0.001, category: 'metric' },
            kilogram: { name: 'Kilogram', symbol: 'kg', factor: 1, category: 'metric' },
            tonne: { name: 'Tonne', symbol: 't', factor: 1000, category: 'metric' },

            // Imperial
            ounce: { name: 'Ounce', symbol: 'oz', factor: 0.0283495, category: 'imperial' },
            pound: { name: 'Pound', symbol: 'lb', factor: 0.453592, category: 'imperial' },
            stone: { name: 'Stone', symbol: 'st', factor: 6.35029, category: 'imperial' },
            ton: { name: 'Ton (US)', symbol: 'ton', factor: 907.185, category: 'imperial' }
        }
    },

    volume: {
        name: 'Volume',
        icon: '🥤',
        baseUnit: 'liter',
        units: {
            // Metric
            milliliter: { name: 'Milliliter', symbol: 'ml', factor: 0.001, category: 'metric' },
            liter: { name: 'Liter', symbol: 'l', factor: 1, category: 'metric' },
            cubicMeter: { name: 'Cubic Meter', symbol: 'm³', factor: 1000, category: 'metric' },

            // Imperial
            fluidOunce: { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735, category: 'imperial' },
            cup: { name: 'Cup (US)', symbol: 'cup', factor: 0.236588, category: 'imperial' },
            pint: { name: 'Pint (US)', symbol: 'pt', factor: 0.473176, category: 'imperial' },
            quart: { name: 'Quart (US)', symbol: 'qt', factor: 0.946353, category: 'imperial' },
            gallon: { name: 'Gallon (US)', symbol: 'gal', factor: 3.78541, category: 'imperial' },

            // UK Imperial
            fluidOunceUK: { name: 'Fluid Ounce (UK)', symbol: 'fl oz (UK)', factor: 0.0284131, category: 'uk-imperial' },
            pintUK: { name: 'Pint (UK)', symbol: 'pt (UK)', factor: 0.568261, category: 'uk-imperial' },
            gallonUK: { name: 'Gallon (UK)', symbol: 'gal (UK)', factor: 4.54609, category: 'uk-imperial' }
        }
    },

    temperature: {
        name: 'Temperature',
        icon: '🌡️',
        baseUnit: 'celsius',
        units: {
            celsius: { name: 'Celsius', symbol: '°C', factor: 1, category: 'metric' },
            fahrenheit: { name: 'Fahrenheit', symbol: '°F', factor: 1, category: 'imperial' },
            kelvin: { name: 'Kelvin', symbol: 'K', factor: 1, category: 'scientific' },
            rankine: { name: 'Rankine', symbol: '°R', factor: 1, category: 'scientific' }
        }
    },

    area: {
        name: 'Area',
        icon: '📐',
        baseUnit: 'squareMeter',
        units: {
            // Metric
            squareMillimeter: { name: 'Square Millimeter', symbol: 'mm²', factor: 1e-6, category: 'metric' },
            squareCentimeter: { name: 'Square Centimeter', symbol: 'cm²', factor: 1e-4, category: 'metric' },
            squareMeter: { name: 'Square Meter', symbol: 'm²', factor: 1, category: 'metric' },
            hectare: { name: 'Hectare', symbol: 'ha', factor: 10000, category: 'metric' },
            squareKilometer: { name: 'Square Kilometer', symbol: 'km²', factor: 1e6, category: 'metric' },

            // Imperial
            squareInch: { name: 'Square Inch', symbol: 'in²', factor: 0.00064516, category: 'imperial' },
            squareFoot: { name: 'Square Foot', symbol: 'ft²', factor: 0.092903, category: 'imperial' },
            squareYard: { name: 'Square Yard', symbol: 'yd²', factor: 0.836127, category: 'imperial' },
            acre: { name: 'Acre', symbol: 'ac', factor: 4046.86, category: 'imperial' },
            squareMile: { name: 'Square Mile', symbol: 'mi²', factor: 2.59e6, category: 'imperial' }
        }
    },

    time: {
        name: 'Time',
        icon: '⏰',
        baseUnit: 'second',
        units: {
            nanosecond: { name: 'Nanosecond', symbol: 'ns', factor: 1e-9, category: 'scientific' },
            microsecond: { name: 'Microsecond', symbol: 'μs', factor: 1e-6, category: 'scientific' },
            millisecond: { name: 'Millisecond', symbol: 'ms', factor: 0.001, category: 'metric' },
            second: { name: 'Second', symbol: 's', factor: 1, category: 'metric' },
            minute: { name: 'Minute', symbol: 'min', factor: 60, category: 'common' },
            hour: { name: 'Hour', symbol: 'h', factor: 3600, category: 'common' },
            day: { name: 'Day', symbol: 'd', factor: 86400, category: 'common' },
            week: { name: 'Week', symbol: 'wk', factor: 604800, category: 'common' },
            month: { name: 'Month', symbol: 'mo', factor: 2629746, category: 'common' },
            year: { name: 'Year', symbol: 'yr', factor: 31556952, category: 'common' }
        }
    },

    speed: {
        name: 'Speed',
        icon: '🏃',
        baseUnit: 'meterPerSecond',
        units: {
            meterPerSecond: { name: 'Meter per Second', symbol: 'm/s', factor: 1, category: 'metric' },
            kilometerPerHour: { name: 'Kilometer per Hour', symbol: 'km/h', factor: 0.277778, category: 'metric' },
            milePerHour: { name: 'Mile per Hour', symbol: 'mph', factor: 0.44704, category: 'imperial' },
            footPerSecond: { name: 'Foot per Second', symbol: 'ft/s', factor: 0.3048, category: 'imperial' },
            knot: { name: 'Knot', symbol: 'kn', factor: 0.514444, category: 'nautical' },
            mach: { name: 'Mach', symbol: 'Ma', factor: 343, category: 'scientific' }
        }
    },

    energy: {
        name: 'Energy',
        icon: '⚡',
        baseUnit: 'joule',
        units: {
            joule: { name: 'Joule', symbol: 'J', factor: 1, category: 'metric' },
            kilojoule: { name: 'Kilojoule', symbol: 'kJ', factor: 1000, category: 'metric' },
            calorie: { name: 'Calorie', symbol: 'cal', factor: 4.184, category: 'metric' },
            kilocalorie: { name: 'Kilocalorie', symbol: 'kcal', factor: 4184, category: 'metric' },
            wattHour: { name: 'Watt Hour', symbol: 'Wh', factor: 3600, category: 'electrical' },
            kilowattHour: { name: 'Kilowatt Hour', symbol: 'kWh', factor: 3.6e6, category: 'electrical' },
            btu: { name: 'British Thermal Unit', symbol: 'BTU', factor: 1055.06, category: 'imperial' }
        }
    }
};

module.exports = UNIT_CATEGORIES;
