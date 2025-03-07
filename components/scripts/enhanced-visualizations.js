// Enhanced visualization utilities

// Initialize enhanced visualizations
function initEnhancedVisualizations() {
    console.log("Initializing enhanced visualizations...");
    
    // Setup chart containers with visual enhancements
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        // Add scanline effect
        const scanline = document.createElement("div");
        scanline.className = "chart-scanline";
        container.appendChild(scanline);
        
        // Add cyber detail elements
        addCyberDetails(container);
    });
    
    // Initialize scroll animations for charts
    initScrollAnimations();
    
    // Initialize tilt effects
    initTiltEffect();
    
    // Override Chart.js defaults
    configureChartJsDefaults();
}

// Create cyber aesthetic details
function addCyberDetails(container) {
    // Add corner decorations
    const corners = [
        { x: 10, y: 10, rotate: 0 },
        { x: container.clientWidth - 10, y: 10, rotate: 90 },
        { x: 10, y: container.clientHeight - 10, rotate: 270 },
        { x: container.clientWidth - 10, y: container.clientHeight - 10, rotate: 180 }
    ];
    
    corners.forEach(corner => {
        const decoration = document.createElement("div");
        decoration.className = "cyber-detail";
        decoration.style.left = corner.x + "px";
        decoration.style.top = corner.y + "px";
        decoration.style.transform = `rotate(${corner.rotate}deg)`;
        
        // Create L-shape corner
        const cornerPath = document.createElement("div");
        cornerPath.className = "cyber-detail-corner";
        cornerPath.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 15 15">
                <path d="M0,0 L15,0 L15,1 L1,1 L1,15 L0,15 Z" fill="#00f0ff" />
            </svg>
        `;
        
        decoration.appendChild(cornerPath);
        container.appendChild(decoration);
    });
}

// Configure Chart.js defaults for cyberpunk aesthetic
function configureChartJsDefaults() {
    if (typeof Chart !== 'undefined') {
        // Set global defaults
        Chart.defaults.color = '#cbd5e1';
        Chart.defaults.font.family = "'Space Mono', monospace";
        
        // Enhanced tooltips
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(8, 12, 19, 0.85)';
        Chart.defaults.plugins.tooltip.titleColor = '#00f0ff';
        Chart.defaults.plugins.tooltip.bodyColor = '#fff';
        Chart.defaults.plugins.tooltip.borderColor = '#00f0ff';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.displayColors = true;
        Chart.defaults.plugins.tooltip.boxPadding = 3;
        Chart.defaults.plugins.tooltip.usePointStyle = true;
        Chart.defaults.plugins.tooltip.titleMarginBottom = 8;
        Chart.defaults.plugins.tooltip.callbacks = {
            ...Chart.defaults.plugins.tooltip.callbacks,
            labelTextColor: function() {
                return '#fff';
            }
        };
        
        // Chart elements styling
        Chart.defaults.elements.point.pointStyle = 'rectRot';
        Chart.defaults.elements.point.radius = 4;
        Chart.defaults.elements.point.hoverRadius = 6;
        Chart.defaults.elements.point.borderWidth = 1;
        Chart.defaults.elements.line.tension = 0.4;
        Chart.defaults.elements.bar.borderRadius = 2;
        
        // Scale styling
        Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
        Chart.defaults.scale.ticks.color = 'rgba(255, 255, 255, 0.6)';
    }
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

// Enhanced tooltips for non-Chart.js visualizations
class AdvancedTooltip {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            className: 'advanced-tooltip',
            offset: { x: 10, y: -28 },
            ...options
        };
        
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = this.options.className;
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.opacity = '0';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '1000';
        this.tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        this.tooltip.style.transform = 'translateY(10px)';
        
        document.body.appendChild(this.tooltip);
    }
    
    show(event, content) {
        this.tooltip.innerHTML = content;
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(0)';
        
        const x = event.pageX + this.options.offset.x;
        const y = event.pageY + this.options.offset.y;
        
        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
    }
    
    hide() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'translateY(10px)';
    }
    
    destroy() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced visualizations if we're on the analytics page
    if (document.getElementById('analytics') || 
        document.querySelector('.chart-container') || 
        document.querySelector('.analytics-card')) {
        initEnhancedVisualizations();
    }
});
