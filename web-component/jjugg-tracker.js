// Self-contained web component that can be embedded anywhere
class JJUGGTracker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.initializeTracker();
    }

    connectedCallback() {
        this.render();
        this.startTracking();
    }

    initializeTracker() {
        // Include all tracking logic here
        this.config = {
            API_BASE_URL: this.getAttribute('api-url') || 'http://127.0.0.1:7766',
            TRACKING_ENABLED: true,
            DEBUG: this.hasAttribute('debug')
        };
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .tracker-widget {
                    width: 300px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 16px;
                    color: white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                /* Include all CSS from the userscript */
            </style>
            <div class="tracker-widget">
                <div class="tracker-header">🎯 JJUGG Tracker</div>
                <div class="job-info">
                    <div class="job-title">Loading...</div>
                    <div class="job-company"></div>
                    <div class="match-score"></div>
                </div>
                <div class="actions">
                    <button id="save-job">💾 Save</button>
                    <button id="auto-fill">✍️ Fill</button>
                    <button id="research">🔍 Research</button>
                </div>
            </div>
        `;
    }

    startTracking() {
        // Include all tracking functionality
        console.log('JJUGG Tracker widget started');
    }
}

// Register the custom element
customElements.define('jjugg-tracker', JJUGGTracker);

// Auto-inject on job sites
if (window.location.hostname.includes('linkedin.com') ||
    window.location.hostname.includes('indeed.com') ||
    window.location.hostname.includes('glassdoor.com')) {

    const tracker = document.createElement('jjugg-tracker');
    document.body.appendChild(tracker);
}
