
// Sample circle data
const circles = [
    {
        id: 1,
        name: "Family Vacation Fund",
        targetAmount: 20000,
        currentAmount: 15000,
        members: 5,
        deadline: "2024-12-31"
    },
    {
        id: 2,
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 3000,
        members: 3,
        deadline: "2024-06-30"
    }
];

// Format currency
function formatCurrency(amount) {
    return `R${amount.toLocaleString()}`;
}

// Calculate progress percentage
function calculateProgress(current, target) {
    return (current / target) * 100;
}

// Render circles
function renderCircles() {
    const circlesList = document.getElementById('circlesList');
    circlesList.innerHTML = circles.map(circle => `
        <div class="circle-card">
            <h3>${circle.name}</h3>
            <div class="circle-stats">
                <span>${formatCurrency(circle.currentAmount)}</span>
                <span>of ${formatCurrency(circle.targetAmount)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${calculateProgress(circle.currentAmount, circle.targetAmount)}%"></div>
            </div>
            <div class="circle-stats">
                <span>${circle.members} members</span>
                <span>Due: ${new Date(circle.deadline).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderCircles();
});
