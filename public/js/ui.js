/**
 * UI utilities and components for Unit Converter Hub
 * Handles DOM manipulation, animations, and user interactions
 */

class UIManager {
    constructor() {
        this.toastContainer = document.getElementById('toastContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.activeToasts = new Set();
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        if (this.loadingOverlay) {
            const messageElement = this.loadingOverlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            this.loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Display duration in milliseconds
     */
    showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${this.escapeHtml(message)}</div>
                <button class="toast-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Add close functionality
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => this.removeToast(toast));

        // Add to container
        this.toastContainer.appendChild(toast);
        this.activeToasts.add(toast);

        // Auto-remove after duration
        setTimeout(() => this.removeToast(toast), duration);

        return toast;
    }

    /**
     * Remove toast notification
     * @param {HTMLElement} toast - Toast element
     */
    removeToast(toast) {
        if (toast && this.activeToasts.has(toast)) {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.activeToasts.delete(toast);
            }, 300);
        }
    }

    /**
     * Clear all toasts
     */
    clearToasts() {
        this.activeToasts.forEach(toast => this.removeToast(toast));
    }

    /**
     * Show success toast
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     */
    showError(message) {
        this.showToast(message, 'error', CONFIG.UI.TOAST_DURATION * 2);
    }

    /**
     * Show warning toast
     * @param {string} message - Warning message
     */
    showWarning(message) {
        this.showToast(message, 'warning');
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Animate element
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation class
     * @param {number} duration - Animation duration
     */
    animate(element, animation, duration = CONFIG.UI.ANIMATION_DURATION) {
        return new Promise(resolve => {
            element.style.animation = `${animation} ${duration}ms ease-in-out`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise} Copy promise
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            this.showSuccess(CONFIG.SUCCESS.COPIED);
        } catch (error) {
            console.error('Failed to copy text:', error);
            this.showError('Failed to copy to clipboard');
        }
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return d.toLocaleDateString();
        }
    }

    /**
     * Debounce input events
     * @param {HTMLElement} input - Input element
     * @param {Function} callback - Callback function
     * @param {number} delay - Debounce delay
     */
    debounceInput(input, callback, delay = CONFIG.UI.DEBOUNCE_DELAY) {
        let timeout;
        input.addEventListener('input', (event) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => callback(event), delay);
        });
    }

    /**
     * Create loading button state
     * @param {HTMLElement} button - Button element
     * @param {boolean} loading - Loading state
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="loading-spinner"></span> Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    /**
     * Validate form field
     * @param {HTMLElement} field - Form field
     * @param {Function} validator - Validation function
     * @returns {boolean} Validation result
     */
    validateField(field, validator) {
        const result = validator(field.value);
        const errorElement = field.parentNode.querySelector('.field-error');
        
        if (result.valid) {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.remove();
            }
            return true;
        } else {
            field.classList.add('error');
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = result.error;
                field.parentNode.appendChild(error);
            } else {
                errorElement.textContent = result.error;
            }
            return false;
        }
    }

    /**
     * Create modal dialog
     * @param {string} title - Modal title
     * @param {string} content - Modal content
     * @param {Array} buttons - Modal buttons
     * @returns {HTMLElement} Modal element
     */
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${this.escapeHtml(title)}</h3>
                    <button class="modal-close" aria-label="Close modal">×</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="action-button ${btn.type || 'secondary'}" data-action="${btn.action}">
                            ${this.escapeHtml(btn.text)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add close functionality
        const closeButton = modal.querySelector('.modal-close');
        closeButton.addEventListener('click', () => this.closeModal(modal));

        // Add button event listeners
        buttons.forEach(btn => {
            const buttonElement = modal.querySelector(`[data-action="${btn.action}"]`);
            if (buttonElement && btn.handler) {
                buttonElement.addEventListener('click', () => btn.handler(modal));
            }
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Close modal dialog
     * @param {HTMLElement} modal - Modal element
     */
    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.style.animation = 'fadeOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }
}

// Create global UI manager instance
window.ui = new UIManager();
