# jjugg - Smart Job Application Tracker

jjugg is a tool to help job seekers, especially remote developers, track their applications automatically or manually. It uses a userscript to capture details from job boards and a local HTML dashboard for management. Fake data is pre-loaded for testing.

## Installation

1. Install a userscript manager:
   - Chrome: [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

2. Add the userscript:
   - Open your userscript manager.
   - Click "Create a new script" or "Add new script."
   - Copy and paste the contents of `jjugg-userscript.js`.

3. Save the tracker HTML file:
   - Open `jjugg.html` in your browser directly, or serve it locally (see below).

## Usage

- **Automatic Tracking**: Apply to jobs on LinkedIn, Indeed, Glassdoor, Monster, ZipRecruiter, CareerBuilder, We Work Remotely, Remote OK, FlexJobs, Working Nomads, or sites with "application-submitted" in the URL. The userscript logs details automatically to `localStorage`.
- **Manual Entry**: Use the form in `jjugg.html` to add applications from unsupported sources.
- **Test with Fake Data**: Open `jjugg.html` to see pre-loaded fake applications. Sort, filter, edit, delete, or export them.
- **Serve Locally**: Run `python -m http.server 8000` in the `jjugg` directory, then visit `http://localhost:8000/jjugg.html` in your browser.
- **View Applications**: Open `jjugg.html` to manage your applications with sorting, filtering, and export options.
- **Track Features**: See `FEATURES.md` for current and upcoming features, including userscript details.

For more details, see the full documentation.
