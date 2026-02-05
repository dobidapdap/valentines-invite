// Configuration
const CONFIG = {
    senderEmail: 'perezkyle065@gmail.com',
    recipientEmail: 'allyzzalou.goyeneche@bisu.edu.ph',
    dateOptions: {
        dinner: {
            subject: "You're Invited to Dinner! 💕",
            venue: "Drunk Skillet Steak & Grill",
            location: "Seaside, Becca Building, 0348 Venancio P. Inting Avenue, Mansasa, Tagbilaran City, 6300 Bohol",
            time: "7:00 PM (19:00)",
            type: "Romantic Dinner"
        },
        lunch: {
            subject: "Let's Have Brunch Together! ☕",
            venue: "Tamper Coffee and Brunch",
            location: "P. Del Rosario Street corner CPG East Avenue, Poblacion 1, Tagbilaran City, 6300 Bohol",
            time: "11:00 AM",
            type: "Brunch Date"
        },
        snack: {
            subject: "Afternoon Treat Date! 🧁",
            venue: "Heath's Cafe",
            location: "419a Carlos P. Garcia East Avenue, Tagbilaran City, 6300 Bohol",
            time: "4:00 PM (16:00)",
            type: "Afternoon Snack"
        },
        home: {
            subject: "Cozy Home Date Together! 🏡",
            venue: "Song-on, Loon, Bohol",
            location: "Home",
            time: "We'll cook together",
            type: "Home Date"
        }
    }
};

// DOM Elements
const questionScreen = document.getElementById('question-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const confirmationScreen = document.getElementById('confirmation-screen');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const dateCards = document.querySelectorAll('.date-card');
const confirmationMessage = document.getElementById('confirmation-message');

// State
let noDodgeCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    createConfetti();
});

function setupEventListeners() {
    // Yes button
    yesBtn.addEventListener('click', handleYesClick);

    // No button with dodge effect
    noBtn.addEventListener('mouseenter', handleNoDodge);
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleNoDodge();
    });

    // Date selection cards
    dateCards.forEach(card => {
        card.addEventListener('click', () => handleDateSelection(card.dataset.option));
    });
}

function handleYesClick() {
    // Add celebration animation
    yesBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        yesBtn.style.transform = 'scale(1)';
    }, 200);

    // Transition to celebration screen
    setTimeout(() => {
        switchScreen(questionScreen, celebrationScreen);
    }, 500);
}

function handleNoDodge() {
    noDodgeCount++;
    
    // Get button dimensions
    const btnRect = noBtn.getBoundingClientRect();
    const containerRect = questionScreen.getBoundingClientRect();
    
    // Calculate safe movement area
    const maxX = containerRect.width - btnRect.width - 40;
    const maxY = containerRect.height - btnRect.height - 40;
    
    // Generate random position
    let newX, newY;
    
    if (noDodgeCount < 3) {
        // First few dodges - move to opposite side
        newX = btnRect.left < containerRect.width / 2 ? 
               Math.random() * (maxX - maxX/2) + maxX/2 : 
               Math.random() * (maxX/2);
        newY = btnRect.top < containerRect.height / 2 ? 
               Math.random() * (maxY - maxY/2) + maxY/2 : 
               Math.random() * (maxY/2);
    } else {
        // After several attempts - move anywhere
        newX = Math.random() * maxX;
        newY = Math.random() * maxY;
    }
    
    // Apply position with smooth transition
    noBtn.style.position = 'absolute';
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
    noBtn.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    // Shrink the button slightly each time
    const scale = Math.max(0.7, 1 - (noDodgeCount * 0.05));
    noBtn.style.transform = `scale(${scale})`;
    
    // Optional: Make Yes button bigger
    const yesScale = Math.min(1.3, 1 + (noDodgeCount * 0.05));
    yesBtn.style.transform = `scale(${yesScale})`;
    
    // Add shake animation
    noBtn.style.animation = 'shake 0.5s';
    setTimeout(() => {
        noBtn.style.animation = '';
    }, 500);
}

function handleDateSelection(option) {
    const dateInfo = CONFIG.dateOptions[option];
    
    if (!dateInfo) {
        console.error('Invalid date option:', option);
        return;
    }

    // Show loading state
    celebrationScreen.classList.add('loading');

    // Send email
    sendEmail(dateInfo)
        .then(() => {
            // Update confirmation message
            confirmationMessage.innerHTML = `
                <strong>${dateInfo.type}</strong><br>
                ${dateInfo.venue}<br>
                ${dateInfo.location}<br>
                ${dateInfo.time}
            `;

            // Transition to confirmation screen
            setTimeout(() => {
                celebrationScreen.classList.remove('loading');
                switchScreen(celebrationScreen, confirmationScreen);
            }, 800);
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            celebrationScreen.classList.remove('loading');
            alert('There was an issue sending the email. Please try again or contact me directly!');
        });
}

async function sendEmail(dateInfo) {
    // Create email body
    const emailBody = `
Hello Lalovee! 💕

I would like to express how much you mean to me and how grateful I am for you. I’m truly excited and looking forward to spending our upcoming Valentine’s date together.

Valentine's Date Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Type: ${dateInfo.type}
🏢 Venue: ${dateInfo.venue}
📌 Location: ${dateInfo.location}
🕐 Time: ${dateInfo.time}

Looking forward to our date together!

With love,
Kyle

━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent to: ${CONFIG.recipientEmail}
From: ${CONFIG.senderEmail}
    `.trim();

    // Using FormSubmit.co for email sending (free service)
    const formData = new FormData();
    formData.append('_to', CONFIG.recipientEmail);
    formData.append('_subject', dateInfo.subject);
    formData.append('_from', CONFIG.senderEmail);
    formData.append('message', emailBody);
    formData.append('_template', 'box');
    formData.append('_captcha', 'false');

    try {
        const response = await fetch('https://formsubmit.co/ajax/' + CONFIG.recipientEmail, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return await response.json();
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
}

function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    setTimeout(() => {
        toScreen.classList.add('active');
    }, 300);
}

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    const colors = ['#ff6b9d', '#ffc2d4', '#ff4757', '#ffd700', '#ff1744'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = Math.random();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animation = `confettiFall ${3 + Math.random() * 3}s linear infinite`;
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confettiContainer.appendChild(confetti);
    }
}

// Add confetti fall animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Prevent default form submission
document.addEventListener('submit', (e) => {
    e.preventDefault();
});