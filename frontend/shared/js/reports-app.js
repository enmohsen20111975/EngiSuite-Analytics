// Reports Application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize reports functionality
    initializeReports();

    // Setup event listeners
    setupReportFilters();
    setupReportActions();
    setupEditorActions();

    // Load initial data
    loadReports();
});

function initializeReports() {
    // Initialize report filter components
    const filterBar = document.querySelector('.reports-filter-bar');
    if (filterBar) {
        // Set default date range to last 30 days
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');

        if (startDateInput) {
            startDateInput.value = startDate.toISOString().split('T')[0];
        }
        if (endDateInput) {
            endDateInput.value = endDate.toISOString().split('T')[0];
        }
    }

    // Initialize report templates
    initializeReportTemplates();
}

function setupReportFilters() {
    const filterBtn = document.getElementById('filter-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

function setupReportActions() {
    const reportItems = document.querySelectorAll('.report-item');
    reportItems.forEach(item => {
        const viewBtn = item.querySelector('.btn-view');
        const downloadBtn = item.querySelector('.btn-download');
        const shareBtn = item.querySelector('.btn-share');
        const deleteBtn = item.querySelector('.btn-delete');

        if (viewBtn) {
            viewBtn.addEventListener('click', function () {
                const reportId = item.getAttribute('data-report-id');
                viewReport(reportId);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', function () {
                const reportId = item.getAttribute('data-report-id');
                downloadReport(reportId);
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                const reportId = item.getAttribute('data-report-id');
                shareReport(reportId);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                const reportId = item.getAttribute('data-report-id');
                deleteReport(reportId);
            });
        }
    });
}

function setupEditorActions() {
    const createReportBtn = document.getElementById('create-report-btn');
    const saveBtn = document.getElementById('save-report-btn');
    const previewBtn = document.getElementById('preview-report-btn');
    const cancelBtn = document.getElementById('cancel-editor-btn');

    if (createReportBtn) {
        createReportBtn.addEventListener('click', showReportEditor);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveReport);
    }

    if (previewBtn) {
        previewBtn.addEventListener('click', previewReport);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideReportEditor);
    }
}

function initializeReportTemplates() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function () {
            selectReportTemplate(this);
        });
    });
}

function loadReports() {
    // Load reports from database or localStorage
    const reports = getReportsFromStorage();
    if (reports.length > 0) {
        displayReports(reports);
    } else {
        displayNoReportsMessage();
    }
}

function getReportsFromStorage() {
    // Check if reports are available in localStorage
    const stored = localStorage.getItem('engisuite_reports');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing reports from localStorage:', error);
        }
    }
    return [];
}

function displayReports(reports) {
    const reportsList = document.getElementById('reports-list');
    if (!reportsList) return;

    // Clear existing content
    reportsList.innerHTML = '';

    reports.forEach(report => {
        const reportItem = createReportItem(report);
        reportsList.appendChild(reportItem);
    });

    // Show reports list and hide no reports message
    document.getElementById('reports-list').style.display = 'block';
    document.getElementById('no-reports').style.display = 'none';
}

function createReportItem(report) {
    const item = document.createElement('div');
    item.className = 'report-item';
    item.setAttribute('data-report-id', report.id);

    const formattedDate = new Date(report.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    item.innerHTML = `
        <div class="report-info">
            <div class="report-title">${report.title}</div>
            <div class="report-meta">
                <span class="report-type">${report.type}</span>
                <span>${formattedDate}</span>
                <span>${report.size}</span>
            </div>
        </div>
        <div class="report-actions">
            <button class="btn-view">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn-download">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="btn-share">
                <i class="fas fa-share"></i> Share
            </button>
            <button class="btn-delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    return item;
}

function displayNoReportsMessage() {
    document.getElementById('reports-list').style.display = 'none';
    document.getElementById('no-reports').style.display = 'block';
}

function applyFilters() {
    // Get filter values
    const reportType = document.getElementById('report-type-filter')?.value || 'all';
    const startDate = document.getElementById('start-date')?.value;
    const endDate = document.getElementById('end-date')?.value;

    // Filter reports
    let filteredReports = getReportsFromStorage();

    if (reportType !== 'all') {
        filteredReports = filteredReports.filter(report => report.type === reportType);
    }

    if (startDate && endDate) {
        filteredReports = filteredReports.filter(report => {
            const reportDate = new Date(report.createdAt);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return reportDate >= start && reportDate <= end;
        });
    }

    // Display filtered results
    displayReports(filteredReports);
}

function resetFilters() {
    // Reset filter values
    const reportTypeFilter = document.getElementById('report-type-filter');
    if (reportTypeFilter) {
        reportTypeFilter.value = 'all';
    }

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (startDateInput) {
        startDateInput.value = startDate.toISOString().split('T')[0];
    }
    if (endDateInput) {
        endDateInput.value = endDate.toISOString().split('T')[0];
    }

    // Reload all reports
    loadReports();
}

function showReportEditor() {
    const editor = document.getElementById('report-editor');
    if (editor) {
        editor.style.display = 'block';
    }
}

function hideReportEditor() {
    const editor = document.getElementById('report-editor');
    if (editor) {
        editor.style.display = 'none';
    }
}

function selectReportTemplate(templateCard) {
    // Remove selected class from all templates
    const allTemplates = document.querySelectorAll('.template-card');
    allTemplates.forEach(card => card.classList.remove('selected'));

    // Add selected class to clicked template
    templateCard.classList.add('selected');

    // Update form fields based on selected template
    const templateType = templateCard.getAttribute('data-template-type');
    updateFormFieldsForTemplate(templateType);
}

function updateFormFieldsForTemplate(templateType) {
    // Show/hide form fields based on template type
    const fieldGroups = document.querySelectorAll('.form-section');
    fieldGroups.forEach(group => {
        group.style.display = 'block';
    });

    // Example: Hide specific fields for certain template types
    if (templateType === 'invoice') {
        document.getElementById('project-info').style.display = 'none';
    } else if (templateType === 'timesheet') {
        document.getElementById('client-info').style.display = 'none';
    }
}

function saveReport() {
    // Validate form
    if (!validateReportForm()) {
        return;
    }

    // Create new report object
    const newReport = {
        id: generateReportId(),
        title: document.getElementById('report-title').value,
        type: document.getElementById('report-type').value,
        template: document.querySelector('.template-card.selected')?.getAttribute('data-template-type') || 'default',
        createdAt: new Date().toISOString(),
        size: '0 KB' // This would be calculated based on content
    };

    // Save to storage
    saveReportToStorage(newReport);

    // Show success message and hide editor
    showNotification('Report saved successfully!', 'success');
    hideReportEditor();

    // Reload reports list
    loadReports();
}

function validateReportForm() {
    const title = document.getElementById('report-title').value.trim();
    const type = document.getElementById('report-type').value;
    const selectedTemplate = document.querySelector('.template-card.selected');

    if (!title) {
        showNotification('Please enter a report title', 'error');
        return false;
    }

    if (!type) {
        showNotification('Please select a report type', 'error');
        return false;
    }

    if (!selectedTemplate) {
        showNotification('Please select a report template', 'error');
        return false;
    }

    return true;
}

function generateReportId() {
    return 'RPT-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
}

function saveReportToStorage(report) {
    const reports = getReportsFromStorage();
    reports.push(report);
    localStorage.setItem('engisuite_reports', JSON.stringify(reports));
}

function previewReport() {
    const editor = document.getElementById('report-editor');
    const preview = document.getElementById('report-preview');

    if (editor && preview) {
        editor.style.display = 'none';
        preview.style.display = 'block';
    }
}

function viewReport(reportId) {
    // Show report preview
    const report = getReportById(reportId);
    if (report) {
        showReportPreview(report);
    }
}

function downloadReport(reportId) {
    // Simulate download
    const report = getReportById(reportId);
    if (report) {
        showNotification(`Downloading report: ${report.title}`, 'info');

        // In real application, this would trigger file download
        setTimeout(() => {
            showNotification('Report downloaded successfully!', 'success');
        }, 1500);
    }
}

function shareReport(reportId) {
    // Show share options
    const report = getReportById(reportId);
    if (report) {
        showShareOptions(report);
    }
}

function deleteReport(reportId) {
    // Confirm deletion
    if (confirm('Are you sure you want to delete this report?')) {
        // Delete from storage
        const reports = getReportsFromStorage().filter(report => report.id !== reportId);
        localStorage.setItem('engisuite_reports', JSON.stringify(reports));

        // Remove from DOM
        const reportItem = document.querySelector(`.report-item[data-report-id="${reportId}"]`);
        if (reportItem) {
            reportItem.remove();
        }

        // Check if we have any reports left
        if (reports.length === 0) {
            displayNoReportsMessage();
        }

        showNotification('Report deleted successfully!', 'success');
    }
}

function getReportById(reportId) {
    const reports = getReportsFromStorage();
    return reports.find(report => report.id === reportId);
}

function showReportPreview(report) {
    const preview = document.getElementById('report-preview');
    if (!preview) return;

    const previewContent = preview.querySelector('.preview-content');
    if (previewContent) {
        previewContent.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <p>${report.title}</p>
            <p>${report.type} Report</p>
            <p>Generated on: ${new Date(report.createdAt).toLocaleDateString('en-US')}</p>
            <div style="margin-top: 20px; font-size: 0.875rem;">
                <p>Report ID: ${report.id}</p>
                <p>Size: ${report.size}</p>
            </div>
        `;
    }

    preview.style.display = 'block';
}

function showShareOptions(report) {
    // In a real application, this would show sharing options (email, social media, etc.)
    const shareUrl = `https://engisuite.com/reports/${report.id}`;
    const shareText = `Check out this ${report.type} report: ${report.title}`;

    // Copy share URL to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Share link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy share link:', err);
        showNotification('Failed to copy share link', 'error');
    });
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Show notification
    notification.classList.add('show');

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export for module usage
export {
    initializeReports,
    setupReportFilters,
    setupReportActions,
    setupEditorActions,
    loadReports,
    displayReports,
    applyFilters,
    resetFilters,
    showReportEditor,
    hideReportEditor,
    saveReport,
    previewReport,
    viewReport,
    downloadReport,
    shareReport,
    deleteReport
};
