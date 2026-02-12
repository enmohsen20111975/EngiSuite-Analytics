// Index page initialization
document.addEventListener('DOMContentLoaded', function () {
    // Load user data
    authService.init();

    // Initialize app
    if (typeof indexApp !== 'undefined') {
        indexApp.initialize();
    }
});
