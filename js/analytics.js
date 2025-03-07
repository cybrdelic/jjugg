// Analytics functions for JJugg Analytics Dashboard

// Process application data for analytics
function processApplicationData(applications) {
    // Count applications by status
    const statusCounts = {
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0
    };
    
    applications.forEach(app => {
        if (statusCounts[app.status] !== undefined) {
            statusCounts[app.status]++;
        }
    });
    
    // Count applications by source
    const sourceCounts = {};
    applications.forEach(app => {
        if (!sourceCounts[app.source]) {
            sourceCounts[app.source] = {
                total: 0,
                interviews: 0,
                offers: 0,
                rejected: 0
            };
        }
        
        sourceCounts[app.source].total++;
        
        if (app.status === 'interview') {
            sourceCounts[app.source].interviews++;
        } else if (app.status === 'offer') {
            sourceCounts[app.source].offers++;
        } else if (app.status === 'rejected') {
            sourceCounts[app.source].rejected++;
        }
    });
    
    // Calculate conversion rates
    Object.keys(sourceCounts).forEach(source => {
        const sourceData = sourceCounts[source];
        sourceData.interviewRate = sourceData.total > 0 ? (sourceData.interviews / sourceData.total) * 100 : 0;
        sourceData.offerRate = sourceData.total > 0 ? (sourceData.offers / sourceData.total) * 100 : 0;
    });
    
    // Group applications by date
    const dateGroups = {};
    applications.forEach(app => {
        const date = app.dateApplied;
        if (!dateGroups[date]) {
            dateGroups[date] = [];
        }
        dateGroups[date].push(app);
    });
    
    return {
        statusCounts,
        sourceCounts,
        dateGroups,
        total: applications.length
    };
}

// Create a sankey diagram for application flow
function createSankeyDiagram(data, containerId) {
    // This would normally use D3.js to create a Sankey diagram
    // For now, we'll just create a placeholder
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <div>Applied: ${data.statusCounts.applied}</div>
            <div>→</div>
            <div>Interview: ${data.statusCounts.interview}</div>
            <div>→</div>
            <div>Offer: ${data.statusCounts.offer}</div>
            <div style="margin-top: 10px;">
                Rejected: ${data.statusCounts.rejected}
            </div>
        </div>
    `;
}

// Create a funnel chart for application stages
function createFunnelChart(data, containerId) {
    // This would normally use Chart.js to create a funnel chart
    // For now, we'll just create a placeholder
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const total = data.total;
    const interviews = data.statusCounts.interview;
    const offers = data.statusCounts.offer;
    
    const interviewPercentage = total > 0 ? Math.round((interviews / total) * 100) : 0;
    const offerPercentage = total > 0 ? Math.round((offers / total) * 100) : 0;
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="height: 40px; background: var(--accent-primary); width: 100%; text-align: center; line-height: 40px;">
                Applied: ${total} (100%)
            </div>
            <div style="height: 40px; background: var(--accent-secondary); width: ${interviewPercentage}%; text-align: center; line-height: 40px; margin-top: 5px;">
                Interviews: ${interviews} (${interviewPercentage}%)
            </div>
            <div style="height: 40px; background: var(--accent-tertiary); width: ${offerPercentage}%; text-align: center; line-height: 40px; margin-top: 5px;">
                Offers: ${offers} (${offerPercentage}%)
            </div>
        </div>
    `;
}

// Create a trends chart
function createTrendsChart(data, chartType, containerId) {
    // This would normally use Chart.js
    // For now, we'll just create a placeholder
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <p>${chartType} Trends Chart Placeholder</p>
            <p>Weekly applications: 5</p>
            <p>Monthly applications: 20</p>
        </div>
    `;
}

// Create remote jobs analysis chart
function createRemoteAnalysisChart(data, containerId) {
    // This would normally use Chart.js
    // For now, we'll just create a placeholder
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <p>Remote vs On-site Jobs Comparison</p>
            <p>Remote: 40% (8 applications)</p>
            <p>On-site: 60% (12 applications)</p>
        </div>
    `;
}

// Create salary insights chart
function createSalaryInsightsChart(data, containerId) {
    // This would normally use Chart.js
    // For now, we'll just create a placeholder
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <p>Salary Range Distribution</p>
            <p>Average: $80,000 - $110,000</p>
            <p>Highest: $135,000</p>
        </div>
    `;
}

// Create source analysis chart
function createSourceAnalysisChart(data, containerId) {
    // This would normally use Chart.js
    // For now, we'll just create a placeholder
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <p>Application Sources</p>
            <p>LinkedIn: 45% (9 applications)</p>
            <p>Indeed: 25% (5 applications)</p>
            <p>Company Website: 15% (3 applications)</p>
            <p>Referral: 10% (2 applications)</p>
            <p>Other: 5% (1 application)</p>
        </div>
    `;
}

// Populate source analysis table
function populateSourceAnalysisTable(data, tableId) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Sort sources by total applications
    const sortedSources = Object.keys(data.sourceCounts).sort((a, b) => {
        return data.sourceCounts[b].total - data.sourceCounts[a].total;
    });
    
    sortedSources.forEach(source => {
        const sourceData = data.sourceCounts[source];
        const row = document.createElement('tr');
        
        const sourceCell = document.createElement('td');
        sourceCell.textContent = source;
        
        const appsCell = document.createElement('td');
        appsCell.textContent = sourceData.total;
        
        const interviewsCell = document.createElement('td');
        interviewsCell.textContent = sourceData.interviews;
        
        const offersCell = document.createElement('td');
        offersCell.textContent = sourceData.offers;
        
        const conversionCell = document.createElement('td');
        conversionCell.textContent = `${Math.round(sourceData.offerRate)}%`;
        
        row.appendChild(sourceCell);
        row.appendChild(appsCell);
        row.appendChild(interviewsCell);
        row.appendChild(offersCell);
        row.appendChild(conversionCell);
        
        tableBody.appendChild(row);
    });
}

// Calculate and display analytics insights
function updateAnalyticsInsights(data) {
    // Update conversion rates
    const totalApps = data.total;
    const interviews = data.statusCounts.interview;
    const offers = data.statusCounts.offer;
    
    const interviewRate = totalApps > 0 ? Math.round((interviews / totalApps) * 100) : 0;
    const offerRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0;
    
    document.getElementById('interview-rate').textContent = `${interviewRate}%`;
    document.getElementById('offer-rate').textContent = `${offerRate}%`;
    document.getElementById('conversion-rate').textContent = `${offerRate}%`;
    
    // Find top source
    let topSource = '';
    let maxApps = 0;
    Object.keys(data.sourceCounts).forEach(source => {
        if (data.sourceCounts[source].total > maxApps) {
            maxApps = data.sourceCounts[source].total;
            topSource = source;
        }
    });
    
    // Find best converting source (min 2 applications)
    let bestSource = '';
    let bestRate = 0;
    Object.keys(data.sourceCounts).forEach(source => {
        if (data.sourceCounts[source].total >= 2 && data.sourceCounts[source].offerRate > bestRate) {
            bestRate = data.sourceCounts[source].offerRate;
            bestSource = source;
        }
    });
    
    // Update source insights
    if (topSource) {
        const topSourcePercentage = Math.round((data.sourceCounts[topSource].total / totalApps) * 100);
        document.getElementById('top-source').textContent = `${topSource} (${topSourcePercentage}%)`;
    }
    
    if (bestSource) {
        const bestSourceRate = Math.round(data.sourceCounts[bestSource].offerRate);
        document.getElementById('best-source').textContent = `${bestSource} (${bestSourceRate}%)`;
    }
    
    // Determine source diversity
    const sourceCount = Object.keys(data.sourceCounts).length;
    let diversity = 'Low';
    if (sourceCount >= 5) {
        diversity = 'High';
    } else if (sourceCount >= 3) {
        diversity = 'Medium';
    }
    
    document.getElementById('source-diversity').textContent = diversity;
}

// Initialize analytics with sample data
function initializeAnalytics() {
    // Get applications from localStorage
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Process data
    const analyticsData = processApplicationData(applications);
    
    // Create visualizations
    createSankeyDiagram(analyticsData, 'sankey-diagram');
    createFunnelChart(analyticsData, 'funnel-chart');
    createTrendsChart(analyticsData, 'Applications', 'applications-chart');
    createTrendsChart(analyticsData, 'Responses', 'responses-chart');
    createTrendsChart(analyticsData, 'Interviews', 'interviews-chart');
    createRemoteAnalysisChart(analyticsData, 'remote-chart');
    createSalaryInsightsChart(analyticsData, 'salary-chart');
    createSourceAnalysisChart(analyticsData, 'sources-chart');
    
    // Populate table
    populateSourceAnalysisTable(analyticsData, 'sources-table-body');
    
    // Update insights
    updateAnalyticsInsights(analyticsData);
}

// Run analytics initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalytics();
});