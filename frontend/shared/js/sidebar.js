// Sidebar functionality
(function () {
    // Set active navigation item
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';

    // Sidebar nav items
    document.querySelectorAll('#sidebar .nav-item[data-nav]').forEach(item => {
        if (item.dataset.nav === currentPage) {
            item.classList.add('bg-blue-50', 'dark:bg-slate-700', 'text-brand-blue', 'dark:text-white');
            item.classList.remove('text-slate-600', 'dark:text-slate-300');
        }
    });

    // Bottom nav items
    document.querySelectorAll('.bottom-nav-item[data-nav]').forEach(item => {
        if (item.dataset.nav === currentPage) {
            item.classList.add('active');
        }
    });

    // Mobile drawer functionality
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('close-sidebar-btn');

    function openDrawer() {
        if (sidebar && overlay) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex', 'mobile-drawer-open');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('drawer-open');
        }
    }

    function closeDrawer() {
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-drawer-open');
            sidebar.style.transform = 'translateX(-100%)';
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            document.body.classList.remove('drawer-open');

            setTimeout(() => {
                if (window.innerWidth < 768) {
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('flex');
                }
                sidebar.style.transform = '';
            }, 300);
        }
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDrawer);
    }

    // Overlay click
    if (overlay) {
        overlay.addEventListener('click', closeDrawer);
    }

    // Mobile menu button (in header)
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', openDrawer);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        } else if (!document.body.classList.contains('drawer-open')) {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('flex');
        }
    });

    // Close drawer on nav item click (mobile)
    document.querySelectorAll('#sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeDrawer();
            }
        });
    });
})();
