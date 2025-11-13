// Booking system functionality - NO EXTERNAL APIs VERSION

// Open booking modal
function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'flex';
    
    // Set minimum date to today
    const dateInput = document.getElementById('preferredDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Populate vehicle dropdowns
    populateVehicleDropdowns();
    
    // Close chatbot if open
    closeChatbot();
}

// Populate vehicle make dropdown
function populateVehicleDropdowns() {
    const makeSelect = document.getElementById('vehicleMake');
    const yearSelect = document.getElementById('vehicleYear');
    
    // Populate makes
    if (makeSelect && makeSelect.options.length <= 1) {
        const makes = getCarMakes();
        makes.forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            makeSelect.appendChild(option);
        });
    }
    
    // Populate years (current year to 25 years back)
    if (yearSelect && yearSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 25; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }
}

// Update models based on selected make
function updateModels() {
    const makeSelect = document.getElementById('vehicleMake');
    const modelSelect = document.getElementById('vehicleModel');
    const selectedMake = makeSelect.value;
    
    // Clear existing models
    modelSelect.innerHTML = '<option value="">Select model...</option>';
    
    if (selectedMake) {
        modelSelect.disabled = false;
        const models = getCarModels(selectedMake);
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    } else {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Select make first...</option>';
    }
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('bookingForm').reset();
    
    // Reset vehicle model dropdown
    const modelSelect = document.getElementById('vehicleModel');
    if (modelSelect) {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Select make first...</option>';
    }
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Submit booking form - USING LOCALSTORAGE INSTEAD OF APIs
async function submitBooking(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Get form data
        const vehicleMake = form.vehicleMake.value;
        const vehicleModel = form.vehicleModel.value;
        const vehicleYear = form.vehicleYear.value;
        const vehicleInfo = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
        
        // Get notification preferences
        const notifyEmail = form.notifyEmail ? form.notifyEmail.checked : true;
        const notifySMS = form.notifySMS ? form.notifySMS.checked : false;
        
        const formData = {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // Generate unique ID
            customer_name: form.customerName.value,
            customer_email: form.customerEmail.value,
            customer_phone: form.customerPhone.value,
            service_type: form.serviceType.value,
            vehicle_info: vehicleInfo,
            vehicle_brand: vehicleMake,
            vehicle_model: vehicleModel,
            vehicle_year: vehicleYear,
            preferred_date: form.preferredDate.value,
            preferred_time: form.preferredTime.value,
            additional_notes: form.additionalNotes.value || 'None',
            notification_email: notifyEmail,
            notification_sms: notifySMS,
            status: 'pending',
            booking_date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        // Save to localStorage instead of database
        saveBookingToLocalStorage(formData);
        
        // Show success modal
        showSuccessModal(formData, { customerSMS: false, adminSMS: false });
        
        // Close booking modal
        closeBookingModal();
        
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('Sorry, there was an error processing your booking. Please try again or call us at +61 412 345 678.\n\nError: ' + error.message);
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Booking';
    }
}

// Save booking to localStorage
function saveBookingToLocalStorage(bookingData) {
    try {
        // Get existing bookings or initialize empty array
        let bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Add new booking
        bookings.push(bookingData);
        
        // Sort by date (newest first)
        bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Save back to localStorage
        localStorage.setItem('appointments', JSON.stringify(bookings));
        
        console.log('✅ Booking saved successfully to local storage!');
        return true;
    } catch (error) {
        console.error('❌ Error saving booking:', error);
        throw error;
    }
}

// Show success modal
function showSuccessModal(bookingData, smsResults) {
    const modal = document.getElementById('successModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const successDetails = document.getElementById('successDetails');
    
    // Format date nicely
    const date = new Date(bookingData.preferred_date);
    const formattedDate = date.toLocaleDateString('en-AU', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Build confirmation message
    let message = '<strong>📧 Booking saved successfully!</strong>';
    
    confirmationMessage.innerHTML = message;
    
    // Build details
    successDetails.innerHTML = `
        <strong>Service:</strong> ${bookingData.service_type}<br>
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${bookingData.preferred_time}<br>
        <strong>Vehicle:</strong> ${bookingData.vehicle_info}<br>
        <br>
        <strong>What's Next?</strong><br>
        Our team will review your booking and contact you within 24 hours to confirm your appointment.<br>
        <br>
        <strong>Contact us directly:</strong><br>
        📞 <a href="tel:+61412345678" style="color: var(--primary-color);">+61 412 345 678</a><br>
        📧 <a href="mailto:info@autocaremechanic.com.au" style="color: var(--primary-color);">info@autocaremechanic.com.au</a>
    `;
    
    // Show modal
    modal.style.display = 'flex';
}

// Format phone number as user types
function formatPhoneNumber(input) {
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');
    
    // Format for Australian numbers
    if (value.startsWith('61')) {
        // International format: +61 4XX XXX XXX
        if (value.length <= 2) {
            input.value = '+' + value;
        } else if (value.length <= 3) {
            input.value = '+61 ' + value.substring(2);
        } else if (value.length <= 6) {
            input.value = '+61 ' + value.substring(2, 3) + value.substring(3);
        } else if (value.length <= 9) {
            input.value = '+61 ' + value.substring(2, 3) + value.substring(3, 6) + ' ' + value.substring(6);
        } else {
            input.value = '+61 ' + value.substring(2, 3) + value.substring(3, 6) + ' ' + value.substring(6, 9) + ' ' + value.substring(9, 12);
        }
    } else if (value.startsWith('0')) {
        // Local format: 04XX XXX XXX
        if (value.length <= 4) {
            input.value = value;
        } else if (value.length <= 7) {
            input.value = value.substring(0, 4) + ' ' + value.substring(4);
        } else {
            input.value = value.substring(0, 4) + ' ' + value.substring(4, 7) + ' ' + value.substring(7, 10);
        }
    } else if (value.startsWith('4')) {
        // Mobile without 0: 4XX XXX XXX -> 04XX XXX XXX
        value = '0' + value;
        if (value.length <= 4) {
            input.value = value;
        } else if (value.length <= 7) {
            input.value = value.substring(0, 4) + ' ' + value.substring(4);
        } else {
            input.value = value.substring(0, 4) + ' ' + value.substring(4, 7) + ' ' + value.substring(7, 10);
        }
    } else {
        // Default formatting
        input.value = value;
    }
}

// Add phone formatting to input field
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === bookingModal) {
        closeBookingModal();
    }
    if (event.target === successModal) {
        closeSuccessModal();
    }
});

// Handle Enter key in chatbot input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Auto-refresh functionality for dashboard (if on dashboard page)
if (window.location.pathname.includes('dashboard')) {
    // Refresh every 30 seconds
    setInterval(() => {
        if (typeof loadAppointments === 'function') {
            loadAppointments();
        }
    }, 30000);
}
