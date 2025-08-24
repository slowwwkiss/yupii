// BLIP AI Chat - HTTP API Integration with Backend Server
// Communicates with running blip-ai-server.js via HTTP APIs

class BLIPChat {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.isProcessing = false;
        this.isInitialized = false;
        
        this.initialize();
    }

    async initialize() {
        try {
            // Add welcome message
            this.addMessage('assistant', "😾 *stretches* Meow! I'm BLIP, your grumpy Solana memecoin oracle. What do you want to know? 🙄");
            this.isInitialized = true;
            this.bindEvents();
        } catch (error) {
            console.error('Failed to initialize BLIP chat:', error);
        }
    }

    bindEvents() {
        // Predefined question button
        const questionButton = document.querySelector('.question-btn');
        if (questionButton) {
            questionButton.addEventListener('click', () => {
                const question = questionButton.getAttribute('data-question');
                if (question) {
                    this.processPredefinedQuestion(question, questionButton);
                }
            });
        }
    }

    async processPredefinedQuestion(question, button) {
        if (this.isProcessing || !this.isInitialized) return;

        // Disable button and change appearance
        button.disabled = true;
        button.style.opacity = '0.5';
        button.textContent = '😾 Processing...';

        try {
            // Add user message
            this.addMessage('user', question);

            // Show typing indicator
            this.showTypingIndicator();

            this.isProcessing = true;

            // Send to backend via HTTP API
            const response = await this.askBLIP(question);

            // Add AI response (this will trigger the typing animation)
            this.addMessage('assistant', response);

            // Hide typing indicator after a delay to allow typing animation to complete
            setTimeout(() => {
                this.hideTypingIndicator();
            }, 1000); // Wait 1 second for typing to start

        } catch (error) {
            console.error('Error processing predefined question:', error);
            this.addMessage('assistant', '❌ Sorry, there was an error processing your question. Please try again.');
            this.hideTypingIndicator();
        } finally {
            this.isProcessing = false;

            // Re-enable button
            button.disabled = false;
            button.style.opacity = '1';
            button.textContent = question;
        }
    }

    async askBLIP(question) {
        try {
            const response = await fetch('/api/ask-blip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Handle different response formats from the backend
            if (data.success && data.response) {
                // Handle predefined question response
                if (typeof data.response === 'string') {
                    return data.response;
                } else if (data.response.text) {
                    return data.response.text;
                } else if (data.response.response) {
                    return data.response.response;
                }
            } else if (data.response) {
                // Direct response
                return data.response;
            } else if (data.message) {
                return data.message;
            }
            
            return '😾 *yawns* Ugh, something went wrong with my response format. 🙄';
        } catch (error) {
            console.error('Error asking BLIP:', error);
            throw error;
        }
    }

    addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const senderLabel = sender === 'user' ? 'You' : 'BLIP';
        const senderIcon = sender === 'user' ? '👤' : '😾';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender-icon">${senderIcon}</span>
                <span class="sender-name">${senderLabel}</span>
            </div>
            <div class="message-content"></div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // If it's an assistant message, animate the typing
        if (sender === 'assistant') {
            this.typeMessage(messageDiv.querySelector('.message-content'), message);
        } else {
            // User messages appear instantly
            messageDiv.querySelector('.message-content').textContent = message;
        }
    }

    async typeMessage(element, text) {
        if (typeof text !== 'string') {
            console.error('Text is not a string:', text);
            element.textContent = '😾 *yawns* Ugh, something went wrong with my response format. 🙄';
            return;
        }
        
        const words = text.split(' ');
        element.textContent = '';
        
        for (let i = 0; i < words.length; i++) {
            element.textContent += words[i] + ' ';
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            this.scrollToBottom();
        }
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BLIPChat();
});

