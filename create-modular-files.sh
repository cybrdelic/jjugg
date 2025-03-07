#!/bin/bash

# This script creates modular component files from jjugg HTML files

# Create directory structure
mkdir -p components/{main,analytics,scripts,shared}

echo "Extracting common components..."

# Extract head section
sed -n '/<head>/,/<\/head>/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/shared/head.html

# Extract sidebar
sed -n '/<div id="sidebar"/,/<!-- End sidebar -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/shared/sidebar.html

echo "Extracting main components..."

# Extract dashboard section
sed -n '/<section id="dashboard"/,/<!-- End dashboard -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/main/dashboard.html

# Extract applications section
sed -n '/<section id="applications"/,/<!-- End applications -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/main/applications.html

# Extract reminders section
sed -n '/<section id="reminders"/,/<!-- End reminders -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/main/reminders.html

# Extract goals section
sed -n '/<section id="goals"/,/<!-- End goals -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/main/goals.html

# Extract timeline section
sed -n '/<section id="timeline"/,/<!-- End timeline -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > components/main/timeline.html

# Extract main scripts
sed -n '/<script>/,/<\/script>/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html | grep -v "<script src=" > components/scripts/main-scripts.js

echo "Extracting analytics components..."

# Extract analytics KPI section
sed -n '/<div class="kpi-container"/,/<!-- End KPI cards -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > components/analytics/kpi.html

# Extract application funnel section
sed -n '/<div class="analytics-card application-funnel"/,/<!-- End application funnel -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > components/analytics/funnel.html

# Extract application trends section
sed -n '/<div class="analytics-card application-trends"/,/<!-- End application trends -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > components/analytics/trends.html

# Extract remote insights section
sed -n '/<div class="analytics-card remote-insights"/,/<!-- End remote insights -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > components/analytics/remote.html

# Extract salary insights section
sed -n '/<div class="analytics-card salary-insights"/,/<!-- End salary insights -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > components/analytics/salary.html

# Extract source insights section
sed -n '/<div class="analytics-card source-insights"/,/<!-- End source insights -->/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > components/analytics/source.html

# Extract analytics scripts
sed -n '/<script>/,/<\/script>/p' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html | grep -v "<script src=" > components/scripts/analytics-scripts.js

echo "Creating enhanced visualization utilities..."

# Create enhanced visualization utilities
cat > components/scripts/enhanced-visualizations.js << 'EOL'
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
EOL

echo "Creating enhanced CSS..."

# Create enhanced CSS for visualizations
cat > components/shared/enhanced-visualizations.css << 'EOL'
/* Enhanced visualization styles */

/* Chart container */
.chart-container {
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
    border-radius: 4px;
}

.chart-container:hover {
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
}

.chart-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
    z-index: 2;
}

.chart-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-secondary), transparent);
    z-index: 2;
}

/* Chart tooltip */
.chart-tooltip {
    background-color: rgba(8, 12, 19, 0.85) !important;
    border-left: 2px solid var(--accent-primary) !important;
    padding: 8px 12px !important;
    border-radius: 4px !important;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.2) !important;
    backdrop-filter: blur(4px) !important;
    transition: opacity 0.2s ease, transform 0.2s ease !important;
    font-family: 'Rajdhani', sans-serif !important;
    z-index: 1000 !important;
}

.chart-tooltip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, transparent 0%, rgba(0, 240, 255, 0.05) 50%, transparent 100%);
    border-radius: inherit;
    pointer-events: none;
}

.chart-tooltip-title {
    font-weight: 600 !important;
    margin-bottom: 4px !important;
    color: var(--accent-primary) !important;
    font-size: 14px !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.chart-tooltip-value {
    font-weight: 700 !important;
    color: #fff !important;
}

.chart-tooltip-label {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 13px !important;
}

/* Zoom controls */
.chart-zoom-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.chart-container:hover .chart-zoom-controls {
    opacity: 1;
}

.chart-zoom-btn {
    width: 28px;
    height: 28px;
    background-color: rgba(8, 12, 19, 0.8);
    border: 1px solid var(--accent-primary);
    color: var(--accent-primary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
}

.chart-zoom-btn:hover {
    background-color: var(--accent-primary);
    color: #080c13;
}

/* Scroll animations */
.scroll-animate {
    transition: transform 0.5s ease, opacity 0.5s ease;
}

.scroll-hide {
    opacity: 0;
    transform: translateY(30px);
}

.scroll-show {
    opacity: 1;
    transform: translateY(0);
}

/* 3D tilt effect */
.tilt-effect {
    transform-style: preserve-3d;
    transform: perspective(1000px);
}

.tilt-inner {
    transition: transform 0.2s ease;
    transform: translateZ(20px);
}

/* Chart annotation */
.chart-annotation {
    position: absolute;
    padding: 4px 8px;
    background-color: rgba(8, 12, 19, 0.8);
    border-left: 2px solid var(--accent-primary);
    font-size: 12px;
    border-radius: 2px;
    pointer-events: none;
    z-index: 10;
    transition: opacity 0.3s ease;
}

.chart-annotation::after {
    content: '';
    position: absolute;
    width: 50px;
    height: 1px;
    background-color: var(--accent-primary);
    opacity: 0.5;
}

/* Cyber detail elements */
.cyber-detail {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

.cyber-detail-circle {
    width: 40px;
    height: 40px;
    border: 1px solid var(--accent-primary);
    border-radius: 50%;
    position: absolute;
}

.cyber-detail-line {
    width: 100px;
    height: 1px;
    background-color: var(--accent-primary);
    position: absolute;
    transform-origin: 0 0;
}

.chart-container:hover .cyber-detail {
    opacity: 0.8;
}

/* Scanline effect */
.chart-scanline {
    position: absolute;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, transparent, var(--accent-primary), transparent);
    opacity: 0.5;
    pointer-events: none;
    animation: scanline 8s linear infinite;
    z-index: 1;
}

@keyframes scanline {
    0% {
        transform: translateY(-100%);
    }
    100% {
        transform: translateY(1000%);
    }
}

/* Advanced tooltip */
.advanced-tooltip {
    position: absolute;
    padding: 15px;
    background-color: rgba(8, 12, 19, 0.95);
    border: 1px solid var(--accent-primary);
    border-radius: 4px;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
    max-width: 300px;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translateY(10px);
}

.advanced-tooltip.visible {
    opacity: 1;
    transform: translateY(0);
}

.advanced-tooltip-header {
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    padding-bottom: 8px;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--accent-primary);
}

.advanced-tooltip-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.advanced-tooltip-stat {
    display: flex;
    flex-direction: column;
}

.advanced-tooltip-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.advanced-tooltip-value {
    font-size: 14px;
    font-weight: 600;
}

/* Data point animations */
.data-flow {
    stroke-dasharray: 1000;
    animation: dataFlow 1.5s ease-in-out forwards;
}

.bar-grow {
    animation: barGrow 0.8s ease-out forwards;
}

.pie-grow {
    transform-origin: center;
    animation: pieGrow 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.data-point-pulse {
    animation: dataPoint 2s infinite;
}

@keyframes dataFlow {
    0% {
        stroke-dashoffset: 1000;
        opacity: 0.3;
    }
    50% {
        opacity: 1;
    }
    100% {
        stroke-dashoffset: 0;
        opacity: 0.8;
    }
}

@keyframes barGrow {
    from {
        height: 0;
        y: 100%;
    }
    to {
        height: attr(height px);
        y: attr(y px);
    }
}

@keyframes pieGrow {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes dataPoint {
    0% {
        r: 3;
        opacity: 0.7;
    }
    50% {
        r: 6;
        opacity: 1;
    }
    100% {
        r: 3;
        opacity: 0.7;
    }
}
EOL

echo "Creating modular HTML files..."

# Create main modular HTML
cat > jjugg-main-modular.html << EOL
<!DOCTYPE html>
<html lang="en" data-theme="dark">
$(cat components/shared/head.html | grep -v "<!DOCTYPE html>" | grep -v "<html")
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/header.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/sidebar.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Sidebar -->
    $(cat components/shared/sidebar.html)

    <main>
        <!-- Dashboard -->
        $(cat components/main/dashboard.html)
        
        <!-- Applications -->
        $(cat components/main/applications.html)
        
        <!-- Reminders -->
        $(cat components/main/reminders.html)
        
        <!-- Goals -->
        $(cat components/main/goals.html)
        
        <!-- Timeline -->
        $(cat components/main/timeline.html)
    </main>

    <!-- Scripts -->
    <script src="js/utils.js"></script>
    <script>
    $(cat components/scripts/main-scripts.js | grep -v "<script>" | grep -v "</script>")
    </script>
</body>
</html>
EOL

# Create analytics modular HTML
cat > jjugg-analytics-modular.html << EOL
<!DOCTYPE html>
<html lang="en" data-theme="dark">
$(cat components/shared/head.html | grep -v "<!DOCTYPE html>" | grep -v "<html")
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/header.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/sidebar.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="components/shared/enhanced-visualizations.css">
</head>
<body>
    <!-- Sidebar modified for analytics page -->
    $(cat components/shared/sidebar.html | sed 's|<div class="sidebar-item analytics">|<div class="sidebar-item analytics">\n            <a href="jjugg-main-modular.html" class="sidebar-link">\n                <span class="sidebar-icon">🏠</span>\n                <span class="sidebar-text">Dashboard</span>\n            </a>\n        </div>\n        <div class="sidebar-item analytics active">|')

    <main>
        <!-- Analytics Dashboard -->
        <section id="analytics" class="active-section">
            <div class="section-header">
                <h2>Analytics Dashboard</h2>
                <div class="section-actions">
                    <button class="btn btn-primary refresh-analytics-btn">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Refresh</span>
                    </button>
                </div>
            </div>
            
            <!-- KPI Cards -->
            $(cat components/analytics/kpi.html)
            
            <div class="analytics-grid">
                <!-- Application Funnel -->
                $(cat components/analytics/funnel.html)
                
                <!-- Application Trends -->
                $(cat components/analytics/trends.html)
                
                <!-- Remote Insights -->
                $(cat components/analytics/remote.html)
                
                <!-- Salary Insights -->
                $(cat components/analytics/salary.html)
                
                <!-- Source Insights -->
                $(cat components/analytics/source.html)
            </div>
        </section>
    </main>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="js/utils.js"></script>
    <script src="components/scripts/enhanced-visualizations.js"></script>
    <script>
    $(cat components/scripts/analytics-scripts.js | grep -v "<script>" | grep -v "</script>")
    </script>
</body>
</html>
EOL

# Create individual component files for easier development
for component in kpi funnel trends remote salary source; do
    cat > jjugg-component-analytics-${component}.html << EOL
<!DOCTYPE html>
<html lang="en" data-theme="dark">
$(cat components/shared/head.html | grep -v "<!DOCTYPE html>" | grep -v "<html")
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/header.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/sidebar.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="components/shared/enhanced-visualizations.css">
</head>
<body>
    <div class="component-wrapper">
        <h1>Component: ${component}</h1>
        <!-- Analytics Component: ${component} -->
        $(cat components/analytics/${component}.html)
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="js/utils.js"></script>
    <script src="components/scripts/enhanced-visualizations.js"></script>
    <script>
    // Component-specific initialization for ${component}
    document.addEventListener('DOMContentLoaded', function() {
        console.log('${component} component loaded');
        // Initialize visualization enhancements
        initEnhancedVisualizations();
        
        // Force-load component test data
        const testData = {
            kpi: [500, 300, 150, 50, 100],
            applications: [
                { date: '2023-01-01', status: 'Applied' },
                { date: '2023-01-05', status: 'Interview Scheduled' },
                { date: '2023-01-10', status: 'Offer Received' }
                // Add more as needed
            ]
        };
        
        // Try to initialize the component
        try {
            switch('${component}') {
                case 'kpi':
                    updateKPIValues(testData.applications);
                    break;
                case 'funnel':
                    renderApplicationPipeline(testData.applications);
                    break;
                case 'trends':
                    renderApplicationTrends(testData.applications);
                    break;
                case 'remote':
                    renderRemoteJobInsights(testData.applications);
                    break;
                case 'salary':
                    renderSalaryInsights(testData.applications);
                    break;
                case 'source':
                    renderSourceInsights(testData.applications);
                    break;
            }
        } catch(e) {
            console.error('Error initializing component:', e);
        }
    });
    
    // Include stripped-down version of analytics code
    $(cat components/scripts/analytics-scripts.js | grep -v "<script>" | grep -v "</script>")
    </script>
</body>
</html>
EOL
done

echo "All modular files created successfully!"
echo ""
echo "New structure:"
echo "- components/ - Contains all modular components"
echo "  |- main/ - Main dashboard components"
echo "  |- analytics/ - Analytics components"
echo "  |- scripts/ - JavaScript files"
echo "  |- shared/ - Shared components and styles"
echo ""
echo "New HTML files:"
echo "- jjugg-main-modular.html - Modular main page"
echo "- jjugg-analytics-modular.html - Modular analytics page"
echo "- jjugg-component-analytics-*.html - Individual analytics components for development"
echo ""
echo "Added enhancements:"
echo "- Enhanced visualization styles in components/shared/enhanced-visualizations.css"
echo "- Enhanced visualization utilities in components/scripts/enhanced-visualizations.js"