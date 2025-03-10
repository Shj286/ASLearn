from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import base64
import numpy as np
import json
from io import BytesIO
from PIL import Image
import logging
from typing import Dict, List

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

# Define colors for drawing
line_spec = mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2)  # Green for lines
dot_spec = mp_draw.DrawingSpec(color=(0, 0, 255), thickness=2)  # Red for dots

finger_tips = [8, 12, 16, 20]
thumb_tip = 4

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define supported gestures with descriptions
SUPPORTED_GESTURES = {
    "LIKE": "Thumbs-up gesture - indicates approval or agreement",
    "DISLIKE": "Thumbs-down gesture - indicates disapproval or disagreement",
    "OK": "Thumb and index finger forming a circle - indicates everything is good",
    "PEACE": "Index and middle fingers extended in a V shape - represents peace",
    "CALL ME": "Thumb and pinky extended, other fingers folded - mimics a phone",
    "STOP": "All fingers extended with palm facing forward - signals to stop",
    "FORWARD": "Index finger pointing forward, other fingers folded - indicates direction",
    "LEFT": "Hand pointing to the left - indicates left direction",
    "RIGHT": "Hand pointing to the right - indicates right direction",
    "I LOVE YOU": "Index finger and pinky extended with thumb out - sign language for 'I love you'"
}

@app.post("/api/gesture")
async def recognize_gesture(request: Request) -> Dict[str, str]:
    """
    Receives an image from the frontend, processes it to detect hand gestures,
    and returns the recognized gesture.
    
    The request body should be a JSON with a base64 encoded image:
    {
        "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBA..."
    }
    """
    logger.info("Received gesture recognition API request")
    
    try:
        # Parse request body
        data_json = await request.json()
        
        # Handle both formats: with or without data URL prefix
        image_data = data_json.get("image", "")
        if isinstance(image_data, str):
            if "base64," in image_data:
                base64_image = image_data.split("base64,")[1]
            else:
                base64_image = image_data  # Assume it's already just the base64 string
        else:
            return {"error": "Invalid image format", "gesture": "Error", "meaning": "Failed to process image"}
        
        # Decode base64 to image
        image_bytes = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_bytes))
        frame = np.array(image)
        
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame and get hand landmarks
        results = hands.process(rgb_frame)
        
        detected_gesture = "No hand detected"
        
        if results.multi_hand_landmarks:
            logger.debug("Hand detected in frame")
            for hand_landmarks in enumerate(results.multi_hand_landmarks):
                lm_list = []  # List to store landmark positions
                finger_fold_status = []
                
                # Extract landmarks
                for i, lm in enumerate(hand_landmarks[1].landmark):
                    lm_list.append(lm)
                
                # Get frame dimensions
                h, w, c = frame.shape
                
                # Check finger fold status
                for tip in finger_tips:
                    if lm_list[tip].x < lm_list[tip - 3].x:
                        finger_fold_status.append(True)
                    else:
                        finger_fold_status.append(False)
                
                # Detect gestures
                # LIKE (Thumbs-up)
                if lm_list[thumb_tip].y < lm_list[thumb_tip - 1].y < lm_list[thumb_tip - 2].y:
                    if all(finger_fold_status):
                        detected_gesture = "LIKE"
                
                # DISLIKE (Thumbs-down)
                if lm_list[thumb_tip].y > lm_list[thumb_tip - 1].y > lm_list[thumb_tip - 2].y:
                    if all(finger_fold_status):
                        detected_gesture = "DISLIKE"
                
                # OK
                thumb_x, thumb_y = lm_list[thumb_tip].x, lm_list[thumb_tip].y
                index_x, index_y = lm_list[8].x, lm_list[8].y
                distance = ((thumb_x - index_x) ** 2 + (thumb_y - index_y) ** 2) ** 0.5
                
                if distance < 0.05:
                    if not finger_fold_status[1] and not finger_fold_status[2] and not finger_fold_status[3]:
                        detected_gesture = "OK"
                
                # PEACE
                thumb_x, thumb_y = lm_list[thumb_tip].x, lm_list[thumb_tip].y
                ring_x, ring_y = lm_list[16].x, lm_list[16].y
                pinky_x, pinky_y = lm_list[20].x, lm_list[20].y
                
                distance_thumb_ring = ((thumb_x - ring_x) ** 2 + (thumb_y - ring_y) ** 2) ** 0.5
                distance_ring_pinky = ((ring_x - pinky_x) ** 2 + (ring_y - pinky_y) ** 2) ** 0.5
                
                if distance_thumb_ring < 0.05 and distance_ring_pinky < 0.05:
                    if not finger_fold_status[0] and not finger_fold_status[1]:
                        detected_gesture = "PEACE"
                
                # CALL ME
                if finger_fold_status[0] and finger_fold_status[1] and finger_fold_status[3]:
                    thumb_x, thumb_y = lm_list[thumb_tip].x, lm_list[thumb_tip].y
                    pinky_x, pinky_y = lm_list[20].x, lm_list[20].y
                    distance_thumb_pinky = ((thumb_x - pinky_x) ** 2 + (thumb_y - pinky_y) ** 2) ** 0.5
                    
                    if distance_thumb_pinky > 0.4:
                        detected_gesture = "CALL ME"
                
                # STOP
                if (lm_list[thumb_tip].y < lm_list[thumb_tip - 1].y < lm_list[thumb_tip - 2].y and
                        lm_list[8].y < lm_list[6].y < lm_list[5].y and
                        lm_list[12].y < lm_list[10].y < lm_list[9].y and
                        lm_list[16].y < lm_list[14].y < lm_list[13].y and
                        lm_list[20].y < lm_list[18].y < lm_list[17].y):
                    detected_gesture = "STOP"
                
                # FORWARD
                if (lm_list[8].y < lm_list[6].y < lm_list[5].y and
                    lm_list[12].y > lm_list[11].y > lm_list[10].y and
                    lm_list[16].y > lm_list[15].y > lm_list[14].y and
                    lm_list[20].y > lm_list[19].y > lm_list[18].y and
                    lm_list[thumb_tip].x > lm_list[thumb_tip - 1].x):
                    detected_gesture = "FORWARD"
                
                # LEFT
                if (lm_list[4].y < lm_list[2].y and
                        lm_list[8].x < lm_list[6].x and
                        lm_list[12].x > lm_list[10].x and
                        lm_list[16].x > lm_list[14].x and
                        lm_list[20].x > lm_list[18].x and
                        lm_list[5].x < lm_list[0].x):
                    detected_gesture = "LEFT"
                
                # RIGHT
                if (lm_list[4].y < lm_list[2].y and
                        lm_list[8].x > lm_list[6].x and
                        lm_list[12].x < lm_list[10].x and
                        lm_list[16].x < lm_list[14].x and
                        lm_list[20].x < lm_list[18].x):
                    detected_gesture = "RIGHT"
                
                # I LOVE YOU
                if (lm_list[8].y < lm_list[6].y < lm_list[5].y and
                        lm_list[12].y > lm_list[11].y > lm_list[10].y and
                        lm_list[16].y > lm_list[15].y > lm_list[14].y and
                        lm_list[20].y < lm_list[19].y < lm_list[18].y and
                        lm_list[thumb_tip].x > lm_list[thumb_tip - 1].x):
                    detected_gesture = "I LOVE YOU"
            
                # Log when gesture changes
                if detected_gesture != "No hand detected":
                    logger.info(f"Detected gesture: {detected_gesture}")
            
        # Return the detected gesture
        return {
            "gesture": detected_gesture,
            "meaning": SUPPORTED_GESTURES.get(detected_gesture, "No gesture detected")
        }
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {"error": str(e), "gesture": "Error", "meaning": "Failed to process image"}

if __name__ == "__main__":
    logger.info("Starting Gesture Recognition Server")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)