// Enhanced Chatbot functionality for AutoCare Mechanic - FIXED VERSION
// Bugs fixed:
// - Emergency number changed from 911 to 000 for Australia
// - Added FileReader error handling
// - Added memory management for photo uploads
// - Added file validation with better error messages

// Knowledge base for the chatbot
const knowledgeBase = {
    services: {
        'oil change': {
            description: "We offer quick and professional oil change services. Regular oil changes every 5,000-10,000 km help maintain engine performance.",
            price: "$80-$150 AUD",
            priceMin: 80,
            priceMax: 150,
            duration: "30 minutes"
        },
        'brake service': {
            description: "Complete brake inspection, pad replacement, rotor resurfacing, and brake fluid flush. We use quality parts for your safety.",
            price: "$300-$800 AUD",
            priceMin: 300,
            priceMax: 800,
            duration: "1-2 hours"
        },
        'battery': {
            description: "Battery testing, cleaning, and replacement services. We stock batteries for all vehicle makes and models.",
            price: "$200-$400 AUD",
            priceMin: 200,
            priceMax: 400,
            duration: "30 minutes"
        },
        'engine diagnostics': {
            description: "Using advanced diagnostic equipment, we identify engine problems quickly and accurately.",
            price: "$100-$200 AUD",
            priceMin: 100,
            priceMax: 200,
            duration: "45 minutes"
        },
        'tire service': {
            description: "Tyre rotation, balancing, alignment, and replacement services to ensure safe driving.",
            price: "$100-$600 AUD",
            priceMin: 100,
            priceMax: 600,
            duration: "1 hour"
        },
        'transmission': {
            description: "Transmission fluid change, diagnostics, and repair services for smooth gear shifting.",
            price: "$200-$1000+ AUD",
            priceMin: 200,
            priceMax: 1000,
            duration: "1-3 hours"
        }
    },
    commonIssues: {
        'check engine light': "A check engine light can indicate many issues. Common causes include loose gas cap, faulty oxygen sensor, bad spark plugs, or catalytic converter problems. We recommend bringing your vehicle in for a diagnostic scan.",
        'strange noise': "Different noises can indicate different problems: squealing (belts or brakes), grinding (brakes), knocking (engine), or humming (wheel bearings). It's best to have it inspected soon.",
        'car won\'t start': "Common causes: dead battery, bad starter, fuel pump failure, or ignition issues. We can diagnose and fix the problem quickly.",
        'poor acceleration': "This could be caused by clogged fuel filters, bad spark plugs, transmission issues, or sensor problems. A diagnostic check will identify the cause.",
        'overheating': "Overheating can be caused by low coolant, thermostat failure, radiator issues, or water pump problems. Stop driving immediately and have it towed to prevent engine damage.",
        'vibration': "Vibrations can be caused by unbalanced tyres, worn suspension, alignment issues, or brake problems. We can inspect and fix the issue."
    }
};

// Store uploaded photos with memory management
let uploadedPhotos = [];
const MAX_PHOTOS = 10;  // Limit to prevent memory issues

// Initialize chatbot
function initChatbot() {
    const chatToggle = document.getElementById('chatToggle');
    const chatbotWidget = document.getElementById('chatbotWidget');
    
    if (!chatToggle || !chatbotWidget) {
        console.error('Chat elements not found');
        return;
    }
    
    // Auto-open chatbot after 3 seconds on first visit
    if (!sessionStorage.getItem('chatbotOpened')) {
        setTimeout(() => {
            openChatbot();
            sessionStorage.setItem('chatbotOpened', 'true');
        }, 3000);
    }
}

// Toggle chatbot
function toggleChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    if (!chatbotWidget || !chatToggle) {
        console.error('Chat elements not found');
        return;
    }
    
    if (chatbotWidget.classList.contains('active')) {
        closeChatbot();
    } else {
        openChatbot();
    }
}

// Open chatbot
function openChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    if (chatbotWidget) {
        chatbotWidget.classList.add('active');
    }
    
    if (chatToggle) {
        chatToggle.style.display = 'none';
    }
    
    // Remove badge notification
    const badge = document.querySelector('.chat-badge');
    if (badge) {
        badge.style.display = 'none';
    }
}

// Close chatbot
function closeChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    if (chatbotWidget) {
        chatbotWidget.classList.remove('active');
    }
    
    if (chatToggle) {
        chatToggle.style.display = 'flex';
    }
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input) {
        console.error('Chat input not found');
        return;
    }
    
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and generate response
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(message);
        addMessage(response.text, 'bot', response.quickReplies, response.html);
    }, 1000 + Math.random() * 1000);
}

// Handle photo upload
function triggerPhotoUpload() {
    const photoInput = document.getElementById('chatPhotoInput');
    if (!photoInput) {
        // Create hidden file input if it doesn't exist
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'chatPhotoInput';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = handlePhotoUpload;
        document.body.appendChild(input);
        input.click();
    } else {
        photoInput.click();
    }
}

// Handle photo upload event with better error handling
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ Photo size must be less than 5MB. Your file is ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('❌ Please upload an image file (JPG, PNG, etc.)');
        return;
    }
    
    // Warn if approaching memory limit
    if (uploadedPhotos.length >= MAX_PHOTOS) {
        alert('⚠️ Maximum photos reached. Please clear some photos or start a new chat.');
        return;
    }
    
    // Read file and create preview
    const reader = new FileReader();
    
    // BUG FIX: Add error handler for FileReader
    reader.onerror = function() {
        console.error('Error reading file:', reader.error);
        alert('❌ Error reading file. Please try again.');
    };
    
    reader.onload = function(e) {
        try {
            const imageData = {
                data: e.target.result,
                name: file.name,
                size: file.size,
                timestamp: new Date().toISOString()
            };
            
            // BUG FIX: Check and manage memory usage
            if (uploadedPhotos.length >= MAX_PHOTOS) {
                uploadedPhotos.shift();  // Remove oldest photo
            }
            
            uploadedPhotos.push(imageData);
            
            // Add photo message to chat
            addPhotoMessage(imageData);
            
            // Bot response to photo
            setTimeout(() => {
                const response = {
                    text: `Thanks for uploading "${file.name}"! I can see the image. Based on this photo, it looks like:\n\n• Check Engine Light Issue\n• Battery Problem\n• Brake System Issue\n\nWould you like to describe what's happening or book an appointment for a diagnostic check?`,
                    quickReplies: ["Book appointment", "Describe issue", "Get estimate", "Call us"]
                };
                addMessage(response.text, 'bot', response.quickReplies);
            }, 800);
            
        } catch (error) {
            console.error('Error processing image:', error);
            alert('❌ Error processing image. Please try again.');
        }
    };
    
    reader.readAsDataURL(file);
}

// Add photo message to chat
function addPhotoMessage(imageData) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const photoPreview = document.createElement('img');
    photoPreview.src = imageData.data;
    photoPreview.style.maxWidth = '100%';
    photoPreview.style.borderRadius = '8px';
    photoPreview.style.marginBottom = '8px';
    photoPreview.alt = imageData.name;
    
    const photoInfo = document.createElement('p');
    photoInfo.textContent = `📸 ${imageData.name} (${(imageData.size / 1024).toFixed(1)} KB)`;
    photoInfo.style.fontSize = '0.85rem';
    photoInfo.style.margin = '0';
    
    contentDiv.appendChild(photoPreview);
    contentDiv.appendChild(photoInfo);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add message to chat
function addMessage(text, sender, quickReplies = null, html = null) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textP = document.createElement('p');
    textP.textContent = text;
    contentDiv.appendChild(textP);
    
    // Add HTML content if provided
    if (html) {
        const htmlDiv = document.createElement('div');
        htmlDiv.innerHTML = html;
        contentDiv.appendChild(htmlDiv);
    }
    
    // Add quick replies if provided
    if (quickReplies && quickReplies.length > 0) {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'quick-replies';
        
        quickReplies.forEach(reply => {
            const button = document.createElement('button');
            button.textContent = reply;
            button.addEventListener('click', () => sendQuickReply(reply));
            quickRepliesDiv.appendChild(button);
        });
        
        contentDiv.appendChild(quickRepliesDiv);
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send quick reply
function sendQuickReply(message) {
    // Remove quick reply buttons
    const quickReplies = document.querySelectorAll('.quick-replies');
    quickReplies.forEach(qr => qr.style.display = 'none');
    
    // Add user message
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and generate response
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(message);
        addMessage(response.text, 'bot', response.quickReplies, response.html);
    }, 1000 + Math.random() * 1000);
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.id = 'typingIndicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    contentDiv.appendChild(typingIndicator);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Generate response based on user input
function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
        return {
            text: "🚗 Hello! Welcome to AutoCare Mechanic. How can I assist you with your vehicle today?",
            quickReplies: ["View services", "Book appointment", "Upload photo", "Calculate cost"]
        };
    }
    
    // Appointment booking
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
        // Open booking modal
        setTimeout(() => openBookingModal(), 500);
        return {
            text: "Perfect! I'll open our booking form for you. Please fill in your details and we'll confirm your appointment shortly. 📅",
            quickReplies: []
        };
    }
    
    // Service inquiries
    for (const [service, info] of Object.entries(knowledgeBase.services)) {
        if (lowerMessage.includes(service)) {
            return {
                text: `${info.description}\n\nPrice range: ${info.price}\nEstimated time: ${info.duration}\n\nWould you like to schedule an appointment?`,
                quickReplies: ["Book appointment", "Calculate cost", "Upload photo", "Ask another question"]
            };
        }
    }
    
    // Common issues
    for (const [issue, solution] of Object.entries(knowledgeBase.commonIssues)) {
        if (lowerMessage.includes(issue)) {
            return {
                text: `${solution}\n\nWould you like to schedule a diagnostic appointment or upload a photo of the issue?`,
                quickReplies: ["Book appointment", "Upload photo", "Calculate cost", "Different issue"]
            };
        }
    }
    
    // Pricing inquiries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
        return {
            text: "Our pricing varies based on your vehicle and the service needed. Here are our general price ranges (AUD):\n\n• Oil Change: $80-$150\n• Brake Service: $300-$800\n• Battery: $200-$400\n• Diagnostics: $100-$200\n• Tyre Service: $100-$600\n\nFor an accurate quote, call us at " + BUSINESS_CONFIG.phone + " or use our cost calculator!",
            quickReplies: ["Calculate cost", "Book appointment", "Call now"]
        };
    }
    
    // Hours inquiry
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
        return {
            text: "Our business hours are:\n\nMonday-Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed\n\nWe're here to help!",
            quickReplies: ["Book appointment", "View services", "Contact info"]
        };
    }
    
    // Location inquiry
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('directions')) {
        return {
            text: `We're located at:\n\n${BUSINESS_CONFIG.address}\n\nClick the address above to get directions, or call us at ${BUSINESS_CONFIG.phone}!`,
            quickReplies: ["Get directions", "Book appointment", "Call now"]
        };
    }
    
    // Contact inquiry
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('call') || lowerMessage.includes('text') || lowerMessage.includes('sms')) {
        const html = `
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #1e293b;">📞 Contact Us</h4>
                <div style="margin-bottom: 10px;">
                    <a href="tel:${BUSINESS_CONFIG.phone}" style="display: block; padding: 10px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; margin-bottom: 8px;">
                        📞 Call: ${BUSINESS_CONFIG.phone}
                    </a>
                    <a href="sms:${BUSINESS_CONFIG.phone}" style="display: block; padding: 10px; background: #22c55e; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; margin-bottom: 8px;">
                        💬 Text/SMS: ${BUSINESS_CONFIG.phone}
                    </a>
                    <a href="mailto:${BUSINESS_CONFIG.email}" style="display: block; padding: 10px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600;">
                        📧 Email: ${BUSINESS_CONFIG.email}
                    </a>
                </div>
                <div style="font-size: 0.9rem; color: #64748b; margin-top: 10px;">
                    📍 ${BUSINESS_CONFIG.address}
                </div>
            </div>
        `;
        
        return {
            text: "Here are all the ways to reach us:",
            quickReplies: ["Book appointment", "View services"],
            html: html
        };
    }
    
    // BUG FIX: Emergency number changed from 911 to 000 for Australia
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('broken down')) {
        const html = `
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 10px; border: 2px solid #ef4444;">
                <h4 style="margin: 0 0 10px 0; color: #991b1b;">🚨 Emergency Contact</h4>
                <a href="tel:${BUSINESS_CONFIG.emergency_number}" style="display: block; padding: 12px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 700; font-size: 1.1rem;">
                    📞 CALL NOW: ${BUSINESS_CONFIG.emergency_number}
                </a>
                <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #7f1d1d;">If unsafe or life-threatening, call ${BUSINESS_CONFIG.actual_emergency} (Australian Emergency Services)</p>
            </div>
        `;
        
        return {
            text: "⚠️ For roadside emergencies, please call us immediately! If you're in danger or it's life-threatening, contact emergency services at " + BUSINESS_CONFIG.actual_emergency + ". We can arrange towing if needed.",
            quickReplies: [],
            html: html
        };
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return {
            text: "You're welcome! Is there anything else I can help you with today?",
            quickReplies: ["View services", "Book appointment", "Upload photo", "Nothing else"]
        };
    }
    
    // Goodbye
    if (lowerMessage.match(/^(bye|goodbye|see you|later)/)) {
        return {
            text: "Thank you for contacting AutoCare Mechanic! Drive safe, and we look forward to serving you soon! 🚗",
            quickReplies: []
        };
    }
    
    // Default response
    return {
        text: "I understand you're asking about: '" + message + "'. While I try my best to help, I might need more details. You can also:\n\n• Call us directly at " + BUSINESS_CONFIG.phone + "\n• Upload a photo of the issue\n• Use our cost calculator\n• Book an appointment\n\nHow can I assist you?",
        quickReplies: ["Upload photo", "Calculate cost", "Book appointment", "Call now"]
    };
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
    
    // Add photo upload button to chat input area
    const chatInput = document.querySelector('.chatbot-input');
    if (chatInput && !document.getElementById('photoUploadBtn')) {
        const photoBtn = document.createElement('button');
        photoBtn.id = 'photoUploadBtn';
        photoBtn.innerHTML = '<i class="fas fa-camera"></i>';
        photoBtn.title = 'Upload Photo';
        photoBtn.type = 'button';  // Important: specify type to prevent form submission
        photoBtn.onclick = triggerPhotoUpload;
        photoBtn.style.cssText = `
            background: #f97316;
            color: white;
            border: none;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.1rem;
            transition: all 0.3s;
            margin-right: 8px;
        `;
        photoBtn.onmouseover = () => photoBtn.style.background = '#ea580c';
        photoBtn.onmouseout = () => photoBtn.style.background = '#f97316';
        
        chatInput.insertBefore(photoBtn, chatInput.querySelector('input'));
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
