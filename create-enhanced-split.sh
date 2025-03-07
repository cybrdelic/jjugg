#!/bin/bash

# This script splits jjugg-main.html and jjugg-analytics.html into smaller component files

# Create directory for HTML components if it doesn't exist
mkdir -p html-components

echo "Creating component files from jjugg-main.html..."

# Extract head section
awk '
BEGIN { output = 0 }
/<head>/,/<\/head>/ { 
    if (output == 0) {
        print "<!DOCTYPE html>\n<html lang=\"en\" data-theme=\"dark\">"
        output = 1
    }
    print
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/head.html

# Extract sidebar component
awk '
BEGIN { output = 0 }
/<div id="sidebar"/,/<\/div><!-- End sidebar -->/ { 
    print
    if ($0 ~ /<\/div><!-- End sidebar -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/sidebar.html

# Extract dashboard section
awk '
BEGIN { output = 0 }
/<section id="dashboard"/,/<\/section><!-- End dashboard -->/ { 
    print
    if ($0 ~ /<\/section><!-- End dashboard -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/dashboard.html

# Extract applications section
awk '
BEGIN { output = 0 }
/<section id="applications"/,/<\/section><!-- End applications -->/ { 
    print
    if ($0 ~ /<\/section><!-- End applications -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/applications.html

# Extract reminders section
awk '
BEGIN { output = 0 }
/<section id="reminders"/,/<\/section><!-- End reminders -->/ { 
    print
    if ($0 ~ /<\/section><!-- End reminders -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/reminders.html

# Extract goals section
awk '
BEGIN { output = 0 }
/<section id="goals"/,/<\/section><!-- End goals -->/ { 
    print
    if ($0 ~ /<\/section><!-- End goals -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/goals.html

# Extract timeline section
awk '
BEGIN { output = 0 }
/<section id="timeline"/,/<\/section><!-- End timeline -->/ { 
    print
    if ($0 ~ /<\/section><!-- End timeline -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/timeline.html

# Extract main JS scripts
awk '
BEGIN { output = 0 }
/<script>$/,/<\/script>/ { 
    print
    if ($0 ~ /<\/script>/) {
        output = 1
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html > html-components/main-scripts.js

echo "Creating component files from jjugg-analytics.html..."

# Extract analytics sections
awk '
BEGIN { output = 0 }
/<section id="analytics"/,/<\/section><!-- End analytics -->/ { 
    print
    if ($0 ~ /<\/section><!-- End analytics -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics.html

# Extract KPI section from analytics
awk '
BEGIN { output = 0 }
/<div class="kpi-container"/,/<\/div><!-- End KPI cards -->/ { 
    print
    if ($0 ~ /<\/div><!-- End KPI cards -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-kpi.html

# Extract application funnel section
awk '
BEGIN { output = 0 }
/<div class="analytics-card application-funnel"/,/<\/div><!-- End application funnel -->/ { 
    print
    if ($0 ~ /<\/div><!-- End application funnel -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-funnel.html

# Extract application trends section
awk '
BEGIN { output = 0 }
/<div class="analytics-card application-trends"/,/<\/div><!-- End application trends -->/ { 
    print
    if ($0 ~ /<\/div><!-- End application trends -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-trends.html

# Extract remote insights section
awk '
BEGIN { output = 0 }
/<div class="analytics-card remote-insights"/,/<\/div><!-- End remote insights -->/ { 
    print
    if ($0 ~ /<\/div><!-- End remote insights -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-remote.html

# Extract salary insights section
awk '
BEGIN { output = 0 }
/<div class="analytics-card salary-insights"/,/<\/div><!-- End salary insights -->/ { 
    print
    if ($0 ~ /<\/div><!-- End salary insights -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-salary.html

# Extract source insights section
awk '
BEGIN { output = 0 }
/<div class="analytics-card source-insights"/,/<\/div><!-- End source insights -->/ { 
    print
    if ($0 ~ /<\/div><!-- End source insights -->/) {
        output = 1
        exit
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-source.html

# Extract analytics JS scripts
awk '
BEGIN { output = 0 }
/<script>$/,/<\/script>/ { 
    print
    if ($0 ~ /<\/script>/) {
        output = 1
    }
}
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html > html-components/analytics-scripts.js

echo "Creating new modular HTML files..."

# Create new jjugg-main-modular.html
cat > jjugg-main-modular.html << EOL
<!DOCTYPE html>
<html lang="en" data-theme="dark">
$(cat html-components/head.html | grep -v "<!DOCTYPE html>" | grep -v "<html")

<body>
    <!-- Sidebar -->
    $(cat html-components/sidebar.html)

    <main>
        <!-- Dashboard -->
        $(cat html-components/dashboard.html)
        
        <!-- Applications -->
        $(cat html-components/applications.html)
        
        <!-- Reminders -->
        $(cat html-components/reminders.html)
        
        <!-- Goals -->
        $(cat html-components/goals.html)
        
        <!-- Timeline -->
        $(cat html-components/timeline.html)
    </main>

    <!-- Scripts -->
    <script src="js/utils.js"></script>
    <script>
    $(cat html-components/main-scripts.js | grep -v "<script>" | grep -v "</script>")
    </script>
</body>
</html>
EOL

# Create new jjugg-analytics-modular.html
cat > jjugg-analytics-modular.html << EOL
<!DOCTYPE html>
<html lang="en" data-theme="dark">
$(cat html-components/head.html | grep -v "<!DOCTYPE html>" | grep -v "<html")

<body>
    <!-- Sidebar with Analytics link modified to point back to main -->
    $(cat html-components/sidebar.html | sed 's|<div class="sidebar-item analytics">|<!-- Sidebar analytics item modified -->\n        <div class="sidebar-item analytics">\n            <a href="jjugg-main-modular.html" class="sidebar-link">\n                <span class="sidebar-icon">🏠</span>\n                <span class="sidebar-text">Dashboard</span>\n            </a>\n        </div>\n        <!-- Original analytics item -->|g')

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
            $(cat html-components/analytics-kpi.html)
            
            <div class="analytics-grid">
                <!-- Application Funnel -->
                $(cat html-components/analytics-funnel.html)
                
                <!-- Application Trends -->
                $(cat html-components/analytics-trends.html)
                
                <!-- Remote Insights -->
                $(cat html-components/analytics-remote.html)
                
                <!-- Salary Insights -->
                $(cat html-components/analytics-salary.html)
                
                <!-- Source Insights -->
                $(cat html-components/analytics-source.html)
            </div>
        </section>
    </main>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="js/utils.js"></script>
    <script>
    $(cat html-components/analytics-scripts.js | grep -v "<script>" | grep -v "</script>")
    </script>
</body>
</html>
EOL

echo "Creating individual component HTML files..."

# Create self-contained component HTML files for easier development
for component in dashboard applications reminders goals timeline analytics-kpi analytics-funnel analytics-trends analytics-remote analytics-salary analytics-source; do
    cat > jjugg-component-${component}.html << EOL
<!DOCTYPE html>
<html lang="en" data-theme="dark">
$(cat html-components/head.html | grep -v "<!DOCTYPE html>" | grep -v "<html")
<body>
    <!-- Component: ${component} -->
    $(cat html-components/${component}.html)

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="js/utils.js"></script>
    <script>
    // Component-specific initialization
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize component
        console.log('Component ${component} loaded');
    });
    </script>
</body>
</html>
EOL
done

echo "All files created successfully!"
echo "New files:"
echo "- jjugg-main-modular.html"
echo "- jjugg-analytics-modular.html"
echo "- Individual component files (jjugg-component-*.html)"
echo "- Component folders in html-components/"