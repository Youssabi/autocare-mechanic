// Alternative Email Services for Booking Notifications
// Use these if FormSubmit doesn't work

// ===== OPTION 1: Web3Forms (Recommended Alternative) =====
// Sign up at: https://web3forms.com (Free, no credit card)
// Get your access key and replace 'YOUR_ACCESS_KEY_HERE'

async function sendEmailViaWeb3Forms(bookingData) {
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: 'YOUR_ACCESS_KEY_HERE', // Get from web3forms.com
                subject: 'New Appointment Booking - AutoCare Mechanic',
                from_name: 'AutoCare Mechanic',
                to: 'Youssabi.america@gmail.com',
                name: bookingData.customer_name,
                email: bookingData.customer_email,
                phone: bookingData.customer_phone,
                service: bookingData.service_type,
                vehicle: bookingData.vehicle_info,
                date: bookingData.preferred_date,
                time: bookingData.preferred_time,
                notes: bookingData.additional_notes,
                status: bookingData.status
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('Email sent via Web3Forms successfully!');
            return true;
        } else {
            console.error('Web3Forms error:', result);
            return false;
        }
    } catch (error) {
        console.error('Error sending email via Web3Forms:', error);
        return false;
    }
}

// ===== OPTION 2: EmailJS (Popular Alternative) =====
// Sign up at: https://www.emailjs.com (Free tier: 200 emails/month)
// Get your service_id, template_id, and public_key

async function sendEmailViaEmailJS(bookingData) {
    try {
        // Load EmailJS SDK if not already loaded
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
            emailjs.init('YOUR_PUBLIC_KEY'); // Get from emailjs.com
        }
        
        const templateParams = {
            to_email: 'Youssabi.america@gmail.com',
            customer_name: bookingData.customer_name,
            customer_email: bookingData.customer_email,
            customer_phone: bookingData.customer_phone,
            service_type: bookingData.service_type,
            vehicle_info: bookingData.vehicle_info,
            preferred_date: bookingData.preferred_date,
            preferred_time: bookingData.preferred_time,
            additional_notes: bookingData.additional_notes,
            status: bookingData.status
        };
        
        const response = await emailjs.send(
            'YOUR_SERVICE_ID',      // Get from emailjs.com
            'YOUR_TEMPLATE_ID',     // Get from emailjs.com
            templateParams
        );
        
        console.log('Email sent via EmailJS successfully!', response);
        return true;
    } catch (error) {
        console.error('Error sending email via EmailJS:', error);
        return false;
    }
}

// ===== OPTION 3: Simple mailto link (Basic fallback) =====
// This opens the user's email client - not automated but always works

function sendEmailViaMailto(bookingData) {
    const subject = encodeURIComponent('New Appointment Booking - AutoCare Mechanic');
    const body = encodeURIComponent(`
New Appointment Booking

Customer Information:
Name: ${bookingData.customer_name}
Email: ${bookingData.customer_email}
Phone: ${bookingData.customer_phone}

Appointment Details:
Service: ${bookingData.service_type}
Vehicle: ${bookingData.vehicle_info}
Date: ${bookingData.preferred_date}
Time: ${bookingData.preferred_time}

Additional Notes:
${bookingData.additional_notes || 'None'}

Status: ${bookingData.status}
    `);
    
    window.location.href = `mailto:Youssabi.america@gmail.com?subject=${subject}&body=${body}`;
}

// ===== HOW TO USE THESE ALTERNATIVES =====

// In booking.js, replace the sendEmailNotification function with one of these:

// For Web3Forms:
// 1. Go to https://web3forms.com
// 2. Sign up for free
// 3. Get your access key
// 4. Replace 'YOUR_ACCESS_KEY_HERE' in sendEmailViaWeb3Forms
// 5. In booking.js, replace sendEmailNotification with sendEmailViaWeb3Forms

// For EmailJS:
// 1. Go to https://www.emailjs.com
// 2. Sign up for free
// 3. Create an email service and template
// 4. Get your service_id, template_id, and public_key
// 5. Replace the placeholders in sendEmailViaEmailJS
// 6. In booking.js, replace sendEmailNotification with sendEmailViaEmailJS

// For mailto (simple backup):
// Just replace sendEmailNotification with sendEmailViaMailto
// This will open the email client on the user's computer
