/**
 * Main application logic for Unit Converter Hub
 * Handles application initialization and core functionality
 */

class UnitConverterApp {
    constructor() {
        this.currentCategory = null;
        this.currentUnits = [];
        this.lastConversion = null;
        this.isConverting = false;
        
        // DOM elements
        this.elements = {
            categoryGrid: document.getElementById('categoryGrid'),
            conversionInterface: document.getElementById('conversionInterface'),
            conversionTitle: document.getElementById('conversionTitle'),
            backButton: document.getElementById('backButton'),
            fromValue: document.getElementById('fromValue'),
            fromUnit: document.getElementById('fromUnit'),
            toValue: document.getElementById('toValue'),
            toUnit: document.getElementById('toUnit'),
            swapButton: document.getElementById('swapButton'),
            convertButton: document.getElementById('convertButton'),
            clearButton: document.getElementById('clearButton'),
            favoriteButton: document.getElementById('favoriteButton'),
            conversionResult: document.getElementById('conversionResult'),
            resultValue: document.getElementById('resultValue'),
            resultFormula: document.getElementById('resultFormula'),
            favoritesGrid: document.getElementById('favoritesGrid'),
            emptyFavorites: document.getElementById('emptyFavorites'),
            exportFavorites: document.getElementById('exportFavorites'),
            importFavorites: document.getElementById('importFavorites'),
            importFile: document.getElementById('importFile'),
            navToggle: document.querySelector('.nav-toggle'),
            navMenu: document.querySelector('.nav-menu')
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            ui.showLoading('Initializing Unit Converter Hub...');
            
            // Load categories
            await this.loadCategories();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load favorites
            this.loadFavorites();
            
            // Check API health
            await this.checkApiHealth();
            
            ui.hideLoading();
            ui.showSuccess('Unit Converter Hub loaded successfully!');
            
        } catch (error) {
            console.error('Initialization error:', error);
            ui.hideLoading();
            ui.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    /**
     * Load unit categories from API
     */
    async loadCategories() {
        try {
            const response = await api.getCategories();
            this.renderCategories(response.categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            ui.showError('Failed to load unit categories');
        }
    }

    /**
     * Render categories grid
     * @param {Array} categories - Categories array
     */
    renderCategories(categories) {
        if (!this.elements.categoryGrid) return;

        this.elements.categoryGrid.innerHTML = categories.map(category => `
            <div class="category-card" data-category="${category.key}">
                <span class="category-icon">${category.icon}</span>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.unitCount} units</div>
            </div>
        `).join('');

        // Add click listeners
        this.elements.categoryGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.selectCategory(category);
            });
        });
    }

    /**
     * Select a category and load its units
     * @param {string} category - Category key
     */
    async selectCategory(category) {
        try {
            ui.showLoading('Loading units...');
            
            const response = await api.getCategoryUnits(category);
            this.currentCategory = category;
            this.currentUnits = response.units;
            
            this.showConversionInterface(response);
            ui.hideLoading();
            
        } catch (error) {
            console.error('Error loading category units:', error);
            ui.hideLoading();
            ui.showError('Failed to load units for this category');
        }
    }

    /**
     * Show conversion interface
     * @param {Object} categoryData - Category data
     */
    showConversionInterface(categoryData) {
        // Update title
        if (this.elements.conversionTitle) {
            this.elements.conversionTitle.textContent = `${categoryData.name} Converter`;
        }

        // Populate unit selects
        this.populateUnitSelects(categoryData.units);

        // Show interface
        if (this.elements.conversionInterface) {
            this.elements.conversionInterface.style.display = 'block';
        }

        // Hide categories
        if (this.elements.categoryGrid) {
            this.elements.categoryGrid.parentElement.style.display = 'none';
        }

        // Update favorite button state
        this.updateFavoriteButton();
    }

    /**
     * Populate unit select dropdowns
     * @param {Array} units - Units array
     */
    populateUnitSelects(units) {
        const options = units.map(unit => 
            `<option value="${unit.key}">${unit.name} (${unit.symbol})</option>`
        ).join('');

        if (this.elements.fromUnit) {
            this.elements.fromUnit.innerHTML = options;
        }
        
        if (this.elements.toUnit) {
            this.elements.toUnit.innerHTML = options;
            // Select different default unit
            if (units.length > 1) {
                this.elements.toUnit.selectedIndex = 1;
            }
        }
    }

    /**
     * Go back to categories
     */
    goBackToCategories() {
        // Hide conversion interface
        if (this.elements.conversionInterface) {
            this.elements.conversionInterface.style.display = 'none';
        }

        // Show categories
        if (this.elements.categoryGrid) {
            this.elements.categoryGrid.parentElement.style.display = 'block';
        }

        // Clear current state
        this.currentCategory = null;
        this.currentUnits = [];
        this.clearConversion();
    }

    /**
     * Perform unit conversion
     */
    async performConversion() {
        if (this.isConverting) return;

        try {
            const value = parseFloat(this.elements.fromValue.value);
            const fromUnit = this.elements.fromUnit.value;
            const toUnit = this.elements.toUnit.value;

            // Validate input
            const validation = CONFIG.validateValue(value);
            if (!validation.valid) {
                ui.showError(validation.error);
                return;
            }

            if (!fromUnit || !toUnit) {
                ui.showError('Please select both units');
                return;
            }

            if (fromUnit === toUnit) {
                ui.showWarning('From unit and to unit are the same');
                this.elements.toValue.value = value;
                return;
            }

            this.isConverting = true;
            ui.setButtonLoading(this.elements.convertButton, true);

            // Perform conversion
            const result = await api.convert(validation.value, fromUnit, toUnit, this.currentCategory);

            if (result.success) {
                this.displayConversionResult(result);
                this.lastConversion = result;
                this.updateFavoriteButton();
            } else {
                ui.showError(result.error || 'Conversion failed');
            }

        } catch (error) {
            console.error('Conversion error:', error);
            ui.showError(error instanceof ApiError ? error.getUserMessage() : 'Conversion failed');
        } finally {
            this.isConverting = false;
            ui.setButtonLoading(this.elements.convertButton, false);
        }
    }

    /**
     * Display conversion result
     * @param {Object} result - Conversion result
     */
    displayConversionResult(result) {
        // Update result value
        if (this.elements.toValue) {
            this.elements.toValue.value = CONFIG.formatNumber(result.convertedValue);
        }

        // Show detailed result
        if (this.elements.resultValue) {
            this.elements.resultValue.textContent = 
                `${CONFIG.formatNumber(result.originalValue)} ${this.getUnitSymbol(result.fromUnit)} = ${CONFIG.formatNumber(result.convertedValue)} ${this.getUnitSymbol(result.toUnit)}`;
        }

        if (this.elements.resultFormula) {
            this.elements.resultFormula.textContent = result.formula || '';
        }

        if (this.elements.conversionResult) {
            this.elements.conversionResult.style.display = 'block';
        }
    }

    /**
     * Get unit symbol by key
     * @param {string} unitKey - Unit key
     * @returns {string} Unit symbol
     */
    getUnitSymbol(unitKey) {
        const unit = this.currentUnits.find(u => u.key === unitKey);
        return unit ? unit.symbol : unitKey;
    }

    /**
     * Swap from and to units
     */
    swapUnits() {
        if (!this.elements.fromUnit || !this.elements.toUnit) return;

        const fromValue = this.elements.fromUnit.value;
        const toValue = this.elements.toUnit.value;
        const fromInputValue = this.elements.fromValue.value;
        const toInputValue = this.elements.toValue.value;

        // Swap units
        this.elements.fromUnit.value = toValue;
        this.elements.toUnit.value = fromValue;

        // Swap values if both have values
        if (fromInputValue && toInputValue) {
            this.elements.fromValue.value = toInputValue;
            this.elements.toValue.value = fromInputValue;
        }

        // Update favorite button
        this.updateFavoriteButton();

        // Auto-convert if there's a value
        if (this.elements.fromValue.value) {
            this.performConversion();
        }
    }

    /**
     * Clear conversion form
     */
    clearConversion() {
        if (this.elements.fromValue) this.elements.fromValue.value = '';
        if (this.elements.toValue) this.elements.toValue.value = '';
        if (this.elements.conversionResult) this.elements.conversionResult.style.display = 'none';
        
        this.lastConversion = null;
        this.updateFavoriteButton();
    }

    /**
     * Update favorite button state
     */
    updateFavoriteButton() {
        if (!this.elements.favoriteButton) return;

        const fromUnit = this.elements.fromUnit?.value;
        const toUnit = this.elements.toUnit?.value;

        if (!this.currentCategory || !fromUnit || !toUnit || fromUnit === toUnit) {
            this.elements.favoriteButton.style.display = 'none';
            return;
        }

        this.elements.favoriteButton.style.display = 'flex';

        const existing = favoritesManager.isFavorited(this.currentCategory, fromUnit, toUnit);
        if (existing) {
            this.elements.favoriteButton.classList.add('active');
            this.elements.favoriteButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                Remove from Favorites
            `;
        } else {
            this.elements.favoriteButton.classList.remove('active');
            this.elements.favoriteButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                Add to Favorites
            `;
        }
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite() {
        const fromUnit = this.elements.fromUnit?.value;
        const toUnit = this.elements.toUnit?.value;

        if (!this.currentCategory || !fromUnit || !toUnit || fromUnit === toUnit) {
            return;
        }

        const existing = favoritesManager.isFavorited(this.currentCategory, fromUnit, toUnit);

        if (existing) {
            // Remove from favorites
            if (favoritesManager.removeFavorite(existing.id)) {
                ui.showSuccess(CONFIG.SUCCESS.FAVORITE_REMOVED);
                this.updateFavoriteButton();
                this.loadFavorites();
            }
        } else {
            // Add to favorites
            this.showAddFavoriteModal();
        }
    }

    /**
     * Show add favorite modal
     */
    showAddFavoriteModal() {
        const fromUnit = this.elements.fromUnit?.value;
        const toUnit = this.elements.toUnit?.value;
        const fromUnitData = this.currentUnits.find(u => u.key === fromUnit);
        const toUnitData = this.currentUnits.find(u => u.key === toUnit);

        const defaultName = `${fromUnitData?.name || fromUnit} to ${toUnitData?.name || toUnit}`;

        const content = `
            <div class="form-group">
                <label for="favoriteName">Favorite Name:</label>
                <input type="text" id="favoriteName" class="form-input" value="${defaultName}" maxlength="100">
            </div>
            <div class="form-group">
                <label>Conversion:</label>
                <div class="conversion-preview">
                    ${fromUnitData?.name || fromUnit} (${fromUnitData?.symbol || fromUnit}) → 
                    ${toUnitData?.name || toUnit} (${toUnitData?.symbol || toUnit})
                </div>
            </div>
        `;

        const modal = ui.createModal('Add to Favorites', content, [
            {
                text: 'Cancel',
                type: 'secondary',
                action: 'cancel',
                handler: (modal) => ui.closeModal(modal)
            },
            {
                text: 'Add Favorite',
                type: 'primary',
                action: 'add',
                handler: (modal) => this.addFavorite(modal)
            }
        ]);

        // Focus on name input
        setTimeout(() => {
            const nameInput = modal.querySelector('#favoriteName');
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        }, 100);
    }

    /**
     * Add favorite from modal
     * @param {HTMLElement} modal - Modal element
     */
    addFavorite(modal) {
        const nameInput = modal.querySelector('#favoriteName');
        const name = nameInput?.value?.trim();

        if (!name) {
            ui.showError('Please enter a name for the favorite');
            return;
        }

        try {
            const fromUnit = this.elements.fromUnit.value;
            const toUnit = this.elements.toUnit.value;

            favoritesManager.addFavorite(name, this.currentCategory, fromUnit, toUnit);
            ui.showSuccess(CONFIG.SUCCESS.FAVORITE_ADDED);
            this.updateFavoriteButton();
            this.loadFavorites();
            ui.closeModal(modal);

        } catch (error) {
            ui.showError(error.message);
        }
    }

    /**
     * Load and display favorites
     */
    loadFavorites() {
        const favorites = favoritesManager.getFavorites();
        this.renderFavorites(favorites);
    }

    /**
     * Render favorites grid
     * @param {Array} favorites - Favorites array
     */
    renderFavorites(favorites) {
        if (!this.elements.favoritesGrid) return;

        if (favorites.length === 0) {
            if (this.elements.emptyFavorites) {
                this.elements.emptyFavorites.style.display = 'block';
            }
            this.elements.favoritesGrid.innerHTML = '';
            return;
        }

        if (this.elements.emptyFavorites) {
            this.elements.emptyFavorites.style.display = 'none';
        }

        this.elements.favoritesGrid.innerHTML = favorites.map(favorite => `
            <div class="favorite-card" data-favorite-id="${favorite.id}">
                <div class="favorite-header">
                    <div class="favorite-name">${ui.escapeHtml(favorite.name)}</div>
                    <div class="favorite-actions">
                        <button class="favorite-action" data-action="use" title="Use this conversion">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                        </button>
                        <button class="favorite-action" data-action="copy" title="Copy conversion">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        </button>
                        <button class="favorite-action" data-action="delete" title="Remove favorite">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="favorite-conversion">
                    ${this.getCategoryName(favorite.category)}: ${this.getUnitName(favorite.category, favorite.fromUnit)} → ${this.getUnitName(favorite.category, favorite.toUnit)}
                </div>
                <div class="favorite-meta">
                    <span>Used ${favorite.useCount || 0} times</span>
                    <span>${ui.formatDate(favorite.lastUsed)}</span>
                </div>
            </div>
        `).join('');

        // Add event listeners
        this.elements.favoritesGrid.querySelectorAll('.favorite-action').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                const card = button.closest('.favorite-card');
                const favoriteId = card.dataset.favoriteId;
                this.handleFavoriteAction(action, favoriteId);
            });
        });
    }

    /**
     * Get category name by key
     * @param {string} categoryKey - Category key
     * @returns {string} Category name
     */
    getCategoryName(categoryKey) {
        // This would ideally come from cached categories data
        const categoryNames = {
            length: 'Length',
            weight: 'Weight',
            volume: 'Volume',
            temperature: 'Temperature',
            area: 'Area',
            time: 'Time',
            speed: 'Speed',
            energy: 'Energy'
        };
        return categoryNames[categoryKey] || categoryKey;
    }

    /**
     * Get unit name by category and key
     * @param {string} category - Category key
     * @param {string} unitKey - Unit key
     * @returns {string} Unit name
     */
    getUnitName(category, unitKey) {
        // This would ideally come from cached units data
        return unitKey;
    }

    /**
     * Handle favorite action
     * @param {string} action - Action type
     * @param {string} favoriteId - Favorite ID
     */
    async handleFavoriteAction(action, favoriteId) {
        const favorite = favoritesManager.getFavorites().find(f => f.id === favoriteId);
        if (!favorite) return;

        switch (action) {
            case 'use':
                await this.useFavorite(favorite);
                break;
            case 'copy':
                this.copyFavorite(favorite);
                break;
            case 'delete':
                this.deleteFavorite(favoriteId);
                break;
        }
    }

    /**
     * Use a favorite conversion
     * @param {Object} favorite - Favorite object
     */
    async useFavorite(favorite) {
        try {
            // Select the category if different
            if (this.currentCategory !== favorite.category) {
                await this.selectCategory(favorite.category);
            }

            // Set the units
            if (this.elements.fromUnit) {
                this.elements.fromUnit.value = favorite.fromUnit;
            }
            if (this.elements.toUnit) {
                this.elements.toUnit.value = favorite.toUnit;
            }

            // Update use count
            favoritesManager.useFavorite(favorite.id);
            this.loadFavorites();
            this.updateFavoriteButton();

            // Scroll to converter
            document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error using favorite:', error);
            ui.showError('Failed to use favorite conversion');
        }
    }

    /**
     * Copy favorite conversion details
     * @param {Object} favorite - Favorite object
     */
    copyFavorite(favorite) {
        const text = `${favorite.name}\n${this.getCategoryName(favorite.category)}: ${favorite.fromUnit} → ${favorite.toUnit}`;
        ui.copyToClipboard(text);
    }

    /**
     * Delete a favorite
     * @param {string} favoriteId - Favorite ID
     */
    deleteFavorite(favoriteId) {
        const favorite = favoritesManager.getFavorites().find(f => f.id === favoriteId);
        if (!favorite) return;

        const modal = ui.createModal(
            'Remove Favorite',
            `<p>Are you sure you want to remove "<strong>${ui.escapeHtml(favorite.name)}</strong>" from your favorites?</p>`,
            [
                {
                    text: 'Cancel',
                    type: 'secondary',
                    action: 'cancel',
                    handler: (modal) => ui.closeModal(modal)
                },
                {
                    text: 'Remove',
                    type: 'primary',
                    action: 'remove',
                    handler: (modal) => {
                        if (favoritesManager.removeFavorite(favoriteId)) {
                            ui.showSuccess(CONFIG.SUCCESS.FAVORITE_REMOVED);
                            this.loadFavorites();
                            this.updateFavoriteButton();
                        }
                        ui.closeModal(modal);
                    }
                }
            ]
        );
    }

    /**
     * Export favorites
     */
    async exportFavorites() {
        try {
            const exportData = favoritesManager.exportFavorites();
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `unit-converter-favorites-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            ui.showSuccess(CONFIG.SUCCESS.FAVORITES_EXPORTED);
            
        } catch (error) {
            console.error('Export error:', error);
            ui.showError('Failed to export favorites');
        }
    }

    /**
     * Import favorites
     */
    importFavorites() {
        if (this.elements.importFile) {
            this.elements.importFile.click();
        }
    }

    /**
     * Handle file import
     * @param {Event} event - File input event
     */
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const exportData = JSON.parse(text);
            
            const result = favoritesManager.importFavorites(exportData);
            
            let message = `Imported ${result.imported} favorites`;
            if (result.existing > 0) {
                message += `, ${result.existing} already existed`;
            }
            if (result.errors > 0) {
                message += `, ${result.errors} had errors`;
            }
            
            ui.showSuccess(message);
            this.loadFavorites();
            
        } catch (error) {
            console.error('Import error:', error);
            ui.showError('Failed to import favorites. Please check the file format.');
        } finally {
            // Clear file input
            event.target.value = '';
        }
    }

    /**
     * Check API health
     */
    async checkApiHealth() {
        try {
            await api.checkHealth();
        } catch (error) {
            console.warn('API health check failed:', error);
            ui.showWarning('API connection issues detected. Some features may not work properly.');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Navigation
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', () => this.goBackToCategories());
        }

        // Mobile navigation
        if (this.elements.navToggle && this.elements.navMenu) {
            this.elements.navToggle.addEventListener('click', () => {
                this.elements.navToggle.classList.toggle('active');
                this.elements.navMenu.classList.toggle('active');
            });
        }

        // Conversion form
        if (this.elements.fromValue) {
            ui.debounceInput(this.elements.fromValue, () => {
                if (this.elements.fromValue.value) {
                    this.performConversion();
                } else {
                    this.clearConversion();
                }
            });
        }

        if (this.elements.fromUnit) {
            this.elements.fromUnit.addEventListener('change', () => {
                this.updateFavoriteButton();
                if (this.elements.fromValue.value) {
                    this.performConversion();
                }
            });
        }

        if (this.elements.toUnit) {
            this.elements.toUnit.addEventListener('change', () => {
                this.updateFavoriteButton();
                if (this.elements.fromValue.value) {
                    this.performConversion();
                }
            });
        }

        if (this.elements.swapButton) {
            this.elements.swapButton.addEventListener('click', () => this.swapUnits());
        }

        if (this.elements.convertButton) {
            this.elements.convertButton.addEventListener('click', () => this.performConversion());
        }

        if (this.elements.clearButton) {
            this.elements.clearButton.addEventListener('click', () => this.clearConversion());
        }

        if (this.elements.favoriteButton) {
            this.elements.favoriteButton.addEventListener('click', () => this.toggleFavorite());
        }

        // Favorites
        if (this.elements.exportFavorites) {
            this.elements.exportFavorites.addEventListener('click', () => this.exportFavorites());
        }

        if (this.elements.importFavorites) {
            this.elements.importFavorites.addEventListener('click', () => this.importFavorites());
        }

        if (this.elements.importFile) {
            this.elements.importFile.addEventListener('change', (e) => this.handleFileImport(e));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.performConversion();
                        break;
                    case 'Backspace':
                        if (this.currentCategory) {
                            e.preventDefault();
                            this.goBackToCategories();
                        }
                        break;
                }
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UnitConverterApp();
});
