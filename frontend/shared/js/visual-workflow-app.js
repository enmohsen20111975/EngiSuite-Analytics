// Visual Workflow Builder Application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize visual workflow
    if (typeof VisualWorkflow !== 'undefined') {
        VisualWorkflow.init();
    }

    // Setup event listeners for toolbar buttons
    setupWorkflowToolbar();

    // Initialize components
    initializeWorkflowComponents();
});

function setupWorkflowToolbar() {
    // Zoom controls
    const zoomInBtn = document.querySelector('button[title="Zoom In"]');
    const zoomOutBtn = document.querySelector('button[title="Zoom Out"]');
    const resetViewBtn = document.querySelector('button[title="Reset View"]');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (VisualWorkflow && VisualWorkflow.zoomIn) {
                VisualWorkflow.zoomIn();
            }
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (VisualWorkflow && VisualWorkflow.zoomOut) {
                VisualWorkflow.zoomOut();
            }
        });
    }

    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            if (VisualWorkflow && VisualWorkflow.resetView) {
                VisualWorkflow.resetView();
            }
        });
    }

    // Examples menu - use ID selector for reliable targeting
    const examplesBtn = document.getElementById('examples-btn');
    const examplesMenu = document.getElementById('examples-menu');
    const examplesClose = document.getElementById('examples-close');

    if (examplesBtn && examplesMenu) {
        examplesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            examplesMenu.style.display = examplesMenu.style.display === 'block' ? 'none' : 'block';
        });
    }

    if (examplesClose && examplesMenu) {
        examplesClose.addEventListener('click', () => {
            examplesMenu.style.display = 'none';
        });
    }

    // Close examples menu when clicking outside
    document.addEventListener('click', (e) => {
        if (examplesMenu && examplesMenu.style.display === 'block') {
            if (!e.target.closest('.examples-menu') && e.target !== examplesBtn && !examplesBtn?.contains(e.target)) {
                examplesMenu.style.display = 'none';
            }
        }
    });
}

function initializeWorkflowComponents() {
    // Initialize component categories
    if (typeof Calculators !== 'undefined' && Calculators.modules) {
        // Categories will be populated by VisualWorkflow.populateComponents()
    }
}

// Export for module usage
export { setupWorkflowToolbar, initializeWorkflowComponents };
