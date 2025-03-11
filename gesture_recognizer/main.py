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
import math

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

# Define number gestures with descriptions
NUMBER_GESTURES = {
    "0": "Closed fist with thumb wrapped around fingers",
    "1": "Index finger extended, all other fingers closed",
    "2": "Index and middle fingers extended, all other fingers closed",
    "3": "Index, middle, and ring fingers extended, all other fingers closed",
    "4": "All fingers extended except thumb",
    "5": "All fingers extended including thumb",
    "6": "Thumb, pinky, and ring finger closed, other fingers extended",
    "7": "Thumb, pinky closed, other fingers extended",
    "8": "Thumb closed, all other fingers extended",
    "9": "Pinky closed, all other fingers extended"
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

@app.post("/api/number")
async def recognize_number(request: Request) -> Dict[str, str]:
    """
    Receives an image from the frontend, processes it to detect number gestures (0-9),
    and returns the recognized number.
    
    The request body should be a JSON with a base64 encoded image:
    {
        "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBA..."
    }
    """
    logger.info("Received number recognition API request")
    
    # Static variable to store previous detections for smoothing
    if not hasattr(recognize_number, "prev_detections"):
        recognize_number.prev_detections = []
    
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
            return {"error": "Invalid image format", "number": "Error", "meaning": "Failed to process image"}
        
        # Decode base64 to image
        image_bytes = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_bytes))
        frame = np.array(image)
        
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame and get hand landmarks
        results = hands.process(rgb_frame)
        
        detected_number = "No hand detected"
        confidence = 0.0
        
        if results.multi_hand_landmarks:
            logger.debug("Hand detected in frame")
            for hand_landmarks in enumerate(results.multi_hand_landmarks):
                lm_list = []  # List to store landmark positions
                
                # Extract landmarks
                for i, lm in enumerate(hand_landmarks[1].landmark):
                    lm_list.append(lm)
                
                # Get frame dimensions
                h, w, c = frame.shape
                
                # Helper function to calculate angle between three points
                def calculate_angle(a, b, c):
                    a_x, a_y = a.x, a.y
                    b_x, b_y = b.x, b.y
                    c_x, c_y = c.x, c.y
                    
                    angle = math.degrees(math.atan2(c_y - b_y, c_x - b_x) - 
                                         math.atan2(a_y - b_y, a_x - b_x))
                    
                    if angle < 0:
                        angle += 360
                        
                    return angle
                
                # Calculate finger bend angles
                thumb_angle = calculate_angle(lm_list[1], lm_list[2], lm_list[4])
                index_angle = calculate_angle(lm_list[5], lm_list[6], lm_list[8])
                middle_angle = calculate_angle(lm_list[9], lm_list[10], lm_list[12])
                ring_angle = calculate_angle(lm_list[13], lm_list[14], lm_list[16])
                pinky_angle = calculate_angle(lm_list[17], lm_list[18], lm_list[20])
                
                # Determine if fingers are extended based on angles and positions
                # More robust than just comparing y coordinates
                thumb_extended = thumb_angle > 150 and lm_list[thumb_tip].x > lm_list[thumb_tip - 1].x
                index_extended = index_angle > 160 and lm_list[8].y < lm_list[5].y
                middle_extended = middle_angle > 160 and lm_list[12].y < lm_list[9].y
                ring_extended = ring_angle > 160 and lm_list[16].y < lm_list[13].y
                pinky_extended = pinky_angle > 160 and lm_list[20].y < lm_list[17].y
                
                # Calculate distances between fingertips for additional features
                thumb_index_distance = np.sqrt((lm_list[4].x - lm_list[8].x)**2 + (lm_list[4].y - lm_list[8].y)**2)
                index_middle_distance = np.sqrt((lm_list[8].x - lm_list[12].x)**2 + (lm_list[8].y - lm_list[12].y)**2)
                
                # Check if thumb is across palm (for number 0)
                thumb_across_palm = lm_list[4].x < lm_list[9].x and not thumb_extended
                
                # Dictionary to store confidence scores for each number
                number_confidence = {
                    "0": 0.0, "1": 0.0, "2": 0.0, "3": 0.0, "4": 0.0,
                    "5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0, "9": 0.0
                }
                
                # Number 0: Closed fist with thumb wrapped around fingers or across palm
                if (not index_extended and not middle_extended and not ring_extended and not pinky_extended):
                    if thumb_across_palm:
                        number_confidence["0"] = 0.9
                    else:
                        number_confidence["0"] = 0.7
                
                # Number 1: Index finger extended, all other fingers closed
                if (index_extended and not middle_extended and not ring_extended and not pinky_extended):
                    number_confidence["1"] = 0.9 if not thumb_extended else 0.7
                
                # Number 2: Index and middle fingers extended in a V shape
                if (index_extended and middle_extended and not ring_extended and not pinky_extended):
                    # Check if fingers are spread apart (V shape)
                    if index_middle_distance > 0.1:
                        number_confidence["2"] = 0.9
                    else:
                        number_confidence["2"] = 0.6
                
                # Number 3: Index, middle, and ring fingers extended
                if (index_extended and middle_extended and ring_extended and not pinky_extended and not thumb_extended):
                    number_confidence["3"] = 0.9
                
                # Number 4: All fingers except thumb extended
                if (index_extended and middle_extended and ring_extended and pinky_extended and not thumb_extended):
                    number_confidence["4"] = 0.9
                
                # Number 5: All fingers extended
                if (thumb_extended and index_extended and middle_extended and ring_extended and pinky_extended):
                    # Check if thumb is clearly separated from other fingers
                    if thumb_index_distance > 0.15:
                        number_confidence["5"] = 0.9
                    else:
                        number_confidence["5"] = 0.7
                
                # Number 6: Thumb, pinky, and ring finger closed, index and middle extended
                # This is the ASL sign for 6 (thumb, pinky touching)
                if (index_extended and middle_extended and not ring_extended and not pinky_extended):
                    # Check for thumb position - should be near pinky for ASL 6
                    thumb_pinky_distance = np.sqrt((lm_list[4].x - lm_list[20].x)**2 + (lm_list[4].y - lm_list[20].y)**2)
                    if thumb_pinky_distance < 0.1 and thumb_extended:
                        number_confidence["6"] = 0.9
                    else:
                        # Alternative 6 gesture (index, middle extended with spread)
                        if index_middle_distance > 0.15:
                            number_confidence["6"] = 0.7
                
                # Number 7: Index, middle, and ring fingers extended, pinky and thumb closed
                if (index_extended and middle_extended and ring_extended and not pinky_extended and not thumb_extended):
                    # Additional check to differentiate from 3
                    # In ASL 7, fingers are typically more spread out
                    if index_middle_distance > 0.08:
                        number_confidence["7"] = 0.8
                    else:
                        number_confidence["3"] = 0.8  # More likely to be 3
                
                # Number 8: Thumb closed, all other fingers extended
                # Alternative: index, middle, ring extended with thumb and pinky touching
                if (index_extended and middle_extended and ring_extended):
                    if pinky_extended and not thumb_extended:
                        number_confidence["8"] = 0.9
                    elif not pinky_extended and thumb_extended:
                        # Check if thumb and pinky are touching
                        thumb_pinky_distance = np.sqrt((lm_list[4].x - lm_list[20].x)**2 + (lm_list[4].y - lm_list[20].y)**2)
                        if thumb_pinky_distance < 0.1:
                            number_confidence["8"] = 0.8
                
                # Number 9: Index, middle, ring, and thumb extended, pinky closed
                if (index_extended and middle_extended and ring_extended and thumb_extended and not pinky_extended):
                    number_confidence["9"] = 0.9
                
                # Find the number with the highest confidence
                max_confidence_number = max(number_confidence.items(), key=lambda x: x[1])
                
                if max_confidence_number[1] > 0.5:  # Confidence threshold
                    detected_number = max_confidence_number[0]
                    confidence = max_confidence_number[1]
                
                # Log when number changes with confidence
                if detected_number != "No hand detected":
                    logger.info(f"Detected number: {detected_number} with confidence {confidence:.2f}")
            
        # Apply smoothing to prevent flickering
        # Keep a history of the last 5 detections
        recognize_number.prev_detections.append((detected_number, confidence))
        if len(recognize_number.prev_detections) > 5:
            recognize_number.prev_detections.pop(0)
        
        # Only consider high confidence detections for smoothing
        high_conf_detections = [d for d in recognize_number.prev_detections if d[1] > 0.6]
        
        if high_conf_detections:
            # Count occurrences of each number
            number_counts = {}
            for d, _ in high_conf_detections:
                if d != "No hand detected":
                    number_counts[d] = number_counts.get(d, 0) + 1
            
            # Find the most common number
            if number_counts:
                smoothed_number = max(number_counts.items(), key=lambda x: x[1])[0]
                # Only update if the most common number appears at least twice
                if number_counts[smoothed_number] >= 2:
                    detected_number = smoothed_number
        
        # Return the detected number
        return {
            "number": detected_number,
            "meaning": NUMBER_GESTURES.get(detected_number, "No number detected"),
            "confidence": f"{confidence:.2f}" if detected_number != "No hand detected" else "0.00"
        }
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {"error": str(e), "number": "Error", "meaning": "Failed to process image", "confidence": "0.00"}

if __name__ == "__main__":
    logger.info("Starting Gesture Recognition Server")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)