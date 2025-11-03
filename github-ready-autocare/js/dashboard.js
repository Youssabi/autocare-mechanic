// Dashboard functionality for AutoCare Mechanic Admin - FIXED VERSION
// Bugs fixed:
// - XSS vulnerability in onclick handlers (now using data attributes)
// - Date format changed from US to Australian (en-AU)

let allAppointments = [];
let currentAppointment = null;

// Load appointments on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
});

// Load appointments from database
async function loadAppointments() {
    const loading = document.getElementById('loading');
    const noData = document.getElementById('noData');
    const tableContainer = document.getElementById('tableContainer');
    
    if (!loading || !noData || !tableContainer) {
        console.error('Required dashboard elements not found');
        return;
    }
    
    loading.style.display = 'block';
    noData.style.display = 'none';
    tableContainer.style.display = 'none';
    
    try {
        const response = await fetch('/tables/appointments?limit=100&sort=-created_at');
        
        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }
        
        const result = await response.json();
        allAppointments = result.data || [];
        
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
    
    const pendingEl = document.getElementById('pendingCount');
    const confirmedEl = document.getElementById('confirmedCount');
    const completedEl = document.getElementById('completedCount');
    const totalEl = document.getElementById('totalCount');
    
    if (pendingEl) pendingEl.textContent = pending;
    if (confirmedEl) confirmedEl.textContent = confirmed;
    if (completedEl) completedEl.textContent = completed;
    if (totalEl) totalEl.textContent = total;
}

// Display appointments in table
function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsBody');
    if (!tbody) {
        console.error('Appointments body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No appointments found</td></tr>';
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        // BUG FIX: Use data attributes instead of onclick to prevent XSS
        // Don't embed IDs directly in onclick handlers
        const actionButtons = createActionButtons(appointment.id, appointment.status);
        
        row.innerHTML = `
            <td data-label="Date & Time">
                <div><strong>${formatDateAU(appointment.preferred_date)}</strong></div>
                <div style="color: #64748b; font-size: 0.9rem;">${escapeHtml(appointment.preferred_time)}</div>
            </td>
            <td data-label="Customer">
                <div><strong>${escapeHtml(appointment.customer_name)}</strong></div>
            </td>
            <td data-label="Contact">
                <div style="font-size: 0.9rem;">
                    <div><i class="fas fa-envelope"></i> ${escapeHtml(appointment.customer_email)}</div>
                    <div><i class="fas fa-phone"></i> ${escapeHtml(appointment.customer_phone)}</div>
                </div>
            </td>
            <td data-label="Service">
                <span style="color: var(--primary-color); font-weight: 600;">${escapeHtml(appointment.service_type)}</span>
            </td>
            <td data-label="Vehicle">${escapeHtml(appointment.vehicle_info)}</td>
            <td data-label="Status">
                <span class="status-badge ${appointment.status}">${capitalizeFirst(appointment.status)}</span>
            </td>
            <td data-label="Actions" id="actions-${appointment.id}">
                <!-- Action buttons will be added here -->
            </td>
        `;
        
        tbody.appendChild(row);
        
        // Add event listeners to action buttons (safe method)
        const actionsCell = document.getElementById(`actions-${appointment.id}`);
        if (actionsCell) {
            actionsCell.innerHTML = actionButtons;
            
            // Add click listeners to all buttons
            const viewBtn = actionsCell.querySelector('[data-action="view"]');
            const confirmBtn = actionsCell.querySelector('[data-action="confirm"]');
            const completeBtn = actionsCell.querySelector('[data-action="complete"]');
            const deleteBtn = actionsCell.querySelector('[data-action="delete"]');
            
            if (viewBtn) {
                viewBtn.addEventListener('click', () => viewAppointment(appointment.id));
            }
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => updateAppointmentStatus(appointment.id, 'confirmed'));
            }
            if (completeBtn) {
                completeBtn.addEventListener('click', () => updateAppointmentStatus(appointment.id, 'completed'));
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteAppointment(appointment.id));
            }
        }
    });
}

// Create action buttons HTML safely
function createActionButtons(appointmentId, status) {
    let html = `
        <div class="action-buttons">
            <button class="btn-action view" data-action="view" title="View Details">
                <i class="fas fa-eye"></i> View
            </button>
    `;
    
    if (status === 'pending') {
        html += `
            <button class="btn-action confirm" data-action="confirm" title="Confirm">
                <i class="fas fa-check"></i> Confirm
            </button>
        `;
    } else if (status === 'confirmed') {
        html += `
            <button class="btn-action confirm" data-action="complete" title="Mark Complete">
                <i class="fas fa-thumbs-up"></i> Complete
            </button>
        `;
    }
    
    html += `
            <button class="btn-action delete" data-action="delete" title="Delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return html;
}

// Filter appointments
function filterAppointments() {
    const statusFilterEl = document.getElementById('statusFilter');
    const dateFilterEl = document.getElementById('dateFilter');
    
    if (!statusFilterEl || !dateFilterEl) {
        console.error('Filter elements not found');
        return;
    }
    
    const statusFilter = statusFilterEl.value;
    const dateFilter = dateFilterEl.value;
    
    let filtered = allAppointments;
    
    // Filter by status
    if (statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    // Filter by date
    if (dateFilter) {
        filtered = filtered.filter(a => a.preferred_date === dateFilter);
    }
    
    displayAppointments(filtered);
}

// View appointment details
function viewAppointment(appointmentId) {
    const appointment = allAppointments.find(a => a.id === appointmentId);
    if (!appointment) {
        console.error('Appointment not found:', appointmentId);
        return;
    }
    
    currentAppointment = appointment;
    
    const detailsContent = document.getElementById('detailsContent');
    if (!detailsContent) {
        console.error('Details content element not found');
        return;
    }
    
    // BUG FIX: Escape all user content to prevent XSS
    detailsContent.innerHTML = `
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-user"></i> Customer Name
            </div>
            <div class="detail-value">${escapeHtml(appointment.customer_name)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-envelope"></i> Email
            </div>
            <div class="detail-value">${escapeHtml(appointment.customer_email)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-phone"></i> Phone Number
            </div>
            <div class="detail-value">${escapeHtml(appointment.customer_phone)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-wrench"></i> Service Type
            </div>
            <div class="detail-value">${escapeHtml(appointment.service_type)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-car"></i> Vehicle Information
            </div>
            <div class="detail-value">${escapeHtml(appointment.vehicle_info)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-calendar"></i> Preferred Date
            </div>
            <div class="detail-value">${formatDateAU(appointment.preferred_date)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-clock"></i> Preferred Time
            </div>
            <div class="detail-value">${escapeHtml(appointment.preferred_time)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-comment"></i> Additional Notes
            </div>
            <div class="detail-value">${escapeHtml(appointment.additional_notes || 'None')}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">
                <i class="fas fa-info-circle"></i> Status
            </div>
            <div class="detail-value">
                <span class="status-badge ${appointment.status}">${capitalizeFirst(appointment.status)}</span>
            </div>
        </div>
        
        <div class="status-actions" id="statusActions">
            <!-- Action buttons will be added here -->
        </div>
    `;
    
    // Add action buttons safely
    const statusActionsDiv = document.getElementById('statusActions');
    if (statusActionsDiv) {
        let actionsHTML = '';
        
        if (appointment.status === 'pending') {
            actionsHTML += `
                <button class="status-btn confirm" data-modal-action="confirm">
                    <i class="fas fa-check"></i> Confirm Appointment
                </button>
            `;
        } else if (appointment.status === 'confirmed') {
            actionsHTML += `
                <button class="status-btn complete" data-modal-action="complete">
                    <i class="fas fa-thumbs-up"></i> Mark as Completed
                </button>
            `;
        }
        
        actionsHTML += `
            <button class="status-btn cancel" data-modal-action="cancel">
                <i class="fas fa-times"></i> Cancel Appointment
            </button>
        `;
        
        statusActionsDiv.innerHTML = actionsHTML;
        
        // Add event listeners
        const confirmBtn = statusActionsDiv.querySelector('[data-modal-action="confirm"]');
        const completeBtn = statusActionsDiv.querySelector('[data-modal-action="complete"]');
        const cancelBtn = statusActionsDiv.querySelector('[data-modal-action="cancel"]');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => updateAppointmentStatus(appointment.id, 'confirmed'));
        }
        if (completeBtn) {
            completeBtn.addEventListener('click', () => updateAppointmentStatus(appointment.id, 'completed'));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => updateAppointmentStatus(appointment.id, 'cancelled'));
        }
    }
    
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus === 'cancelled' ? 'cancel' : 'update'} this appointment?`)) {
        return;
    }
    
    try {
        // Get appointment details before updating
        const appointment = allAppointments.find(a => a.id === appointmentId);
        
        const response = await fetch(`/tables/appointments/${appointmentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update appointment');
        }
        
        // Send notifications to customer when status changes to confirmed
        if (newStatus === 'confirmed' && appointment) {
            // Send email if customer opted in
            if (appointment.notification_email !== false) {
                console.log('📧 Sending confirmation email to customer...');
                await sendConfirmationEmailToCustomer(appointment);
            }
            
            // Send SMS if customer opted in and Twilio is configured
            if (appointment.notification_sms !== false && typeof sendTwilioSMS !== 'undefined') {
                console.log('💬 Sending confirmation SMS to customer...');
                try {
                    await sendCustomerBookingSMS(appointment, 'confirmed');
                    console.log('✅ SMS sent successfully!');
                } catch (error) {
                    console.error('❌ Error sending SMS:', error);
                }
            }
        }
        
        // Reload appointments
        await loadAppointments();
        
        // Close modal if open
        closeDetailsModal();
        
        let notificationMsg = '';
        if (newStatus === 'confirmed') {
            if (appointment.notification_email && appointment.notification_sms) {
                notificationMsg = ' Customer notified by email and SMS.';
            } else if (appointment.notification_email) {
                notificationMsg = ' Customer notified by email.';
            } else if (appointment.notification_sms) {
                notificationMsg = ' Customer notified by SMS.';
            }
        }
        
        alert(`Appointment ${newStatus} successfully!${notificationMsg}`);
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment. Please try again.');
    }
}

// Send confirmation email to customer when appointment is confirmed
async function sendConfirmationEmailToCustomer(appointment) {
    try {
        console.log('🔄 Loading EmailJS for confirmation email...');
        
        // Check if EmailJS is loaded, if not load it
        if (typeof emailjs === 'undefined') {
            await loadEmailJS();
        }
        
        // Initialize EmailJS (only once)
        if (!window.emailjsInitialized) {
            console.log('🔑 Initializing EmailJS...');
            emailjs.init(BUSINESS_CONFIG.emailjs.publicKey);
            window.emailjsInitialized = true;
        }
        
        // Prepare template parameters for CONFIRMED email
        const templateParams = {
            to_email: appointment.customer_email,
            customer_name: appointment.customer_name,
            customer_email: appointment.customer_email,
            customer_phone: appointment.customer_phone,
            service_type: appointment.service_type,
            vehicle_info: appointment.vehicle_info,
            preferred_date: formatDateAU(appointment.preferred_date),
            preferred_time: appointment.preferred_time,
            additional_notes: appointment.additional_notes || 'None'
        };
        
        console.log('📨 Sending CONFIRMED email to:', appointment.customer_email);
        
        // Send email using the CONFIRMED template
        const response = await emailjs.send(
            BUSINESS_CONFIG.emailjs.serviceId,
            BUSINESS_CONFIG.emailjs.confirmedTemplateId,
            templateParams
        );
        
        console.log('✅ Confirmation email sent successfully!', response);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        console.log('Error details:', error.text || error.message);
        // Don't throw - appointment was still confirmed
        return false;
    }
}

// Load EmailJS library dynamically
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = resolve;
        script.onerror = () => {
            reject(new Error('Failed to load EmailJS library'));
        };
        document.head.appendChild(script);
    });
}

// Delete appointment
async function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/tables/appointments/${appointmentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete appointment');
        }
        
        // Reload appointments
        await loadAppointments();
        
        alert('Appointment deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
    }
}

// Close details modal
function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentAppointment = null;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
});

// Utility functions
// BUG FIX: Changed from en-US to en-AU for Australian date format (DD/MM/YYYY)
function formatDateAU(dateString) {
    if (!dateString) return 'Invalid date';
    
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-AU', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// BUG FIX: Add escapeHtml function to prevent XSS attacks
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
