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

// Format number with K suffix for thousands
function formatK(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num;
}

// Format percentage
function formatPercent(value, decimals = 1) {
    return value.toFixed(decimals) + '%';
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

// Create a cyber gradient for charts
function createCyberGradient(ctx, startColor, endColor, vertical = false) {
    const gradient = vertical 
        ? ctx.createLinearGradient(0, 0, 0, 300)
        : ctx.createLinearGradient(0, 0, 300, 0);
    
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    return gradient;
}

// Add scroll animation to elements
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('scroll-hide');
                entry.target.classList.add('scroll-show');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.classList.add('scroll-hide');
        observer.observe(el);
    });
}

// Add 3D tilt effect to elements
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('.tilt-effect');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const inner = element.querySelector('.tilt-inner');
            if (inner) {
                inner.style.transform = `translateZ(20px) rotateX(${-deltaY * 10}deg) rotateY(${deltaX * 10}deg)`;
            }
        });
        
        element.addEventListener('mouseleave', () => {
            const inner = element.querySelector('.tilt-inner');
            if (inner) {
                inner.style.transform = 'translateZ(20px)';
            }
        });
    });
}

// Zoom functionality for charts
function setupChartZoom(chartId, chart) {
    const container = document.getElementById(chartId).parentNode;
    
    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'chart-zoom-controls';
    
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'chart-zoom-btn';
    zoomInBtn.innerHTML = '+';
    zoomInBtn.setAttribute('aria-label', 'Zoom in');
    
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'chart-zoom-btn';
    zoomOutBtn.innerHTML = '-';
    zoomOutBtn.setAttribute('aria-label', 'Zoom out');
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'chart-zoom-btn';
    resetBtn.innerHTML = '⟲';
    resetBtn.setAttribute('aria-label', 'Reset zoom');
    
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetBtn);
    
    container.appendChild(zoomControls);
    
    // Add scanline effect
    const scanline = document.createElement('div');
    scanline.className = 'chart-scanline';
    container.appendChild(scanline);
    
    // Zoom functionality
    let zoomLevel = 1;
    
    zoomInBtn.addEventListener('click', () => {
        if (zoomLevel < 2) {
            zoomLevel += 0.2;
            applyZoom();
        }
    });
    
    zoomOutBtn.addEventListener('click', () => {
        if (zoomLevel > 0.6) {
            zoomLevel -= 0.2;
            applyZoom();
        }
    });
    
    resetBtn.addEventListener('click', () => {
        zoomLevel = 1;
        applyZoom();
    });
    
    function applyZoom() {
        const chartCanvas = document.getElementById(chartId);
        chartCanvas.style.transform = `scale(${zoomLevel})`;
        chartCanvas.style.transformOrigin = 'center center';
        
        // Trigger chart update if needed
        if (chart) {
            chart.update();
        }
    }
}