// Twilio SMS Configuration
// SECURITY NOTE: In production, these should be stored securely on a server
// For a static site, this is the only option, but keep credentials private

const TWILIO_CONFIG = {
    // Your Twilio Account SID (starts with AC)
    // Get from: https://www.twilio.com/console
    accountSid: 'YOUR_ACCOUNT_SID_HERE',
    
    // Your Twilio Auth Token (32 character string)
    // Get from: https://www.twilio.com/console
    authToken: 'YOUR_AUTH_TOKEN_HERE',
    
    // Your Twilio phone number (US number)
    // Get from: https://www.twilio.com/console/phone-numbers/incoming
    fromNumber: '+1XXXXXXXXXX',
    
    // Your business phone number (where you want to receive admin SMS)
    // UPDATE THIS: Replace with your actual mobile number
    adminNumber: '+61 431 282 277'
};

// ⚠️ IMPORTANT - BEFORE GOING LIVE:
// 1. Get your credentials from https://www.twilio.com/console/
// 2. Replace the placeholders above with your actual credentials
// 3. NEVER commit credentials to GitHub
// 4. Store them in GitHub Secrets instead (see guides)

// Twilio API Endpoint
const TWILIO_API_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;

// Send SMS via Twilio with improved error handling
async function sendTwilioSMS(to, message) {
    try {
        // Validate config
        if (!TWILIO_CONFIG.accountSid || TWILIO_CONFIG.accountSid.includes('YOUR_') || 
            !TWILIO_CONFIG.authToken || TWILIO_CONFIG.authToken.includes('YOUR_')) {
            throw new Error('❌ Twilio not configured! Update js/twilio-config.js with your credentials.');
        }

        // Validate and format phone number properly
        let cleanTo;
        try {
            cleanTo = validateAndFormatPhoneNumber(to);
        } catch (formatError) {
            console.error('❌ Phone format error:', formatError.message);
            throw new Error('Invalid recipient phone number: ' + formatError.message);
        }
        
        // Validate message
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message: must be a non-empty string');
        }
        
        if (message.length > 1600) {
            throw new Error('Message too long: SMS has 1600 character limit');
        }
        
        // Validate from number
        let cleanFrom;
        try {
            cleanFrom = validateAndFormatPhoneNumber(TWILIO_CONFIG.fromNumber);
        } catch (formatError) {
            console.error('❌ Twilio from number error:', formatError.message);
            throw new Error('Twilio from number configuration error: ' + formatError.message);
        }
        
        // Create authorization header (Base64 encoded)
        const auth = btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`);
        
        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('To', cleanTo);
        formData.append('From', cleanFrom);
        formData.append('Body', message);
        
        console.log(`📱 Sending SMS to ${cleanTo}...`);
        console.log(`From: ${cleanFrom}`);
        console.log(`Message length: ${message.length} characters`);
        
        // Send SMS via Twilio API
        const response = await fetch(TWILIO_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Twilio error:', error);
            throw new Error(`Twilio API error: ${error.message} (Code: ${error.code})`);
        }
        
        const result = await response.json();
        console.log('✅ SMS sent successfully!');
        console.log(`   SID: ${result.sid}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Sent to: ${result.to}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

// Validate and format phone number
function validateAndFormatPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('Invalid phone number: must be a string');
    }
    
    // Remove common formatting characters
    let cleaned = phoneNumber.replace(/[\s\-\.\(\)]/g, '');
    
    // Handle Australian format: 0XXXXXXXXX or 0X XXXX XXXX
    if (cleaned.match(/^0[2-9]/)) {
        // Replace leading 0 with +61
        cleaned = '+61' + cleaned.substring(1);
    }
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
        throw new Error('Invalid phone number format: must start with + or be in Australian format');
    }
    
    // Validate it has the correct number of digits (10-15 total)
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        throw new Error(`Invalid phone number: too short or too long (${digitsOnly.length} digits). Expected 10-15 digits.`);
    }
    
    // Validate country code is present
    if (!cleaned.match(/^\+\d{1,3}\d{6,14}$/)) {
        throw new Error('Invalid phone number format. Example: +61431282277 or 0431282277');
    }
    
    return cleaned;
}

// Send SMS to customer (booking confirmation)
async function sendCustomerBookingSMS(bookingData, status = 'pending') {
    try {
        if (!bookingData || !bookingData.customer_phone) {
            throw new Error('Missing booking data or customer phone');
        }
        
        const customerName = bookingData.customer_name.split(' ')[0]; // First name only
        
        let message;
        if (status === 'pending') {
            message = `Hi ${customerName}! Your ${bookingData.service_type} appointment for ${bookingData.preferred_date} at ${bookingData.preferred_time} is PENDING. We'll confirm soon. - AutoCare Mechanic`;
        } else if (status === 'confirmed') {
            message = `Hi ${customerName}! Your ${bookingData.service_type} appointment is CONFIRMED for ${bookingData.preferred_date} at ${bookingData.preferred_time}. See you then! - AutoCare Mechanic`;
        } else {
            throw new Error('Unknown booking status: ' + status);
        }
        
        // Trim message if too long
        if (message.length > 1600) {
            message = message.substring(0, 1597) + '...';
        }
        
        return await sendTwilioSMS(bookingData.customer_phone, message);
        
    } catch (error) {
        console.error('❌ Error in sendCustomerBookingSMS:', error.message);
        return false;
    }
}

// Send SMS to admin (new booking notification)
async function sendAdminBookingSMS(bookingData) {
    try {
        if (!bookingData) {
            throw new Error('Missing booking data');
        }
        
        const message = `🚗 NEW BOOKING!\n\nCustomer: ${bookingData.customer_name}\nService: ${bookingData.service_type}\nVehicle: ${bookingData.vehicle_info}\nDate: ${bookingData.preferred_date} at ${bookingData.preferred_time}\n\nView: ${window.location.origin}/admin/`;
        
        return await sendTwilioSMS(TWILIO_CONFIG.adminNumber, message);
        
    } catch (error) {
        console.error('❌ Error in sendAdminBookingSMS:', error.message);
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendTwilioSMS,
        sendCustomerBookingSMS,
        sendAdminBookingSMS,
        validateAndFormatPhoneNumber,
        TWILIO_CONFIG
    };
}
