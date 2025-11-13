// Enhanced Chatbot functionality for AutoCare Mechanic
// With photo upload, clickable links, cost calculator, and more

// Knowledge base for the chatbot
const knowledgeBase = {
    services: {
        'oil change': {
            description: "We offer quick and professional oil change services. Regular oil changes every 5,000-10,000 km help maintain engine performance.",
            price: "$80-$150",
            priceMin: 80,
            priceMax: 150,
            duration: "30 minutes"
        },
        'brake service': {
            description: "Complete brake inspection, pad replacement, rotor resurfacing, and brake fluid flush. We use quality parts for your safety.",
            price: "$300-$800",
            priceMin: 300,
            priceMax: 800,
            duration: "1-2 hours"
        },
        'battery': {
            description: "Battery testing, cleaning, and replacement services. We stock batteries for all vehicle makes and models.",
            price: "$200-$400",
            priceMin: 200,
            priceMax: 400,
            duration: "30 minutes"
        },
        'engine diagnostics': {
            description: "Using advanced diagnostic equipment, we identify engine problems quickly and accurately.",
            price: "$100-$200",
            priceMin: 100,
            priceMax: 200,
            duration: "45 minutes"
        },
        'tire service': {
            description: "Tyre rotation, balancing, alignment, and replacement services to ensure safe driving.",
            price: "$100-$600",
            priceMin: 100,
            priceMax: 600,
            duration: "1 hour"
        },
        'transmission': {
            description: "Transmission fluid change, diagnostics, and repair services for smooth gear shifting.",
            price: "$200-$1000+",
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
        'vibration': "Vibrations can be caused by unbalanced tires, worn suspension, alignment issues, or brake problems. We can inspect and fix the issue."
    },
    contact: {
        phone: "+61 412 345 678",
        email: "info@autocaremechanic.com.au",
        address: "123 Main Street, Sydney NSW 2000",
        hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed",
        maps: "https://maps.google.com/?q=123+Main+Street+Sydney+NSW+2000"
    }
};

// Store uploaded photos
let uploadedPhotos = [];

// Initialize chatbot
function initChatbot() {
    const chatToggle = document.getElementById('chatToggle');
    const chatbotWidget = document.getElementById('chatbotWidget');
    
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
    
    chatbotWidget.classList.add('active');
    chatToggle.style.display = 'none';
    
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
    
    chatbotWidget.classList.remove('active');
    chatToggle.style.display = 'flex';
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatbotInput');
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

// NEW: Handle photo upload
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

// NEW: Handle photo upload event
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    // Read file and create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = {
            data: e.target.result,
            name: file.name,
            size: file.size,
            timestamp: new Date().toISOString()
        };
        
        uploadedPhotos.push(imageData);
        
        // Add photo message to chat
        addPhotoMessage(imageData);
        
        // Bot response to photo
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addMessage(
                    "Thanks for sharing the photo! I can see the issue. Based on the image, I recommend scheduling an appointment so our mechanic can take a closer look. Would you like to book now?",
                    'bot',
                    ['Book appointment', 'Upload another photo', 'Ask question']
                );
            }, 1500);
        }, 500);
    };
    
    reader.readAsDataURL(file);
}

// NEW: Add photo message to chat
function addPhotoMessage(imageData) {
    const messagesContainer = document.getElementById('chatbotMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message photo-message';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageData.data;
    img.alt = imageData.name;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.cursor = 'pointer';
    img.onclick = () => openPhotoViewer(imageData.data);
    
    const caption = document.createElement('p');
    caption.textContent = '📷 Photo uploaded';
    caption.style.fontSize = '0.85rem';
    caption.style.marginTop = '5px';
    caption.style.color = '#64748b';
    
    contentDiv.appendChild(img);
    contentDiv.appendChild(caption);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// NEW: Open photo viewer (full screen)
function openPhotoViewer(imageSrc) {
    const viewer = document.createElement('div');
    viewer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
    `;
    
    viewer.appendChild(img);
    viewer.onclick = () => viewer.remove();
    
    document.body.appendChild(viewer);
}

// Send quick reply
function sendQuickReply(message) {
    // Remove quick reply buttons
    const quickReplies = document.querySelectorAll('.quick-replies');
    quickReplies.forEach(qr => qr.style.display = 'none');
    
    // Handle special quick replies
    if (message === 'Upload photo' || message === 'Upload another photo') {
        triggerPhotoUpload();
        return;
    }
    
    if (message === 'Calculate cost') {
        showCostCalculator();
        return;
    }
    
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

// NEW: Show cost calculator
function showCostCalculator() {
    const html = `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">💰 Cost Calculator</h4>
            <select id="calcService" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
                <option value="">Select a service...</option>
                <option value="oil change">Oil Change ($35-$75)</option>
                <option value="brake service">Brake Service ($150-$400)</option>
                <option value="battery">Battery Replacement ($100-$200)</option>
                <option value="engine diagnostics">Engine Diagnostics ($50-$100)</option>
                <option value="tire service">Tire Service ($50-$300)</option>
                <option value="transmission">Transmission Service ($100-$500+)</option>
            </select>
            <button onclick="calculateEstimate()" style="width: 100%; padding: 10px; background: #f97316; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                Calculate Estimate
            </button>
            <div id="calcResult" style="margin-top: 10px; display: none;"></div>
        </div>
    `;
    
    addMessage('Here\'s our cost calculator. Select a service to see the estimated price range:', 'bot', [], html);
}

// NEW: Calculate cost estimate
function calculateEstimate() {
    const serviceSelect = document.getElementById('calcService');
    const resultDiv = document.getElementById('calcResult');
    const serviceName = serviceSelect.value;
    
    if (!serviceName) {
        alert('Please select a service');
        return;
    }
    
    const service = knowledgeBase.services[serviceName];
    const avgCost = (service.priceMin + service.priceMax) / 2;
    
    resultDiv.innerHTML = `
        <div style="background: white; padding: 12px; border-radius: 6px; border: 2px solid #f97316;">
            <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">Estimated Cost</div>
            <div style="font-size: 1.5rem; color: #f97316; font-weight: 700; margin-bottom: 5px;">$${service.priceMin} - $${service.priceMax}</div>
            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 5px;">Average: $${avgCost.toFixed(2)}</div>
            <div style="font-size: 0.85rem; color: #64748b;">Duration: ${service.duration}</div>
        </div>
    `;
    resultDiv.style.display = 'block';
    
    // Auto-scroll to result
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Add message to chat
function addMessage(text, sender, quickReplies = null, customHTML = null) {
    const messagesContainer = document.getElementById('chatbotMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Add text with clickable links
    const textP = document.createElement('p');
    textP.innerHTML = makeLinksClickable(text);
    contentDiv.appendChild(textP);
    
    // Add custom HTML if provided
    if (customHTML) {
        const customDiv = document.createElement('div');
        customDiv.innerHTML = customHTML;
        contentDiv.appendChild(customDiv);
    }
    
    // Add quick replies if provided
    if (quickReplies && quickReplies.length > 0) {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'quick-replies';
        
        quickReplies.forEach(reply => {
            const button = document.createElement('button');
            button.textContent = reply;
            button.onclick = () => sendQuickReply(reply);
            quickRepliesDiv.appendChild(button);
        });
        
        contentDiv.appendChild(quickRepliesDiv);
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// NEW: Make phone numbers, emails, and addresses clickable
function makeLinksClickable(text) {
    // Make phone numbers clickable
    text = text.replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '<a href="tel:$1" style="color: #f97316; text-decoration: none; font-weight: 600;">📞 $1</a>');
    
    // Make email addresses clickable
    text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '<a href="mailto:$1" style="color: #f97316; text-decoration: none; font-weight: 600;">📧 $1</a>');
    
    // Make addresses clickable (simple pattern)
    if (text.includes(knowledgeBase.contact.address)) {
        text = text.replace(
            knowledgeBase.contact.address,
            `<a href="${knowledgeBase.contact.maps}" target="_blank" style="color: #f97316; text-decoration: none; font-weight: 600;">📍 ${knowledgeBase.contact.address}</a>`
        );
    }
    
    return text;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    
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
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
        return {
            text: "Hello! Welcome to AutoCare Mechanic. How can I assist you with your vehicle today?",
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
            text: "Our pricing varies based on your vehicle and the service needed. Here are our general price ranges (AUD):\n\n• Oil Change: $80-$150\n• Brake Service: $300-$800\n• Battery: $200-$400\n• Diagnostics: $100-$200\n• Tyre Service: $100-$600\n\nFor an accurate quote, call us at +61 412 345 678 or use our cost calculator!",
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
            text: `We're located at:\n\n${knowledgeBase.contact.address}\n\nClick the address above to get directions, or call us at ${knowledgeBase.contact.phone}!`,
            quickReplies: ["Book appointment", "Call now", "View hours"]
        };
    }
    
    // Contact inquiry
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('call') || lowerMessage.includes('text') || lowerMessage.includes('sms')) {
        const html = `
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #1e293b;">📞 Contact Us</h4>
                <div style="margin-bottom: 10px;">
                    <a href="tel:${knowledgeBase.contact.phone}" style="display: block; padding: 10px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; margin-bottom: 8px;">
                        📞 Call: ${knowledgeBase.contact.phone}
                    </a>
                    <a href="sms:${knowledgeBase.contact.phone}" style="display: block; padding: 10px; background: #22c55e; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600; margin-bottom: 8px;">
                        💬 Text/SMS: ${knowledgeBase.contact.phone}
                    </a>
                    <a href="mailto:${knowledgeBase.contact.email}" style="display: block; padding: 10px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 600;">
                        📧 Email: ${knowledgeBase.contact.email}
                    </a>
                </div>
                <div style="font-size: 0.9rem; color: #64748b; margin-top: 10px;">
                    📍 ${knowledgeBase.contact.address}
                </div>
            </div>
        `;
        
        return {
            text: "Here are all the ways to reach us:",
            quickReplies: ["Book appointment", "View services"],
            html: html
        };
    }
    
    // Emergency situations
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('broken down')) {
        const html = `
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 10px; border: 2px solid #ef4444;">
                <h4 style="margin: 0 0 10px 0; color: #991b1b;">🚨 Emergency Contact</h4>
                <a href="tel:${knowledgeBase.contact.phone}" style="display: block; padding: 12px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 700; font-size: 1.1rem;">
                    📞 CALL NOW: ${knowledgeBase.contact.phone}
                </a>
                <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #7f1d1d;">If unsafe, contact emergency services first (911)</p>
            </div>
        `;
        
        return {
            text: "⚠️ For roadside emergencies, please call us immediately! If you're in an unsafe location, contact emergency services first. We can arrange towing if needed.",
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
        text: "I understand you're asking about: '" + message + "'. While I try my best to help, I might need more details. You can also:\n\n• Call us directly at (555) 123-4567\n• Upload a photo of the issue\n• Use our cost calculator\n• Book an appointment\n\nHow can I assist you?",
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
