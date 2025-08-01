// Data Manager for handling exam data
class DataManager {
    constructor() {
        this.storageKey = 'zoroExamHistory';
        this.data = this.loadData();
    }

    // Load data from localStorage
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Add a new exam
    addExam(exam) {
        // Generate a unique ID for the exam
        exam.id = `exam-${Date.now()}`;
        exam.date = exam.date || new Date().toISOString().split('T')[0];
        
        // Calculate percentage if not provided
        if (!exam.percentage) {
            exam.percentage = Math.round((exam.score / exam.total) * 100);
        }
        
        // Calculate not attempted if not provided
        if (exam.notAttempted === undefined) {
            exam.notAttempted = exam.total - exam.correct - exam.incorrect;
        }
        
        this.data.push(exam);
        return this.saveData();
    }

    // Update an existing exam
    updateExam(id, updatedExam) {
        const index = this.data.findIndex(exam => exam.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updatedExam };
            return this.saveData();
        }
        return false;
    }

    // Delete an exam
    deleteExam(id) {
        const index = this.data.findIndex(exam => exam.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            return this.saveData();
        }
        return false;
    }

    // Get all exams
    getAllExams() {
        return this.data;
    }

    // Get recent exams (limit to specified number)
    getRecentExams(limit = 5) {
        return [...this.data]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Get exams by subject
    getExamsBySubject(subject) {
        return this.data.filter(exam => exam.subject === subject);
    }

    // Get exam statistics
    getStatistics() {
        if (this.data.length === 0) {
            return {
                totalExams: 0,
                averageScore: 0,
                bestScore: 0,
                lastScore: 0,
                totalCorrect: 0,
                totalIncorrect: 0,
                totalNotAttempted: 0,
                subjects: {}
            };
        }

        const totalExams = this.data.length;
        const averageScore = this.data.reduce((sum, exam) => sum + exam.percentage, 0) / totalExams;
        const bestScore = Math.max(...this.data.map(exam => exam.percentage));
        const lastExam = [...this.data].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const lastScore = lastExam ? lastExam.percentage : 0;
        
        const totalCorrect = this.data.reduce((sum, exam) => sum + exam.correct, 0);
        const totalIncorrect = this.data.reduce((sum, exam) => sum + exam.incorrect, 0);
        const totalNotAttempted = this.data.reduce((sum, exam) => sum + exam.notAttempted, 0);
        
        // Group by subject
        const subjects = {};
        this.data.forEach(exam => {
            if (!subjects[exam.subject]) {
                subjects[exam.subject] = {
                    count: 0,
                    totalScore: 0,
                    bestScore: 0,
                    averageScore: 0
                };
            }
            
            subjects[exam.subject].count++;
            subjects[exam.subject].totalScore += exam.percentage;
            subjects[exam.subject].bestScore = Math.max(subjects[exam.subject].bestScore, exam.percentage);
        });
        
        // Calculate average for each subject
        Object.keys(subjects).forEach(subject => {
            subjects[subject].averageScore = subjects[subject].totalScore / subjects[subject].count;
        });
        
        return {
            totalExams,
            averageScore: parseFloat(averageScore.toFixed(1)),
            bestScore,
            lastScore,
            totalCorrect,
            totalIncorrect,
            totalNotAttempted,
            subjects
        };
    }

    // Export data as JSON
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data from JSON
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            if (Array.isArray(importedData)) {
                this.data = importedData;
                return this.saveData();
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearData() {
        this.data = [];
        return this.saveData();
    }
}

// Initialize the data manager
const dataManager = new DataManager();
