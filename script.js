// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
    }

    addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;

        if (!title) return;

        const task = {
            id: Date.now().toString(),
            title,
            description,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.updateStats();
        this.resetForm();
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('dueDate').value = task.dueDate || '';
        document.getElementById('priority').value = task.priority;

        // Remove the task being edited
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        this.updateStats();
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.render();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTasks() {
        let filtered = this.tasks;

        // Apply status filter
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(this.searchTerm) ||
                (task.description && task.description.toLowerCase().includes(this.searchTerm))
            );
        }

        return filtered;
    }

    render() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask('${task.id}')"
                >
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `<span>📅 ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="taskManager.editTask('${task.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="taskManager.deleteTask('${task.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('taskCount').textContent = `(${totalTasks} tasks)`;
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('priority').value = 'medium';
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
const taskManager = new TaskManager();

// Add some sample tasks for demonstration
if (taskManager.tasks.length === 0) {
    const sampleTasks = [
        {
            id: '1',
            title: 'Welcome to TaskMaster Pro!',
            description: 'This is a sample task. You can edit or delete it.',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            priority: 'high',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Complete CSE 310 module',
            description: 'Work on the Web Apps module project',
            dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            title: 'Learn JavaScript ES6 features',
            description: 'Study arrow functions, destructuring, and modules',
            dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
            priority: 'low',
            completed: true,
            createdAt: new Date().toISOString()
        }
    ];
    
    taskManager.tasks = sampleTasks;
    taskManager.saveTasks();
    taskManager.render();
    taskManager.updateStats();
}