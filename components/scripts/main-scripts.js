    <script>
        // Initial Data with Favorite Property
        const fakeData = [
            { id: 1, title: "Software Engineer", company: "TechCorp", date: "2025-02-20", status: "Applied", notes: "Submitted via company site", url: "https://techcorp.com/jobs", history: [{ date: "2025-02-20", status: "Applied", notes: "Submitted application" }], salary: { expected: 120000, offered: null, benefits: "Healthcare, 401k" }, favorite: false },
            { id: 2, title: "Data Analyst", company: "DataWorks", date: "2025-02-15", status: "Interview Scheduled", notes: "Phone screen next week", url: "https://dataworks.com/careers", history: [{ date: "2025-02-15", status: "Applied", notes: "Submitted application" }, { date: "2025-02-18", status: "Interview Scheduled", notes: "Got email for phone screen" }], salary: { expected: 95000, offered: null, benefits: "" }, favorite: false },
            { id: 3, title: "Product Manager", company: "Innovate Inc", date: "2025-01-25", status: "Applied", notes: "Awaiting response", url: "https://innovateinc.com/apply", history: [{ date: "2025-01-25", status: "Applied", notes: "Applied through referral" }], salary: { expected: 140000, offered: null, benefits: "" }, favorite: false },
            { id: 4, title: "UX Designer", company: "Designify", date: "2025-03-01", status: "Offer Received", notes: "Negotiating salary", url: "https://designify.com/jobs", history: [{ date: "2025-03-01", status: "Applied", notes: "Applied online" }, { date: "2025-03-05", status: "Interview Scheduled", notes: "Portfolio review" }, { date: "2025-03-10", status: "Interview Scheduled", notes: "Team interview" }, { date: "2025-03-15", status: "Offer Received", notes: "Initial offer made" }], salary: { expected: 110000, offered: 105000, benefits: "Healthcare, 401k, Remote work" }, favorite: false },
            { id: 5, title: "DevOps Engineer", company: "CloudNet", date: "2025-02-10", status: "Rejected", notes: "Not enough experience", url: "https://cloudnet.com/careers", history: [{ date: "2025-02-10", status: "Applied", notes: "Applied online" }, { date: "2025-02-15", status: "Interview Scheduled", notes: "Technical screen" }, { date: "2025-02-20", status: "Rejected", notes: "Got rejection email" }], salary: { expected: 130000, offered: null, benefits: "" }, favorite: false }
        ];

        let applications = fakeData;
        let savedJobs = [];
        let isKanbanView = false;
        let githubData = null;
        let isProjectsKanbanView = false;

        const kanbanCategories = {
            'Recently Updated': repo => new Date(repo.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            'Older Projects': repo => new Date(repo.updated_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        };

        // Load Data on Page Load
        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                document.getElementById('theme-text').textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            }

            const storedApps = localStorage.getItem('jobApplications');
            if (storedApps) {
                try {
                    applications = JSON.parse(storedApps).map(app => ({ ...app, favorite: app.favorite || false }));
                } catch (e) {
                    console.error('Error parsing stored applications:', e);
                    applications = fakeData;
                }
            }

            const storedSavedJobs = localStorage.getItem('savedJobs');
            if (storedSavedJobs) {
                try {
                    savedJobs = JSON.parse(storedSavedJobs);
                } catch (e) {
                    console.error('Error parsing stored saved jobs:', e);
                    savedJobs = [];
                }
            }

            // Initialize sidebar navigation
            initSidebar();
            
            // Setup content sections
            document.getElementById('dashboard-home').style.display = 'block';
            
            // Render all sections
            renderTable();
            renderAnalytics();
            renderReminders();
            renderDashboard();
            renderTimeline();
            updateGoalProgress();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];

            // Real-time Filtering for Applications
            document.querySelectorAll('.filter-inputs input, .filter-inputs select, #filter').forEach(input => {
                input.addEventListener('input', () => {
                    if (isKanbanView) renderKanban();
                    else renderTable();
                });
            });

            // Setup analytics tabs
            document.querySelectorAll('.analytics-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    document.querySelectorAll('.analytics-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Hide all tab content
                    document.querySelectorAll('.analytics-tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Show content for active tab
                    const tabId = tab.dataset.tab;
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });

            // Check for existing GitHub token
            const token = localStorage.getItem('githubToken');
            if (token) {
                document.getElementById('login-section').children[0].style.display = 'none';
                document.getElementById('login-section').children[1].style.display = 'none';
                document.getElementById('logout-btn').style.display = 'inline-block';
                fetchGitHubData(token);
            }
        });
        
        // Initialize Sidebar Navigation
        function initSidebar() {
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (item.dataset.target) {
                        switchToSection(item.dataset.target);
                    }
                });
            });
        }
        
        // Switch between sections
        function switchToSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.style.display = 'none';
            });
            
            // Remove active class from all sidebar items
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).style.display = 'block';
            
            // Highlight active sidebar item
            document.querySelector(`.sidebar-item[data-target="${sectionId}"]`).classList.add('active');
        }
        
        // Render Dashboard Home
        function renderDashboard() {
            // Render Recent Applications
            const recentAppsContainer = document.getElementById('recent-applications');
            recentAppsContainer.innerHTML = '';
            
            const recentApps = [...applications]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);
                
            if (recentApps.length === 0) {
                recentAppsContainer.innerHTML = '<p style="color: var(--text-tertiary); text-align: center;">No applications yet.</p>';
            } else {
                recentApps.forEach(app => {
                    const appDiv = document.createElement('div');
                    appDiv.className = 'dashboard-app-card';
                    appDiv.innerHTML = `
                        <div class="dashboard-app-title">${app.title}</div>
                        <div class="dashboard-app-company">${app.company}</div>
                        <div class="dashboard-app-date">${formatDate(app.date)}</div>
                        <div class="dashboard-app-status status-${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</div>
                    `;
                    recentAppsContainer.appendChild(appDiv);
                });
            }
            
            // Render Dashboard Reminders
            const dashboardReminders = document.getElementById('dashboard-reminders');
            dashboardReminders.innerHTML = '';
            
            const reminders = applications
                .filter(app => app.status === 'Applied' && daysSince(app.date) > 10)
                .slice(0, 3);
                
            if (reminders.length === 0) {
                dashboardReminders.innerHTML = '<p style="color: var(--text-tertiary); text-align: center;">No follow-up reminders at this time.</p>';
            } else {
                reminders.forEach(app => {
                    const reminderDiv = document.createElement('div');
                    reminderDiv.className = 'dashboard-reminder';
                    reminderDiv.innerHTML = `
                        <div class="dashboard-reminder-title">${app.company} - ${app.title}</div>
                        <div class="dashboard-reminder-days">Applied ${daysSince(app.date)} days ago</div>
                        <button onclick="markFollowed(${app.id})" class="reminder-action-btn">Follow Up</button>
                    `;
                    dashboardReminders.appendChild(reminderDiv);
                });
            }
            
            // Update dashboard goal progress
            const weeklyProgress = calculateWeeklyProgress();
            document.getElementById('dashboard-weekly-goal-progress').style.width = `${weeklyProgress.progressPercent}%`;
            document.getElementById('dashboard-weekly-apps-submitted').textContent = `${weeklyProgress.weeklyCount} applications`;
            document.getElementById('dashboard-weekly-goal-target').textContent = `Goal: ${weeklyProgress.weeklyGoal}/week`;
        }
        
        // Calculate weekly progress for dashboard
        function calculateWeeklyProgress() {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            
            const weeklyApps = applications.filter(app => {
                const appDate = new Date(app.date);
                return appDate >= weekAgo && appDate <= today;
            });
            
            const weeklyCount = weeklyApps.length;
            const weeklyGoal = 10;
            const progressPercent = Math.min(100, (weeklyCount / weeklyGoal) * 100);
            
            return {
                weeklyCount,
                weeklyGoal,
                progressPercent
            };
        }

        // Theme Toggle Function
        function toggleTheme() {
            const html = document.documentElement;
            const themeText = document.getElementById('theme-text');
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            themeText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            localStorage.setItem('theme', newTheme);
            if (githubData) renderProfilePage(); // Re-render charts for theme
            renderAnalytics(); // Re-render analytics charts
            updateGoalProgress(); // Re-render goal chart
        }

        // Modal Functions with Animation
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            
            // Trigger animation after display is set
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            // Add escape key listener for modal
            document.addEventListener('keydown', function closeOnEsc(e) {
                if (e.key === 'Escape') {
                    closeModal(modalId);
                    document.removeEventListener('keydown', closeOnEsc);
                }
            });
            
            // Add click outside to close
            modal.addEventListener('click', function closeOnClick(e) {
                if (e.target === modal) {
                    closeModal(modalId);
                    modal.removeEventListener('click', closeOnClick);
                }
            });
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('active');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }, 300);
        }

        // Navigation Functions
        function showDashboard() {
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('profile-page').style.display = 'none';
        }

        function showProfile() {
            const token = localStorage.getItem('githubToken');
            if (token) {
                document.getElementById('dashboard').style.display = 'none';
                document.getElementById('profile-page').style.display = 'block';
                if (!githubData) {
                    fetchGitHubData(token);
                } else {
                    renderProfilePage();
                }
            } else {
                showNotification('Please log in with GitHub first.', 'error');
            }
        }

        // Toggle View Function for Applications
        function toggleView() {
            isKanbanView = document.getElementById('view-toggle').checked;
            const tableView = document.getElementById('table-view');
            const kanbanView = document.getElementById('kanban-view');
            if (isKanbanView) {
                tableView.style.display = 'none';
                kanbanView.style.display = 'grid';
                renderKanban();
            } else {
                tableView.style.display = 'block';
                kanbanView.style.display = 'none';
                renderTable();
            }
        }

        // Add Application Form Submission
        document.getElementById('app-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const app = {
                id: Date.now(),
                title: document.getElementById('title').value,
                company: document.getElementById('company').value,
                date: document.getElementById('date').value,
                status: document.getElementById('status').value,
                notes: document.getElementById('notes').value,
                url: document.getElementById('url').value,
                history: [{ date: document.getElementById('date').value, status: document.getElementById('status').value, notes: document.getElementById('notes').value }],
                salary: {
                    expected: parseFloat(document.getElementById('expected-salary').value) || 0,
                    offered: parseFloat(document.getElementById('offered-salary').value) || null,
                    benefits: ""
                },
                favorite: false
            };
            applications.push(app);
            saveData();
            if (isKanbanView) renderKanban();
            else renderTable();
            renderAnalytics();
            renderReminders();
            renderTimeline();
            updateGoalProgress();
            closeModal('app-modal');
            showNotification('Application added successfully');
        });

        // Save Job Form Submission
        document.getElementById('save-job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const job = {
                id: Date.now(),
                title: document.getElementById('save-title').value,
                company: document.getElementById('save-company').value,
                url: document.getElementById('save-url').value,
                notes: document.getElementById('save-notes').value,
                dateSaved: new Date().toISOString().split('T')[0]
            };
            savedJobs.push(job);
            saveData();
            closeModal('save-job-modal');
            showNotification('Job saved successfully');
        });

        // Utility Functions
        function daysSince(dateString) {
            const date = new Date(dateString);
            const today = new Date();
            const diffTime = Math.abs(today - date);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        function formatCurrency(value) {
            if (value == null) return 'N/A';
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
        }

        // Filter Applications
        function filterApplications() {
            let filteredApps = [...applications];
            const filter = document.getElementById('filter').value;
            if (filter === 'Favorites') {
                filteredApps = filteredApps.filter(app => app.favorite);
            } else if (filter !== 'All') {
                filteredApps = filteredApps.filter(app => app.status === filter);
            }

            const titleFilter = document.getElementById('filter-title').value.toLowerCase();
            const companyFilter = document.getElementById('filter-company').value.toLowerCase();
            const dateFilter = document.getElementById('filter-date').value;
            const statusFilter = document.getElementById('filter-status').value;
            const expectedFilter = parseFloat(document.getElementById('filter-expected').value) || 0;
            const offeredFilter = parseFloat(document.getElementById('filter-offered').value) || 0;
            const notesFilter = document.getElementById('filter-notes').value.toLowerCase();
            const urlFilter = document.getElementById('filter-url').value.toLowerCase();

            return filteredApps.filter(app => {
                return (
                    app.title.toLowerCase().includes(titleFilter) &&
                    app.company.toLowerCase().includes(companyFilter) &&
                    (!dateFilter || new Date(app.date) >= new Date(dateFilter)) &&
                    (!statusFilter || app.status === statusFilter) &&
                    (app.salary.expected >= expectedFilter || expectedFilter === 0) &&
                    ((app.salary.offered >= offeredFilter && app.salary.offered !== null) || offeredFilter === 0) &&
                    app.notes.toLowerCase().includes(notesFilter) &&
                    (app.url || '').toLowerCase().includes(urlFilter)
                );
            });
        }

        // Render Table View for Applications
        function renderTable() {
            const tbody = document.querySelector('#applications-table tbody');
            tbody.innerHTML = '';
            let filteredApps = filterApplications();

            filteredApps.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((app, index) => {
                const row = document.createElement('tr');
                const statusClass = {
                    'Applied': 'status-applied',
                    'Interview Scheduled': 'status-interview',
                    'Offer Received': 'status-offer',
                    'Rejected': 'status-rejected'
                }[app.status] || '';
                
                // Add staggered animation
                row.classList.add('fade-in');
                row.style.animationDelay = `${index * 30}ms`;
                
                // Add favorite row styling
                if (app.favorite) {
                    row.style.background = 'rgba(255, 215, 0, 0.05)';
                }
                
                row.innerHTML = `
                    <td>${app.title}</td>
                    <td>${app.company}</td>
                    <td>${formatDate(app.date)}</td>
                    <td><span class="status ${statusClass}" title="${app.status}">${app.status}</span></td>
                    <td>${formatCurrency(app.salary.expected)}</td>
                    <td>${formatCurrency(app.salary.offered)}</td>
                    <td>${app.notes}</td>
                    <td>${app.url ? `<a href="${app.url}" target="_blank" class="hover-glow">View</a>` : ''}</td>
                    <td>
                        <button onclick="viewDetails(${app.id})" class="action-btn hover-lift" title="View application details">Details</button>
                        <button onclick="startEdit(${app.id})" class="action-btn hover-lift" title="Edit application">Edit</button>
                        <button onclick="deleteApplication(${app.id})" class="action-btn hover-lift" title="Delete application">Delete</button>
                        <button onclick="toggleFavorite(${app.id})" class="action-btn favorite-btn ${app.favorite ? 'active' : ''}" title="${app.favorite ? 'Remove from favorites' : 'Add to favorites'}">${app.favorite ? '★' : '☆'}</button>
                        ${app.status === 'Applied' && daysSince(app.date) > 10 ? `<button onclick="markFollowed(${app.id})" class="action-btn hover-lift pulse" title="Mark as followed up">Follow Up</button>` : ''}
                    </td>
                `;
                tbody.appendChild(row);
            });

            if (filteredApps.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No applications found.</td></tr>`;
            }
        }

        const statusToIdSuffix = {
            'Applied': 'applied',
            'Interview Scheduled': 'interview',
            'Offer Received': 'offer',
            'Rejected': 'rejected'
        };

        // Render Kanban View for Applications with Pagination/Infinite Scroll
        function renderKanban() {
            const statuses = ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'];
            let filteredApps = filterApplications();
            const ITEMS_PER_PAGE = 5; // Number of items to show initially and load more

            statuses.forEach(status => {
                const container = document.getElementById(`kanban-${statusToIdSuffix[status]}`);
                if (!container) {
                    console.error(`Kanban container not found for status: ${status}`);
                    return;
                }
                container.innerHTML = '';
                
                const appsInStatus = filteredApps.filter(app => app.status === status);
                const columnHeader = container.parentElement.querySelector('h3');
                
                // Add count badge to the column header
                columnHeader.innerHTML = `${status} <span class="count">${appsInStatus.length}</span>`;
                
                // If no apps, show message
                if (appsInStatus.length === 0) {
                    container.innerHTML = `<p style="color: var(--text-tertiary); text-align: center;">No applications</p>`;
                    return;
                }
                
                // Otherwise, render the first batch of cards with animation staggering
                const initialItems = appsInStatus.slice(0, ITEMS_PER_PAGE);
                initialItems.forEach((app, index) => {
                    addKanbanCard(container, app, index * 50); // Stagger animation by 50ms per card
                });
                
                // If there are more items, add "Load More" button
                if (appsInStatus.length > ITEMS_PER_PAGE) {
                    const loadMoreBtn = document.createElement('div');
                    loadMoreBtn.className = 'kanban-load-more';
                    loadMoreBtn.textContent = `Load ${Math.min(ITEMS_PER_PAGE, appsInStatus.length - ITEMS_PER_PAGE)} more`;
                    loadMoreBtn.dataset.page = '1';
                    loadMoreBtn.dataset.status = status;
                    loadMoreBtn.addEventListener('click', loadMoreKanbanItems);
                    container.appendChild(loadMoreBtn);
                }
            });
        }
        
        // Function to add a single kanban card with animation
        function addKanbanCard(container, app, delay = 0) {
            const card = document.createElement('div');
            card.className = `kanban-card ${app.favorite ? 'favorite' : ''}`;
            card.innerHTML = `
                <div class="title">${app.title}</div>
                <div class="company">${app.company}</div>
                <div class="actions">
                    <button onclick="viewDetails(${app.id})" class="action-btn" title="View application details">Details</button>
                    <button onclick="startEdit(${app.id})" class="action-btn" title="Edit application">Edit</button>
                    <button onclick="deleteApplication(${app.id})" class="action-btn" title="Delete application">Delete</button>
                    <button onclick="toggleFavorite(${app.id})" class="action-btn favorite-btn ${app.favorite ? 'active' : ''}" title="${app.favorite ? 'Remove from favorites' : 'Add to favorites'}">${app.favorite ? '★' : '☆'}</button>
                </div>
            `;
            
            // Hide initially for animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            
            container.appendChild(card);
            
            // Trigger animation after a delay
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, delay);
        }
        
        // Function to load more kanban items when button is clicked
        function loadMoreKanbanItems(e) {
            const btn = e.currentTarget;
            const status = btn.dataset.status;
            const page = parseInt(btn.dataset.page);
            const container = btn.parentElement;
            const ITEMS_PER_PAGE = 5;
            
            // Remove the button temporarily
            btn.remove();
            
            // Get filtered applications of this status
            const appsInStatus = filterApplications().filter(app => app.status === status);
            
            // Calculate start and end indices for this page
            const startIndex = page * ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, appsInStatus.length);
            
            // Add the next batch of cards with animation
            const nextItems = appsInStatus.slice(startIndex, endIndex);
            nextItems.forEach((app, index) => {
                addKanbanCard(container, app, index * 50);
            });
            
            // If there are still more items, add the button back
            if (endIndex < appsInStatus.length) {
                btn.textContent = `Load ${Math.min(ITEMS_PER_PAGE, appsInStatus.length - endIndex)} more`;
                btn.dataset.page = (page + 1).toString();
                setTimeout(() => {
                    container.appendChild(btn);
                }, nextItems.length * 50 + 100); // Add button after all cards are added
            }
        }

        // Toggle Favorite Status with Animation
        function toggleFavorite(id) {
            const app = applications.find(a => a.id === id);
            if (app) {
                app.favorite = !app.favorite;
                saveData();
                
                // Find all instances of this app in the UI and update them
                if (isKanbanView) {
                    // Find and update kanban card
                    const kanbanCards = document.querySelectorAll('.kanban-card');
                    kanbanCards.forEach(card => {
                        const actionButtons = card.querySelectorAll('.actions button');
                        const favoriteBtn = actionButtons[actionButtons.length - 1];
                        if (favoriteBtn && favoriteBtn.getAttribute('onclick').includes(`toggleFavorite(${id})`)) {
                            // Update card class
                            if (app.favorite) {
                                card.classList.add('favorite');
                                card.classList.add('bounce'); // Add bounce animation
                                setTimeout(() => card.classList.remove('bounce'), 500); // Remove after animation completes
                            } else {
                                card.classList.remove('favorite');
                                card.classList.add('shake'); // Add shake animation
                                setTimeout(() => card.classList.remove('shake'), 500); // Remove after animation completes
                            }
                            
                            // Update button
                            favoriteBtn.innerHTML = app.favorite ? '★' : '☆';
                            favoriteBtn.title = app.favorite ? 'Remove from favorites' : 'Add to favorites';
                            favoriteBtn.className = `action-btn favorite-btn ${app.favorite ? 'active' : ''}`;
                        }
                    });
                } else {
                    // Find and update table row
                    const tableRows = document.querySelectorAll('#applications-table tbody tr');
                    tableRows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        const actionCell = cells[cells.length - 1];
                        const favoriteBtn = actionCell.querySelector(`button[onclick*="toggleFavorite(${id})"]`);
                        if (favoriteBtn) {
                            favoriteBtn.innerHTML = app.favorite ? '★' : '☆';
                            favoriteBtn.title = app.favorite ? 'Remove from favorites' : 'Add to favorites';
                            favoriteBtn.className = `action-btn favorite-btn ${app.favorite ? 'active' : ''}`;
                            
                            if (app.favorite) {
                                row.classList.add('flash');
                                setTimeout(() => row.classList.remove('flash'), 500);
                            }
                        }
                    });
                }
                
                showNotification(app.favorite ? 'Application favorited' : 'Application unfavorited');
            }
        }

        function viewDetails(id) {
            const app = applications.find(a => a.id === id);
            if (app) {
                document.getElementById('detail-title').textContent = app.title;
                document.getElementById('detail-company').textContent = app.company;
                document.getElementById('detail-date').textContent = formatDate(app.date);
                document.getElementById('detail-status').textContent = app.status;
                document.getElementById('detail-expected').textContent = formatCurrency(app.salary.expected);
                document.getElementById('detail-offered').textContent = formatCurrency(app.salary.offered);
                document.getElementById('detail-notes').textContent = app.notes || 'N/A';
                const urlContainer = document.getElementById('detail-url-container');
                if (app.url) {
                    urlContainer.innerHTML = `<a href="${app.url}" target="_blank">View</a>`;
                } else {
                    urlContainer.textContent = 'N/A';
                }
                renderTimeline(app, 'detail-timeline');
                openModal('details-modal');
            }
        }

        // Edit Application using Modal instead of prompt
        function startEdit(id) {
            const app = applications.find(a => a.id === id);
            if (app) {
                // Create an edit modal dynamically
                const editModalId = 'edit-modal-' + id;
                let editModal = document.getElementById(editModalId);
                
                // If modal doesn't exist, create it
                if (!editModal) {
                    editModal = document.createElement('div');
                    editModal.id = editModalId;
                    editModal.className = 'modal';
                    
                    const modalHtml = `
                        <div class="modal-content">
                            <button class="modal-close" onclick="closeModal('${editModalId}')">×</button>
                            <h2>Edit Application</h2>
                            <form id="edit-form-${id}">
                                <div class="form-group">
                                    <label for="edit-title-${id}">Job Title</label>
                                    <input type="text" id="edit-title-${id}" value="${app.title}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-company-${id}">Company</label>
                                    <input type="text" id="edit-company-${id}" value="${app.company}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-date-${id}">Date</label>
                                    <input type="date" id="edit-date-${id}" value="${app.date}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-status-${id}">Status</label>
                                    <select id="edit-status-${id}">
                                        <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                                        <option value="Interview Scheduled" ${app.status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
                                        <option value="Offer Received" ${app.status === 'Offer Received' ? 'selected' : ''}>Offer Received</option>
                                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="edit-expected-${id}">Expected Salary</label>
                                    <input type="number" id="edit-expected-${id}" value="${app.salary?.expected || ''}" placeholder="$">
                                </div>
                                <div class="form-group">
                                    <label for="edit-offered-${id}">Offered Salary</label>
                                    <input type="number" id="edit-offered-${id}" value="${app.salary?.offered || ''}" placeholder="$">
                                </div>
                                <div class="form-group">
                                    <label for="edit-notes-${id}">Notes</label>
                                    <textarea id="edit-notes-${id}">${app.notes || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label for="edit-url-${id}">URL</label>
                                    <input type="url" id="edit-url-${id}" value="${app.url || ''}">
                                </div>
                                <button type="submit" class="btn-primary">Save Changes</button>
                            </form>
                        </div>
                    `;
                    
                    editModal.innerHTML = modalHtml;
                    document.body.appendChild(editModal);
                    
                    // Add form submission handler
                    document.getElementById(`edit-form-${id}`).addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const prevStatus = app.status;
                        const newStatus = document.getElementById(`edit-status-${id}`).value;
                        
                        // Update app data
                        app.title = document.getElementById(`edit-title-${id}`).value;
                        app.company = document.getElementById(`edit-company-${id}`).value;
                        app.date = document.getElementById(`edit-date-${id}`).value;
                        app.status = newStatus;
                        app.notes = document.getElementById(`edit-notes-${id}`).value;
                        app.url = document.getElementById(`edit-url-${id}`).value;
                        
                        // Update salary information
                        if (!app.salary) app.salary = {};
                        app.salary.expected = parseFloat(document.getElementById(`edit-expected-${id}`).value) || 0;
                        app.salary.offered = parseFloat(document.getElementById(`edit-offered-${id}`).value) || null;
                        
                        // Add to history if status changed
                        if (newStatus !== prevStatus) {
                            if (!app.history) app.history = [];
                            app.history.push({
                                date: new Date().toISOString().split('T')[0],
                                status: newStatus,
                                notes: `Status changed from ${prevStatus} to ${newStatus}`
                            });
                        }
                        
                        saveData();
                        
                        // Update UI
                        if (isKanbanView) renderKanban();
                        else renderTable();
                        renderAnalytics();
                        renderReminders();
                        renderTimeline();
                        updateGoalProgress();
                        
                        closeModal(editModalId);
                        showNotification('Application updated successfully', 'success');
                    });
                }
                
                // Open the modal
                openModal(editModalId);
            }
        }

        // Delete Application
        function deleteApplication(id) {
            if (confirm('Are you sure you want to delete this application?')) {
                applications = applications.filter(a => a.id !== id);
                saveData();
                if (isKanbanView) renderKanban();
                else renderTable();
                renderAnalytics();
                renderReminders();
                renderTimeline();
                updateGoalProgress();
                showNotification('Application deleted');
            }
        }

        // Mark as Followed Up
        function markFollowed(id) {
            const app = applications.find(a => a.id === id);
            if (app) {
                const today = new Date().toISOString().split('T')[0];
                app.notes += ` - Followed up on ${today}`;
                app.history.push({ date: today, status: app.status, notes: 'Followed up on application' });
                saveData();
                if (isKanbanView) renderKanban();
                else renderTable();
                renderAnalytics();
                renderReminders();
                renderTimeline();
            }
        }

        // Save Data to LocalStorage
        function saveData() {
            localStorage.setItem('jobApplications', JSON.stringify(applications));
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        }

        // Show Notification with Animation
        function showNotification(message, type = 'success') {
            // Remove any existing notifications to prevent stacking
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => {
                notification.classList.add('notification-exit');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
            
            // Create new notification
            const flash = document.createElement('div');
            flash.className = 'notification notification-enter';
            
            // Set background based on type
            const bgColor = type === 'success' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(244, 67, 54, 0.2)';
            const borderColor = type === 'success' ? 'var(--accent-primary)' : 'var(--status-rejected)';
            const icon = type === 'success' ? '✓' : '✗';
            
            flash.style.cssText = `
                position: fixed; top: 20px; right: 20px; padding: 12px 20px 12px 40px;
                background: ${bgColor}; backdrop-filter: blur(10px); 
                border-radius: 6px; color: white; font-weight: 500; z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 3px solid ${borderColor};
                transform: translateX(50px); opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            `;
            
            // Add icon
            const iconSpan = document.createElement('span');
            iconSpan.style.cssText = `
                position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                font-size: 1.2em; color: ${borderColor};
            `;
            iconSpan.textContent = icon;
            
            flash.appendChild(iconSpan);
            
            // Add message
            const messageSpan = document.createElement('span');
            messageSpan.textContent = message;
            flash.appendChild(messageSpan);
            
            // Add close button
            const closeBtn = document.createElement('span');
            closeBtn.style.cssText = `
                position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                cursor: pointer; font-size: 1em; opacity: 0.7; transition: opacity 0.2s ease;
                width: 20px; height: 20px; text-align: center; line-height: 20px;
            `;
            closeBtn.textContent = '×';
            closeBtn.addEventListener('mouseenter', () => { closeBtn.style.opacity = '1'; });
            closeBtn.addEventListener('mouseleave', () => { closeBtn.style.opacity = '0.7'; });
            closeBtn.addEventListener('click', () => {
                flash.classList.add('notification-exit');
                setTimeout(() => {
                    if (flash.parentNode) {
                        flash.parentNode.removeChild(flash);
                    }
                }, 300);
            });
            
            flash.appendChild(closeBtn);
            
            // Add to document
            document.body.appendChild(flash);
            
            // Trigger entrance animation
            setTimeout(() => {
                flash.style.transform = 'translateX(0)';
                flash.style.opacity = '1';
            }, 10);
            
            // Auto-dismiss
            setTimeout(() => {
                flash.classList.add('notification-exit');
                setTimeout(() => {
                    if (flash.parentNode) {
                        flash.parentNode.removeChild(flash);
                    }
                }, 300);
            }, 3000);
        }
        
        // Add notification animation styles
        const notificationStyle = document.createElement('style');
        notificationStyle.textContent = `
            .notification-enter {
                animation: notification-enter 0.3s ease forwards;
            }
            .notification-exit {
                animation: notification-exit 0.3s ease forwards;
            }
            @keyframes notification-enter {
                from { transform: translateX(50px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notification-exit {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(50px); opacity: 0; }
            }
        `;
        document.head.appendChild(notificationStyle);

        // World-Class Job Search Analytics With Relevant Metrics
        function renderAnalytics() {
            // Get the filtered time range
            const timeRange = document.getElementById('analytics-time-range')?.value || 'month';
            const filteredApps = getFilteredAppsByTimeRange(applications, timeRange);
            
            // Render Application Status Dashboard
            renderApplicationStatusDashboard(filteredApps);
            
            // Render Application Pipeline
            renderApplicationPipeline(filteredApps);
            
            // Render Application Activity
            renderApplicationActivity(filteredApps);
            
            // Render Remote Job Insights
            renderRemoteJobInsights(filteredApps);
            
            // Render Salary Insights
            renderSalaryInsights(filteredApps);
            
            // Render Application Source Analysis
            renderApplicationSourceAnalysis(filteredApps);
            
            // Render Actionable Recommendations
            renderActionableRecommendations(filteredApps);
        }
        
        // Filter applications by time range
        function getFilteredAppsByTimeRange(apps, timeRange) {
            const today = new Date();
            let startDate = new Date();
            
            // Set the start date based on the selected time range
            switch (timeRange) {
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(today.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(today.getFullYear() - 1);
                    break;
                case 'all':
                default:
                    startDate = new Date(0); // Beginning of time
                    break;
            }
            
            return apps.filter(app => new Date(app.date) >= startDate);
        }

        // Render Application Status Dashboard
        function renderApplicationStatusDashboard(apps) {
            // Calculate previous period's data for comparison
            const prevTimeRange = getPreviousPeriod(document.getElementById('analytics-time-range')?.value || 'month');
            const prevApps = getFilteredAppsByTimeRange(applications, prevTimeRange);
            
            // Calculate total applications
            const totalApplications = apps.length;
            
            // Calculate weekly application rate
            const today = new Date();
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            
            const appsLastWeek = apps.filter(app => {
                const appDate = new Date(app.date);
                return appDate >= oneWeekAgo && appDate <= today;
            }).length;
            
            // Calculate active applications (those not rejected or with offers)
            const activeApplications = apps.filter(app => 
                app.status !== 'Rejected' && app.status !== 'Offer Received'
            ).length;
            
            // Calculate response rate
            const responseCount = apps.filter(app => 
                app.status !== 'Applied' || 
                app.history?.some(h => h.status !== 'Applied' && new Date(h.date) > new Date(app.date))
            ).length;
            const responseRate = totalApplications > 0 ? (responseCount / totalApplications) * 100 : 0;
            
            const prevResponseCount = prevApps.filter(app => 
                app.status !== 'Applied' || 
                app.history?.some(h => h.status !== 'Applied' && new Date(h.date) > new Date(app.date))
            ).length;
            const prevResponseRate = prevApps.length > 0 ? (prevResponseCount / prevApps.length) * 100 : 0;
            
            const responseChange = prevResponseRate > 0 ? ((responseRate - prevResponseRate) / prevResponseRate) * 100 : 0;
            
            // Calculate interview rate
            const interviewCount = apps.filter(app => 
                app.status === 'Interview Scheduled' || 
                app.status === 'Offer Received' || 
                app.history?.some(h => h.status === 'Interview Scheduled')
            ).length;
            const interviewRate = totalApplications > 0 ? (interviewCount / totalApplications) * 100 : 0;
            
            const prevInterviewCount = prevApps.filter(app => 
                app.status === 'Interview Scheduled' || 
                app.status === 'Offer Received' || 
                app.history?.some(h => h.status === 'Interview Scheduled')
            ).length;
            const prevInterviewRate = prevApps.length > 0 ? (prevInterviewCount / prevApps.length) * 100 : 0;
            
            const interviewChange = prevInterviewRate > 0 ? ((interviewRate - prevInterviewRate) / prevInterviewRate) * 100 : 0;
            
            // Calculate pending responses
            const pendingCount = apps.filter(app => app.status === 'Applied').length;
            
            // Update KPI cards
            const totalAppsEl = document.getElementById('total-applications');
            if (totalAppsEl) totalAppsEl.textContent = totalApplications;
            
            const applicationRateEl = document.getElementById('application-rate');
            if (applicationRateEl) applicationRateEl.textContent = `${appsLastWeek}/week`;
            
            const responseRateEl = document.getElementById('response-rate-value');
            if (responseRateEl) responseRateEl.textContent = `${responseRate.toFixed(1)}%`;
            
            const responseChangeEl = document.getElementById('response-rate-change');
            if (responseChangeEl) {
                const arrow = responseChangeEl.querySelector('.arrow');
                responseChangeEl.textContent = `${Math.abs(responseChange).toFixed(1)}% `;
                responseChangeEl.appendChild(arrow);
                
                if (responseChange > 0) {
                    responseChangeEl.classList.add('positive');
                    responseChangeEl.classList.remove('negative');
                    arrow.textContent = '↑';
                } else if (responseChange < 0) {
                    responseChangeEl.classList.add('negative');
                    responseChangeEl.classList.remove('positive');
                    arrow.textContent = '↓';
                } else {
                    responseChangeEl.classList.remove('positive', 'negative');
                    arrow.textContent = '→';
                }
            }
            
            const interviewRateEl = document.getElementById('interview-rate-value');
            if (interviewRateEl) interviewRateEl.textContent = `${interviewRate.toFixed(1)}%`;
            
            const interviewChangeEl = document.getElementById('interview-rate-change');
            if (interviewChangeEl) {
                const arrow = interviewChangeEl.querySelector('.arrow');
                interviewChangeEl.textContent = `${Math.abs(interviewChange).toFixed(1)}% `;
                interviewChangeEl.appendChild(arrow);
                
                if (interviewChange > 0) {
                    interviewChangeEl.classList.add('positive');
                    interviewChangeEl.classList.remove('negative');
                    arrow.textContent = '↑';
                } else if (interviewChange < 0) {
                    interviewChangeEl.classList.add('negative');
                    interviewChangeEl.classList.remove('positive');
                    arrow.textContent = '↓';
                } else {
                    interviewChangeEl.classList.remove('positive', 'negative');
                    arrow.textContent = '→';
                }
            }
            
            const activeAppsEl = document.getElementById('active-applications');
            if (activeAppsEl) activeAppsEl.textContent = activeApplications;
            
            const activeAppsChangeEl = document.getElementById('active-applications-change');
            if (activeAppsChangeEl) {
                const arrow = activeAppsChangeEl.querySelector('.arrow');
                activeAppsChangeEl.textContent = `${pendingCount} pending `;
                activeAppsChangeEl.appendChild(arrow);
            }
        }
        
        // Helper function to update KPI cards
        function updateKpiCard(cardId, value, change) {
            const card = document.getElementById(cardId);
            if (!card) return;
            
            const valueElement = card.querySelector('.kpi-value');
            const changeElement = card.querySelector('.kpi-change');
            
            if (valueElement) valueElement.textContent = value;
            
            if (changeElement) {
                const changeValue = change.toFixed(1);
                const arrow = changeElement.querySelector('.arrow');
                
                changeElement.textContent = Math.abs(changeValue) + '% ';
                changeElement.appendChild(arrow);
                
                if (change > 0) {
                    changeElement.classList.add('positive');
                    changeElement.classList.remove('negative');
                    arrow.textContent = '↑';
                } else if (change < 0) {
                    changeElement.classList.add('negative');
                    changeElement.classList.remove('positive');
                    arrow.textContent = '↓';
                } else {
                    changeElement.classList.remove('positive', 'negative');
                    arrow.textContent = '→';
                }
            }
        }
        
        // Get previous period based on current period
        function getPreviousPeriod(timeRange) {
            switch (timeRange) {
                case 'week':
                    return 'prev-week';
                case 'month':
                    return 'prev-month';
                case 'quarter':
                    return 'prev-quarter';
                case 'year':
                    return 'prev-year';
                default:
                    return 'all';
            }
        }

        // Render Application Pipeline
        function renderApplicationPipeline(apps) {
            const appliedCount = apps.filter(app => app.status === 'Applied' || app.history?.some(h => h.status === 'Applied')).length;
            const responseCount = apps.filter(app => 
                app.status !== 'Applied' || 
                app.history?.some(h => h.status !== 'Applied' && new Date(h.date) > new Date(app.date))
            ).length;
            const interviewCount = apps.filter(app => app.status === 'Interview Scheduled' || app.status === 'Offer Received' || app.history?.some(h => h.status === 'Interview Scheduled')).length;
            const offerCount = apps.filter(app => app.status === 'Offer Received').length;
            const rejectedCount = apps.filter(app => app.status === 'Rejected').length;
            
            // Calculate funnel metrics
            const timeToResponse = calculateAverageTimeToStatus(apps, 'Applied', status => status !== 'Applied');
            const timeToInterview = calculateAverageTimeToStatus(apps, 'Applied', status => status === 'Interview Scheduled');
            const timeToOffer = calculateAverageTimeToStatus(apps, 'Applied', status => status === 'Offer Received');
            const avgCycleTime = calculateAverageCycleTime(apps);
            
            // Update funnel metrics
            document.getElementById('time-to-response').textContent = timeToResponse.toFixed(1) + ' days';
            document.getElementById('time-to-interview').textContent = timeToInterview.toFixed(1) + ' days';
            document.getElementById('time-to-offer').textContent = timeToOffer.toFixed(1) + ' days';
            document.getElementById('avg-cycle-time').textContent = avgCycleTime.toFixed(1) + ' days';
            
            // Render Sankey Diagram
            renderSankeyDiagram(appliedCount, responseCount, interviewCount, offerCount, rejectedCount);
            
            // Render Cyberpunk Funnel Chart
            renderCyberpunkFunnel(appliedCount, responseCount, interviewCount, offerCount);
        }
        
        // Render Sankey Diagram for Application Flow
        function renderSankeyDiagram(appliedCount, responseCount, interviewCount, offerCount, rejectedCount) {
            // Clear previous diagram
            d3.select("#sankey-diagram").html("");
            
            // Calculate values for the diagram
            // These values are approximations as Sankey requires specific flow values
            const noResponseCount = Math.max(0, appliedCount - responseCount);
            const responseNoInterviewCount = Math.max(0, responseCount - interviewCount);
            const interviewNoOfferCount = Math.max(0, interviewCount - offerCount);
            
            // Define the nodes
            const nodes = [
                { name: "Applications" },
                { name: "Responses" },
                { name: "Interviews" },
                { name: "Offers" },
                { name: "No Response" },
                { name: "Rejected" }
            ];
            
            // Define the links
            const links = [
                { source: 0, target: 1, value: responseCount },
                { source: 0, target: 4, value: noResponseCount },
                { source: 1, target: 2, value: interviewCount },
                { source: 1, target: 5, value: responseNoInterviewCount },
                { source: 2, target: 3, value: offerCount },
                { source: 2, target: 5, value: interviewNoOfferCount }
            ];
            
            // Set up the dimensions and margins
            const margin = { top: 10, right: 10, bottom: 10, left: 10 };
            const width = document.getElementById("sankey-diagram").clientWidth - margin.left - margin.right;
            const height = 280 - margin.top - margin.bottom;
            
            // Create the SVG
            const svg = d3.select("#sankey-diagram")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            // Create the Sankey generator
            const sankey = d3.sankey()
                .nodeWidth(20)
                .nodePadding(10)
                .extent([[1, 1], [width - 1, height - 5]]);
            
            // Generate the diagram
            const graph = sankey({
                nodes: nodes.map(d => Object.assign({}, d)),
                links: links.map(d => Object.assign({}, d))
            });
            
            // Define the link gradient colors for cyberpunk aesthetic
            const linkColors = [
                { source: "Applications", target: "Responses", color: "#00f0ff" }, // accent-primary
                { source: "Applications", target: "No Response", color: "#ff2a6d" }, // accent-tertiary
                { source: "Responses", target: "Interviews", color: "#9d00ff" }, // accent-secondary
                { source: "Responses", target: "Rejected", color: "#ff2a6d" }, // accent-tertiary
                { source: "Interviews", target: "Offers", color: "#05ffa1" }, // accent-quaternary
                { source: "Interviews", target: "Rejected", color: "#ff2a6d" } // accent-tertiary
            ];
            
            // Add gradient definitions
            const defs = svg.append("defs");
            
            graph.links.forEach((link, i) => {
                const gradientId = "gradient-" + i;
                const sourceNode = nodes[link.source.index].name;
                const targetNode = nodes[link.target.index].name;
                
                const foundColor = linkColors.find(c => 
                    c.source === sourceNode && c.target === targetNode
                );
                
                const color = foundColor ? foundColor.color : "#00f0ff";
                
                const gradient = defs.append("linearGradient")
                    .attr("id", gradientId)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", link.source.x1)
                    .attr("y1", link.source.y0)
                    .attr("x2", link.target.x0)
                    .attr("y2", link.target.y1);
                
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", color)
                    .attr("stop-opacity", 0.8);
                
                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "#000000")
                    .attr("stop-opacity", 0.3);
            });
            
            // Add the links
            svg.append("g")
                .selectAll("path")
                .data(graph.links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("d", d3.sankeyLinkHorizontal())
                .attr("stroke", (d, i) => "url(#gradient-" + i + ")")
                .attr("stroke-width", d => Math.max(1, d.width))
                .style("stroke-opacity", 0.5)
                .on("mouseover", function() {
                    d3.select(this).style("stroke-opacity", 0.8);
                })
                .on("mouseout", function() {
                    d3.select(this).style("stroke-opacity", 0.5);
                });
            
            // Node fill colors
            const nodeColors = {
                "Applications": "#00f0ff", // accent-primary
                "Responses": "#9d00ff",    // accent-secondary
                "Interviews": "#05ffa1",   // accent-quaternary
                "Offers": "#05ffa1",       // accent-quaternary
                "No Response": "#ff2a6d",  // accent-tertiary
                "Rejected": "#ff2a6d"      // accent-tertiary
            };
            
            // Add the nodes
            const node = svg.append("g")
                .selectAll("g")
                .data(graph.nodes)
                .enter()
                .append("g")
                .attr("class", "node");
            
            // Node rectangles
            node.append("rect")
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)
                .attr("height", d => d.y1 - d.y0)
                .attr("width", d => d.x1 - d.x0)
                .attr("fill", d => nodeColors[d.name] || "#00f0ff")
                .attr("opacity", 0.8)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .append("title")
                .text(d => d.name + "\n" + d.value);
            
            // Add the node labels
            node.append("text")
                .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
                .attr("y", d => (d.y1 + d.y0) / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
                .text(d => d.name + " (" + d.value + ")")
                .attr("font-family", "'Space Mono', monospace")
                .attr("font-size", "12px")
                .attr("fill", "white")
                .attr("stroke", "none")
                .style("text-shadow", "0 0 3px #00f0ff");
        }
        
        // Render Cyberpunk Funnel Chart
        function renderCyberpunkFunnel(appliedCount, responseCount, interviewCount, offerCount) {
            // Clear previous diagram
            d3.select("#funnel-chart-container").html("");
            
            // Set up dimensions
            const margin = { top: 20, right: 20, bottom: 30, left: 20 };
            const width = document.getElementById("funnel-chart-container").clientWidth - margin.left - margin.right;
            const height = 250 - margin.top - margin.bottom;
            
            // Create the SVG
            const svg = d3.select("#funnel-chart-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            // Funnel data
            const data = [
                { stage: "Applied", value: appliedCount },
                { stage: "Responses", value: responseCount },
                { stage: "Interviews", value: interviewCount },
                { stage: "Offers", value: offerCount }
            ];
            
            // Calculate funnel properties
            const stageHeight = height / data.length;
            const maxValue = d3.max(data, d => d.value);
            const maxWidth = width * 0.8;
            const xScale = d3.scaleLinear()
                .domain([0, maxValue])
                .range([0, maxWidth]);
            
            // Define the gradient
            const defs = svg.append("defs");
            
            const stageColors = [
                { offset: "0%", color: "#00f0ff" }, // accent-primary
                { offset: "33%", color: "#9d00ff" }, // accent-secondary
                { offset: "66%", color: "#ff2a6d" }, // accent-tertiary
                { offset: "100%", color: "#05ffa1" }  // accent-quaternary
            ];
            
            // Create gradient for each stage
            data.forEach((d, i) => {
                const gradientId = "funnel-gradient-" + i;
                
                const gradient = defs.append("linearGradient")
                    .attr("id", gradientId)
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%");
                
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", stageColors[i % stageColors.length].color)
                    .attr("stop-opacity", 0.9);
                
                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", stageColors[(i + 1) % stageColors.length].color)
                    .attr("stop-opacity", 0.7);
                
                // Add a glow filter
                const filter = defs.append("filter")
                    .attr("id", "glow" + i)
                    .attr("x", "-50%")
                    .attr("y", "-50%")
                    .attr("width", "200%")
                    .attr("height", "200%");
                
                filter.append("feGaussianBlur")
                    .attr("stdDeviation", "3")
                    .attr("result", "coloredBlur");
                
                const feMerge = filter.append("feMerge");
                feMerge.append("feMergeNode")
                    .attr("in", "coloredBlur");
                feMerge.append("feMergeNode")
                    .attr("in", "SourceGraphic");
            });
            
            // Draw the funnel stages
            data.forEach((d, i) => {
                const y = i * stageHeight;
                let topWidth, bottomWidth;
                
                // Calculate trapezoid dimensions
                if (i === 0) {
                    topWidth = xScale(d.value);
                    bottomWidth = i < data.length - 1 ? xScale(data[i + 1].value) : topWidth;
                } else {
                    topWidth = xScale(data[i - 1].value);
                    bottomWidth = xScale(d.value);
                }
                
                // Adjust for first stage
                if (i === 0) bottomWidth = xScale(d.value);
                
                // Create the trapezoid path
                const points = [
                    [(width - topWidth) / 2, y],
                    [(width + topWidth) / 2, y],
                    [(width + bottomWidth) / 2, y + stageHeight],
                    [(width - bottomWidth) / 2, y + stageHeight]
                ];
                
                // Draw the trapezoid
                svg.append("polygon")
                    .attr("class", "funnel-stage")
                    .attr("points", points.map(p => p.join(",")).join(" "))
                    .attr("fill", "url(#funnel-gradient-" + i + ")")
                    .attr("filter", "url(#glow" + i + ")")
                    .on("mouseover", function() {
                        d3.select(this).attr("filter", "url(#glow" + i + ")");
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("filter", "none");
                    });
                
                // Add the stage label
                svg.append("text")
                    .attr("class", "funnel-label")
                    .attr("x", width / 2)
                    .attr("y", y + stageHeight / 2 - 6)
                    .text(d.stage);
                
                // Add the value
                svg.append("text")
                    .attr("class", "funnel-value")
                    .attr("x", width / 2)
                    .attr("y", y + stageHeight / 2 + 12)
                    .text(d.value);
                
                // Add conversion rate if not first stage
                if (i > 0) {
                    const conversionRate = ((d.value / data[i - 1].value) * 100 || 0).toFixed(1);
                    
                    svg.append("text")
                        .attr("class", "funnel-rate")
                        .attr("x", width / 2)
                        .attr("y", y + 5)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#ff00ff")
                        .attr("font-size", "10px")
                        .attr("font-family", "'Space Mono', monospace")
                        .style("text-shadow", "0 0 3px #ff00ff")
                        .text("▼ " + conversionRate + "%");
                }
            });
        }
        
        // Calculate average time between status changes
        function calculateAverageTimeToStatus(apps, fromStatus, toStatusFn) {
            const timeDiffs = [];
            
            apps.forEach(app => {
                if (!app.history || app.history.length < 2) return;
                
                // Sort history by date
                const sortedHistory = [...app.history].sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Find from status entry
                const fromEntry = sortedHistory.find(h => h.status === fromStatus);
                if (!fromEntry) return;
                
                // Find to status entry
                const toEntry = sortedHistory.find(h => toStatusFn(h.status) && new Date(h.date) > new Date(fromEntry.date));
                if (!toEntry) return;
                
                // Calculate time difference in days
                const fromDate = new Date(fromEntry.date);
                const toDate = new Date(toEntry.date);
                const diffTime = Math.abs(toDate - fromDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                timeDiffs.push(diffDays);
            });
            
            // Return average or 0 if no data
            return timeDiffs.length > 0 ? timeDiffs.reduce((sum, days) => sum + days, 0) / timeDiffs.length : 0;
        }
        
        // Calculate average cycle time from applied to final status
        function calculateAverageCycleTime(apps) {
            const cycleTimes = [];
            
            apps.forEach(app => {
                if (!app.history || app.history.length < 2) return;
                
                // Sort history by date
                const sortedHistory = [...app.history].sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Get first and last entry
                const firstEntry = sortedHistory[0];
                const lastEntry = sortedHistory[sortedHistory.length - 1];
                
                // Calculate time difference in days
                const firstDate = new Date(firstEntry.date);
                const lastDate = new Date(lastEntry.date);
                const diffTime = Math.abs(lastDate - firstDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                cycleTimes.push(diffDays);
            });
            
            // Return average or 0 if no data
            return cycleTimes.length > 0 ? cycleTimes.reduce((sum, days) => sum + days, 0) / cycleTimes.length : 0;
        }

        // Render Application Activity
        function renderApplicationActivity(apps) {
            // Prepare data for trend chart
            const dates = getLast8Weeks();
            const appCounts = countApplicationsByWeek(apps, dates);
            const responseCounts = countResponsesByWeek(apps, dates);
            const interviewCounts = countInterviewsByWeek(apps, dates);
            const labels = dates.map(date => `Week of ${formatDate(date)}`);
            
            // Calculate weekly application goal (aiming for 10/week)
            const weeklyGoal = 10;
            const currentWeek = appCounts[appCounts.length - 1];
            document.getElementById('weekly-app-goal').textContent = weeklyGoal;
            document.getElementById('current-weekly-rate').textContent = currentWeek;
            
            // Determine peak application day
            const dayOfWeekCounts = countApplicationsByDayOfWeek(apps);
            const daySuccessRates = calculateDaySuccessRates(apps);
            const peakDay = getKeyWithHighestValue(daySuccessRates);
            document.getElementById('peak-day').textContent = getDayName(peakDay);
            
            // Analyze job board success rates
            const jobBoardStats = analyzeJobBoardSuccessRates(apps);
            let bestJobBoard = "None";
            let bestRate = 0;
            
            if (jobBoardStats.length > 0) {
                const topJobBoard = jobBoardStats[0];
                bestJobBoard = topJobBoard.source;
                bestRate = topJobBoard.responseRate * 100;
            }
            
            document.getElementById('best-job-board').textContent = bestJobBoard;
            document.getElementById('best-job-board-rate').textContent = `${bestRate.toFixed(0)}%`;
            
            // Create trends chart
            const trendsChartCtx = document.getElementById('application-trends-chart').getContext('2d');
            if (window.trendsChart) window.trendsChart.destroy();
            
            // Create gradients for cyberpunk styling
            const createGradient = (ctx, colorStart, colorEnd) => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                return gradient;
            };
            
            const appliedGradient = createGradient(trendsChartCtx, 'rgba(0, 240, 255, 0.7)', 'rgba(0, 240, 255, 0.1)');
            const responsesGradient = createGradient(trendsChartCtx, 'rgba(157, 0, 255, 0.7)', 'rgba(157, 0, 255, 0.1)');
            const interviewsGradient = createGradient(trendsChartCtx, 'rgba(5, 255, 161, 0.7)', 'rgba(5, 255, 161, 0.1)');
            
            window.trendsChart = new Chart(trendsChartCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Applied',
                            data: appCounts,
                            borderColor: '#00f0ff', // accent-primary
                            backgroundColor: appliedGradient,
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#00f0ff',
                            pointBorderColor: '#000000',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBorderWidth: 1,
                            pointHoverBorderWidth: 2,
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#00f0ff'
                        },
                        {
                            label: 'Responses',
                            data: responseCounts,
                            borderColor: '#9d00ff', // accent-secondary
                            backgroundColor: responsesGradient,
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#9d00ff',
                            pointBorderColor: '#000000',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBorderWidth: 1,
                            pointHoverBorderWidth: 2,
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#9d00ff'
                        },
                        {
                            label: 'Interviews',
                            data: interviewCounts,
                            borderColor: '#05ffa1', // accent-quaternary
                            backgroundColor: interviewsGradient,
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#05ffa1',
                            pointBorderColor: '#000000',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBorderWidth: 1,
                            pointHoverBorderWidth: 2,
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#05ffa1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: "#00f0ff",
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 10
                                }
                            },
                            grid: {
                                color: 'rgba(0, 240, 255, 0.1)',
                                lineWidth: 0.5,
                                tickBorderDash: [2, 2]
                            },
                            border: {
                                dash: [4, 4],
                                color: 'rgba(0, 240, 255, 0.2)'
                            }
                        },
                        x: {
                            ticks: {
                                color: "#00f0ff",
                                maxRotation: 45,
                                minRotation: 45,
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 10
                                }
                            },
                            grid: {
                                color: 'rgba(0, 240, 255, 0.1)',
                                lineWidth: 0.5
                            },
                            border: {
                                dash: [4, 4],
                                color: 'rgba(0, 240, 255, 0.2)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: "#00f0ff",
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 12
                                },
                                boxWidth: 15,
                                padding: 15
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#00f0ff',
                            borderWidth: 1,
                            bodyFont: {
                                family: "'Space Mono', monospace"
                            },
                            titleFont: {
                                family: "'Space Mono', monospace",
                                weight: 'bold'
                            },
                            callbacks: {
                                afterLabel: function(context) {
                                    const datasetIndex = context.datasetIndex;
                                    const index = context.dataIndex;
                                    
                                    if (datasetIndex === 0) {
                                        const responseRate = appCounts[index] > 0 ? (responseCounts[index] / appCounts[index] * 100).toFixed(1) : 0;
                                        return `Response rate: ${responseRate}%`;
                                    }
                                    return '';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Get dates for the last 8 weeks
        function getLast8Weeks() {
            const dates = [];
            const today = new Date();
            
            for (let i = 7; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - (i * 7));
                // Set to beginning of week (Sunday)
                date.setDate(date.getDate() - date.getDay());
                dates.push(new Date(date));
            }
            
            return dates;
        }
        
        // Count interviews by week
        function countInterviewsByWeek(apps, weeks) {
            return weeks.map(weekStart => {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                return apps.filter(app => {
                    if (!app.history) return false;
                    
                    const interviewEntry = app.history.find(h => 
                        h.status === 'Interview Scheduled' && 
                        new Date(h.date) >= weekStart && 
                        new Date(h.date) <= weekEnd
                    );
                    
                    return !!interviewEntry;
                }).length;
            });
        }
        
        // Calculate success rates by day of week
        function calculateDaySuccessRates(apps) {
            const dayCount = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}; // Sun-Sat
            const daySuccess = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}; // Sun-Sat
            
            apps.forEach(app => {
                const appDate = new Date(app.date);
                const dayOfWeek = appDate.getDay();
                dayCount[dayOfWeek]++;
                
                // Consider success as getting an interview or offer
                if (app.status === 'Interview Scheduled' || app.status === 'Offer Received') {
                    daySuccess[dayOfWeek]++;
                }
            });
            
            // Calculate success rate
            const successRates = {};
            for (let day in dayCount) {
                successRates[day] = dayCount[day] > 0 ? daySuccess[day] / dayCount[day] : 0;
            }
            
            return successRates;
        }
        
        // Analyze job board success rates
        function analyzeJobBoardSuccessRates(apps) {
            const jobBoardPatterns = [
                { pattern: /linkedin\.com/i, source: 'LinkedIn' },
                { pattern: /indeed\.com/i, source: 'Indeed' },
                { pattern: /glassdoor\.com/i, source: 'Glassdoor' },
                { pattern: /monster\.com/i, source: 'Monster' },
                { pattern: /ziprecruiter\.com/i, source: 'ZipRecruiter' },
                { pattern: /careerbuilder\.com/i, source: 'CareerBuilder' },
                { pattern: /weworkremotely\.com/i, source: 'We Work Remotely' },
                { pattern: /remoteok\.com/i, source: 'Remote OK' },
                { pattern: /flexjobs\.com/i, source: 'FlexJobs' },
                { pattern: /workingnomads\.com/i, source: 'Working Nomads' },
                { pattern: /simplyhired\.com/i, source: 'SimplyHired' }
            ];
            
            const sources = {};
            
            // Count applications and responses by source
            apps.forEach(app => {
                if (!app.url) return;
                
                let source = 'Other';
                
                // Identify source from URL
                for (const board of jobBoardPatterns) {
                    if (board.pattern.test(app.url)) {
                        source = board.source;
                        break;
                    }
                }
                
                if (!sources[source]) {
                    sources[source] = {
                        count: 0,
                        responses: 0,
                        interviews: 0
                    };
                }
                
                sources[source].count++;
                
                // Count as response if not applied
                if (app.status !== 'Applied') {
                    sources[source].responses++;
                }
                
                // Count as interview if interview scheduled or offer
                if (app.status === 'Interview Scheduled' || app.status === 'Offer Received') {
                    sources[source].interviews++;
                }
            });
            
            // Calculate rates and sort by response rate
            return Object.entries(sources)
                .map(([source, stats]) => ({
                    source,
                    count: stats.count,
                    responseRate: stats.count > 0 ? stats.responses / stats.count : 0,
                    interviewRate: stats.count > 0 ? stats.interviews / stats.count : 0
                }))
                .filter(data => data.count >= 2) // Only include sources with at least 2 applications
                .sort((a, b) => b.responseRate - a.responseRate);
        }
        
        // Get dates for the last 12 weeks
        function getLast12Weeks() {
            const dates = [];
            const today = new Date();
            
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - (i * 7));
                // Set to beginning of week (Sunday)
                date.setDate(date.getDate() - date.getDay());
                dates.push(new Date(date));
            }
            
            return dates;
        }
        
        // Count applications by week
        function countApplicationsByWeek(apps, weeks) {
            return weeks.map(weekStart => {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                return apps.filter(app => {
                    const appDate = new Date(app.date);
                    return appDate >= weekStart && appDate <= weekEnd;
                }).length;
            });
        }
        
        // Count responses by week
        function countResponsesByWeek(apps, weeks) {
            return weeks.map(weekStart => {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                return apps.filter(app => {
                    if (!app.history || app.history.length < 2) return false;
                    
                    const responseEntry = app.history.find(h => 
                        h.status !== 'Applied' && 
                        new Date(h.date) >= weekStart && 
                        new Date(h.date) <= weekEnd
                    );
                    
                    return !!responseEntry;
                }).length;
            });
        }
        
        // Count applications by day of week
        function countApplicationsByDayOfWeek(apps) {
            const dayCount = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}; // Sun-Sat
            
            apps.forEach(app => {
                const appDate = new Date(app.date);
                const dayOfWeek = appDate.getDay();
                dayCount[dayOfWeek]++;
            });
            
            return dayCount;
        }
        
        // Helper to get key with highest value in object
        function getKeyWithHighestValue(obj) {
            return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
        }
        
        // Convert day number to name
        function getDayName(dayNumber) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[dayNumber];
        }

        // Render Remote Job Insights
        function renderRemoteJobInsights(apps) {
            // Identify remote applications based on URL or job title
            const remoteApps = apps.filter(app => 
                (app.url && /remote|weworkremotely|remoteok|flexjobs|workingnomads/i.test(app.url)) ||
                (app.title && /remote|wfh|work from home/i.test(app.title))
            );
            
            const onSiteApps = apps.filter(app => !remoteApps.includes(app));
            
            // Calculate stats for remote applications
            const remoteCount = remoteApps.length;
            const remoteResponseCount = remoteApps.filter(app => app.status !== 'Applied').length;
            const remoteInterviewCount = remoteApps.filter(app => 
                app.status === 'Interview Scheduled' || app.status === 'Offer Received'
            ).length;
            
            const remoteResponseRate = remoteCount > 0 ? (remoteResponseCount / remoteCount) * 100 : 0;
            const remoteInterviewRate = remoteCount > 0 ? (remoteInterviewCount / remoteCount) * 100 : 0;
            
            // Calculate stats for on-site applications
            const onSiteCount = onSiteApps.length;
            const onSiteResponseCount = onSiteApps.filter(app => app.status !== 'Applied').length;
            const onSiteInterviewCount = onSiteApps.filter(app => 
                app.status === 'Interview Scheduled' || app.status === 'Offer Received'
            ).length;
            
            const onSiteResponseRate = onSiteCount > 0 ? (onSiteResponseCount / onSiteCount) * 100 : 0;
            const onSiteInterviewRate = onSiteCount > 0 ? (onSiteInterviewCount / onSiteCount) * 100 : 0;
            
            // Update metrics
            document.getElementById('remote-application-count').textContent = remoteCount;
            document.getElementById('remote-response-rate').textContent = `${remoteResponseRate.toFixed(0)}%`;
            document.getElementById('remote-interview-rate').textContent = `${remoteInterviewRate.toFixed(0)}%`;
            
            // Analyze remote job boards
            const remotePlatforms = analyzeRemotePlatforms(remoteApps);
            
            // Update top remote platforms list
            const remotePlatformsEl = document.getElementById('top-remote-platforms');
            if (remotePlatformsEl) {
                remotePlatformsEl.innerHTML = remotePlatforms.length > 0
                    ? remotePlatforms.slice(0, 3).map(platform => 
                        `<li>${platform.source} <span class="response-rate">${Math.round(platform.responseRate * 100)}%</span></li>`
                    ).join('')
                    : '<li>No remote platforms data</li>';
            }
            
            // Create remote vs. on-site comparison chart
            const remoteChartCtx = document.getElementById('remote-vs-onsite-chart').getContext('2d');
            if (window.remoteComparisonChart) window.remoteComparisonChart.destroy();
            
            window.remoteComparisonChart = new Chart(remoteChartCtx, {
                type: 'bar',
                data: {
                    labels: ['Applications', 'Response Rate', 'Interview Rate'],
                    datasets: [
                        {
                            label: 'Remote',
                            data: [remoteCount, remoteResponseRate, remoteInterviewRate],
                            backgroundColor: 'rgba(0, 240, 255, 0.7)',
                            borderColor: 'rgba(0, 240, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                        },
                        {
                            label: 'On-site',
                            data: [onSiteCount, onSiteResponseRate, onSiteInterviewRate],
                            backgroundColor: 'rgba(157, 0, 255, 0.7)',
                            borderColor: 'rgba(157, 0, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value, index, values) {
                                    return index === 0 ? value : value + '%';
                                },
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const datasetLabel = context.dataset.label;
                                    const value = context.raw;
                                    const index = context.dataIndex;
                                    
                                    if (index === 0) {
                                        return `${datasetLabel}: ${value} applications`;
                                    } else {
                                        return `${datasetLabel}: ${value.toFixed(1)}%`;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Analyze remote platforms success rates
        function analyzeRemotePlatforms(apps) {
            const platformPatterns = [
                { pattern: /weworkremotely\.com/i, source: 'We Work Remotely' },
                { pattern: /remoteok\.com/i, source: 'Remote OK' },
                { pattern: /flexjobs\.com/i, source: 'FlexJobs' },
                { pattern: /workingnomads\.com/i, source: 'Working Nomads' },
                { pattern: /linkedin\.com.*remote/i, source: 'LinkedIn Remote' },
                { pattern: /indeed\.com.*remote/i, source: 'Indeed Remote' },
                { pattern: /remote\.co/i, source: 'Remote.co' },
                { pattern: /remote\.io/i, source: 'Remote.io' },
                { pattern: /justremote\.co/i, source: 'JustRemote' },
                { pattern: /remotive\.io/i, source: 'Remotive' }
            ];
            
            const platforms = {};
            
            // Count applications and responses by platform
            apps.forEach(app => {
                if (!app.url) return;
                
                let source = 'Other Remote';
                
                // Identify source from URL
                for (const platform of platformPatterns) {
                    if (platform.pattern.test(app.url)) {
                        source = platform.source;
                        break;
                    }
                }
                
                if (!platforms[source]) {
                    platforms[source] = {
                        count: 0,
                        responses: 0,
                        interviews: 0
                    };
                }
                
                platforms[source].count++;
                
                // Count as response if not applied
                if (app.status !== 'Applied') {
                    platforms[source].responses++;
                }
                
                // Count as interview if interview scheduled or offer
                if (app.status === 'Interview Scheduled' || app.status === 'Offer Received') {
                    platforms[source].interviews++;
                }
            });
            
            // Calculate rates and sort by response rate
            return Object.entries(platforms)
                .map(([source, stats]) => ({
                    source,
                    count: stats.count,
                    responseRate: stats.count > 0 ? stats.responses / stats.count : 0,
                    interviewRate: stats.count > 0 ? stats.interviews / stats.count : 0
                }))
                .filter(data => data.count > 0) // Only include sources with at least 1 application
                .sort((a, b) => b.responseRate - a.responseRate);
        }
        
        // Render Salary Insights
        function renderSalaryInsights(apps) {
            // Get expected salary data
            const expectedSalaries = apps
                .filter(app => app.salary && app.salary.expected > 0)
                .map(app => ({
                    amount: app.salary.expected,
                    title: app.title,
                    company: app.company,
                    isRemote: isRemoteJob(app)
                }));
            
            // Get offered salary data
            const offeredSalaries = apps
                .filter(app => app.salary && app.salary.offered !== null)
                .map(app => ({
                    amount: app.salary.offered,
                    title: app.title,
                    company: app.company,
                    isRemote: isRemoteJob(app)
                }));
                
            // Calculate average expected salary
            const avgExpected = expectedSalaries.length > 0 
                ? Math.round(expectedSalaries.reduce((sum, s) => sum + s.amount, 0) / expectedSalaries.length) 
                : 0;
                
            // Calculate average offered salary
            const avgOffered = offeredSalaries.length > 0 
                ? Math.round(offeredSalaries.reduce((sum, s) => sum + s.amount, 0) / offeredSalaries.length) 
                : 0;
            
            // Calculate offer vs expected ratio
            const offerExpectedRatio = (avgExpected > 0 && avgOffered > 0) 
                ? Math.round((avgOffered / avgExpected) * 100 - 100) 
                : 0;
                
            // Update salary cards
            document.getElementById('avg-expected').textContent = formatCurrency(avgExpected);
            document.getElementById('avg-offered').textContent = formatCurrency(avgOffered);
            document.getElementById('offer-expected-ratio').textContent = (offerExpectedRatio >= 0 ? '+' : '') + offerExpectedRatio + '%';
            
            // Calculate remote vs on-site salary difference
            let remoteSalaryDiff = 0;
            let remoteSalaryDirection = 'equal to';
            
            if (expectedSalaries.length > 0) {
                const remoteSalaries = expectedSalaries.filter(s => s.isRemote);
                const onSiteSalaries = expectedSalaries.filter(s => !s.isRemote);
                
                if (remoteSalaries.length > 0 && onSiteSalaries.length > 0) {
                    const avgRemote = remoteSalaries.reduce((sum, s) => sum + s.amount, 0) / remoteSalaries.length;
                    const avgOnSite = onSiteSalaries.reduce((sum, s) => sum + s.amount, 0) / onSiteSalaries.length;
                    
                    if (avgRemote !== avgOnSite) {
                        remoteSalaryDiff = Math.abs(Math.round((avgRemote / avgOnSite - 1) * 100));
                        remoteSalaryDirection = avgRemote < avgOnSite ? 'lower' : 'higher';
                    }
                }
            }
            
            document.getElementById('remote-salary-diff').textContent = remoteSalaryDiff + '%';
            document.getElementById('remote-salary-direction').textContent = remoteSalaryDirection;
            
            // Analyze salary by job title
            const titleSalaryData = analyzeJobTitleSalaries(apps);
            
            if (titleSalaryData.length > 0) {
                const highestTitle = titleSalaryData[0];
                document.getElementById('highest-paying-title').textContent = highestTitle.title;
                document.getElementById('highest-title-salary').textContent = formatCurrency(highestTitle.avgSalary);
            }
            
            // Create salary comparison chart (expected vs offered)
            const salaryChartCtx = document.getElementById('salary-comparison-chart').getContext('2d');
            if (window.salaryComparisonChart) window.salaryComparisonChart.destroy();
            
            const salaryComparisonData = apps
                .filter(app => app.salary && app.salary.expected > 0)
                .map(app => ({
                    title: `${app.company} - ${app.title}`,
                    expected: app.salary.expected,
                    offered: app.salary.offered || 0
                }))
                .slice(0, 7); // Limit to 7 most recent applications
            
            window.salaryComparisonChart = new Chart(salaryChartCtx, {
                type: 'bar',
                data: {
                    labels: salaryComparisonData.map(d => d.title),
                    datasets: [
                        {
                            label: 'Expected',
                            data: salaryComparisonData.map(d => d.expected),
                            backgroundColor: 'rgba(0, 240, 255, 0.7)',
                            borderColor: 'rgba(0, 240, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                        },
                        {
                            label: 'Offered',
                            data: salaryComparisonData.map(d => d.offered),
                            backgroundColor: 'rgba(157, 0, 255, 0.7)',
                            borderColor: 'rgba(157, 0, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatK(value);
                                },
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            title: {
                                display: true,
                                text: 'Salary',
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label;
                                    const value = context.raw;
                                    return `${label}: ${formatCurrency(value)}`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Check if a job is remote
        function isRemoteJob(app) {
            return (app.url && /remote|weworkremotely|remoteok|flexjobs|workingnomads/i.test(app.url)) ||
                   (app.title && /remote|wfh|work from home/i.test(app.title));
        }
        
        // Analyze salary by job title
        function analyzeJobTitleSalaries(apps) {
            // Common job title patterns
            const titlePatterns = [
                { pattern: /software engineer|developer|programmer|coder/i, title: 'Software Engineer' },
                { pattern: /frontend|front end|front-end/i, title: 'Frontend Developer' },
                { pattern: /backend|back end|back-end/i, title: 'Backend Developer' },
                { pattern: /fullstack|full stack|full-stack/i, title: 'Full Stack Developer' },
                { pattern: /data (?:scientist|analyst|engineer)/i, title: 'Data Scientist/Analyst' },
                { pattern: /(?:ui|ux|product) designer/i, title: 'UX/UI Designer' },
                { pattern: /devops|sre|site reliability/i, title: 'DevOps/SRE' },
                { pattern: /qa|quality assurance|test/i, title: 'QA Engineer' },
                { pattern: /product manager/i, title: 'Product Manager' },
                { pattern: /project manager/i, title: 'Project Manager' },
                { pattern: /mobile|ios|android/i, title: 'Mobile Developer' },
                { pattern: /ml|machine learning|ai/i, title: 'ML Engineer' }
            ];
            
            // Group applications by normalized title
            const titleGroups = {};
            
            apps.forEach(app => {
                if (!app.title || !app.salary) return;
                
                // Normalize the title
                let normalizedTitle = 'Other';
                
                for (const pattern of titlePatterns) {
                    if (pattern.pattern.test(app.title)) {
                        normalizedTitle = pattern.title;
                        break;
                    }
                }
                
                if (!titleGroups[normalizedTitle]) {
                    titleGroups[normalizedTitle] = {
                        title: normalizedTitle,
                        count: 0,
                        expectedSum: 0,
                        offeredSum: 0,
                        offeredCount: 0
                    };
                }
                
                titleGroups[normalizedTitle].count++;
                
                if (app.salary.expected > 0) {
                    titleGroups[normalizedTitle].expectedSum += app.salary.expected;
                }
                
                if (app.salary.offered !== null) {
                    titleGroups[normalizedTitle].offeredSum += app.salary.offered;
                    titleGroups[normalizedTitle].offeredCount++;
                }
            });
            
            // Calculate averages and create result
            return Object.values(titleGroups)
                .map(group => {
                    const avgExpected = group.count > 0 ? Math.round(group.expectedSum / group.count) : 0;
                    const avgOffered = group.offeredCount > 0 ? Math.round(group.offeredSum / group.offeredCount) : 0;
                    
                    return {
                        title: group.title,
                        count: group.count,
                        avgSalary: avgOffered > 0 ? avgOffered : avgExpected // Use offered if available, otherwise expected
                    };
                })
                .filter(data => data.avgSalary > 0 && data.count >= 1)
                .sort((a, b) => b.avgSalary - a.avgSalary);
        }
        
        // Create salary brackets for distribution chart
        function createSalaryBrackets(salaries) {
            if (salaries.length === 0) {
                return {
                    labels: ['$0-$50K', '$50K-$100K', '$100K-$150K', '$150K-$200K', '$200K+'],
                    counts: [0, 0, 0, 0, 0]
                };
            }
            
            const min = Math.min(...salaries);
            const max = Math.max(...salaries);
            
            // Create brackets based on min and max
            const bracketSize = Math.max(25000, Math.ceil((max - min) / 5 / 10000) * 10000);
            const brackets = [];
            const counts = [];
            
            let currentBracket = Math.floor(min / bracketSize) * bracketSize;
            for (let i = 0; i < 5; i++) {
                const bracketMin = currentBracket;
                const bracketMax = currentBracket + bracketSize;
                
                brackets.push(`$${formatK(bracketMin)}-$${formatK(bracketMax)}`);
                counts.push(salaries.filter(s => s >= bracketMin && s < bracketMax).length);
                
                currentBracket = bracketMax;
            }
            
            // Add last bracket for anything higher
            brackets[brackets.length - 1] = `$${formatK(currentBracket - bracketSize)}+`;
            
            return {
                labels: brackets,
                counts: counts
            };
        }
        
        // Format number as K
        function formatK(num) {
            return Math.round(num / 1000) + 'K';
        }
        
        // Create gradient color for chart
        function createGradientColor(ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(157, 0, 255, 0.2)');
            return gradient;
        }

        // Render Skills Analysis - Placeholder for now since no real skill data exists in the app
        function renderSkillsAnalysis(apps) {
            // Placeholder data for skills analysis
            const skillsData = [
                { text: 'JavaScript', value: 30 },
                { text: 'React', value: 28 },
                { text: 'TypeScript', value: 25 },
                { text: 'Node.js', value: 20 },
                { text: 'Python', value: 18 },
                { text: 'SQL', value: 16 },
                { text: 'HTML/CSS', value: 15 },
                { text: 'Docker', value: 12 },
                { text: 'AWS', value: 10 },
                { text: 'GraphQL', value: 8 },
                { text: 'Git', value: 8 },
                { text: 'MongoDB', value: 7 },
                { text: 'Vue.js', value: 6 },
                { text: 'CI/CD', value: 5 },
                { text: 'Agile', value: 5 }
            ];
            
            // In a real implementation, we would extract skills from job titles, descriptions, and notes
            // Create word cloud (mock implementation)
            document.getElementById('skills-cloud').innerHTML = `
                <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; height: 100%;">
                    ${skillsData.map(skill => `
                        <div style="
                            margin: 8px; 
                            padding: 8px 16px; 
                            background: rgba(0, 240, 255, ${0.1 + (skill.value / 100)}); 
                            border-radius: 20px; 
                            font-size: ${12 + (skill.value / 3)}px;
                            transition: all 0.3s ease;
                        " class="hover-lift">
                            ${skill.text}
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Placeholder data for insights
            document.getElementById('top-skills').textContent = 'ReactJS, TypeScript';
            document.getElementById('skills-conversion').textContent = '43%';
            document.getElementById('skill-gaps').textContent = 'Docker, Kubernetes';
        }

        // Render Company Intelligence
        function renderCompanyIntelligence(apps) {
            // Group applications by company
            const companiesByResponse = apps.reduce((acc, app) => {
                if (!acc[app.company]) {
                    acc[app.company] = {
                        name: app.company,
                        applications: [],
                        responses: 0,
                        avgResponseTime: 0
                    };
                }
                
                acc[app.company].applications.push(app);
                
                // Check if there was a response (status change from Applied)
                if (app.history && app.history.length > 1) {
                    const appliedEntry = app.history.find(h => h.status === 'Applied');
                    const responseEntry = app.history.find(h => 
                        h.status !== 'Applied' && 
                        new Date(h.date) > new Date(appliedEntry.date)
                    );
                    
                    if (appliedEntry && responseEntry) {
                        acc[app.company].responses++;
                        
                        // Calculate response time in days
                        const appliedDate = new Date(appliedEntry.date);
                        const responseDate = new Date(responseEntry.date);
                        const diffTime = Math.abs(responseDate - appliedDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        acc[app.company].responseTimes = acc[app.company].responseTimes || [];
                        acc[app.company].responseTimes.push(diffDays);
                    }
                }
                
                return acc;
            }, {});
            
            // Calculate average response time for each company
            Object.values(companiesByResponse).forEach(company => {
                company.responseRate = company.applications.length > 0 
                    ? company.responses / company.applications.length 
                    : 0;
                    
                company.avgResponseTime = company.responseTimes && company.responseTimes.length > 0
                    ? company.responseTimes.reduce((sum, time) => sum + time, 0) / company.responseTimes.length
                    : null;
            });
            
            // Sort companies by response rate
            const topResponsiveCompanies = Object.values(companiesByResponse)
                .filter(c => c.avgResponseTime !== null)
                .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
                .slice(0, 5);
                
            // Update responsive companies list
            const responsiveCompaniesEl = document.getElementById('responsive-companies');
            if (responsiveCompaniesEl) {
                responsiveCompaniesEl.innerHTML = topResponsiveCompanies.length > 0
                    ? topResponsiveCompanies.map(company => 
                        `<li>${company.name} <span class="response-time">${company.avgResponseTime.toFixed(1)} days</span></li>`
                    ).join('')
                    : '<li>No data available</li>';
            }
            
            // Group applications by location - using fake data for now since we don't have location data
            const locationData = {
                'San Francisco': { count: 3, avgSalary: 145000 },
                'New York': { count: 2, avgSalary: 138000 },
                'Seattle': { count: 2, avgSalary: 135000 },
                'Austin': { count: 1, avgSalary: 120000 },
                'Remote': { count: 4, avgSalary: 115000 }
            };
            
            // Sort locations by average salary
            const topLocations = Object.entries(locationData)
                .sort((a, b) => b[1].avgSalary - a[1].avgSalary)
                .slice(0, 5);
                
            // Update best locations list
            const bestLocationsEl = document.getElementById('best-locations');
            if (bestLocationsEl) {
                bestLocationsEl.innerHTML = topLocations.map(([location, data]) => 
                    `<li>${location} <span class="salary-indicator">${formatCurrency(data.avgSalary)}</span></li>`
                ).join('');
            }
            
            // Create company response chart
            const companyChartCtx = document.getElementById('company-response-chart').getContext('2d');
            if (window.companyResponseChart) window.companyResponseChart.destroy();
            
            // Prepare data for chart
            const companyChartData = Object.values(companiesByResponse)
                .filter(c => c.applications.length >= 1)
                .sort((a, b) => b.responseRate - a.responseRate)
                .slice(0, 5);
                
            window.companyResponseChart = new Chart(companyChartCtx, {
                type: 'bar',
                data: {
                    labels: companyChartData.map(c => c.name),
                    datasets: [{
                        label: 'Response Rate',
                        data: companyChartData.map(c => Math.round(c.responseRate * 100)),
                        backgroundColor: 'rgba(255, 152, 0, 0.7)',
                        borderColor: 'rgba(255, 152, 0, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Response rate: ${context.raw}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                },
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        }
                    }
                }
            });
        }

        // Render Market Health
        function renderMarketHealth(apps) {
            // Using fake market health data for demonstration
            const marketScore = 72;
            const marketTrend = 3.2;
            
            // Update market health indicators
            document.getElementById('market-score').textContent = marketScore;
            document.getElementById('market-indicator').textContent = marketScore > 50 ? '🟢' : '🔴';
            
            const marketTrendEl = document.getElementById('market-trend-indicator');
            if (marketTrendEl) {
                if (marketTrend > 0) {
                    marketTrendEl.classList.add('trend-up');
                    marketTrendEl.classList.remove('trend-down');
                } else {
                    marketTrendEl.classList.add('trend-down');
                    marketTrendEl.classList.remove('trend-up');
                }
                
                document.getElementById('market-trend-value').textContent = 
                    (marketTrend > 0 ? '+' : '') + marketTrend.toFixed(1) + '%';
            }
            
            // Insights placeholders
            document.getElementById('best-hiring-month').textContent = 'January';
            document.getElementById('market-forecast').textContent = '5% increase';
            
            // Create market health chart - showing a fake seasonal pattern
            const healthChartCtx = document.getElementById('market-health-chart').getContext('2d');
            if (window.marketHealthChart) window.marketHealthChart.destroy();
            
            // Fake market health data - 12 months
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const marketData = [78, 75, 70, 68, 65, 62, 60, 65, 70, 73, 68, 72]; // Current year
            const prevYearData = [74, 70, 65, 63, 60, 58, 56, 60, 65, 68, 65, 70]; // Previous year
            
            window.marketHealthChart = new Chart(healthChartCtx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'This Year',
                            data: marketData,
                            borderColor: 'rgba(0, 240, 255, 1)',
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Previous Year',
                            data: prevYearData,
                            borderColor: 'rgba(157, 0, 255, 0.6)',
                            backgroundColor: 'rgba(157, 0, 255, 0.05)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            borderDash: [5, 5]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Market Health Score',
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    }
                }
            });
        }
        
        // Render Application Source Analysis
        function renderApplicationSourceAnalysis(apps) {
            // Count automatically vs manually tracked applications
            const autoTrackedApps = apps.filter(app => 
                app.history && 
                app.history.some(h => h.notes && h.notes.includes('Auto-tracked application'))
            );
            const manuallyTrackedApps = apps.filter(app => !autoTrackedApps.includes(app));
            
            const autoCount = autoTrackedApps.length;
            const manualCount = manuallyTrackedApps.length;
            const totalCount = apps.length;
            
            const autoPercent = totalCount > 0 ? Math.round((autoCount / totalCount) * 100) : 0;
            const manualPercent = totalCount > 0 ? Math.round((manualCount / totalCount) * 100) : 0;
            
            // Update source analysis
            document.getElementById('auto-track-count').textContent = autoCount;
            document.getElementById('auto-track-percent').textContent = `${autoPercent}%`;
            document.getElementById('manual-track-count').textContent = manualCount;
            document.getElementById('manual-track-percent').textContent = `${manualPercent}%`;
            
            // Analyze top performing sources
            const jobBoardStats = analyzeJobBoardSuccessRates(apps);
            
            // Update top sources list
            const topSourcesEl = document.getElementById('top-sources');
            if (topSourcesEl) {
                topSourcesEl.innerHTML = jobBoardStats.length > 0
                    ? jobBoardStats.slice(0, 3).map(source => 
                        `<li>${source.source} <span class="response-time">${Math.round(source.responseRate * 100)}% response</span></li>`
                    ).join('')
                    : '<li>No source data available</li>';
            }
            
            // Create source comparison chart
            const sourceChartCtx = document.getElementById('source-comparison-chart').getContext('2d');
            if (window.sourceComparisonChart) window.sourceComparisonChart.destroy();
            
            // Prepare data for chart - top 5 sources by application count
            const topSources = jobBoardStats
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            window.sourceComparisonChart = new Chart(sourceChartCtx, {
                type: 'bar',
                data: {
                    labels: topSources.map(s => s.source),
                    datasets: [
                        {
                            label: 'Response Rate',
                            data: topSources.map(s => Math.round(s.responseRate * 100)),
                            backgroundColor: 'rgba(0, 240, 255, 0.7)',
                            borderColor: 'rgba(0, 240, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Applications',
                            data: topSources.map(s => s.count),
                            backgroundColor: 'rgba(157, 0, 255, 0.7)',
                            borderColor: 'rgba(157, 0, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Response Rate (%)',
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                },
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Applications Count',
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                drawOnChartArea: false
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    }
                }
            });
            
            // Create tracking method chart
            const trackingMethodCtx = document.getElementById('tracking-method-chart').getContext('2d');
            if (window.trackingMethodChart) window.trackingMethodChart.destroy();
            
            window.trackingMethodChart = new Chart(trackingMethodCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Auto-tracked', 'Manually Added'],
                    datasets: [{
                        data: [autoCount, manualCount],
                        backgroundColor: ['rgba(0, 240, 255, 0.7)', 'rgba(157, 0, 255, 0.7)']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label;
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Render Actionable Recommendations
        function renderActionableRecommendations(apps) {
            // Find best performing job board
            const jobBoardStats = analyzeJobBoardSuccessRates(apps);
            let bestJobBoard = "the job board with best results";
            let bestJobBoardRate = 0;
            
            if (jobBoardStats.length > 0) {
                const topJobBoard = jobBoardStats[0];
                bestJobBoard = topJobBoard.source;
                bestJobBoardRate = Math.round(topJobBoard.responseRate * 100);
            }
            
            // Count applications needing follow-up
            const followupCount = apps.filter(app => 
                app.status === 'Applied' && daysSince(app.date) > 10
            ).length;
            
            // Check weekly goal progress
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Go to start of week (Sunday)
            startOfWeek.setHours(0, 0, 0, 0);
            
            const appsThisWeek = apps.filter(app => {
                const appDate = new Date(app.date);
                return appDate >= startOfWeek && appDate <= today;
            }).length;
            
            const weeklyGoal = 10; // Target is 10 applications per week
            const remainingApps = Math.max(0, weeklyGoal - appsThisWeek);
            const goalStatus = appsThisWeek >= weeklyGoal ? 'meeting' : 'below';
            
            // Update recommendation content
            document.getElementById('rec-job-board').textContent = bestJobBoard;
            document.getElementById('rec-response-rate').textContent = `${bestJobBoardRate}%`;
            document.getElementById('followup-count').textContent = followupCount;
            document.getElementById('goal-status').textContent = goalStatus;
            document.getElementById('remaining-apps').textContent = remainingApps;
        }
        
        // Add event listener for analytics time range selector
        document.addEventListener('DOMContentLoaded', () => {
            const timeRangeSelector = document.getElementById('analytics-time-range');
            if (timeRangeSelector) {
                timeRangeSelector.addEventListener('change', () => {
                    renderAnalytics();
                });
            }
        });

        // Sort Table for Applications
        function sortTable(colIndex) {
            const table = document.getElementById('applications-table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const sortDirection = table.getAttribute('data-sort-dir') === 'asc' ? 'desc' : 'asc';
            table.setAttribute('data-sort-dir', sortDirection);
            rows.sort((a, b) => {
                const aValue = a.cells[colIndex].textContent.trim();
                const bValue = b.cells[colIndex].textContent.trim();
                if (colIndex === 2) {
                    return sortDirection === 'asc' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
                } else if (colIndex === 4 || colIndex === 5) {
                    const aNum = parseFloat(aValue.replace(/[^0-9.-]+/g, "")) || (aValue === 'N/A' ? -Infinity : 0);
                    const bNum = parseFloat(bValue.replace(/[^0-9.-]+/g, "")) || (bValue === 'N/A' ? -Infinity : 0);
                    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                }
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            });
            rows.forEach(row => tbody.appendChild(row));
        }

        // Export Data to CSV
        function exportData() {
            let csv = 'Job Title,Company,Date,Status,Expected Salary,Offered Salary,Notes,URL,Favorite\n';
            applications.forEach(app => {
                csv += `"${app.title}","${app.company}","${app.date}","${app.status}","${app.salary.expected || ''}","${app.salary.offered || ''}","${app.notes}","${app.url || ''}","${app.favorite ? 'Yes' : 'No'}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'job_applications.csv';
            a.click();
        }

        // Render Reminders
        function renderReminders() {
            const container = document.getElementById('reminders-list');
            container.innerHTML = '';
            const reminders = applications.filter(app => app.status === 'Applied' && daysSince(app.date) > 10);
            if (reminders.length === 0) {
                container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 1rem;">No follow-up reminders at this time.</p>';
                return;
            }
            reminders.forEach(app => {
                const li = document.createElement('li');
                li.className = 'reminder-item';
                li.innerHTML = `
                    <div><strong>${app.company}</strong> - ${app.title}<br><small>Applied ${daysSince(app.date)} days ago</small></div>
                    <button onclick="markFollowed(${app.id})" class="action-btn" title="Mark as followed up">Mark Followed Up</button>
                `;
                container.appendChild(li);
            });
        }

        // Render Timeline
        function renderTimeline(app = null, containerId = 'app-timeline') {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            if (app) {
                if (app.history && app.history.length) {
                    app.history.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(h => {
                        addTimelineItem(container, h.date, formatDate(h.date), `<strong>${h.status}</strong>: ${h.notes}`);
                    });
                } else {
                    container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 1rem;">No history available for this application.</p>';
                }
            } else {
                let allHistory = [];
                applications.forEach(app => {
                    if (app.history) {
                        app.history.forEach(h => allHistory.push({ ...h, company: app.company, title: app.title, appId: app.id }));
                    }
                });
                allHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).forEach(h => {
                    addTimelineItem(container, h.date, `<strong>${h.company}</strong> - ${h.title}`, `<strong>${h.status}</strong>: ${h.notes}`);
                });
                if (allHistory.length === 0) {
                    container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 1rem;">No application history yet.</p>';
                }
            }
        }

        function addTimelineItem(container, date, title, content) {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-date">${formatDate(date)}</div>
                <div class="timeline-content">${title}<br>${content}</div>
            `;
            container.appendChild(item);
        }

        // Update Goal Progress
        function updateGoalProgress() {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            const weeklyApps = applications.filter(app => {
                const appDate = new Date(app.date);
                return appDate >= weekAgo && appDate <= today;
            });
            const weeklyCount = weeklyApps.length;
            const weeklyGoal = 10;
            const progress = Math.min(100, (weeklyCount / weeklyGoal) * 100);
            document.getElementById('weekly-goal-progress').style.width = `${progress}%`;
            document.getElementById('weekly-apps-submitted').textContent = `${weeklyCount} applications`;
            document.getElementById('weekly-goal-target').textContent = `Goal: ${weeklyGoal}/week`;
            renderApplicationChart();
        }

        // Render Application Chart
        function renderApplicationChart() {
            const today = new Date();
            const fourWeeksAgo = new Date(today);
            fourWeeksAgo.setDate(today.getDate() - 28);
            const dates = [];
            for (let i = 0; i < 28; i++) {
                const date = new Date(fourWeeksAgo);
                date.setDate(date.getDate() + i);
                dates.push(date.toISOString().split('T')[0]);
            }
            const appCounts = dates.reduce((acc, date) => { acc[date] = 0; return acc; }, {});
            applications.forEach(app => { if (app.date in appCounts) appCounts[app.date]++; });
            const chartData = {
                labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Applications Submitted',
                    data: Object.values(appCounts),
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderColor: 'rgba(0, 240, 255, 1)',
                    borderWidth: 1,
                    tension: 0.4
                }]
            };
            const ctx = document.getElementById('application-chart').getContext('2d');
            if (window.applicationChart) window.applicationChart.destroy();
            window.applicationChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1, color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                        x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'), maxRotation: 45, minRotation: 45 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                    },
                    plugins: { legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') } } }
                }
            });
        }

        // GitHub Integration
        async function fetchGitHubData(token) {
            try {
                const userResponse = await fetch('https://api.github.com/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (!userResponse.ok) throw new Error('Failed to fetch user profile');
                const user = await userResponse.json();

                const reposResponse = await fetch('https://api.github.com/user/repos', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (!reposResponse.ok) throw new Error('Failed to fetch repositories');
                const repos = await reposResponse.json();

                githubData = { user, repos };
                renderProfilePage();
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to fetch GitHub data. Check your token and try again.', 'error');
                logout();
            }
        }

        function handleLogin() {
            const token = document.getElementById('github-token-input').value;
            if (token) {
                localStorage.setItem('githubToken', token);
                document.getElementById('login-section').children[0].style.display = 'none';
                document.getElementById('login-section').children[1].style.display = 'none';
                document.getElementById('logout-btn').style.display = 'inline-block';
                fetchGitHubData(token);
                showNotification('Logged in with GitHub');
            } else {
                showNotification('Please enter a valid GitHub token.', 'error');
            }
        }

        function logout() {
            localStorage.removeItem('githubToken');
            githubData = null;
            document.getElementById('profile-page').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('login-section').children[0].style.display = 'inline-block';
            document.getElementById('login-section').children[1].style.display = 'inline-block';
            document.getElementById('logout-btn').style.display = 'none';
            showNotification('Logged out');
        }

        function renderProfilePage() {
            renderProfileInfo();
            renderProjectsView();
            renderProfileAnalytics();
        }

        function renderProfileInfo() {
            const container = document.getElementById('profile-info');
            const { user } = githubData;
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${user.avatar_url}" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%;">
                    <div>
                        <h3>${user.login}</h3>
                        <p>${user.bio || 'No bio available'}</p>
                        <a href="${user.html_url}" target="_blank">View GitHub Profile</a>
                    </div>
                </div>
                <div class="mt-4">
                    <h3>Cover Letter</h3>
                    <textarea id="cover-letter" rows="10" style="width: 100%;"></textarea>
                    <button class="btn-primary" onclick="generateCoverLetter()">Generate Cover Letter</button>
                </div>
                <div class="mt-4">
                    <h3>Resume</h3>
                    <textarea id="resume" rows="10" style="width: 100%;"></textarea>
                    <button class="btn-primary" onclick="generateResume()">Generate Resume</button>
                </div>
            `;
        }

        function generateCoverLetter() {
            document.getElementById('cover-letter').value = "Dear Hiring Manager,\n\nI am writing to express my interest in the [Position] role at [Company]. With my background in [Field], I believe I can contribute to your team.\n\n[More text]\n\nSincerely,\n[Your Name]";
        }

        function generateResume() {
            document.getElementById('resume').value = "[Your Name]\n[Contact Information]\n\nObjective:\n[Your objective]\n\nExperience:\n[Your experience]\n\nEducation:\n[Your education]\n\nSkills:\n[Your skills]";
        }

        function toggleProjectsView() {
            isProjectsKanbanView = document.getElementById('projects-view-toggle').checked;
            const tableView = document.getElementById('projects-table-view');
            const kanbanView = document.getElementById('projects-kanban-view');
            if (isProjectsKanbanView) {
                tableView.style.display = 'none';
                kanbanView.style.display = 'grid';
                renderProjectsKanban();
            } else {
                tableView.style.display = 'block';
                kanbanView.style.display = 'none';
                renderProjectsTable();
            }
        }

        function renderProjectsView() {
            if (isProjectsKanbanView) {
                renderProjectsKanban();
            } else {
                renderProjectsTable();
            }
        }

        function renderProjectsTable() {
            const tbody = document.querySelector('#projects-table tbody');
            tbody.innerHTML = '';
            let filteredRepos = filterProjects();

            filteredRepos.forEach(repo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${repo.name}</td>
                    <td>${repo.description || 'N/A'}</td>
                    <td>${repo.language || 'N/A'}</td>
                    <td>${repo.stargazers_count}</td>
                    <td>${repo.forks_count}</td>
                    <td>${formatDate(repo.updated_at)}</td>
                    <td>
                        <button onclick="openProjectDetails('${repo.name}')" class="action-btn">Details</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            if (filteredRepos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No projects found.</td></tr>`;
            }
        }

        function filterProjects() {
            let filteredRepos = [...githubData.repos];

            const nameFilter = document.getElementById('filter-project-name').value.toLowerCase();
            const descriptionFilter = document.getElementById('filter-project-description').value.toLowerCase();
            const languageFilter = document.getElementById('filter-project-language').value.toLowerCase();
            const starsFilter = parseInt(document.getElementById('filter-project-stars').value) || 0;
            const forksFilter = parseInt(document.getElementById('filter-project-forks').value) || 0;
            const updatedFilter = document.getElementById('filter-project-updated').value;

            return filteredRepos.filter(repo => {
                return (
                    repo.name.toLowerCase().includes(nameFilter) &&
                    (repo.description || '').toLowerCase().includes(descriptionFilter) &&
                    (repo.language || '').toLowerCase().includes(languageFilter) &&
                    repo.stargazers_count >= starsFilter &&
                    repo.forks_count >= forksFilter &&
                    (!updatedFilter || new Date(repo.updated_at) >= new Date(updatedFilter))
                );
            });
        }

        function sortProjectsTable(colIndex) {
            const table = document.getElementById('projects-table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const sortDirection = table.getAttribute('data-sort-dir') === 'asc' ? 'desc' : 'asc';
            table.setAttribute('data-sort-dir', sortDirection);
            rows.sort((a, b) => {
                let aValue = a.cells[colIndex].textContent.trim();
                let bValue = b.cells[colIndex].textContent.trim();
                if (colIndex === 3 || colIndex === 4) {
                    aValue = parseInt(aValue) || 0;
                    bValue = parseInt(bValue) || 0;
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                } else if (colIndex === 5) {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                } else {
                    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
            });
            rows.forEach(row => tbody.appendChild(row));
        }

        function renderProjectsKanban() {
            const container = document.getElementById('projects-kanban-view');
            container.innerHTML = '';
            const kanban = document.createElement('div');
            kanban.className = 'kanban-container';
            kanban.style.display = 'grid';
            kanban.style.gridTemplateColumns = 'repeat(2, 1fr)';

            Object.keys(kanbanCategories).forEach(category => {
                const column = document.createElement('div');
                column.className = 'kanban-column';
                column.innerHTML = `<h3>${category}</h3>`;
                const cardsContainer = document.createElement('div');
                cardsContainer.className = 'kanban-cards';

                const reposInCategory = githubData.repos.filter(kanbanCategories[category]);
                reposInCategory.forEach(repo => {
                    const card = document.createElement('div');
                    card.className = 'kanban-card';
                    card.innerHTML = `
                        <div class="title">${repo.name}</div>
                        <div class="company">${repo.description || 'No description'}</div>
                        <button onclick="openProjectDetails('${repo.name}')" class="action-btn">Details</button>
                    `;
                    cardsContainer.appendChild(card);
                });

                if (reposInCategory.length === 0) {
                    cardsContainer.innerHTML = `<p style="color: var(--text-tertiary); text-align: center;">No projects</p>`;
                }

                column.appendChild(cardsContainer);
                kanban.appendChild(column);
            });

            container.appendChild(kanban);
        }

        function renderProfileAnalytics() {
            const container = document.getElementById('profile-analytics');
            container.innerHTML = '';

            const totalRepos = githubData.repos.length;
            const languageCounts = githubData.repos.reduce((acc, repo) => {
                if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
                return acc;
            }, {});
            const totalStars = githubData.repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
            const totalForks = githubData.repos.reduce((acc, repo) => acc + repo.forks_count, 0);

            container.innerHTML = `
                <div class="analytics">
                    <div class="analytics-card" title="Total number of repositories">
                        <div class="analytics-number">${totalRepos}</div>
                        <div class="analytics-label">Total Repos</div>
                    </div>
                    <div class="analytics-card" title="Total stars across all repositories">
                        <div class="analytics-number">${totalStars}</div>
                        <div class="analytics-label">Total Stars</div>
                    </div>
                    <div class="analytics-card" title="Total forks across all repositories">
                        <div class="analytics-number">${totalForks}</div>
                        <div class="analytics-label">Total Forks</div>
                    </div>
                </div>
                <h3 class="mt-4">Repositories by Language</h3>
                <div class="chart-container">
                    <canvas id="language-chart"></canvas>
                </div>
                <h3 class="mt-4">Repositories Created per Month</h3>
                <div class="chart-container">
                    <canvas id="repos-per-month-chart"></canvas>
                </div>
            `;

            const languageData = {
                labels: Object.keys(languageCounts),
                datasets: [{
                    data: Object.values(languageCounts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            };
            const languageCtx = document.getElementById('language-chart').getContext('2d');
            if (window.languageChart) window.languageChart.destroy();
            window.languageChart = new Chart(languageCtx, {
                type: 'pie',
                data: languageData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    }
                }
            });

            const reposPerMonth = githubData.repos.reduce((acc, repo) => {
                const month = new Date(repo.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});
            const months = Object.keys(reposPerMonth).sort((a, b) => new Date(a) - new Date(b));
            const reposPerMonthData = {
                labels: months,
                datasets: [{
                    label: 'Repositories Created',
                    data: months.map(month => reposPerMonth[month]),
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderColor: 'rgba(0, 240, 255, 1)',
                    borderWidth: 1,
                }]
            };
            const reposPerMonthCtx = document.getElementById('repos-per-month-chart').getContext('2d');
            if (window.reposPerMonthChart) window.reposPerMonthChart.destroy();
            window.reposPerMonthChart = new Chart(reposPerMonthCtx, {
                type: 'bar',
                data: reposPerMonthData,
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                        x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                    },
                    plugins: { legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') } } }
                }
            });
        }

        function openProjectDetails(repoName) {
            const repo = githubData.repos.find(r => r.name === repoName);
            if (repo) {
                const container = document.getElementById('project-details-content');
                container.innerHTML = `
                    <p><strong>Name:</strong> ${repo.name}</p>
                    <p><strong>Description:</strong> ${repo.description || 'N/A'}</p>
                    <p><strong>Language:</strong> ${repo.language || 'N/A'}</p>
                    <p><strong>Stars:</strong> ${repo.stargazers_count}</p>
                    <p><strong>Forks:</strong> ${repo.forks_count}</p>
                    <p><strong>Last Updated:</strong> ${formatDate(repo.updated_at)}</p>
                    <p><strong>Commits:</strong> 100 (placeholder)</p>
                    <p><strong>Contributors:</strong> 5 (placeholder)</p>
                    <p><strong>Open Issues:</strong> ${repo.open_issues_count}</p>
                    <p><strong>Open Pull Requests:</strong> 2 (placeholder)</p>
                    <p><strong>URL:</strong> <a href="${repo.html_url}" target="_blank">View on GitHub</a></p>
                    <button onclick="openProjectAnalytics('${repo.name}')" class="btn-primary">View Analytics</button>
                `;
                openModal('project-details-modal');
            }
        }

        function openProjectAnalytics(repoName) {
            const repo = githubData.repos.find(r => r.name === repoName);
            if (repo) {
                const container = document.getElementById('project-analytics-content');
                container.innerHTML = `
                    <p>Analytics for <strong>${repo.name}</strong></p>
                    <p>Stars: ${repo.stargazers_count}</p>
                    <p>Forks: ${repo.forks_count}</p>
                    <p>Watchers: ${repo.watchers_count}</p>
                    <p>Open Issues: ${repo.open_issues_count}</p>
                `;
                openModal('project-analytics-modal');
            }
        }

        // Real-time Filtering for Projects
        document.querySelectorAll('#projects-table-view .filter-inputs input').forEach(input => {
            input.addEventListener('input', () => {
                if (!isProjectsKanbanView) renderProjectsTable();
            });
        });
    </script>
