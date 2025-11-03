// Chatbot functionality for AutoCare Mechanic

// Knowledge base for the chatbot
const knowledgeBase = {
    services: {
        'oil change': {
            description: "We offer quick and professional oil change services. Regular oil changes every 3,000-5,000 miles help maintain engine performance.",
            price: "$35-$75",
            duration: "30 minutes"
        },
        'brake service': {
            description: "Complete brake inspection, pad replacement, rotor resurfacing, and brake fluid flush. We use quality parts for your safety.",
            price: "$150-$400",
            duration: "1-2 hours"
        },
        'battery': {
            description: "Battery testing, cleaning, and replacement services. We stock batteries for all vehicle makes and models.",
            price: "$100-$200",
            duration: "30 minutes"
        },
        'engine diagnostics': {
            description: "Using advanced diagnostic equipment, we identify engine problems quickly and accurately.",
            price: "$50-$100",
            duration: "45 minutes"
        },
        'tire service': {
            description: "Tire rotation, balancing, alignment, and replacement services to ensure safe driving.",
            price: "$50-$300",
            duration: "1 hour"
        },
        'transmission': {
            description: "Transmission fluid change, diagnostics, and repair services for smooth gear shifting.",
            price: "$100-$500+",
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
    }
};

// Appointment data (in a real app, this would be stored in a database)
let appointments = [];

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
        addMessage(response.text, 'bot', response.quickReplies);
    }, 1000 + Math.random() * 1000);
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
        addMessage(response.text, 'bot', response.quickReplies);
    }, 1000 + Math.random() * 1000);
}

// Add message to chat
function addMessage(text, sender, quickReplies = null) {
    const messagesContainer = document.getElementById('chatbotMessages');
    
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
            quickReplies: ["View services", "Book appointment", "Check engine light", "Get pricing"]
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
                quickReplies: ["Book appointment", "Ask another question", "View all services"]
            };
        }
    }
    
    // Common issues
    for (const [issue, solution] of Object.entries(knowledgeBase.commonIssues)) {
        if (lowerMessage.includes(issue)) {
            return {
                text: `${solution}\n\nWould you like to schedule a diagnostic appointment?`,
                quickReplies: ["Book appointment", "Tell me more", "Different issue"]
            };
        }
    }
    
    // Pricing inquiries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
        return {
            text: "Our pricing varies based on your vehicle and the service needed. Here are our general price ranges:\n\n• Oil Change: $35-$75\n• Brake Service: $150-$400\n• Battery: $100-$200\n• Diagnostics: $50-$100\n• Tire Service: $50-$300\n\nFor an accurate quote, please call us at (555) 123-4567 with your vehicle details.",
            quickReplies: ["Book appointment", "Another question"]
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
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
        return {
            text: "We're located at:\n\n123 Main Street\nYour City, ST 12345\n\nFeel free to visit us during business hours or call ahead at (555) 123-4567!",
            quickReplies: ["Get directions", "Book appointment", "View hours"]
        };
    }
    
    // Contact inquiry
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('call')) {
        return {
            text: "Here's how to reach us:\n\n📞 Phone: (555) 123-4567\n📧 Email: info@autocaremechanic.com\n📍 Address: 123 Main Street, Your City, ST 12345\n\nWe're happy to help!",
            quickReplies: ["Book appointment", "View services"]
        };
    }
    
    // Emergency situations
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('broken down')) {
        return {
            text: "If you have a roadside emergency, please call us immediately at (555) 123-4567. If you're in an unsafe location, contact roadside assistance or emergency services first. We can arrange for towing if needed.",
            quickReplies: ["Call now", "View services"]
        };
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return {
            text: "You're welcome! Is there anything else I can help you with today?",
            quickReplies: ["View services", "Book appointment", "Nothing else"]
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
        text: "I understand you're asking about: '" + message + "'. While I try my best to help, I might need more details. You can also call us directly at (555) 123-4567 for immediate assistance. What would you like to know?",
        quickReplies: ["View all services", "Book appointment", "Speak to human", "Pricing info"]
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
