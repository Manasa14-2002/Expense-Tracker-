let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const authPopup = document.getElementById('auth-popup');
const closePopup = document.getElementById('close-popup');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const inputSection = document.getElementById('input-section');
const expensesList = document.getElementById('expenses-list');
const authPopupTitle = document.getElementById('auth-popup-title');
const chartContainer = document.querySelector('.chart-container');

const ctx = document.getElementById('pieChart').getContext('2d');
let pieChart;

function getCurrentUserExpenses() {
    return JSON.parse(localStorage.getItem(currentUser.username + '_expenses')) || [];
}

function saveCurrentUserExpenses(expenses) {
    localStorage.setItem(currentUser.username + '_expenses', JSON.stringify(expenses));
}

function updateTotalAmount() {
    const expenses = getCurrentUserExpenses();
    const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    totalAmountCell.textContent = totalAmount;
}

addBtn.addEventListener('click', function() {
    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (category === '') {
        alert('Please select a category');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (date === '') {
        alert('Please select a date');
        return;
    }

    const expenses = getCurrentUserExpenses();
    const expense = { category, amount, date };
    expenses.push(expense);
    saveCurrentUserExpenses(expenses);

    addExpenseRow(expense);
    updateChart();
    updateTotalAmount();
});

function addExpenseRow(expense) {
    const newRow = expensesTableBody.insertRow();
    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement('button');

    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        let expenses = getCurrentUserExpenses();
        expenses = expenses.filter(e => e !== expense);
        saveCurrentUserExpenses(expenses);
        expensesTableBody.removeChild(newRow);
        updateChart();
        updateTotalAmount();
    });

    categoryCell.textContent = expense.category;
    amountCell.textContent = expense.amount;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(deleteBtn);
}

function updateChart() {
    const expenses = getCurrentUserExpenses();
    const categories = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
    };

    if (pieChart) {
        pieChart.data = data;
        pieChart.update();
    } else {
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: $${value}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

loginBtn.addEventListener('click', function() {
    authPopup.style.display = 'block';
    authPopupTitle.textContent = 'Login';
    authSubmitBtn.textContent = 'Login';
});

registerBtn.addEventListener('click', function() {
    authPopup.style.display = 'block';
    authPopupTitle.textContent = 'Register';
    authSubmitBtn.textContent = 'Register';
});

closePopup.addEventListener('click', function() {
    authPopup.style.display = 'none';
});

authSubmitBtn.addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === '' || password === '') {
        alert('Please enter both username and password');
        return;
    }

    if (authSubmitBtn.textContent === 'Register') {
        if (registeredUsers.some(user => user.username === username)) {
            alert('User already registered');
            return;
        }

        registeredUsers.push({ username, password });
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        alert('Registration successful! Please log in.');
        authPopupTitle.textContent = 'Login';
        authSubmitBtn.textContent = 'Login';
    } else {
        const user = registeredUsers.find(user => user.username === username && user.password === password);

        if (!user) {
            alert('Invalid username or password');
            return;
        }

        alert('Login successful!');
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        inputSection.style.display = 'block';
        expensesList.style.display = 'block';
        chartContainer.classList.remove('hidden');
        authPopup.style.display = 'none';
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';

        // Load current user's expenses
        expensesTableBody.innerHTML = ''; // Clear previous data
        const userExpenses = getCurrentUserExpenses();
        userExpenses.forEach(expense => addExpenseRow(expense));
        updateTotalAmount();
        updateChart();
    }
});

logoutBtn.addEventListener('click', function() {
    alert('Logout successful!');
    currentUser = null;
    localStorage.removeItem('currentUser');
    inputSection.style.display = 'none';
    expensesList.style.display = 'none';
    chartContainer.classList.add('hidden');
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
});

if (currentUser) {
    inputSection.style.display = 'block';
    expensesList.style.display = 'block';
    chartContainer.classList.remove('hidden');
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';

    // Load current user's expenses
    expensesTableBody.innerHTML = ''; // Clear previous data
    const userExpenses = getCurrentUserExpenses();
    userExpenses.forEach(expense => addExpenseRow(expense));
    updateTotalAmount();
    updateChart();
} else {
    inputSection.style.display = 'none';
    expensesList.style.display = 'none';
    chartContainer.classList.add('hidden');
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
}
