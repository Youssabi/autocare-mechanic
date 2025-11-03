// Check if admin is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not authenticated
        window.location.href = 'admin-login.html';
    }
}

// Call checkAuth on page load
checkAuth();

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-AU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    document.getElementById('currentTime').textContent = `${dateString} | ${timeString}`;
}

// Update time every second
updateTime();
setInterval(updateTime, 1000);

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('loginTime');
        window.location.href = 'admin-login.html';
    }
}

// Load bookings from localStorage
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    return bookings;
}

// Display bookings in the table
function displayBookings(bookingsToDisplay = null) {
    const bookings = bookingsToDisplay || loadBookings();
    const tbody = document.getElementById('bookingsTableBody');
    const noBookingsMsg = document.getElementById('noBookings');
    
    // Update statistics
    updateStatistics(bookings);
    
    if (bookings.length === 0) {
        tbody.innerHTML = '';
        noBookingsMsg.style.display = 'block';
        return;
    }
    
    noBookingsMsg.style.display = 'none';
    
    // Sort bookings by date and time (most recent first)
    bookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });
    
    tbody.innerHTML = bookings.map((booking, index) => `
        <tr>
            <td>${formatDate(booking.date)}</td>
            <td>${formatTime(booking.time)}</td>
            <td><strong>${booking.name}</strong></td>
            <td>${booking.vehicle}</td>
            <td>${formatService(booking.service)}</td>
            <td>
                <div>${booking.phone}</div>
                <div style="font-size: 0.85rem; color: #666;">${booking.email}</div>
            </td>
            <td>
                <span class="status-badge status-${booking.status || 'pending'}">
                    ${booking.status || 'Pending'}
                </span>
            </td>
            <td>
                <button onclick="updateStatus(${index})" class="control-btn" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;">
                    Update
                </button>
                <button onclick="deleteBooking(${index})" class="control-btn danger" style="padding: 0.3rem 0.6rem; font-size: 0.85rem; margin-left: 0.25rem;">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStatistics(bookings) {
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('totalBookings').textContent = bookings.length;
    
    const todayCount = bookings.filter(b => b.date === today).length;
    document.getElementById('todayBookings').textContent = todayCount;
    
    const pendingCount = bookings.filter(b => !b.status || b.status === 'pending').length;
    document.getElementById('pendingBookings').textContent = pendingCount;
    
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    document.getElementById('completedBookings').textContent = completedCount;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Format service name
function formatService(service) {
    return service.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Refresh bookings
function refreshBookings() {
    displayBookings();
    // Show a brief success message
    showNotification('Bookings refreshed successfully!');
}

// Search bookings
function searchBookings() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const bookings = loadBookings();
    
    if (!searchTerm) {
        displayBookings();
        return;
    }
    
    const filtered = bookings.filter(booking => 
        booking.name.toLowerCase().includes(searchTerm) ||
        booking.email.toLowerCase().includes(searchTerm) ||
        booking.vehicle.toLowerCase().includes(searchTerm) ||
        booking.service.toLowerCase().includes(searchTerm)
    );
    
    displayBookings(filtered);
}

// Update booking status
function updateStatus(index) {
    const bookings = loadBookings();
    const booking = bookings[index];
    
    const newStatus = prompt('Update status (pending/confirmed/completed):', booking.status || 'pending');
    
    if (newStatus && ['pending', 'confirmed', 'completed'].includes(newStatus.toLowerCase())) {
        bookings[index].status = newStatus.toLowerCase();
        localStorage.setItem('bookings', JSON.stringify(bookings));
        displayBookings();
        showNotification('Status updated successfully!');
    }
}

// Delete a booking
function deleteBooking(index) {
    if (confirm('Are you sure you want to delete this booking?')) {
        const bookings = loadBookings();
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        displayBookings();
        showNotification('Booking deleted successfully!');
    }
}

// Clear all bookings
function clearAllBookings() {
    if (confirm('⚠️ WARNING: This will permanently delete ALL bookings. Are you sure?')) {
        if (confirm('This action cannot be undone. Type "DELETE" to confirm.')) {
            localStorage.removeItem('bookings');
            displayBookings();
            showNotification('All bookings have been cleared!');
        }
    }
}

// Export bookings to CSV
function exportBookings() {
    const bookings = loadBookings();
    
    if (bookings.length === 0) {
        alert('No bookings to export!');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Time', 'Name', 'Email', 'Phone', 'Vehicle', 'Service', 'Notes', 'Status'];
    const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
            booking.date,
            booking.time,
            `"${booking.name}"`,
            booking.email,
            booking.phone,
            `"${booking.vehicle}"`,
            booking.service,
            `"${booking.notes || ''}"`,
            booking.status || 'pending'
        ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('Bookings exported successfully!');
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Placeholder functions for quick actions
function viewReports() {
    alert('Reports feature coming soon! This will show detailed analytics and insights.');
}

function manageServices() {
    alert('Service management feature coming soon! This will allow you to add/edit available services.');
}

function viewCustomers() {
    alert('Customer database feature coming soon! This will show all customer information and history.');
}

function settings() {
    alert('Settings feature coming soon! This will allow you to configure system preferences.');
}

// Auto-refresh bookings every 30 seconds
setInterval(refreshBookings, 30000);

// Initial load
displayBookings();

// Add search on Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBookings();
    }
});

// Session timeout (auto-logout after 30 minutes of inactivity)
let inactivityTimeout;

function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        alert('Session expired due to inactivity. Please login again.');
        logout();
    }, 30 * 60 * 1000); // 30 minutes
}

// Reset timer on any activity
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
resetInactivityTimer();
