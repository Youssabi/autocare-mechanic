// Booking system functionality - FIXED VERSION
// All bugs corrected:
// - Phone validation
// - Email null checks
// - Timezone handling
// - Validation for notification preferences

// Track form submission to prevent accidental modal close
let isSubmittingBooking = false;

// Open booking modal
function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) {
        console.error('Booking modal not found');
        return;
    }
    
    modal.style.display = 'flex';
    
    // Set minimum date to today (using local date, not UTC)
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        dateInput.setAttribute('min', todayString);
    }
    
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
    // BUG FIX: Don't close if actively submitting
    if (isSubmittingBooking) {
        return;
    }
    
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    
    // Reset form
    const form = document.getElementById('bookingForm');
    if (form) {
        form.reset();
    }
    
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
    if (modal) {
        modal.style.display = 'none';
    }
}

// Submit booking form
async function submitBooking(event) {
    event.preventDefault();
    
    isSubmittingBooking = true;
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (!submitButton) {
        console.error('Submit button not found');
        isSubmittingBooking = false;
        return;
    }
    
    // Disable button and show loading
    const originalHTML = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Get form data
        const vehicleMake = form.vehicleMake.value;
        const vehicleModel = form.vehicleModel.value;
        const vehicleYear = form.vehicleYear.value;
        const vehicleInfo = `${vehicleYear} ${vehicleMake} ${vehicleModel}`;
        
        // BUG FIX: Explicitly check for notification checkboxes existence
        const notifyEmailCheckbox = form.notifyEmail;
        const notifySMSCheckbox = form.notifySMS;
        
        const notifyEmail = notifyEmailCheckbox ? notifyEmailCheckbox.checked : false;
        const notifySMS = notifySMSCheckbox ? notifySMSCheckbox.checked : false;
        
        // BUG FIX: Validate email and phone before submission
        const email = form.customerEmail.value.trim();
        const phone = form.customerPhone.value.trim();
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            isSubmittingBooking = false;
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
            return;
        }
        
        if (!isValidPhone(phone)) {
            alert('Please enter a valid phone number');
            isSubmittingBooking = false;
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
            return;
        }
        
        const formData = {
            customer_name: form.customerName.value.trim(),
            customer_email: email,
            customer_phone: phone,
            service_type: form.serviceType.value,
            vehicle_info: vehicleInfo,
            vehicle_brand: vehicleMake,
            vehicle_model: vehicleModel,
            vehicle_year: vehicleYear,
            preferred_date: form.preferredDate.value,
            preferred_time: form.preferredTime.value,
            additional_notes: form.additionalNotes.value.trim() || 'None',
            notification_email: notifyEmail,
            notification_sms: notifySMS,
            status: 'pending',
            booking_date: new Date().toISOString()
        };
        
        // Save to database
        const response = await fetch('/tables/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save booking');
        }
        
        const result = await response.json();
        
        // Send email notification to admin (if enabled)
        if (formData.notification_email) {
            try {
                await sendEmailNotification(formData);
            } catch (error) {
                console.warn('Admin email notification failed:', error);
            }
        }
        
        // Try to send confirmation email to customer (if enabled)
        if (formData.notification_email) {
            try {
                await sendCustomerConfirmation(formData);
            } catch (error) {
                console.warn('Customer email confirmation failed:', error);
            }
        }
        
        // Send SMS notifications (if enabled)
        let smsResults = {
            customerSMS: false,
            adminSMS: false
        };
        
        if (formData.notification_sms && typeof sendTwilioSMS !== 'undefined') {
            try {
                // Format phone number for Twilio
                const twilioPhone = formatPhoneForTwilio(formData.customer_phone);
                
                // Send SMS to customer
                console.log('📱 Sending SMS to customer...');
                smsResults.customerSMS = await sendCustomerBookingSMS(formData, 'pending');
                
                // Send SMS to admin
                console.log('📱 Sending SMS to admin...');
                smsResults.adminSMS = await sendAdminBookingSMS(formData);
                
            } catch (error) {
                console.error('❌ Error sending SMS:', error);
            }
        }
        
        // Show success modal
        showSuccessModal(formData, smsResults);
        
        // Close booking modal
        closeBookingModal();
        
    } catch (error) {
        console.error('Error submitting booking:', error);
        console.error('Error details:', error.message);
        alert('Sorry, there was an error processing your booking. Please try again or call us at ' + BUSINESS_CONFIG.phone + '\n\nError: ' + error.message);
    } finally {
        // Re-enable button
        isSubmittingBooking = false;
        submitButton.disabled = false;
        submitButton.innerHTML = originalHTML;
    }
}

// Send email notification to admin
async function sendEmailNotification(bookingData) {
    try {
        // Using Web3Forms - Reliable email service
        const emailData = {
            access_key: '5f00b0b0-cdeb-4494-9b30-c01fea77ab7b',
            subject: '🔔 NEW APPOINTMENT - Please Contact Customer',
            from_name: 'AutoCare Mechanic Website',
            name: bookingData.customer_name,
            email: bookingData.customer_email,
            phone: bookingData.customer_phone,
            service: bookingData.service_type,
            vehicle: bookingData.vehicle_info,
            date: bookingData.preferred_date,
            time: bookingData.preferred_time,
            notes: bookingData.additional_notes || 'None',
            status: bookingData.status,
            booking_date: new Date().toLocaleString(),
            action_required: '⚠️ PLEASE CALL/EMAIL CUSTOMER TO CONFIRM APPOINTMENT'
        };
        
        // Send via Web3Forms API
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        const result = await response.json();
        console.log('Email result:', result);
        
        if (result.success) {
            console.log('✅ Email notification sent successfully!');
            return true;
        } else {
            console.warn('⚠️ Email may not have been sent:', result.message);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}

// Send confirmation email to customer via EmailJS
async function sendCustomerConfirmation(bookingData) {
    try {
        console.log('📧 Attempting to send customer email...');
        console.log('Customer email:', bookingData.customer_email);
        
        // BUG FIX: Check if EmailJS exists before using it
        if (typeof emailjs === 'undefined') {
            console.log('📦 Loading EmailJS library...');
            await loadEmailJS();
        }
        
        // Initialize EmailJS with null check
        if (!window.emailjsInitialized && typeof emailjs !== 'undefined') {
            console.log('🔑 Initializing EmailJS...');
            emailjs.init(BUSINESS_CONFIG.emailjs.publicKey);
            window.emailjsInitialized = true;
        }
        
        // BUG FIX: Verify emailjs is available before sending
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library failed to load');
        }
        
        // Prepare template parameters
        const templateParams = {
            to_email: bookingData.customer_email,
            reply_to: bookingData.customer_email,
            customer_name: bookingData.customer_name,
            customer_email: bookingData.customer_email,
            customer_phone: bookingData.customer_phone,
            service_type: bookingData.service_type,
            vehicle_info: bookingData.vehicle_info,
            preferred_date: formatDateAU(bookingData.preferred_date),
            preferred_time: bookingData.preferred_time,
            additional_notes: bookingData.additional_notes || 'None'
        };
        
        console.log('📨 Sending email with params:', templateParams);
        
        // Send email using EmailJS
        const response = await emailjs.send(
            BUSINESS_CONFIG.emailjs.serviceId,
            BUSINESS_CONFIG.emailjs.bookingTemplateId,
            templateParams
        );
        
        console.log('✅ Customer confirmation sent successfully!', response);
        console.log(`📧 Email sent to: ${bookingData.customer_email}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending customer confirmation:', error);
        console.log('Error details:', error.text || error.message);
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

// Show success modal
function showSuccessModal(bookingData, smsResults) {
    const modal = document.getElementById('successModal');
    if (!modal) {
        console.error('Success modal not found');
        return;
    }
    
    const detailsElement = document.getElementById('successDetails');
    const messageElement = document.getElementById('confirmationMessage');
    
    if (!detailsElement || !messageElement) {
        console.error('Success modal elements not found');
        return;
    }
    
    // Update confirmation message based on what was sent
    let confirmationMsg = '<strong>';
    if (bookingData.notification_email && bookingData.notification_sms) {
        confirmationMsg += '📧 Email and 💬 SMS confirmation sent!';
    } else if (bookingData.notification_email) {
        confirmationMsg += '📧 Email confirmation sent!';
    } else if (bookingData.notification_sms) {
        confirmationMsg += '💬 SMS confirmation sent!';
    } else {
        confirmationMsg += '✅ Booking received!';
    }
    confirmationMsg += '</strong>';
    
    // Add SMS status if available
    if (smsResults && bookingData.notification_sms) {
        if (smsResults.customerSMS) {
            confirmationMsg += '<br><small style="color: #10b981;">✅ SMS sent to your phone</small>';
        } else {
            confirmationMsg += '<br><small style="color: #f59e0b;">⚠️ SMS delivery pending</small>';
        }
    }
    
    messageElement.innerHTML = confirmationMsg;
    
    // BUG FIX: Escape HTML in details to prevent XSS
    const details = `
        <strong>Booking Details:</strong><br>
        📅 Date: ${escapeHtml(bookingData.preferred_date)}<br>
        🕒 Time: ${escapeHtml(bookingData.preferred_time)}<br>
        🔧 Service: ${escapeHtml(bookingData.service_type)}<br>
        🚗 Vehicle: ${escapeHtml(bookingData.vehicle_info)}<br><br>
        We'll contact you at ${escapeHtml(bookingData.customer_phone)} to confirm your appointment.
    `;
    
    detailsElement.innerHTML = details;
    modal.style.display = 'flex';
}

// Close modals when clicking outside (but not during submission)
window.addEventListener('click', function(event) {
    if (isSubmittingBooking) {
        return;  // Prevent close during submission
    }
    
    const bookingModal = document.getElementById('bookingModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === bookingModal) {
        closeBookingModal();
    }
    
    if (event.target === successModal) {
        closeSuccessModal();
    }
});

// Set minimum date on page load
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        dateInput.setAttribute('min', todayString);
    }
});
