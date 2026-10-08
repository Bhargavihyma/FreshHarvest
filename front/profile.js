// Profile page functionality
let currentUser = null;
let orders = [];
let transactions = [];
let paymentCards = [];
let addresses = [];

// Sample data
const sampleOrders = [
    {
        id: 'ORD001',
        date: '2024-01-15',
        status: 'Delivered',
        total: 450,
        items: [
            { name: 'Fresh Tomatoes', quantity: 2, price: 40 },
            { name: 'Green Spinach', quantity: 1, price: 30 },
            { name: 'Organic Carrots', quantity: 3, price: 25 }
        ],
        deliveryAddress: 'Home - 123 Main Street, Mumbai'
    },
    {
        id: 'ORD002',
        date: '2024-01-12',
        status: 'In Transit',
        total: 320,
        items: [
            { name: 'Bell Peppers', quantity: 1, price: 80 },
            { name: 'Fresh Broccoli', quantity: 2, price: 60 },
            { name: 'Red Onions', quantity: 4, price: 20 }
        ],
        deliveryAddress: 'Office - 456 Business Park, Mumbai'
    },
    {
        id: 'ORD003',
        date: '2024-01-10',
        status: 'Processing',
        total: 280,
        items: [
            { name: 'Fresh Basil', quantity: 2, price: 35 },
            { name: 'Cucumber', quantity: 3, price: 15 },
            { name: 'Sweet Potatoes', quantity: 2, price: 45 }
        ],
        deliveryAddress: 'Home - 123 Main Street, Mumbai'
    }
];

const sampleTransactions = [
    { id: 'TXN001', date: '2024-01-15', type: 'Debit', amount: 450, description: 'Order Payment - ORD001' },
    { id: 'TXN002', date: '2024-01-14', type: 'Credit', amount: 500, description: 'Wallet Top-up' },
    { id: 'TXN003', date: '2024-01-12', type: 'Debit', amount: 320, description: 'Order Payment - ORD002' },
    { id: 'TXN004', date: '2024-01-10', type: 'Credit', amount: 1000, description: 'Welcome Bonus' }
];

const sampleCards = [
    {
        id: 'CARD001',
        type: 'Visa',
        last4: '4532',
        expiry: '12/26',
        isDefault: true
    },
    {
        id: 'CARD002',
        type: 'Mastercard',
        last4: '8901',
        expiry: '08/25',
        isDefault: false
    }
];

const sampleAddresses = [
    {
        id: 'ADDR001',
        type: 'Home',
        name: 'John Doe',
        address: '123 Main Street, Andheri West',
        city: 'Mumbai',
        pincode: '400058',
        phone: '+91 9876543210',
        isDefault: true,
        distance: 2.5
    },
    {
        id: 'ADDR002',
        type: 'Office',
        name: 'John Doe',
        address: '456 Business Park, Bandra Kurla Complex',
        city: 'Mumbai',
        pincode: '400051',
        phone: '+91 9876543210',
        isDefault: false,
        distance: 8.2
    }
];

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateProfileHeader();
    } else {
        // Redirect to home if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize data
    orders = [...sampleOrders];
    transactions = [...sampleTransactions];
    paymentCards = [...sampleCards];
    addresses = [...sampleAddresses];
    
    // Load initial tab content
    loadOrders();
    loadTransactions();
    loadPaymentCards();
    loadAddresses();
}

function updateProfileHeader() {
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
    }
}

function showProfileTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.profile-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.profile-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding panel
    const panel = document.getElementById(tabName);
    if (panel) {
        panel.classList.add('active');
    }
}

function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const statusClass = order.status.toLowerCase().replace(' ', '-');
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">
                <strong>Order #${order.id}</strong>
                <span class="order-date">${formatDate(order.date)}</span>
            </div>
            <div class="order-status ${statusClass}">
                <i class="fas fa-${getStatusIcon(order.status)}"></i>
                ${order.status}
            </div>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₹${item.price * item.quantity}</span>
                </div>
            `).join('')}
        </div>
        <div class="order-footer">
            <div class="order-address">
                <i class="fas fa-map-marker-alt"></i>
                ${order.deliveryAddress}
            </div>
            <div class="order-total">
                <strong>Total: ₹${order.total}</strong>
            </div>
        </div>
        <div class="order-actions">
            <button class="btn-secondary" onclick="trackOrder('${order.id}')">
                <i class="fas fa-truck"></i>
                Track Order
            </button>
            <button class="btn-primary" onclick="reorderItems('${order.id}')">
                <i class="fas fa-redo"></i>
                Reorder
            </button>
        </div>
    `;
    
    return card;
}

function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;
    
    transactionsList.innerHTML = '<h3>Recent Transactions</h3>';
    
    transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-desc">${transaction.description}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${transaction.type.toLowerCase()}">
                ${transaction.type === 'Credit' ? '+' : '-'}₹${transaction.amount}
            </div>
        `;
        transactionsList.appendChild(transactionItem);
    });
}

function loadPaymentCards() {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid) return;
    
    cardsGrid.innerHTML = '';
    
    paymentCards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsGrid.appendChild(cardElement);
    });
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'payment-card';
    cardDiv.innerHTML = `
        <div class="card-header">
            <div class="card-type">
                <i class="fab fa-cc-${card.type.toLowerCase()}"></i>
                ${card.type}
            </div>
            ${card.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="card-number">**** **** **** ${card.last4}</div>
        <div class="card-expiry">Expires: ${card.expiry}</div>
        <div class="card-actions">
            <button class="btn-secondary" onclick="editCard('${card.id}')">
                <i class="fas fa-edit"></i>
                Edit
            </button>
            <button class="btn-danger" onclick="deleteCard('${card.id}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;
    return cardDiv;
}

function loadAddresses() {
    const addressesGrid = document.getElementById('addressesGrid');
    if (!addressesGrid) return;
    
    addressesGrid.innerHTML = '';
    
    addresses.forEach(address => {
        const addressElement = createAddressElement(address);
        addressesGrid.appendChild(addressElement);
    });
}

function createAddressElement(address) {
    const addressDiv = document.createElement('div');
    addressDiv.className = 'address-card';
    addressDiv.innerHTML = `
        <div class="address-header">
            <div class="address-type">
                <i class="fas fa-${address.type.toLowerCase() === 'home' ? 'home' : 'building'}"></i>
                ${address.type}
            </div>
            ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="address-details">
            <div class="address-name">${address.name}</div>
            <div class="address-text">${address.address}</div>
            <div class="address-city">${address.city} - ${address.pincode}</div>
            <div class="address-phone">${address.phone}</div>
        </div>
        <div class="address-distance">
            <i class="fas fa-route"></i>
            Distance from store: ${address.distance} km
        </div>
        <div class="address-actions">
            <button class="btn-secondary" onclick="editAddress('${address.id}')">
                <i class="fas fa-edit"></i>
                Edit
            </button>
            <button class="btn-danger" onclick="deleteAddress('${address.id}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;
    return addressDiv;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusIcon(status) {
    switch (status.toLowerCase()) {
        case 'delivered': return 'check-circle';
        case 'in transit': return 'truck';
        case 'processing': return 'clock';
        default: return 'info-circle';
    }
}

// Action functions
function trackOrder(orderId) {
    showNotification(`Tracking order ${orderId}...`, 'info');
}

function reorderItems(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showNotification(`Added ${order.items.length} items to cart for reorder!`, 'success');
    }
}

function addMoney() {
    const amount = prompt('Enter amount to add to wallet:');
    if (amount && !isNaN(amount) && amount > 0) {
        const currentBalance = parseInt(document.getElementById('walletBalance').textContent);
        const newBalance = currentBalance + parseInt(amount);
        document.getElementById('walletBalance').textContent = newBalance;
        
        // Add transaction
        transactions.unshift({
            id: 'TXN' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'Credit',
            amount: parseInt(amount),
            description: 'Wallet Top-up'
        });
        
        loadTransactions();
        showNotification(`₹${amount} added to wallet successfully!`, 'success');
    }
}

function viewTransactions() {
    showNotification('Showing all transactions', 'info');
}

function addNewCard() {
    showNotification('Add new card functionality would open a form here', 'info');
}

function editCard(cardId) {
    showNotification(`Edit card ${cardId}`, 'info');
}

function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        paymentCards = paymentCards.filter(card => card.id !== cardId);
        loadPaymentCards();
        showNotification('Card deleted successfully!', 'success');
    }
}

function addNewAddress() {
    showNotification('Add new address functionality would open a form here', 'info');
}

function editAddress(addressId) {
    showNotification(`Edit address ${addressId}`, 'info');
}

function deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        addresses = addresses.filter(addr => addr.id !== addressId);
        loadAddresses();
        showNotification('Address deleted successfully!', 'success');
    }
}