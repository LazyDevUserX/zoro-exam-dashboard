// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Initialize modals
    initializeModals();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Initialize forms
    initializeForms();
    
    // Initialize toasts
    initializeToasts();
    
    // Load sample data if none exists
    loadSampleData();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding page
            const pageId = `${this.getAttribute('data-page')}-page`;
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.add('active');
                
                // Initialize page-specific content
                initializePage(pageId);
            }
        });
    });
}

// Initialize page-specific content
function initializePage(pageId) {
    switch (pageId) {
        case 'dashboard-page':
            updateDashboardStats();
            updateRecentExamsTable();
            initializeCharts();
            break;
        case 'history-page':
            updateHistoryTable();
            break;
        case 'analytics-page':
            initializeAnalyticsCharts();
            break;
        case 'settings-page':
            // Settings page doesn't need special initialization
            break;
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const stats = dataManager.getStatistics();
    
    document.getElementById('total-exams').textContent = stats.totalExams;
    document.getElementById('avg-score').textContent = `${stats.averageScore}%`;
    document.getElementById('best-score').textContent = `${stats.bestScore}%`;
    document.getElementById('last-score').textContent = `${stats.lastScore}%`;
}

// Update recent exams table
function updateRecentExamsTable() {
    const tbody = document.getElementById('recent-exams-tbody');
    const recentExams = dataManager.getRecentExams(5);
    
    tbody.innerHTML = '';
    
    if (recentExams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No exam data available</td>
            </tr>
        `;
        return;
    }
    
    recentExams.forEach(exam => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(exam.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Determine performance badge
        let performanceBadge = '';
        if (exam.percentage >= 90) {
            performanceBadge = '<span class="performance-badge excellent">Excellent</span>';
        } else if (exam.percentage >= 75) {
            performanceBadge = '<span class="performance-badge good">Good</span>';
        } else if (exam.percentage >= 60) {
            performanceBadge = '<span class="performance-badge average">Average</span>';
        } else {
            performanceBadge = '<span class="performance-badge poor">Poor</span>';
        }
        
        row.innerHTML = `
            <td>${exam.examName}</td>
            <td>${formattedDate}</td>
            <td>${exam.score}/${exam.total} (${exam.percentage}%)</td>
            <td>${performanceBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn small" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn small" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update history table
function updateHistoryTable() {
    const tbody = document.getElementById('history-tbody');
    const exams = dataManager.getAllExams();
    
    tbody.innerHTML = '';
    
    if (exams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No exam data available</td>
            </tr>
        `;
        return;
    }
    
    // Sort exams by date (newest first)
    const sortedExams = [...exams].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExams.forEach(exam => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(exam.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${exam.examName}</td>
            <td>${exam.subject || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${exam.score}/${exam.total} (${exam.percentage}%)</td>
            <td>${exam.correct}</td>
            <td>${exam.incorrect}</td>
            <td>${exam.notAttempted}</td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn small" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn small" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Initialize charts
function initializeCharts() {
    // Score Trend Chart
    const scoreTrendCtx = document.getElementById('score-trend-chart').getContext('2d');
    const exams = [...dataManager.getAllExams()].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    new Chart(scoreTrendCtx, {
        type: 'line',
        data: {
            labels: exams.map(exam => {
                const date = new Date(exam.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'Score Percentage',
                data: exams.map(exam => exam.percentage),
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointRadius: 4
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.raw}%`;
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
                        }
                    },
                    grid: {
                        color: 'rgba(229, 231, 235, 0.5)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Subject Performance Chart
    const subjectCtx = document.getElementById('subject-chart').getContext('2d');
    const stats = dataManager.getStatistics();
    const subjects = Object.keys(stats.subjects);
    
    new Chart(subjectCtx, {
        type: 'bar',
        data: {
            labels: subjects.map(subject => subject.charAt(0).toUpperCase() + subject.slice(1)),
            datasets: [{
                label: 'Average Score',
                data: subjects.map(subject => stats.subjects[subject].averageScore),
                backgroundColor: [
                    'rgba(79, 70, 229, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(14, 165, 233, 0.7)'
                ],
                borderColor: [
                    'rgba(79, 70, 229, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(14, 165, 233, 1)'
                ],
                borderWidth: 1,
                borderRadius: 6
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Average: ${context.raw.toFixed(1)}%`;
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
                        }
                    },
                    grid: {
                        color: 'rgba(229, 231, 235, 0.5)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    // Score Distribution Chart
    const scoreDistributionCtx = document.getElementById('score-distribution-chart').getContext('2d');
    const exams = dataManager.getAllExams();
    
    // Create score ranges
    const scoreRanges = {
        '0-59%': 0,
        '60-69%': 0,
        '70-79%': 0,
        '80-89%': 0,
        '90-100%': 0
    };
    
    exams.forEach(exam => {
        const score = exam.percentage;
        if (score < 60) scoreRanges['0-59%']++;
        else if (score < 70) scoreRanges['60-69%']++;
        else if (score < 80) scoreRanges['70-79%']++;
        else if (score < 90) scoreRanges['80-89%']++;
        else scoreRanges['90-100%']++;
    });
    
    new Chart(scoreDistributionCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(scoreRanges),
            datasets: [{
                data: Object.values(scoreRanges),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(14, 165, 233, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(14, 165, 233, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            cutout: '60%'
        }
    });
    
    // Improvement Over Time Chart
    const improvementCtx = document.getElementById('improvement-chart').getContext('2d');
    const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate moving average
    const windowSize = 3;
    const movingAverages = [];
    
    for (let i = 0; i < sortedExams.length; i++) {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(sortedExams.length, i + Math.ceil(windowSize / 2));
        const windowExams = sortedExams.slice(start, end);
        
        const average = windowExams.reduce((sum, exam) => sum + exam.percentage, 0) / windowExams.length;
        movingAverages.push(average);
    }
    
    new Chart(improvementCtx, {
        type: 'line',
        data: {
            labels: sortedExams.map((exam, index) => {
                const date = new Date(exam.date);
                return index % 2 === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            }),
            datasets: [
                {
                    label: 'Score',
                    data: sortedExams.map(exam => exam.percentage),
                    borderColor: 'rgba(79, 70, 229, 0.5)',
                    borderWidth: 1,
                    pointRadius: 2,
                    pointBackgroundColor: 'rgba(79, 70, 229, 0.5)',
                    tension: 0.1
                },
                {
                    label: 'Moving Average',
                    data: movingAverages,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
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
                        }
                    },
                    grid: {
                        color: 'rgba(229, 231, 235, 0.5)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Subject Comparison Chart
    const subjectComparisonCtx = document.getElementById('subject-comparison-chart').getContext('2d');
    const stats = dataManager.getStatistics();
    const subjects = Object.keys(stats.subjects);
    
    new Chart(subjectComparisonCtx, {
        type: 'radar',
        data: {
            labels: subjects.map(subject => subject.charAt(0).toUpperCase() + subject.slice(1)),
            datasets: [{
                label: 'Average Score',
                data: subjects.map(subject => stats.subjects[subject].averageScore),
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointRadius: 4
            }, {
                label: 'Best Score',
                data: subjects.map(subject => stats.subjects[subject].bestScore),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(229, 231, 235, 0.5)'
                    },
                    angleLines: {
                        color: 'rgba(229, 231, 235, 0.5)'
                    }
                }
            }
        }
    });
}

// Initialize modals
function initializeModals() {
    const addExamBtn = document.getElementById('add-exam-btn');
    const addExamModal = document.getElementById('add-exam-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelAddExamBtn = document.getElementById('cancel-add-exam');
    
    addExamBtn.addEventListener('click', function() {
        addExamModal.classList.add('active');
    });
    
    closeModalBtn.addEventListener('click', function() {
        addExamModal.classList.remove('active');
    });
    
    cancelAddExamBtn.addEventListener('click', function() {
        addExamModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    addExamModal.addEventListener('click', function(e) {
        if (e.target === addExamModal) {
            addExamModal.classList.remove('active');
        }
    });
}

// Initialize theme toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
    
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').classList.remove('fa-moon');
            themeToggle.querySelector('i').classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.querySelector('i').classList.remove('fa-sun');
            themeToggle.querySelector('i').classList.add('fa-moon');
        }
    });
}

// Initialize forms
function initializeForms() {
    const addExamForm = document.getElementById('add-exam-form');
    
    addExamForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const examData = {
            examName: document.getElementById('exam-name').value,
            subject: document.getElementById('exam-subject').value,
            date: document.getElementById('exam-date').value,
            total: parseInt(document.getElementById('total-questions').value),
            correct: parseInt(document.getElementById('correct-answers').value),
            incorrect: parseInt(document.getElementById('incorrect-answers').value),
            notAttempted: parseInt(document.getElementById('not-attempted').value),
            score: parseInt(document.getElementById('correct-answers').value)
        };
        
        if (dataManager.addExam(examData)) {
            // Close modal
            document.getElementById('add-exam-modal').classList.remove('active');
            
            // Reset form
            addExamForm.reset();
            
            // Show success toast
            showToast('Success', 'Your exam has been added successfully!');
            
            // Refresh dashboard
            updateDashboardStats();
            updateRecentExamsTable();
        } else {
            showToast('Error', 'Failed to add exam. Please try again.', 'error');
        }
    });
}

// Initialize toasts
function initializeToasts() {
    const toastCloseBtn = document.querySelector('.toast-close');
    
    toastCloseBtn.addEventListener('click', function() {
        const toast = document.getElementById('notification-toast');
        toast.classList.remove('show');
    });
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    const toastTitle = toast.querySelector('.toast-title');
    const toastDesc = toast.querySelector('.toast-desc');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastTitle.textContent = title;
    toastDesc.textContent = message;
    
    // Update icon based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon';
        toastIcon.style.color = '#10b981';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
        toastIcon.style.color = '#ef4444';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
        toastIcon.style.color = '#f59e0b';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle toast-icon';
        toastIcon.style.color = '#3b82f6';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load sample data if no data exists
function loadSampleData() {
    const exams = dataManager.getAllExams();
    
    if (exams.length === 0) {
        // Sample exam data
        const sampleExams = [
            {
                examName: 'Mathematics Midterm',
                subject: 'mathematics',
                date: '2023-10-15',
                total: 50,
                correct: 45,
                incorrect: 3,
                notAttempted: 2,
                score: 45,
                percentage: 90
            },
            {
                examName: 'Science Quiz',
                subject: 'science',
                date: '2023-10-10',
                total: 30,
                correct: 27,
                incorrect: 2,
                notAttempted: 1,
                score: 27,
                percentage: 90
            },
            {
                examName: 'History Test',
                subject: 'history',
                date: '2023-10-05',
                total: 40,
                correct: 32,
                incorrect: 5,
                notAttempted: 3,
                score: 32,
                percentage: 80
            },
            {
                examName: 'Literature Essay',
                subject: 'literature',
                date: '2023-09-28',
                total: 25,
                correct: 22,
                incorrect: 2,
                notAttempted: 1,
                score: 22,
                percentage: 88
            },
            {
                examName: 'Geography Exam',
                subject: 'geography',
                date: '2023-09-20',
                total: 35,
                correct: 30,
                incorrect: 3,
                notAttempted: 2,
                score: 30,
                percentage: 86
            }
        ];
        
        // Add sample exams
        sampleExams.forEach(exam => {
            dataManager.addExam(exam);
        });
        
        // Refresh dashboard
        updateDashboardStats();
        updateRecentExamsTable();
    }
}
