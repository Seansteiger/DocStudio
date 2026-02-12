/* ===== Simple Hash Router ===== */

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigateTo(path) {
    window.location.hash = path;
}

export function getCurrentRoute() {
    return window.location.hash.slice(1) || '/';
}

export function initRouter(contentEl) {
    async function handleRoute() {
        const path = getCurrentRoute();
        const handler = routes[path] || routes['/'];

        // Cleanup previous page
        if (currentCleanup && typeof currentCleanup === 'function') {
            currentCleanup();
            currentCleanup = null;
        }

        if (handler) {
            contentEl.innerHTML = '';
            contentEl.classList.remove('animate-fade-in');
            void contentEl.offsetWidth; // force reflow
            contentEl.classList.add('animate-fade-in');
            currentCleanup = await handler(contentEl);
        }

        // Update active sidebar link
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${path}`);
        });
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
