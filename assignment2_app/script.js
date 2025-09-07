// AI Task Manager - Main JavaScript File

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.currentPriorityFilter = 'all';
        this.currentView = 'cards';
        this.editingTaskId = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.generateAIInsights();
        
        // Set minimum date to today for due date input
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDueDate').min = today;
    }

    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Priority filter buttons
        document.querySelectorAll('.priority-filter').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePriorityFilterChange(e));
        });
        
        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewChange(e));
        });
        
        // AI features
        document.getElementById('aiSuggestBtn').addEventListener('click', () => this.showAISuggestions());
        document.getElementById('dailySummaryBtn').addEventListener('click', () => this.showDailySummary());
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openTaskModal();
            }
        });
    }

    // Task CRUD Operations
    createTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description || '',
            dueDate: taskData.dueDate || null,
            priority: taskData.priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.generateAIInsights();
        
        // Show success notification
        this.showNotification('Task created successfully!', 'success');
        
        return task;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.generateAIInsights();
            
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    deleteTask(taskId) {
        console.log('Delete task called with ID:', taskId); // Debug log
        console.log('Current tasks:', this.tasks.map(t => ({id: t.id, title: t.title}))); // Debug log
        
        if (confirm('Are you sure you want to delete this task?')) {
            const initialLength = this.tasks.length;
            
            // Find the task first to verify it exists
            const taskToDelete = this.tasks.find(task => task.id === taskId);
            console.log('Task to delete:', taskToDelete); // Debug log
            
            if (!taskToDelete) {
                this.showNotification('Error: Task not found', 'error');
                console.error('Task not found with ID:', taskId);
                return;
            }
            
            // Remove the task
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            console.log('Tasks after filter:', this.tasks.length); // Debug log
            
            // Verify deletion occurred
            if (this.tasks.length < initialLength) {
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.generateAIInsights();
                
                this.showNotification('Task deleted successfully!', 'success');
                console.log('Task deleted successfully'); // Debug log
            } else {
                this.showNotification('Error: Task could not be deleted', 'error');
                console.error('Delete failed for task ID:', taskId);
            }
        }
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.generateAIInsights();
            
            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }

    // UI Rendering
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');
        
        let filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        emptyState.style.display = 'none';
        
        // Apply view class
        container.className = `tasks-container ${this.currentView}-view`;
        
        container.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        
        // Bind task-specific events
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        const dueDateText = dueDate ? dueDate.toLocaleDateString() : 'No due date';
        
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-priority-indicator ${task.priority}"></div>
                
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    </div>
                    
                    <div class="task-actions">
                        <button class="task-action-btn complete" data-action="complete" data-task-id="${task.id}" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
                            <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="task-action-btn edit" data-action="edit" data-task-id="${task.id}" title="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete" data-action="delete" data-task-id="${task.id}" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="task-meta">
                    <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i class="fas fa-calendar"></i>
                        ${dueDateText}
                    </span>
                    <span class="task-priority-badge ${task.priority}">
                        ${task.priority}
                    </span>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        // Remove existing event listeners to prevent duplicates
        const container = document.getElementById('tasksContainer');
        
        // Use event delegation on the container instead of individual elements
        container.removeEventListener('click', this.handleTaskContainerClick);
        container.addEventListener('click', this.handleTaskContainerClick.bind(this));
    }
    
    handleTaskContainerClick(e) {
        // Handle task action buttons
        if (e.target.closest('.task-action-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.task-action-btn');
            const action = btn.dataset.action;
            const taskId = btn.dataset.taskId;
            
            console.log('Action clicked:', action, 'Task ID:', taskId); // Debug log
            
            switch(action) {
                case 'complete':
                    this.toggleTaskCompletion(taskId);
                    break;
                case 'edit':
                    this.editTask(taskId);
                    break;
                case 'delete':
                    this.deleteTask(taskId);
                    break;
            }
            return;
        }
        
        // Handle task card click to edit (excluding action buttons)
        const taskCard = e.target.closest('.task-card');
        if (taskCard && !e.target.closest('.task-actions')) {
            const taskId = taskCard.dataset.taskId;
            this.editTask(taskId);
        }
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            // Status filter
            if (this.currentFilter === 'completed' && !task.completed) return false;
            if (this.currentFilter === 'pending' && task.completed) return false;
            
            // Priority filter
            if (this.currentPriorityFilter !== 'all' && task.priority !== this.currentPriorityFilter) return false;
            
            return true;
        });
    }

    // Modal Management
    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('modalTitle');
        
        if (task) {
            // Edit mode
            title.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority;
            this.editingTaskId = task.id;
        } else {
            // Create mode
            title.textContent = 'Add New Task';
            form.reset();
            this.editingTaskId = null;
        }
        
        modal.classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.editingTaskId = null;
    }

    closeSummaryModal() {
        document.getElementById('summaryModal').classList.remove('active');
    }

    closeAiModal() {
        document.getElementById('aiModal').classList.remove('active');
    }

    closeAllModals() {
        this.closeTaskModal();
        this.closeSummaryModal();
        this.closeAiModal();
    }

    // Event Handlers
    handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            dueDate: formData.get('dueDate'),
            priority: formData.get('priority')
        };
        
        if (!taskData.title) {
            this.showNotification('Please enter a task title', 'error');
            return;
        }
        
        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData);
        } else {
            this.createTask(taskData);
        }
        
        this.closeTaskModal();
    }

    handleFilterChange(e) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
    }

    handlePriorityFilterChange(e) {
        document.querySelectorAll('.priority-filter').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentPriorityFilter = e.target.dataset.priority;
        this.renderTasks();
    }

    handleViewChange(e) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentView = e.target.dataset.view;
        this.renderTasks();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.openTaskModal(task);
        }
    }

    // Statistics and Analytics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    // AI Features
    generateAIInsights() {
        this.updatePriorityRecommendation();
        this.updateAISuggestions();
    }

    updatePriorityRecommendation() {
        const pendingTasks = this.tasks.filter(task => !task.completed);
        const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
        const overdueTasks = pendingTasks.filter(task => {
            if (!task.dueDate) return false;
            return new Date(task.dueDate) < new Date();
        });
        
        let recommendation = '';
        
        if (overdueTasks.length > 0) {
            recommendation = `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Focus on completing them first!`;
        } else if (highPriorityTasks.length > 0) {
            recommendation = `You have ${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's' : ''}. Consider tackling them next.`;
        } else if (pendingTasks.length > 0) {
            recommendation = 'Great job! No urgent tasks. Focus on medium-priority items to stay productive.';
        } else {
            recommendation = '🎉 All tasks completed! Time to add new goals or take a well-deserved break.';
        }
        
        document.getElementById('priorityText').textContent = recommendation;
    }

    updateAISuggestions() {
        const suggestions = this.generateTaskSuggestions();
        const container = document.getElementById('suggestionsContainer');
        
        if (suggestions.length === 0) {
            container.innerHTML = '<p>Complete a few tasks to get personalized AI suggestions!</p>';
            return;
        }
        
        container.innerHTML = suggestions.slice(0, 3).map(suggestion => 
            `<div class="ai-suggestion-preview">💡 ${suggestion}</div>`
        ).join('');
    }

    generateTaskSuggestions() {
        const completedTasks = this.tasks.filter(task => task.completed);
        const suggestions = [];
        
        // Analyze patterns in completed tasks
        const taskPatterns = this.analyzeTaskPatterns(completedTasks);
        
        // Generate suggestions based on patterns
        if (taskPatterns.hasWorkTasks) {
            suggestions.push('Schedule a team meeting to discuss project progress');
            suggestions.push('Review and update project documentation');
            suggestions.push('Plan next week\'s work priorities');
        }
        
        if (taskPatterns.hasPersonalTasks) {
            suggestions.push('Set aside time for personal development');
            suggestions.push('Plan a healthy meal for tomorrow');
            suggestions.push('Schedule exercise or outdoor activity');
        }
        
        if (taskPatterns.hasLearningTasks) {
            suggestions.push('Research new industry trends');
            suggestions.push('Take an online course or tutorial');
            suggestions.push('Read an article related to your field');
        }
        
        // Default suggestions
        if (suggestions.length === 0) {
            suggestions.push(
                'Review your goals for this week',
                'Plan tomorrow\'s priorities',
                'Take a 15-minute break to recharge',
                'Organize your workspace',
                'Connect with a colleague or friend'
            );
        }
        
        return suggestions;
    }

    analyzeTaskPatterns(tasks) {
        const patterns = {
            hasWorkTasks: false,
            hasPersonalTasks: false,
            hasLearningTasks: false
        };
        
        const workKeywords = ['meeting', 'project', 'work', 'client', 'report', 'presentation'];
        const personalKeywords = ['exercise', 'health', 'family', 'home', 'personal'];
        const learningKeywords = ['learn', 'study', 'course', 'read', 'research', 'skill'];
        
        tasks.forEach(task => {
            const text = (task.title + ' ' + task.description).toLowerCase();
            
            if (workKeywords.some(keyword => text.includes(keyword))) {
                patterns.hasWorkTasks = true;
            }
            if (personalKeywords.some(keyword => text.includes(keyword))) {
                patterns.hasPersonalTasks = true;
            }
            if (learningKeywords.some(keyword => text.includes(keyword))) {
                patterns.hasLearningTasks = true;
            }
        });
        
        return patterns;
    }

    showAISuggestions() {
        const modal = document.getElementById('aiModal');
        const content = document.getElementById('aiSuggestionsContent');
        
        const suggestions = this.generateTaskSuggestions();
        
        content.innerHTML = `
            <div class="ai-suggestions-header">
                <p>Based on your task patterns, here are some AI-generated suggestions:</p>
            </div>
            
            <div class="ai-suggestions-list">
                ${suggestions.map((suggestion, index) => `
                    <div class="ai-suggestion-item">
                        <div class="suggestion-text">
                            <i class="fas fa-lightbulb"></i>
                            ${suggestion}
                        </div>
                        <div class="suggestion-actions">
                            <button class="btn btn-primary btn-sm" onclick="taskManager.addSuggestionAsTask('${suggestion.replace(/'/g, "\\'")}')">
                                <i class="fas fa-plus"></i>
                                Add as Task
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        modal.classList.add('active');
    }

    addSuggestionAsTask(suggestion) {
        this.createTask({
            title: suggestion,
            description: 'Generated by AI based on your task patterns',
            priority: 'medium'
        });
        
        this.closeAiModal();
    }

    showDailySummary() {
        const modal = document.getElementById('summaryModal');
        const content = document.getElementById('summaryContent');
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const todayTasks = this.tasks.filter(task => {
            if (!task.completedAt) return false;
            return task.completedAt.split('T')[0] === todayStr;
        });
        
        const todayCompleted = todayTasks.length;
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const highPriorityPending = this.tasks.filter(task => !task.completed && task.priority === 'high').length;
        
        const productivity = totalTasks > 0 ? Math.round((todayCompleted / totalTasks) * 100) : 0;
        
        content.innerHTML = `
            <div class="summary-stats">
                <div class="summary-stat">
                    <span class="summary-stat-number">${todayCompleted}</span>
                    <span class="summary-stat-label">Completed Today</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-number">${pendingTasks}</span>
                    <span class="summary-stat-label">Still Pending</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-number">${productivity}%</span>
                    <span class="summary-stat-label">Productivity</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-number">${highPriorityPending}</span>
                    <span class="summary-stat-label">High Priority Left</span>
                </div>
            </div>
            
            <div class="summary-insights">
                <h3>📊 Daily Insights</h3>
                ${this.generateDailyInsights(todayCompleted, pendingTasks, highPriorityPending)}
            </div>
            
            ${todayTasks.length > 0 ? `
                <div class="completed-tasks-today">
                    <h3>✅ Completed Today</h3>
                    <ul>
                        ${todayTasks.map(task => `<li>${this.escapeHtml(task.title)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        
        modal.classList.add('active');
    }

    generateDailyInsights(completed, pending, highPriority) {
        let insights = [];
        
        if (completed === 0) {
            insights.push('🎯 No tasks completed today. Consider starting with a small, achievable task to build momentum.');
        } else if (completed === 1) {
            insights.push('👍 Good start! You completed 1 task today. Keep the momentum going.');
        } else if (completed <= 3) {
            insights.push('🚀 Great progress! You completed ' + completed + ' tasks today. You\'re on a roll!');
        } else {
            insights.push('🏆 Excellent work! You completed ' + completed + ' tasks today. You\'re highly productive!');
        }
        
        if (highPriority > 0) {
            insights.push(`⚠️ You have ${highPriority} high-priority task${highPriority > 1 ? 's' : ''} remaining. Consider tackling them tomorrow.`);
        }
        
        if (pending === 0) {
            insights.push('🎉 Amazing! No pending tasks. You\'re all caught up!');
        } else if (pending <= 3) {
            insights.push(`📝 You have ${pending} task${pending > 1 ? 's' : ''} remaining. Almost there!`);
        }
        
        return insights.map(insight => `<p>${insight}</p>`).join('');
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.showNotification(`Switched to ${this.currentTheme} theme`, 'success');
    }
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Utility Functions
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function openTaskModal() {
    taskManager.openTaskModal();
}

function closeTaskModal() {
    taskManager.closeTaskModal();
}

function closeSummaryModal() {
    taskManager.closeSummaryModal();
}

function closeAiModal() {
    taskManager.closeAiModal();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Add notification animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
