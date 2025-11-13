// Dashboard functionality for AutoCare Mechanic Admin - LOCALSTORAGE VERSION

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // Load appointments
    loadAppointments();
    
    // Set up auto-refresh every 30 seconds
    setInterval(loadAppointments, 30000);
});

let allAppointments = [];
let currentAppointment = null;

// Load appointments from localStorage
function loadAppointments() {
    const loading = document.getElementById('loading');
    const noData = document.getElementById('noData');
    const tableContainer = document.getElementById('tableContainer');
    
    loading.style.display = 'block';
    noData.style.display = 'none';
    tableContainer.style.display = 'none';
    
    try {
        // Load from localStorage instead of API
        const storedAppointments = localStorage.getItem('appointments');
        allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
        
        // Sort by date (newest first)
        allAppointments.sort((a, b) => {
            const dateA = new Date(a.created_at || a.booking_date);
            const dateB = new Date(b.created_at || b.booking_date);
            return dateB - dateA;
        });
        
        // Update stats
        updateStats();
        
        // Display appointments
        displayAppointments(allAppointments);
        
        loading.style.display = 'none';
        
        if (allAppointments.length === 0) {
            noData.style.display = 'block';
        } else {
            tableContainer.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        loading.style.display = 'none';
        noData.style.display = 'block';
        alert('Failed to load appointments. Please refresh the page.');
    }
}

// Update statistics
function updateStats() {
    const pending = allAppointments.filter(a => a.status === 'pending').length;
    const confirmed = allAppointments.filter(a => a.status === 'confirmed').length;
    const completed = allAppointments.filter(a => a.status === 'completed').length;
    const total = allAppointments.length;
    
    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = allAppointments.filter(a => a.preferred_date === today).length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('confirmedCount').textContent = confirmed;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;
    
    // Update today's count if element exists
    if (document.getElementById('todayCount')) {
        document.getElementById('todayCount').textContent = todayAppointments;
    }
}

// Display appointments in table
function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsBody');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No appointments found</td></tr>';
        return;
    }
    
    appointments.forEach((appointment, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td data-label="Date & Time">
                <div><strong>${formatDate(appointment.preferred_date)}</strong></div>
                <div style="color: #64748b; font-size: 0.9rem;">${appointment.preferred_time}</div>
            </td>
            <td data-label="Customer">
                <div><strong>${appointment.customer_name}</strong></div>
            </td>
            <td data-label="Contact">
                <div style="font-size: 0.9rem;">
                    <div><i class="fas fa-envelope"></i> ${appointment.customer_email}</div>
                    <div><i class="fas fa-phone"></i> ${appointment.customer_phone}</div>
                </div>
            </td>
            <td data-label="Service">
                <span style="color: var(--primary-color); font-weight: 600;">${appointment.service_type}</span>
            </td>
            <td data-label="Vehicle">${appointment.vehicle_info}</td>
            <td data-label="Status">
                <span class="status-badge ${appointment.status}">${capitalizeFirst(appointment.status)}</span>
            </td>
            <td data-label="Actions">
                <div class="action-buttons">
                    <button onclick="viewDetails(${index})" class="btn-action" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editAppointment(${index})" class="btn-action" title="Edit Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAppointment(${index})" class="btn-action btn-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// View appointment details
function viewDetails(index) {
    const appointment = allAppointments[index];
    currentAppointment = appointment;
    
    const modal = document.getElementById('detailsModal');
    const details = document.getElementById('appointmentDetails');
    
    details.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <strong>Customer Name:</strong>
                <span>${appointment.customer_name}</span>
            </div>
            <div class="detail-item">
                <strong>Email:</strong>
                <span><a href="mailto:${appointment.customer_email}">${appointment.customer_email}</a></span>
            </div>
            <div class="detail-item">
                <strong>Phone:</strong>
                <span><a href="tel:${appointment.customer_phone}">${appointment.customer_phone}</a></span>
            </div>
            <div class="detail-item">
                <strong>Service Type:</strong>
                <span>${appointment.service_type}</span>
            </div>
            <div class="detail-item">
                <strong>Vehicle:</strong>
                <span>${appointment.vehicle_info}</span>
            </div>
            <div class="detail-item">
                <strong>Preferred Date:</strong>
                <span>${formatDate(appointment.preferred_date)}</span>
            </div>
            <div class="detail-item">
                <strong>Preferred Time:</strong>
                <span>${appointment.preferred_time}</span>
            </div>
            <div class="detail-item">
                <strong>Status:</strong>
                <span class="status-badge ${appointment.status}">${capitalizeFirst(appointment.status)}</span>
            </div>
            <div class="detail-item full-width">
                <strong>Additional Notes:</strong>
                <span>${appointment.additional_notes || 'None'}</span>
            </div>
            <div class="detail-item full-width">
                <strong>Booking Date:</strong>
                <span>${new Date(appointment.booking_date).toLocaleString('en-AU')}</span>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Edit appointment (change status)
function editAppointment(index) {
    const appointment = allAppointments[index];
    const newStatus = prompt(`Change status for ${appointment.customer_name}'s appointment?\n\nCurrent status: ${appointment.status}\n\nEnter new status (pending/confirmed/completed):`, appointment.status);
    
    if (newStatus && ['pending', 'confirmed', 'completed'].includes(newStatus.toLowerCase())) {
        appointment.status = newStatus.toLowerCase();
        
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(allAppointments));
        
        // Reload appointments
        loadAppointments();
        
        alert(`Status updated to: ${newStatus}`);
    }
}

// Delete appointment
function deleteAppointment(index) {
    const appointment = allAppointments[index];
    
    if (confirm(`Are you sure you want to delete ${appointment.customer_name}'s appointment?\n\nThis action cannot be undone.`)) {
        // Remove from array
        allAppointments.splice(index, 1);
        
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(allAppointments));
        
        // Reload appointments
        loadAppointments();
        
        alert('Appointment deleted successfully');
    }
}

// Export to CSV
function exportToCSV() {
    if (allAppointments.length === 0) {
        alert('No appointments to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Time', 'Customer Name', 'Email', 'Phone', 'Service', 'Vehicle', 'Status', 'Notes', 'Booking Date'];
    const rows = allAppointments.map(app => [
        app.preferred_date,
        app.preferred_time,
        app.customer_name,
        app.customer_email,
        app.customer_phone,
        app.service_type,
        app.vehicle_info,
        app.status,
        app.additional_notes || '',
        new Date(app.booking_date).toLocaleString('en-AU')
    ]);
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Clear all appointments
function clearAll() {
    if (confirm('⚠️ WARNING: This will delete ALL appointments permanently!\n\nAre you sure you want to continue?')) {
        if (confirm('This is your last chance. Type "DELETE ALL" to confirm.\n\nThis action CANNOT be undone!')) {
            localStorage.removeItem('appointments');
            allAppointments = [];
            loadAppointments();
            alert('All appointments have been deleted');
        }
    }
}

// Filter appointments
function filterAppointments() {
    const filterValue = document.getElementById('statusFilter').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = allAppointments;
    
    // Filter by status
    if (filterValue !== 'all') {
        filtered = filtered.filter(app => app.status === filterValue);
    }
    
    // Filter by search
    if (searchValue) {
        filtered = filtered.filter(app => 
            app.customer_name.toLowerCase().includes(searchValue) ||
            app.customer_email.toLowerCase().includes(searchValue) ||
            app.customer_phone.includes(searchValue) ||
            app.service_type.toLowerCase().includes(searchValue) ||
            app.vehicle_info.toLowerCase().includes(searchValue)
        );
    }
    
    displayAppointments(filtered);
}

// Close modals
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuthenticated');
        window.location.href = 'login.html';
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
});

// Add event listeners for search and filter
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAppointments);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterAppointments);
    }
});

// Refresh data
function refreshData() {
    loadAppointments();
    alert('Data refreshed successfully!');
}
