const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const chatService = {
    // Get all chat sessions
    async getChatSessions() {
        const response = await fetch(`${BACKEND_URL}/api/chat-sessions`);
        if (!response.ok) {
            throw new Error('Failed to fetch chat sessions');
        }
        return response.json();
    },

    // Get a single chat session by ID
    async getChatSession(sessionId) {
        const response = await fetch(`${BACKEND_URL}/api/chat-sessions/${sessionId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch chat session');
        }
        return response.json();
    },

    // Create a new chat session
    async createChatSession(sessionData) {
        const response = await fetch(`${BACKEND_URL}/api/chat-sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });
        if (!response.ok) {
            throw new Error('Failed to create chat session');
        }
        return response.json();
    },

    // Update a chat session
    async updateChatSession(sessionId, sessionData) {
        const response = await fetch(`${BACKEND_URL}/api/chat-sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });
        if (!response.ok) {
            throw new Error('Failed to update chat session');
        }
        return response.json();
    },

    // Delete a chat session
    async deleteChatSession(sessionId) {
        const response = await fetch(`${BACKEND_URL}/api/chat-sessions/${sessionId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete chat session');
        }
        return response.json();
    },

    // Add a message to a chat session
    async addChatMessage(sessionId, message) {
        const response = await fetch(`${BACKEND_URL}/api/chat-sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        if (!response.ok) {
            throw new Error('Failed to add chat message');
        }
        return response.json();
    },

    // Add an image to a chat session
    async addChatImage(sessionId, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${BACKEND_URL}/api/chat-sessions/${sessionId}/images`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to add chat image');
        }
        return response.json();
    },

    // Send a chat message and get streaming response
    async sendChatMessage(sessionId, message) {
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                sessionId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send chat message');
        }

        return response;
    },

    // Analyze monument images
    async analyzeMonument(sessionId, images, location) {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append('images', image);
        });
        if (location) {
            formData.append('location', JSON.stringify(location));
        }
        formData.append('sessionId', sessionId);

        const response = await fetch(`${BACKEND_URL}/api/analyze-monument`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to analyze monument');
        }

        return response;
    }
}; 