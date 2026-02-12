// Analytics Page Application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize page functionality
    initializeAnalytics();

    // Setup event listeners
    setupTabNavigation();
    setupQueryBuilder();
    setupDataUpload();
    setupDataAnalysis();
    setupPivotTable();
    setupDashboard();

    // Check user session
    checkAnalyticsSession();
});

function initializeAnalytics() {
    // Load translations
    i18n.init();

    // Initialize chart library
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }

    // Load user data
    const user = localStorage.getItem('engisuite_user');
    if (user) {
        displayAnalyticsUserProfile(JSON.parse(user));
    }

    // Initialize page with default tab
    showTab('query-builder');
}

function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('.tab-link');

    tabLinks.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
    });
}

function showTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab links
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab content and activate link
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    const selectedLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
    if (selectedLink) {
        selectedLink.classList.add('active');
    }

    // Load tab-specific data
    switch (tabId) {
        case 'query-builder':
            loadQueryBuilderData();
            break;
        case 'data-upload':
            loadDataUploadData();
            break;
        case 'data-analysis':
            loadDataAnalysisData();
            break;
        case 'pivot-table':
            loadPivotTableData();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

function setupQueryBuilder() {
    // Initialize query builder interface
    const queryBuilder = document.getElementById('query-builder');
    if (queryBuilder) {
        // Setup database connection
        const connectBtn = document.getElementById('connect-db');
        if (connectBtn) {
            connectBtn.addEventListener('click', connectToDatabase);
        }

        // Setup query execution
        const executeBtn = document.getElementById('execute-query');
        if (executeBtn) {
            executeBtn.addEventListener('click', executeQuery);
        }

        // Setup query export
        const exportBtn = document.getElementById('export-query');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportQueryResults);
        }
    }
}

function setupDataUpload() {
    // Initialize data upload functionality
    const dataUpload = document.getElementById('data-upload');
    if (dataUpload) {
        // File input change
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }

        // Drag and drop
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('drop', handleFileDrop);
            dropZone.addEventListener('dragleave', handleDragLeave);
        }

        // Process files
        const processBtn = document.getElementById('process-files');
        if (processBtn) {
            processBtn.addEventListener('click', processFiles);
        }
    }
}

function setupDataAnalysis() {
    // Initialize data analysis functionality
    const dataAnalysis = document.getElementById('data-analysis');
    if (dataAnalysis) {
        // Dataset selection
        const datasetSelect = document.getElementById('dataset-select');
        if (datasetSelect) {
            datasetSelect.addEventListener('change', loadSelectedDataset);
        }

        // Column selection
        const columnSelect = document.getElementById('column-select');
        if (columnSelect) {
            columnSelect.addEventListener('change', updateChartOptions);
        }

        // Chart type selection
        const chartTypeSelect = document.getElementById('chart-type');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', updateChartOptions);
        }

        // Generate chart
        const generateChartBtn = document.getElementById('generate-chart');
        if (generateChartBtn) {
            generateChartBtn.addEventListener('click', generateChart);
        }

        // Download chart
        const downloadChartBtn = document.getElementById('download-chart');
        if (downloadChartBtn) {
            downloadChartBtn.addEventListener('click', downloadChart);
        }
    }
}

function setupPivotTable() {
    // Initialize pivot table functionality
    const pivotTable = document.getElementById('pivot-table');
    if (pivotTable) {
        // Pivot configuration changes
        const pivotConfig = document.getElementById('pivot-config');
        if (pivotConfig) {
            const configInputs = pivotConfig.querySelectorAll('select, input');
            configInputs.forEach(input => {
                input.addEventListener('change', updatePivotTable);
            });
        }

        // Refresh pivot table
        const refreshBtn = document.getElementById('refresh-pivot');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', updatePivotTable);
        }

        // Export pivot table
        const exportBtn = document.getElementById('export-pivot');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportPivotTable);
        }
    }
}

function setupDashboard() {
    // Initialize dashboard functionality
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        // Date range filter
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', updateDashboardCharts);
        }

        // Refresh dashboard
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', updateDashboardCharts);
        }
    }
}

function checkAnalyticsSession() {
    const token = localStorage.getItem('engisuite_token');
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

function displayAnalyticsUserProfile(user) {
    const userAvatar = document.getElementById('analytics-user-avatar');
    const userName = document.getElementById('analytics-user-name');
    const userEmail = document.getElementById('analytics-user-email');

    if (userAvatar) {
        userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }

    if (userName) {
        userName.textContent = user.name;
    }

    if (userEmail) {
        userEmail.textContent = user.email;
    }
}

function initializeCharts() {
    // Initialize Chart.js with custom options
    Chart.defaults.color = '#333';
    Chart.defaults.borderColor = '#e0e0e0';
    Chart.defaults.backgroundColor = 'rgba(102, 126, 234, 0.1)';
}

function connectToDatabase() {
    // Database connection logic
    const dbType = document.getElementById('db-type').value;
    const dbHost = document.getElementById('db-host').value;
    const dbPort = document.getElementById('db-port').value;
    const dbName = document.getElementById('db-name').value;
    const dbUser = document.getElementById('db-user').value;
    const dbPassword = document.getElementById('db-password').value;

    // Validate inputs
    if (!dbType || !dbHost || !dbPort || !dbName || !dbUser) {
        showNotification('Please fill in all database connection fields', 'error');
        return;
    }

    // Show loading indicator
    const connectBtn = document.getElementById('connect-db');
    const originalText = connectBtn.textContent;
    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;

    // Simulate database connection
    setTimeout(() => {
        // Store connection info (in real app, this would be stored securely)
        const connectionInfo = {
            dbType,
            dbHost,
            dbPort,
            dbName,
            dbUser
        };
        localStorage.setItem('engisuite_db_connection', JSON.stringify(connectionInfo));

        showNotification('Database connection established successfully', 'success');

        // Enable query interface
        const querySection = document.getElementById('query-section');
        if (querySection) {
            querySection.style.display = 'block';
        }

        // Load tables
        loadDatabaseTables();

        connectBtn.textContent = originalText;
        connectBtn.disabled = false;
    }, 1500);
}

function executeQuery() {
    // Query execution logic
    const query = document.getElementById('query-text').value;

    if (!query.trim()) {
        showNotification('Please enter a SQL query', 'error');
        return;
    }

    // Show loading indicator
    const executeBtn = document.getElementById('execute-query');
    const originalText = executeBtn.textContent;
    executeBtn.textContent = 'Executing...';
    executeBtn.disabled = true;

    // Simulate query execution
    setTimeout(() => {
        const resultsCount = Math.floor(Math.random() * 1000) + 1;
        const executionTime = (Math.random() * 2).toFixed(2);

        // Display results in table
        const resultsTable = document.getElementById('results-table');
        if (resultsTable) {
            resultsTable.innerHTML = `
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Date</th>
                </tr>
                <tr>
                    <td>1</td>
                    <td>Sample Data 1</td>
                    <td>123.45</td>
                    <td>2024-01-15</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Sample Data 2</td>
                    <td>678.90</td>
                    <td>2024-01-16</td>
                </tr>
            `;
        }

        // Update results stats
        document.getElementById('results-count').textContent = `${resultsCount} results`;
        document.getElementById('execution-time').textContent = `${executionTime} seconds`;

        showNotification('Query executed successfully', 'success');

        executeBtn.textContent = originalText;
        executeBtn.disabled = false;
    }, 2000);
}

function loadSelectedDataset() {
    // Load selected dataset for analysis
    const datasetId = document.getElementById('dataset-select').value;

    if (!datasetId) {
        showNotification('Please select a dataset', 'error');
        return;
    }

    // Simulate loading dataset metadata
    setTimeout(() => {
        // Update column select options
        const columnSelect = document.getElementById('column-select');
        if (columnSelect) {
            columnSelect.innerHTML = `
                <option value="">Select Column</option>
                <option value="value">Value</option>
                <option value="count">Count</option>
                <option value="average">Average</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
            `;
        }

        showNotification('Dataset loaded successfully', 'success');
    }, 1000);
}

function updateChartOptions() {
    // Update chart configuration based on selections
    const datasetId = document.getElementById('dataset-select').value;
    const columnId = document.getElementById('column-select').value;
    const chartType = document.getElementById('chart-type').value;

    if (datasetId && columnId && chartType) {
        document.getElementById('generate-chart').disabled = false;
    } else {
        document.getElementById('generate-chart').disabled = true;
    }
}

function generateChart() {
    // Generate chart based on selected options
    const canvas = document.getElementById('analysis-chart');
    if (!canvas) {
        showNotification('Chart canvas not found', 'error');
        return;
    }

    // Show loading indicator
    const generateBtn = document.getElementById('generate-chart');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = 'Generating Chart...';
    generateBtn.disabled = true;

    setTimeout(() => {
        // Destroy existing chart if it exists
        if (window.analysisChart) {
            window.analysisChart.destroy();
        }

        // Create new chart
        window.analysisChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sample Data',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Sample Data Analysis'
                    }
                }
            }
        });

        showNotification('Chart generated successfully', 'success');

        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }, 1500);
}

function updatePivotTable() {
    // Update pivot table based on configuration
    const pivotContainer = document.getElementById('pivot-container');
    if (pivotContainer) {
        pivotContainer.innerHTML = `
            <div class="pivot-table">
                <table>
                    <tr>
                        <th></th>
                        <th>2023</th>
                        <th>2024</th>
                        <th>Total</th>
                    </tr>
                    <tr>
                        <th>Electrical</th>
                        <td>12,345</td>
                        <td>15,678</td>
                        <td>28,023</td>
                    </tr>
                    <tr>
                        <th>Mechanical</th>
                        <td>9,876</td>
                        <td>11,234</td>
                        <td>21,110</td>
                    </tr>
                    <tr>
                        <th>Civil</th>
                        <td>8,567</td>
                        <td>10,456</td>
                        <td>19,023</td>
                    </tr>
                    <tr>
                        <th>Total</th>
                        <td>30,788</td>
                        <td>37,368</td>
                        <td>68,156</td>
                    </tr>
                </table>
            </div>
        `;

        showNotification('Pivot table updated', 'success');
    }
}

function updateDashboardCharts() {
    // Update dashboard charts based on selected filters
    const dateRange = document.getElementById('date-range').value;

    // Update all dashboard charts
    const charts = document.querySelectorAll('.dashboard-chart');
    charts.forEach(chart => {
        const chartId = chart.getAttribute('data-chart-id');
        updateDashboardChart(chartId, dateRange);
    });

    showNotification('Dashboard updated', 'success');
}

function updateDashboardChart(chartId, dateRange) {
    // Update specific dashboard chart
    const canvas = document.getElementById(`dashboard-chart-${chartId}`);
    if (!canvas) return;

    // Simulate updating chart data based on date range
    if (window.dashboardCharts && window.dashboardCharts[chartId]) {
        window.dashboardCharts[chartId].data.datasets[0].data =
            [65, 59, 80, 81, 56, 55].map(value => value * (1 + Math.random() * 0.2));
        window.dashboardCharts[chartId].update('none');
    }
}

function handleFileSelect(event) {
    // Handle file selection
    const files = event.target.files;
    displaySelectedFiles(files);
}

function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    displaySelectedFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.add('active');
}

function handleDragLeave(event) {
    event.preventDefault();
    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.remove('active');
}

function displaySelectedFiles(files) {
    const fileList = document.getElementById('selected-files');
    if (fileList) {
        fileList.innerHTML = '';

        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <div class="file-actions">
                    <button class="btn-remove" onclick="removeFile(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });

        // Enable process button
        document.getElementById('process-files').disabled = files.length === 0;
    }
}

function removeFile(button) {
    const fileItem = button.closest('.file-item');
    if (fileItem) {
        fileItem.remove();

        // Check if no files left
        const fileList = document.getElementById('selected-files');
        if (fileList && fileList.children.length === 0) {
            document.getElementById('process-files').disabled = true;
        }
    }
}

function processFiles() {
    // Process uploaded files
    const processBtn = document.getElementById('process-files');
    const originalText = processBtn.textContent;
    processBtn.textContent = 'Processing...';
    processBtn.disabled = true;

    setTimeout(() => {
        showNotification('Files processed successfully', 'success');
        processBtn.textContent = originalText;
        processBtn.disabled = false;
    }, 2000);
}

function loadQueryBuilderData() {
    // Load query builder initial data
    console.log('Loading query builder data...');
}

function loadDataUploadData() {
    // Load data upload initial data
    console.log('Loading data upload data...');
}

function loadDataAnalysisData() {
    // Load data analysis initial data
    console.log('Loading data analysis data...');
}

function loadPivotTableData() {
    // Load pivot table initial data
    console.log('Loading pivot table data...');
    updatePivotTable();
}

function loadDashboardData() {
    // Load dashboard initial data
    console.log('Loading dashboard data...');
    initializeDashboardCharts();
}

function initializeDashboardCharts() {
    // Initialize dashboard charts
    const chartConfigs = [
        {
            id: 'sales',
            type: 'bar',
            title: 'Monthly Sales',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [65, 59, 80, 81, 56, 55]
        },
        {
            id: 'revenue',
            type: 'line',
            title: 'Revenue Trend',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [28, 48, 40, 19, 86, 27]
        },
        {
            id: 'categories',
            type: 'pie',
            title: 'Sales by Category',
            labels: ['Electrical', 'Mechanical', 'Civil'],
            data: [45, 30, 25]
        }
    ];

    window.dashboardCharts = {};

    chartConfigs.forEach(config => {
        const canvas = document.getElementById(`dashboard-chart-${config.id}`);
        if (canvas) {
            window.dashboardCharts[config.id] = new Chart(canvas, {
                type: config.type,
                data: {
                    labels: config.labels,
                    datasets: [{
                        label: config.title,
                        data: config.data,
                        backgroundColor: [
                            'rgba(102, 126, 234, 0.8)',
                            'rgba(118, 75, 162, 0.8)',
                            'rgba(236, 112, 99, 0.8)'
                        ],
                        borderColor: [
                            'rgba(102, 126, 234, 1)',
                            'rgba(118, 75, 162, 1)',
                            'rgba(236, 112, 99, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: config.title
                        }
                    }
                }
            });
        }
    });
}

function exportQueryResults() {
    // Export query results to CSV
    showNotification('Export functionality coming soon', 'info');
}

function exportPivotTable() {
    // Export pivot table
    showNotification('Export functionality coming soon', 'info');
}

function downloadChart() {
    // Download chart as image
    const canvas = document.getElementById('analysis-chart');
    if (!canvas || !window.analysisChart) {
        showNotification('No chart to download', 'error');
        return;
    }

    canvas.toBlob(function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart.png';
        a.click();
        URL.revokeObjectURL(url);
    });

    showNotification('Chart downloaded', 'success');
}

function loadDatabaseTables() {
    // Load database tables into sidebar
    const tablesList = document.getElementById('database-tables');
    if (tablesList) {
        tablesList.innerHTML = `
            <li class="table-item">
                <i class="fas fa-table"></i>
                <span>customers</span>
            </li>
            <li class="table-item">
                <i class="fas fa-table"></i>
                <span>orders</span>
            </li>
            <li class="table-item">
                <i class="fas fa-table"></i>
                <span>products</span>
            </li>
            <li class="table-item">
                <i class="fas fa-table"></i>
                <span>categories</span>
            </li>
        `;

        // Make tables selectable
        const tableItems = tablesList.querySelectorAll('.table-item');
        tableItems.forEach(item => {
            item.addEventListener('click', function () {
                tableItems.forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                addTableToQuery(this.textContent.trim());
            });
        });
    }
}

function addTableToQuery(tableName) {
    // Add table to query builder
    const queryText = document.getElementById('query-text');
    if (queryText) {
        if (queryText.value.trim() === '') {
            queryText.value = `SELECT * FROM ${tableName}`;
        } else {
            queryText.value += `\nJOIN ${tableName}`;
        }
    }
}

function showNotification(message, type) {
    // Display notification
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
    initializeAnalytics,
    setupTabNavigation,
    setupQueryBuilder,
    setupDataUpload,
    setupDataAnalysis,
    setupPivotTable,
    setupDashboard,
    initializeCharts,
    connectToDatabase,
    executeQuery,
    loadSelectedDataset,
    updateChartOptions,
    generateChart,
    updatePivotTable,
    updateDashboardCharts,
    handleFileSelect,
    handleFileDrop,
    handleDragOver,
    handleDragLeave,
    processFiles,
    showNotification
};
