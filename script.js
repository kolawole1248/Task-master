/**
 * TaskManager Class - Main application controller
 * Handles all task operations, data persistence, and UI updates
 */
class TaskManager {
    constructor() {
        // Initialize tasks from localStorage or empty array
        this.tasks = this.loadTasks();
        this.currentFilter = 'all'; // Current active filter
        this.searchTerm = ''; // Current search term
        this.init(); // Initialize the application
    }

    /**
     * Initialize the application by binding events and rendering initial state
     */
    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    /**
     * Bind all DOM event listeners for user interactions
     */
    bindEvents() {
        // Handle form submission for adding new tasks
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Bind filter button click events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Bind search input for real-time filtering
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
    }

    /**
     * Add a new task from form data
     * Validates input, creates task object, and updates UI
     */
    addTask() {
        // Get form values
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;

        // Validate required title
        if (!title) {
            alert('Please enter a task title');
            return;
        }

        // Create new task object with unique ID and timestamp
        const task = {
            id: Date.now().toString(), // Unique identifier
            title,
            description,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString() // Track creation time
        };

        // Add to beginning of tasks array (newest first)
        this.tasks.unshift(task);
        this.saveTasks(); // Persist to localStorage
        this.render(); // Update UI
        this.updateStats(); // Refresh statistics
        this.resetForm(); // Clear form for next entry
    }

    /**
     * Prepare a task for editing by populating the form
     * @param {string} id - ID of task to edit
     */
    editTask(id) {
        // Find the task to edit
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        // Populate form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('dueDate').value = task.dueDate || '';
        document.getElementById('priority').value = task.priority;

        // Remove the task being edited from the list
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        this.updateStats();
    }

    /**
     * Delete a task after confirmation
     * @param {string} id - ID of task to delete
     */
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            // Filter out the deleted task
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    /**
     * Toggle task completion status
     * @param {string} id - ID of task to toggle
     */
    toggleTask(id) {
        // Map through tasks and toggle completion for matching ID
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.render();
        this.updateStats();
    }

    /**
     * Set the current filter and update UI
     * @param {string} filter - Filter type ('all', 'active', 'completed')
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button styling
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render(); // Re-render with new filter
    }

    /**
     * Get tasks filtered by current filter and search term
     * @returns {Array} Filtered array of tasks
     */
    getFilteredTasks() {
        let filtered = this.tasks;

        // Apply status-based filtering
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }

        // Apply search term filtering across title and description
        if (this.searchTerm) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(this.searchTerm) ||
                (task.description && task.description.toLowerCase().includes(this.searchTerm))
            );
        }

        return filtered;
    }

    /**
     * Render the tasks list based on current filters
     * Shows empty state when no tasks match filters
     */
    render() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        // Show empty state if no tasks match filters
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        // Hide empty state and render tasks
        emptyState.classList.add('hidden');
        
        // Generate HTML for each task using template literal
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
        `).join(''); // Join array into single string
    }

    /**
     * Update statistics display with current task counts
     */
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // Update DOM elements with current counts
        document.getElementById('taskCount').textContent = `(${totalTasks} tasks)`;
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
    }

    /**
     * Reset the task form to default state
     */
    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('priority').value = 'medium'; // Reset to default priority
    }

    /**
     * Save tasks to browser's localStorage
     */
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    /**
     * Load tasks from browser's localStorage
     * @returns {Array} Array of tasks or empty array if none saved
     */
    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML string
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when script loads
const taskManager = new TaskManager();

// Add sample tasks for demonstration if no tasks exist
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