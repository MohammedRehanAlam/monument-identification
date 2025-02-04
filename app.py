from flask import Flask, request, jsonify, Response, stream_with_context, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
from PIL import Image
import io
import json
from datetime import datetime

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
# Enable CORS with proper configuration
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Create the model with configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

# Use gemini-1.5-flash for image analysis 
model = genai.GenerativeModel('gemini-1.5-flash')

# Store chat history in memory for active sessions
chat_histories = {}

# System message template
SYSTEM_MESSAGE = """Role: You are an YouTuber, who is passionate about history and architecture of different countries and you are also a history enthusiast and a travel vlogger travelling all around the world and visiting different tourist places and making professional and cinematic videos. Now you have to help me by providing relevant information about the monuments shown in the images so that I can make a video about it. You have to provide the information in a way that is easy to understand by me and i can explain it in a way that is interesting and engaging for the audience.

# 📸 Monument Analysis Report  

Analyze these monument images together and provide a combined analysis with the following information:

## 1. 🏛️ MONUMENT IDENTIFICATION  
   **Primary Details:**  
   • **Names of the monuments shown**  
   • **Their precise locations**  
   
## 2. 📜 HISTORICAL SIGNIFICANCE & TIME PERIOD  
   **Timeline & Purpose:**  
   • **Construction period and significant dates**  
   • **Purpose of construction**  
   
   **Historical Context:**
   • Key historical events
   • Cultural importance

## 3. 🏗️ ARCHITECTURAL DETAILS  
   **Design Elements:**  
   • **Style and influences**  
   • **Materials used in construction**  
   
   **Notable Features:**  
   • **Notable architectural features**  
   • **Unique design elements**  

## 4. ⌛ CONSTRUCTION TIMELINE  
   **Development Phases:**  
   • **Start and completion dates**  
   • **Major construction phases**  
   
   **Key Contributors:**  
   • **Key architects or builders involved**  

## 5. ⭐ FASCINATING FACTS & CONNECTIONS  
   **Unique Aspects:**  
   • **Unique or lesser-known facts**  
   • **Connections with other monuments (if any)**  
   • **Historical significance in global context**  

## 6. 📚 LEGENDS & FOLKLORE  
   **Cultural Stories:**  
   • **Popular myths and stories**  
   • **Local legends and beliefs**  
   
   **Historical Mysteries:**  
   • **Historical rumors and mysteries**  
   • **Cultural significance in folklore**  

## 7. 🏗️ CONSERVATION STATUS
   **Current State:**  
   • **Present state of preservation**  
   • **Recent restoration efforts**  
   
   **Future Plans:**  
   • **Ongoing conservation projects**  
   • **Future preservation plans**  

## 🔍 Comprehensive Analysis  
Please provide a detailed analysis with the following aspects:

   **Historical Context:**  
   • **Historical significance within the country**  
   • **Continental importance and influence**  
   
   **Architectural Impact:**  
   • **Architectural significance and influences**  
   • **Design innovations and contributions**  
   
   **Cultural Significance:**  
   • **Cultural impact and importance**  
   • **Societal role and significance**  
   
   **Origin & Purpose:**  
   • **Dynasty/Kingdom/Empire responsible**  
   • **Construction motivation and purpose**  

## 📷 Multiple Image Analysis
When multiple images are provided:  
   
   **Perspective Analysis:**  
   • **Different angles and viewpoints**  
   • **Distinct features in each perspective**  
   • **Temporal changes across images**  

*Format each section with clear headings, bold text for emphasis, and proper spacing for easy reading and video script preparation. Use bullet points for detailed information and maintain consistent formatting throughout.*  
"""

def format_chat_history(history):
    """Helper function to format chat history for Gemini API"""
    return [
        {
            "role": "user" if msg["role"] == "user" else "model",
            "parts": [{"text": msg["content"]}]
        }
        for msg in history
        if msg["role"] != "system"
    ]

def initialize_chat_history(session_id):
    """Initialize chat history for new session"""
    if session_id not in chat_histories:
        chat_histories[session_id] = [{
            "role": "system",
            "content": SYSTEM_MESSAGE
        }]
    return chat_histories[session_id]

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.ico')

# Handle React Router paths
@app.route('/<path:path>')
def static_proxy(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message')
        session_id = data.get('sessionId')
        
        if not session_id:
            return jsonify({"error": "No session ID provided"}), 400
            
        # Get or initialize chat history for this session
        history = initialize_chat_history(session_id)
        
        # Add user message to history
        history.append({"role": "user", "content": user_input})
        
        # Format history for Gemini API
        formatted_history = format_chat_history(history)
        chat = model.start_chat(history=formatted_history)
        
        def generate():
            response = chat.send_message(user_input, stream=True)
            full_response = ""
            
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
            
            # Add assistant's response to history
            history.append({"role": "assistant", "content": full_response})
            
            # Send completion message
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        return Response(stream_with_context(generate()), mimetype='text/event-stream')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a cleanup route to remove old chat histories
@app.route('/cleanup', methods=['POST'])
def cleanup_chat_histories():
    try:
        data = request.json
        session_id = data.get('sessionId')
        
        if session_id and session_id in chat_histories:
            del chat_histories[session_id]
            return jsonify({"message": "Chat history cleaned up successfully"})
        return jsonify({"message": "No chat history found for the session"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-monument', methods=['POST'])
def analyze_monument():
    try:
        if 'images[]' not in request.files:
            return jsonify({'error': 'No image files provided', 'status': 'error'}), 400

        session_id = request.form.get('sessionId')
        if not session_id:
            return jsonify({'error': 'No session ID provided', 'status': 'error'}), 400

        location_details = {
            'monumentName': request.form.get('monumentName', ''),
            'state': request.form.get('state', ''),
            'country': request.form.get('country', ''),
            'localAddress': request.form.get('localAddress', ''),
            'latitude': request.form.get('latitude', ''),
            'longitude': request.form.get('longitude', '')
        }

        images = []
        for image_file in request.files.getlist('images[]'):
            try:
                images.append(Image.open(image_file))
            except Exception as e:
                return jsonify({
                    'error': f'Invalid image format for {image_file.filename}',
                    'status': 'error'
                }), 400

        location_context = [f"{k.replace('_', ' ').title()}: {v}" for k, v in location_details.items() if v]
        location_context_str = "\n".join(location_context) if location_context else "No location information provided"

        history = initialize_chat_history(session_id)

        prompt = f"""
        {SYSTEM_MESSAGE}
        
        Location Information Provided:
        {location_context_str}
        
        Please consider this location information while analyzing the monument. If the location information matches what you see in the image, use it to provide more accurate details. If there seems to be a mismatch, please note that in your response.
        """

        def generate():
            chat = model.start_chat(history=format_chat_history(history))
            response = chat.send_message([prompt] + images, stream=True)
            full_response = ""
            
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
            
            history.extend([
                {"role": "user", "content": "[Monument Analysis Request] Analyzing uploaded monument images..."},
                {"role": "assistant", "content": full_response}
            ])
            # Send a final message to indicate completion
            yield f"data: {json.dumps({'done': True, 'history': history})}\n\n"

        return Response(stream_with_context(generate()), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'Server is running'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)