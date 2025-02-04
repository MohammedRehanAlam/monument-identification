# Gemini AI Chat Application

A simple chat application using Google's Gemini AI API.

## Setup

1. Install the required packages:
```bash
pip install -r requirements.txt
```

2. Replace the API_KEY in app.py with your Gemini API key
   (Get your API key from https://makersuite.google.com/app/apikey)

3. Start the Flask backend:
```bash
python app.py
```

4. In a new terminal, navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

5. Start the React frontend:
```bash
npm start
```

The application should now be running at http://localhost:3000

## Features

- Simple chat interface
- Real-time responses from Gemini AI
- Error handling
- Loading states
