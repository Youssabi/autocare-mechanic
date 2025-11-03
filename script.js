// Set minimum date to today for the date picker
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Set default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
});

// Handle booking form submission
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        vehicle: document.getElementById('vehicle').value.trim(),
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        notes: document.getElementById('notes').value.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Validate form data
    if (!validateFormData(formData)) {
        return;
    }
    
    // Save booking to localStorage
    saveBooking(formData);
    
    // Show confirmation message
    showConfirmation(formData);
    
    // Reset form
    this.reset();
    
    // Reset date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
});

// Validate form data
function validateFormData(data) {
    // Phone number validation (Australian format)
    const phoneRegex = /^(\+?61|0)[2-9]\d{8}$/;
    const cleanPhone = data.phone.replace(/\s|-/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
        showError('Please enter a valid Australian phone number');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    // Date validation (not in the past)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showError('Please select a future date');
        return false;
    }
    
    // Check if date is not Sunday
    if (selectedDate.getDay() === 0) {
        showError('Sorry, we are closed on Sundays. Please select another day.');
        return false;
    }
    
    return true;
}

// Save booking to localStorage
function saveBooking(bookingData) {
    // Get existing bookings
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Add new booking
    bookings.push(bookingData);
    
    // Save back to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Show confirmation message
function showConfirmation(bookingData) {
    const form = document.getElementById('bookingForm');
    const confirmationMsg = document.getElementById('confirmationMessage');
    const bookingDetails = document.getElementById('bookingDetails');
    
    // Format booking details
    const formattedDate = new Date(bookingData.date).toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const formattedTime = formatTime(bookingData.time);
    
    // Create booking details HTML
    bookingDetails.innerHTML = `
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <h4 style="margin-bottom: 0.75rem; color: #333;">Booking Details:</h4>
            <p><strong>Name:</strong> ${bookingData.name}</p>
            <p><strong>Vehicle:</strong> ${bookingData.vehicle}</p>
            <p><strong>Service:</strong> ${formatService(bookingData.service)}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Contact:</strong> ${bookingData.phone}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ''}
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 0.9rem;">
                📧 A confirmation email will be sent to ${bookingData.email}<br>
                📱 You will receive an SMS reminder 24 hours before your appointment.
            </p>
        </div>
    `;
    
    // Hide form and show confirmation
    form.style.display = 'none';
    confirmationMsg.style.display = 'block';
    
    // Scroll to confirmation message
    confirmationMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Show form again after 10 seconds
    setTimeout(() => {
        form.style.display = 'block';
        confirmationMsg.style.display = 'none';
    }, 10000);
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

// Show error message
function showError(message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid #f5c6cb;
        animation: shake 0.5s;
    `;
    errorDiv.textContent = '⚠️ ' + message;
    
    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
    
    // Insert error message before form
    const form = document.getElementById('bookingForm');
    form.parentNode.insertBefore(errorDiv, form);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
        style.remove();
    }, 5000);
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Auto-format phone number as user types
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format as Australian mobile: 0XXX XXX XXX
    if (value.startsWith('61')) {
        value = '0' + value.substring(2);
    }
    
    if (value.length > 0) {
        if (value.length <= 4) {
            e.target.value = value;
        } else if (value.length <= 7) {
            e.target.value = value.slice(0, 4) + ' ' + value.slice(4);
        } else {
            e.target.value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 10);
        }
    }
});

// Prevent booking on Sundays
document.getElementById('date').addEventListener('change', function(e) {
    const selectedDate = new Date(e.target.value);
    if (selectedDate.getDay() === 0) {
        showError('Sorry, we are closed on Sundays. Please select another day.');
        // Set to next Monday
        selectedDate.setDate(selectedDate.getDate() + 1);
        e.target.value = selectedDate.toISOString().split('T')[0];
    }
});
