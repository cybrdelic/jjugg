/**
 * Clean visualization utilities for jjugg analytics
 * 
 * This file provides clean visualizations with minimal animations
 * for the analytics charts and diagrams in jjugg.
 */

// Initialize minimal visualizations
function initEnhancedVisualizations() {
    console.log("Initializing clean visualizations...");
    
    // Configure Chart.js defaults
    configureChartJsDefaults();
    
    // Setup zoom controls for all chart canvases
    setupAllChartZooms();
}

// Configure Chart.js defaults for clean aesthetic
function configureChartJsDefaults() {
    if (typeof Chart !== 'undefined') {
        // Set global defaults
        Chart.defaults.color = '#212529';
        Chart.defaults.font.family = "'Inter', sans-serif";
        
        // Enhanced tooltips
        Chart.defaults.plugins.tooltip.backgroundColor = 'white';
        Chart.defaults.plugins.tooltip.titleColor = '#212529';
        Chart.defaults.plugins.tooltip.bodyColor = '#212529';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(0,0,0,0.1)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.displayColors = true;
        Chart.defaults.plugins.tooltip.boxPadding = 3;
        Chart.defaults.plugins.tooltip.usePointStyle = true;
        Chart.defaults.plugins.tooltip.titleMarginBottom = 8;
        Chart.defaults.plugins.tooltip.callbacks = {
            ...Chart.defaults.plugins.tooltip.callbacks,
            labelTextColor: function() {
                return '#212529';
            }
        };
        
        // Chart elements styling
        Chart.defaults.elements.point.radius = 4;
        Chart.defaults.elements.point.hoverRadius = 6;
        Chart.defaults.elements.point.borderWidth = 1;
        Chart.defaults.elements.line.tension = 0.4;
        Chart.defaults.elements.bar.borderRadius = 2;
        
        // Scale styling
        Chart.defaults.scale.grid.color = 'rgba(0, 0, 0, 0.05)';
        Chart.defaults.scale.ticks.color = 'rgba(0, 0, 0, 0.6)';
    }
}

// Add zoom functionality to charts
function setupAllChartZooms() {
    // For Chart.js charts
    const chartIds = [
        'remote-vs-onsite-chart',
        'response-rate-chart',
        'salary-comparison-chart',
        'market-health-chart',
        'source-comparison-chart',
        'tracking-method-chart'
    ];
    
    chartIds.forEach(id => {
        const chart = document.getElementById(id);
        if (chart) {
            setupChartZoom(id);
        }
    });
    
    // For D3 charts
    const d3Charts = ['sankey-diagram', 'funnel-chart-container'];
    d3Charts.forEach(id => {
        const chart = document.getElementById(id);
        if (chart) {
            setupChartZoom(id);
        }
    });
}

// Zoom functionality for charts
function setupChartZoom(chartId) {
    const element = document.getElementById(chartId);
    if (!element) return;
    
    const container = element.parentNode;
    if (!container) return;
    
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
        element.style.transform = `scale(${zoomLevel})`;
        element.style.transformOrigin = 'center center';
        
        // Trigger chart update if there's a chart instance in window
        const chartInstance = window[chartId + 'Chart'];
        if (chartInstance && typeof chartInstance.update === 'function') {
            chartInstance.update();
        }
    }
}

// Simple Sankey Diagram for Application Flow
function standardRenderSankeyDiagram(appliedCount, responseCount, interviewCount, offerCount, rejectedCount) {
    // Clear previous diagram
    d3.select("#sankey-diagram").html("");
    
    // Calculate values for the diagram
    const noResponseCount = Math.max(0, appliedCount - responseCount);
    const responseNoInterviewCount = Math.max(0, responseCount - interviewCount);
    const interviewNoOfferCount = Math.max(0, interviewCount - offerCount);
    
    // Define the nodes
    const nodes = [
        { name: "Applications", value: appliedCount, column: 0 },
        { name: "Responses", value: responseCount, column: 1 },
        { name: "Interviews", value: interviewCount, column: 2 },
        { name: "Offers", value: offerCount, column: 3 },
        { name: "No Response", value: noResponseCount, column: 1 },
        { name: "Rejected (No Interview)", value: responseNoInterviewCount, column: 2 },
        { name: "Rejected (Post-Interview)", value: interviewNoOfferCount, column: 3 }
    ];
    
    // Define the links
    const links = [
        { source: 0, target: 1, value: responseCount },
        { source: 0, target: 4, value: noResponseCount },
        { source: 1, target: 2, value: interviewCount },
        { source: 1, target: 5, value: responseNoInterviewCount },
        { source: 2, target: 3, value: offerCount },
        { source: 2, target: 6, value: interviewNoOfferCount }
    ];
    
    // Set up dimensions
    const margin = { top: 20, right: 10, bottom: 10, left: 10 };
    const width = document.getElementById("sankey-diagram").clientWidth - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;
    
    // Create the SVG
    const svg = d3.select("#sankey-diagram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Get theme colors dynamically
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const getThemeColors = () => {
        const computedStyle = getComputedStyle(document.documentElement);
        return {
            background: computedStyle.getPropertyValue('--bg-secondary') || (isDarkTheme ? '#343a40' : '#ffffff'),
            text: computedStyle.getPropertyValue('--text-primary') || (isDarkTheme ? '#f8f9fa' : '#212529'),
            textSecondary: computedStyle.getPropertyValue('--text-secondary') || (isDarkTheme ? 'rgba(248, 249, 250, 0.7)' : 'rgba(33, 37, 41, 0.7)'),
            border: computedStyle.getPropertyValue('--border-thin') || (isDarkTheme ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)')
        };
    };
    
    const themeColors = getThemeColors();
    
    // Initialize d3 sankey layout
    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[0, 0], [width, height]]);
    
    // Convert nodes and links to the format expected by d3-sankey
    const sankeyData = {
        nodes: nodes.map((d, i) => ({ ...d, id: i })),
        links: links.map(d => ({ ...d, value: d.value }))
    };
    
    // Generate the sankey diagram
    const { nodes: sankeyNodes, links: sankeyLinks } = sankey(sankeyData);
    
    // Simple tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "sankey-tooltip")
        .style("position", "absolute")
        .style("padding", "8px 12px")
        .style("background", themeColors.background)
        .style("border", themeColors.border)
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
        .style("font-family", "'Inter', sans-serif")
        .style("font-size", "12px")
        .style("color", themeColors.text)
        .style("z-index", "1000")
        .style("pointer-events", "none")
        .style("opacity", 0);
    
    // Define colors for positive and negative outcomes
    const nodeColors = {
        "Applications": isDarkTheme ? "#0d6efd" : "#0d6efd", // Blue
        "Responses": isDarkTheme ? "#6f42c1" : "#6610f2", // Purple
        "Interviews": isDarkTheme ? "#198754" : "#198754", // Green
        "Offers": isDarkTheme ? "#20c997" : "#20c997", // Teal
        "No Response": isDarkTheme ? "#dc3545" : "#dc3545", // Red
        "Rejected (No Interview)": isDarkTheme ? "#dc3545" : "#dc3545", // Red
        "Rejected (Post-Interview)": isDarkTheme ? "#dc3545" : "#dc3545" // Red
    };
    
    // Draw the links
    const link = svg.append("g")
        .selectAll(".link")
        .data(sankeyLinks)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => {
            const sourceColor = nodeColors[d.source.name];
            return d3.color(sourceColor).copy({opacity: 0.6});
        })
        .attr("stroke-width", d => Math.max(1, d.width))
        .style("fill", "none")
        .style("stroke-opacity", 0.4)
        .on("mouseover", function(event, d) {
            // Highlight this link
            d3.select(this)
                .style("stroke-opacity", 0.7);
                
            // Get node names
            const sourceName = d.source.name;
            const targetName = d.target.name;
            
            // Calculate percentage
            let percentage = 0;
            if (sourceName === "Applications") {
                percentage = Math.round((d.value / appliedCount) * 100);
            } else if (sourceName === "Responses") {
                percentage = Math.round((d.value / responseCount) * 100);
            } else if (sourceName === "Interviews") {
                percentage = Math.round((d.value / interviewCount) * 100);
            }
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
                
            tooltip.html(`
                <div style="font-weight: 500;">${sourceName} → ${targetName}</div>
                <div style="margin-top: 5px;">${d.value} (${percentage}%)</div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
            
            // Highlight connected nodes
            node.filter(n => n.id === d.source.id || n.id === d.target.id)
                .select("rect")
                .style("opacity", 1);
        })
        .on("mouseout", function() {
            // Reset this link
            d3.select(this)
                .style("stroke-opacity", 0.4);
                
            // Hide tooltip
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
                
            // Reset nodes
            node.select("rect")
                .style("opacity", 0.8);
        });
    
    // Draw the nodes
    const node = svg.append("g")
        .selectAll(".node")
        .data(sankeyNodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0}, ${d.y0})`);
    
    // Node rectangles
    node.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => nodeColors[d.name])
        .attr("stroke", d => d3.color(nodeColors[d.name]).darker(0.3))
        .attr("stroke-width", 1)
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            // Highlight this node
            d3.select(this)
                .style("opacity", 1);
                
            // Highlight related links
            link.filter(l => l.source.id === d.id || l.target.id === d.id)
                .style("stroke-opacity", 0.7);
                
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
                
            // Calculate conversion rate
            let conversionRate = 0;
            let prevStage = "";
            
            if (d.name === "Responses") {
                conversionRate = Math.round((d.value / appliedCount) * 100);
                prevStage = "Applications";
            } else if (d.name === "Interviews") {
                conversionRate = Math.round((d.value / responseCount) * 100);
                prevStage = "Responses";
            } else if (d.name === "Offers") {
                conversionRate = Math.round((d.value / interviewCount) * 100);
                prevStage = "Interviews";
            } else if (d.name === "No Response") {
                conversionRate = Math.round((d.value / appliedCount) * 100);
                prevStage = "Applications";
            } else if (d.name === "Rejected (No Interview)") {
                conversionRate = Math.round((d.value / responseCount) * 100);
                prevStage = "Responses";
            } else if (d.name === "Rejected (Post-Interview)") {
                conversionRate = Math.round((d.value / interviewCount) * 100);
                prevStage = "Interviews";
            }
            
            tooltip.html(`
                <div style="font-weight: 500;">${d.name}</div>
                <div style="margin-top: 5px;">Count: ${d.value}</div>
                ${d.name !== "Applications" ? `<div>From ${prevStage}: ${conversionRate}%</div>` : ''}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            // Reset this node
            d3.select(this)
                .style("opacity", 0.8);
                
            // Reset all links
            link.style("stroke-opacity", 0.4);
                
            // Hide tooltip
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        });
    
    // Add labels for the nodes
    node.append("text")
        .attr("x", d => d.x0 < width / 2 ? (d.x1 - d.x0) + 6 : -6)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .attr("font-family", "'Inter', sans-serif")
        .attr("font-size", "12px")
        .attr("fill", themeColors.text)
        .text(d => `${d.name} (${d.value})`);
    
    // Add simple column headers
    const columnLabels = ["Applied", "Initial Response", "Interview Stage", "Final Outcome"];
    const columnWidth = width / 4;
    
    svg.append("g")
        .selectAll(".column-label")
        .data(columnLabels)
        .enter()
        .append("text")
        .attr("class", "column-label")
        .attr("x", (d, i) => i * columnWidth + columnWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", themeColors.textSecondary)
        .text(d => d);
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize clean visualizations if we're on the analytics page
    if (document.getElementById('analytics') || 
        document.querySelector('.chart-container') || 
        document.querySelector('.analytics-card')) {
        
        initEnhancedVisualizations();
        
        // Override Sankey diagram renderer
        if (typeof renderSankeyDiagram === 'function') {
            // Store original function
            window.originalRenderSankeyDiagram = renderSankeyDiagram;
            // Override with clean version
            window.renderSankeyDiagram = standardRenderSankeyDiagram;
        }
    }
});