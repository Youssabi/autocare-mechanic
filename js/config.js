// ========================================
// CENTRALIZED CONFIGURATION FILE
// ========================================
// Single source of truth for all business settings
// Update here and all files automatically use the correct values!

const BUSINESS_CONFIG = {
    // IMPORTANT: Update these with your actual business information
    phone: '+61 431 282 277',           // YOUR PHONE NUMBER
    email: 'info@autocaremechanic.com.au',  // YOUR EMAIL
    address: '123 Main Street, Sydney NSW 2000',  // YOUR ADDRESS
    
    // Maps link
    mapsUrl: 'https://maps.google.com/?q=123+Main+Street+Sydney+NSW+2000',
    
    // Business hours (Australian timezone)
    hours: {
        monday_friday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
    },
    
    // Emergency contact (same as phone, for Australia use 000 for emergency)
    emergency_number: '+61 431 282 277',
    actual_emergency: '000',  // Australian emergency services
    
    // Services with pricing (AUD)
    services: {
        'oil_change': {
            name: 'Oil Change',
            description: 'Quick and professional oil change service',
            priceMin: 80,
            priceMax: 150,
            duration: '30 minutes'
        },
        'brake_service': {
            name: 'Brake Service',
            description: 'Complete brake inspection, pad replacement, and fluid flush',
            priceMin: 300,
            priceMax: 800,
            duration: '1-2 hours'
        },
        'battery': {
            name: 'Battery',
            description: 'Battery testing, cleaning, and replacement',
            priceMin: 200,
            priceMax: 400,
            duration: '30 minutes'
        },
        'engine_diagnostics': {
            name: 'Engine Diagnostics',
            description: 'Advanced diagnostic equipment to identify engine problems',
            priceMin: 100,
            priceMax: 200,
            duration: '45 minutes'
        },
        'tire_service': {
            name: 'Tyre Service',
            description: 'Tyre rotation, balancing, alignment, and replacement',
            priceMin: 100,
            priceMax: 600,
            duration: '1 hour'
        },
        'transmission': {
            name: 'Transmission Service',
            description: 'Transmission fluid change, diagnostics, and repair',
            priceMin: 200,
            priceMax: 1000,
            duration: '1-3 hours'
        }
    },
    
    // Twilio Configuration
    // ⚠️ NEVER commit these to GitHub!
    // Add to GitHub Secrets instead (see setup guide)
    twilio: {
        accountSid: 'GET_FROM_GITHUB_SECRETS',
        authToken: 'GET_FROM_GITHUB_SECRETS',
        fromNumber: '+1XXXXXXXXXX',  // Your Twilio number
        adminNumber: '+61 431 282 277'  // UPDATE WITH YOUR NUMBER
    },
    
    // EmailJS Configuration
    // ⚠️ Public key is safe to share, but keep service/template IDs private
    emailjs: {
        serviceId: 'service_4hka7wq',
        publicKey: 'r4S3UEdppOsDSAhGm',
        bookingTemplateId: 'template_ezc44lg',
        confirmedTemplateId: 'template_ug1md6x'
    }
};

// Format phone number for international use
function formatPhoneForTwilio(phone) {
    // Remove all non-digit and + characters
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
        // If it starts with 0, replace with +61
        if (cleaned.startsWith('0')) {
            cleaned = '+61' + cleaned.substring(1);
        } else {
            cleaned = '+' + cleaned;
        }
    }
    
    // Validate it's a reasonable length (10-15 digits)
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        throw new Error(`Invalid phone number format: ${phone}`);
    }
    
    return cleaned;
}

// Format phone number for display
function formatPhoneForDisplay(phone) {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+61')) {
        return cleaned.replace(/(\+61)(\d{1})(\d{3})(\d{3})(\d{3})/, '$1 4$2$3 $4$5');
    }
    return cleaned;
}

// Get service by name or ID
function getService(serviceId) {
    return BUSINESS_CONFIG.services[serviceId];
}

// Validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate phone format (basic)
function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

// Format date for Australian locale (DD/MM/YYYY)
function formatDateAU(date) {
    if (typeof date === 'string') {
        date = new Date(date + 'T00:00:00');
    }
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Format datetime for Australian locale
function formatDateTimeAU(date, time) {
    const formatted = formatDateAU(date);
    return `${formatted} at ${time}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sanitize onclick handlers - DO NOT use inline onclick for user-generated content!
function createSafeButton(text, dataId) {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.appointmentId = dataId;
    return button;
}
