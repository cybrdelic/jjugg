#\!/bin/bash

# Create jjugg-main.html
awk '
BEGIN { print "<\!DOCTYPE html>\n<html lang=\"en\" data-theme=\"dark\">" }
/<head>/,/<\/head>/ { print }
/<body>/,/<div id="sidebar"/ { print }
/<div id="sidebar"/,/<div class="sidebar-item analytics"/ { print }
/<div class="sidebar-item analytics"/ {
  print "        <div class=\"sidebar-item analytics\">\n            <a href=\"jjugg-analytics.html\" class=\"sidebar-link\">\n                <span class=\"sidebar-icon\">📊</span>\n                <span class=\"sidebar-text\">Analytics Dashboard</span>\n            </a>\n        </div>"
  flag = 1; next
}
flag && /<div class="sidebar-item/ { flag = 0 }
flag { next }
/<div class="sidebar-item goals"/,/<\/div>/ { print }
/<main>/,/<section id="analytics"/ { print }
/<section id="analytics"/ { 
  print "    <\!-- Analytics moved to jjugg-analytics.html -->\n"
  flag2 = 1; next
}
flag2 && /<section id="goals"/ { flag2 = 0 }
flag2 { next }
/<section id="goals"/,/<script>/ { print }
/<script>/,/<\/html>/ {
  # This is a simplification - in reality you\'d need to be more selective about which JS to include
  print 
}
END { print "</body>\n</html>" }
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg.html > /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-main.html

# Create jjugg-analytics.html
awk '
BEGIN { print "<\!DOCTYPE html>\n<html lang=\"en\" data-theme=\"dark\">" }
/<head>/,/<\/head>/ { print }
/<body>/,/<div id="sidebar"/ { print }
/<div id="sidebar"/ {
  print "    <div id=\"sidebar\">\n        <div class=\"sidebar-header\">JJugg Analytics</div>\n        <div class=\"sidebar-item dashboard\">\n            <a href=\"jjugg-main.html\" class=\"sidebar-link\">\n                <span class=\"sidebar-icon\">🏠</span>\n                <span class=\"sidebar-text\">Main Dashboard</span>\n            </a>\n        </div>\n        <div class=\"sidebar-item analytics\">\n            <a href=\"#\" class=\"sidebar-link active\">\n                <span class=\"sidebar-icon\">📊</span>\n                <span class=\"sidebar-text\">Analytics</span>\n            </a>\n        </div>"
  flag = 1; next
}
flag && /<\/div>/ { 
  flag = 0
  print "    </div>"
}
flag { next }
/<main>/,/<section id="dashboard"/ { print }
/<section id="dashboard"/ { 
  flag2 = 1
  print "    <\!-- Main dashboard content moved to jjugg-main.html -->\n"
  next
}
flag2 && /<section id="analytics"/ { 
  flag2 = 0
  print "    <section id=\"analytics\" class=\"content-section active\">"
}
flag2 { next }
/<section id="analytics"/,/<section id="goals"/ { print }
/<section id="goals"/ { 
  flag3 = 1
  print "    <\!-- Other sections moved to jjugg-main.html -->\n" 
  next
}
flag3 && /<script>/ { flag3 = 0 }
flag3 { next }
/<script>/,/<\/html>/ {
  # This is a simplification - in reality you\'d need to be more selective about which JS to include
  print 
}
END { print "</body>\n</html>" }
' /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg.html > /home/cybrdelic/alexf/software-projects/.current/jjugg/jjugg-analytics.html

chmod +x /home/cybrdelic/alexf/software-projects/.current/jjugg/create-split-files.sh
