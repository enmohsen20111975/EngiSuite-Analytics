/**
 * Analytics Advanced Features Module
 * Provides advanced data analysis features including:
 * - IndexedDB storage
 * - Advanced filtering with nested AND/OR logic
 * - Enhanced export options (PDF, Excel, SQL, PNG)
 * - Sample data loading
 * - Data statistics and preview
 */

class AnalyticsAdvanced {
    constructor() {
        this.dbName = 'EngiSuiteAnalyticsDB';
        this.dbVersion = 1;
        this.db = null;
        this.currentData = [];
        this.filterGroups = [];
    }

    // ==================== IndexedDB Storage ====================
    
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('datasets')) {
                    const datasetStore = db.createObjectStore('datasets', { keyPath: 'id', autoIncrement: true });
                    datasetStore.createIndex('name', 'name', { unique: false });
                    datasetStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('queries')) {
                    const queryStore = db.createObjectStore('queries', { keyPath: 'id', autoIncrement: true });
                    queryStore.createIndex('name', 'name', { unique: false });
                    queryStore.createIndex('saveDate', 'saveDate', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
                    templateStore.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    async saveDataset(name, data, metadata = {}) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readwrite');
            const store = transaction.objectStore('datasets');
            
            const record = {
                name,
                data,
                uploadDate: new Date().toISOString(),
                rowCount: Array.isArray(data) ? data.length : 0,
                columns: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [],
                ...metadata
            };
            
            const request = store.add(record);
            
            request.onsuccess = () => resolve({ success: true, id: request.result, record });
            request.onerror = () => reject(request.error);
        });
    }

    async getDatasets() {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readonly');
            const store = transaction.objectStore('datasets');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getDataset(id) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readonly');
            const store = transaction.objectStore('datasets');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteDataset(id) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readwrite');
            const store = transaction.objectStore('datasets');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve({ success: true });
            request.onerror = () => reject(request.error);
        });
    }

    async clearAllDatasets() {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readwrite');
            const store = transaction.objectStore('datasets');
            const request = store.clear();
            
            request.onsuccess = () => resolve({ success: true });
            request.onerror = () => reject(request.error);
        });
    }

    async getStorageInfo() {
        if (!this.db) await this.initDB();
        
        const datasets = await this.getDatasets();
        const totalSize = JSON.stringify(datasets).length;
        
        return {
            datasetsCount: datasets.length,
            storageUsed: this.formatBytes(totalSize),
            totalSize
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // ==================== Advanced Filtering ====================
    
    createFilterGroup(logic = 'AND') {
        return {
            id: this.generateId(),
            logic: logic,
            conditions: []
        };
    }

    createFilterCondition(column, operator, value) {
        return {
            id: this.generateId(),
            column,
            operator,
            value
        };
    }

    addFilterGroup(logic = 'AND') {
        const group = this.createFilterGroup(logic);
        this.filterGroups.push(group);
        return group;
    }

    addFilterCondition(groupId, column, operator, value) {
        const group = this.filterGroups.find(g => g.id === groupId);
        if (group) {
            const condition = this.createFilterCondition(column, operator, value);
            group.conditions.push(condition);
            return condition;
        }
        return null;
    }

    removeFilterGroup(groupId) {
        this.filterGroups = this.filterGroups.filter(g => g.id !== groupId);
    }

    removeFilterCondition(groupId, conditionId) {
        const group = this.filterGroups.find(g => g.id === groupId);
        if (group) {
            group.conditions = group.conditions.filter(c => c.id !== conditionId);
        }
    }

    applyFilters(data) {
        if (!data || data.length === 0) return [];
        if (this.filterGroups.length === 0) return data;

        return data.filter(row => {
            // Evaluate each filter group
            const groupResults = this.filterGroups.map(group => {
                // Evaluate all conditions in the group
                const conditionResults = group.conditions.map(condition => {
                    return this.evaluateCondition(row, condition);
                });
                
                // Apply group logic (AND or OR)
                if (group.logic === 'AND') {
                    return conditionResults.every(r => r);
                } else {
                    return conditionResults.some(r => r);
                }
            });
            
            // All groups must be true (AND between groups)
            return groupResults.every(r => r);
        });
    }

    evaluateCondition(row, condition) {
        const { column, operator, value } = condition;
        const rowValue = row[column];
        
        switch (operator) {
            case 'equals':
                return rowValue == value;
            case 'not_equals':
                return rowValue != value;
            case 'greater_than':
                return Number(rowValue) > Number(value);
            case 'less_than':
                return Number(rowValue) < Number(value);
            case 'greater_equals':
                return Number(rowValue) >= Number(value);
            case 'less_equals':
                return Number(rowValue) <= Number(value);
            case 'contains':
                return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
            case 'not_contains':
                return !String(rowValue).toLowerCase().includes(String(value).toLowerCase());
            case 'starts_with':
                return String(rowValue).toLowerCase().startsWith(String(value).toLowerCase());
            case 'ends_with':
                return String(rowValue).toLowerCase().endsWith(String(value).toLowerCase());
            case 'is_null':
                return rowValue === null || rowValue === undefined || rowValue === '';
            case 'not_null':
                return rowValue !== null && rowValue !== undefined && rowValue !== '';
            case 'in':
                return Array.isArray(value) && value.includes(rowValue);
            case 'not_in':
                return Array.isArray(value) && !value.includes(rowValue);
            case 'between':
                return Array.isArray(value) && value.length === 2 &&
                       Number(rowValue) >= Number(value[0]) && Number(rowValue) <= Number(value[1]);
            default:
                return true;
        }
    }

    // ==================== Export Functions ====================
    
    exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h];
                const strVal = val === null || val === undefined ? '' : String(val);
                // Escape quotes and wrap in quotes if contains comma
                return strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')
                    ? `"${strVal.replace(/"/g, '""')}"`
                    : strVal;
            }).join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }

    exportToExcel(data, filename = 'export.xlsx') {
        // Create a simple HTML table that Excel can open
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        let html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; }
                    td, th { border: 1px solid #ccc; padding: 8px; }
                    th { background-color: #f0f0f0; font-weight: bold; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
        `;
        
        data.forEach(row => {
            html += `<tr>${headers.map(h => `<td>${row[h] !== null ? row[h] : ''}</td>`).join('')}</tr>`;
        });
        
        html += '</table></body></html>';
        
        this.downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8');
    }

    exportToSQL(data, tableName = 'exported_data', filename = 'export.sql') {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const columns = headers.map(h => {
            const sampleValue = data.find(r => r[h] !== null && r[h] !== undefined)?.[h];
            const type = typeof sampleValue === 'number' ? 'FLOAT' : 'TEXT';
            return `${h} ${type}`;
        }).join(', ');
        
        let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});\n\n`;
        sql += `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES\n`;
        
        const values = data.map(row => {
            const rowValues = headers.map(h => {
                const val = row[h];
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'number') return val;
                return `'${String(val).replace(/'/g, "''")}'`;
            });
            return `(${rowValues.join(', ')})`;
        });
        
        sql += values.join(',\n');
        sql += ';\n';
        
        this.downloadFile(sql, filename, 'text/plain;charset=utf-8');
    }

    exportToPNG(element, filename = 'export.png') {
        if (!element) return;
        
        // Use html2canvas if available, otherwise create a simple canvas
        if (typeof html2canvas !== 'undefined') {
            html2canvas(element).then(canvas => {
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                });
            });
        } else {
            // Fallback: create a simple canvas with the data
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 800;
            canvas.height = 600;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#333333';
            ctx.font = '16px Arial';
            ctx.fillText('Data Export - ' + new Date().toLocaleDateString(), 20, 30);
            ctx.fillText(`Total records: ${element.querySelectorAll('tr').length - 1}`, 20, 60);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    }

    exportToPDF(data, filename = 'export.pdf') {
        if (!data || data.length === 0) return;
        
        // Create a simple HTML document for PDF
        const headers = Object.keys(data[0]);
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #667eea; color: white; padding: 10px; text-align: left; }
                    td { border: 1px solid #ddd; padding: 8px; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>Data Export Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Total records: ${data.length}</p>
                <table>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
        `;
        
        data.slice(0, 100).forEach(row => {
            html += `<tr>${headers.map(h => `<td>${row[h] !== null ? row[h] : ''}</td>`).join('')}</tr>`;
        });
        
        if (data.length > 100) {
            html += `<tr><td colspan="${headers.length}" style="text-align: center; color: #666;">... and ${data.length - 100} more records</td></tr>`;
        }
        
        html += `
                </table>
                <div class="footer">Generated by EngiSuite Analytics Pro</div>
            </body>
            </html>
        `;
        
        // Use window.print() for PDF export
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ==================== Sample Data Loading ====================
    
    async loadSampleData() {
        const sampleDatasets = [
            {
                name: 'Sales Data',
                data: this.generateSalesData(100)
            },
            {
                name: 'Customer Data',
                data: this.generateCustomerData(50)
            },
            {
                name: 'Inventory Data',
                data: this.generateInventoryData(30)
            },
            {
                name: 'Financial Data',
                data: this.generateFinancialData(60)
            },
            {
                name: 'Employee Data',
                data: this.generateEmployeeData(25)
            }
        ];

        const results = [];
        for (const dataset of sampleDatasets) {
            try {
                const result = await this.saveDataset(dataset.name, dataset.data);
                results.push({ success: true, name: dataset.name, id: result.id });
            } catch (error) {
                results.push({ success: false, name: dataset.name, error: error.message });
            }
        }

        return results;
    }

    generateSalesData(count) {
        const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
        const regions = ['North', 'South', 'East', 'West'];
        const categories = ['Electronics', 'Furniture', 'Clothing', 'Food'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            product: products[Math.floor(Math.random() * products.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            quantity: Math.floor(Math.random() * 100) + 1,
            price: (Math.random() * 500 + 50).toFixed(2),
            total: 0,
            region: regions[Math.floor(Math.random() * regions.length)]
        })).map(row => ({
            ...row,
            total: (row.quantity * parseFloat(row.price)).toFixed(2)
        }));
    }

    generateCustomerData(count) {
        const cities = ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'];
        const types = ['Premium', 'Regular', 'VIP', 'New'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Customer ${i + 1}`,
            email: `customer${i + 1}@example.com`,
            phone: `+20 1${Math.floor(Math.random() * 900000000) + 100000000}`,
            city: cities[Math.floor(Math.random() * cities.length)],
            registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customerType: types[Math.floor(Math.random() * types.length)],
            totalPurchases: Math.floor(Math.random() * 50) + 1
        }));
    }

    generateInventoryData(count) {
        const products = ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Printer'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            product: products[Math.floor(Math.random() * products.length)],
            quantity: Math.floor(Math.random() * 200) + 10,
            unitPrice: (Math.random() * 1000 + 100).toFixed(2),
            remainingStock: Math.floor(Math.random() * 100) + 5,
            additionDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: ['Electronics', 'Accessories', 'Peripherals'][Math.floor(Math.random() * 3)]
        }));
    }

    generateFinancialData(count) {
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            revenue: (Math.random() * 10000 + 1000).toFixed(2),
            expenses: (Math.random() * 5000 + 500).toFixed(2),
            profit: 0,
            category: ['Sales', 'Services', 'Consulting', 'Support'][Math.floor(Math.random() * 4)],
            description: `Transaction ${i + 1}`
        })).map(row => ({
            ...row,
            profit: (parseFloat(row.revenue) - parseFloat(row.expenses)).toFixed(2)
        }));
    }

    generateEmployeeData(count) {
        const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
        const positions = ['Manager', 'Senior', 'Junior', 'Lead', 'Specialist'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Employee ${i + 1}`,
            email: `employee${i + 1}@company.com`,
            department: departments[Math.floor(Math.random() * departments.length)],
            position: positions[Math.floor(Math.random() * positions.length)],
            salary: (Math.random() * 20000 + 5000).toFixed(2),
            hireDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            performance: ['Excellent', 'Good', 'Average', 'Needs Improvement'][Math.floor(Math.random() * 4)]
        }));
    }

    // ==================== Data Statistics ====================
    
    calculateStatistics(data, column) {
        if (!data || data.length === 0) return null;
        
        const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && !isNaN(v));
        
        if (values.length === 0) return null;
        
        const numericValues = values.map(v => parseFloat(v));
        numericValues.sort((a, b) => a - b);
        
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const mean = sum / numericValues.length;
        const median = this.calculateMedian(numericValues);
        const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);
        
        return {
            count: numericValues.length,
            sum: sum.toFixed(2),
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            min: numericValues[0].toFixed(2),
            max: numericValues[numericValues.length - 1].toFixed(2),
            stdDev: stdDev.toFixed(2),
            variance: variance.toFixed(2)
        };
    }

    calculateMedian(values) {
        const mid = Math.floor(values.length / 2);
        return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    }

    calculateDistribution(data, column, bins = 10) {
        if (!data || data.length === 0) return null;
        
        const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && !isNaN(v));
        
        if (values.length === 0) return null;
        
        const numericValues = values.map(v => parseFloat(v));
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const binWidth = (max - min) / bins;
        
        const distribution = [];
        for (let i = 0; i < bins; i++) {
            const binStart = min + (i * binWidth);
            const binEnd = min + ((i + 1) * binWidth);
            const count = numericValues.filter(v => v >= binStart && v < binEnd).length;
            
            distribution.push({
                bin: i + 1,
                start: binStart.toFixed(2),
                end: binEnd.toFixed(2),
                count,
                percentage: ((count / numericValues.length) * 100).toFixed(2)
            });
        }
        
        return {
            column,
            totalValues: numericValues.length,
            min,
            max,
            binWidth: binWidth.toFixed(2),
            distribution
        };
    }

    // ==================== Utility Functions ====================
    
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async showDataPreview(data) {
        if (!data || data.length === 0) return;
        
        const columns = Object.keys(data[0]);
        const previewData = data.slice(0, 20);
        
        let html = `
            <div class="data-preview-modal">
                <div class="modal-content" style="max-width: 90vw; max-height: 80vh; overflow: auto;">
                    <div class="modal-header">
                        <h3><i class="fas fa-table"></i> Data Preview</h3>
                        <button class="icon-btn" onclick="this.closest('.data-preview-modal').remove()">✖</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
                            <strong>Total Records:</strong> ${data.length} | 
                            <strong>Columns:</strong> ${columns.length} |
                            <strong>Showing:</strong> First ${previewData.length} records
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        ${columns.map(col => `<th>${col}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${previewData.map(row => `
                                        <tr>
                                            ${columns.map(col => `<td>${row[col] !== null ? row[col] : ''}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${data.length > 20 ? `
                            <div style="margin-top: 15px; text-align: center; color: #666;">
                                <i class="fas fa-info-circle"></i> Showing first 20 of ${data.length} records
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal);
    }

    async showStatisticsModal(data) {
        if (!data || data.length === 0) return;
        
        const columns = Object.keys(data[0]);
        const numericColumns = columns.filter(col => {
            const values = data.slice(0, 10).map(row => row[col]);
            return values.some(v => typeof v === 'number' || !isNaN(parseFloat(v)));
        });
        
        let statsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">';
        
        numericColumns.forEach(col => {
            const stats = this.calculateStatistics(data, col);
            if (stats) {
                statsHtml += `
                    <div class="stat-card" style="padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
                        <h4 style="margin-top: 0; color: white;">${col}</h4>
                        <div style="font-size: 0.85rem; margin-top: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Count:</span>
                                <strong>${stats.count}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Mean:</span>
                                <strong>${stats.mean}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Median:</span>
                                <strong>${stats.median}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Min:</span>
                                <strong>${stats.min}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Max:</span>
                                <strong>${stats.max}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Std Dev:</span>
                                <strong>${stats.stdDev}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Sum:</span>
                                <strong>${stats.sum}</strong>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        statsHtml += '</div>';
        
        if (numericColumns.length === 0) {
            statsHtml = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-chart-bar fa-3x" style="margin-bottom: 15px; display: block;"></i>
                    <p>No numeric columns found for statistical analysis</p>
                </div>
            `;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3><i class="fas fa-chart-pie"></i> Data Statistics</h3>
                    <button class="icon-btn" onclick="this.closest('.modal').remove()">✖</button>
                </div>
                <div class="modal-body" style="max-height: 600px; overflow-y: auto;">
                    ${statsHtml}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Export the class
export { AnalyticsAdvanced };
