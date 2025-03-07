// Utility functions

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Format currency
function formatCurrency(amount) {
    if (!amount) return '';
    
    // If it's already a formatted string, return it
    if (typeof amount === 'string' && amount.includes('$')) {
        return amount;
    }
    
    // If it's a number, format it
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

// Get start of week (Sunday)
function getStartOfWeek(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = date.getDate() - dayOfWeek;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Deep clone an object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if a string contains any of the terms
function containsAny(str, terms) {
    if (!str) return false;
    const lowerStr = str.toLowerCase();
    return terms.some(term => lowerStr.includes(term.toLowerCase()));
}

// Calculate date difference in days
function dateDiffInDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}