"use client";

import React, { useRef, useEffect, useState } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-backend-webgl";

interface Coordinate {
  x: number;
  y: number;
  z: number;
}

interface Prediction {
  keypoints: Coordinate[];
  keypoints3D: Coordinate[];
  handedness: string;
  score: number;
}

const WebcamStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<string>("No hand detected");
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const loadModel = async (): Promise<void> => {
      try {
        // Load the MediaPipe HandPose model
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: "tfjs",
          modelType: "full",
          maxHands: 1,
        } as handPoseDetection.MediaPipeHandsTfjsModelConfig;

        detectorRef.current = await handPoseDetection.createDetector(model, detectorConfig);

        setIsModelLoaded(true);
        setErrorMessage("");
        console.log("Hand detection model loaded");
      } catch (error) {
        console.error("Error loading hand detection model:", error);
        setErrorMessage("Failed to load hand detection model");
      }
    };

    const startWebcam = async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be loaded
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            // Start prediction once video is playing
            animationFrameId = requestAnimationFrame(predictHands);
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setErrorMessage("Error accessing webcam. Please check permissions.");
      }
    };

    const detectGesture = (landmarks: Coordinate[]): string => {
      if (!landmarks || landmarks.length < 21) return "No hand detected";

      // Helper function to calculate euclidean distance
      const calculateDistance = (point1: Coordinate, point2: Coordinate): number => {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) + Math.pow(point1.z - point2.z, 2));
      };

      // Get finger landmarks
      const thumb = [landmarks[4], landmarks[3], landmarks[2], landmarks[1]];
      const indexFinger = [landmarks[8], landmarks[7], landmarks[6], landmarks[5]];
      const middleFinger = [landmarks[12], landmarks[11], landmarks[10], landmarks[9]];
      const ringFinger = [landmarks[16], landmarks[15], landmarks[14], landmarks[13]];
      const pinkyFinger = [landmarks[20], landmarks[19], landmarks[18], landmarks[17]];
      const wrist = landmarks[0];

      // Check finger fold status
      const fingerTips = [indexFinger[0], middleFinger[0], ringFinger[0], pinkyFinger[0]];
      const fingerBases = [indexFinger[2], middleFinger[2], ringFinger[2], pinkyFinger[2]];

      const isFolded = (tip: Coordinate, base: Coordinate): boolean => {
        return tip.y > base.y;
      };

      const fingerFoldStatus = [isFolded(indexFinger[0], indexFinger[2]), isFolded(middleFinger[0], middleFinger[2]), isFolded(ringFinger[0], ringFinger[2]), isFolded(pinkyFinger[0], pinkyFinger[2])];

      // folded hand
      if (fingerFoldStatus.every((status) => status === true)) return "FOLDED";

      // THUMBS UP
      if (thumb[0].y < thumb[1].y && thumb[1].y < thumb[2].y && fingerFoldStatus.every((status) => status === true)) {
        return "LIKE";
      }

      // THUMBS DOWN
      if (thumb[0].y > thumb[1].y && thumb[1].y > thumb[2].y && fingerFoldStatus.every((status) => status === true)) {
        return "DISLIKE";
      }

      // OK SIGN
      const thumbIndexDistance = calculateDistance(thumb[0], indexFinger[0]);
      if (thumbIndexDistance < 0.1 && !fingerFoldStatus[1] && !fingerFoldStatus[2] && !fingerFoldStatus[3]) {
        return "OK";
      }

      // PEACE SIGN
      if (!fingerFoldStatus[0] && !fingerFoldStatus[1] && fingerFoldStatus[2] && fingerFoldStatus[3]) {
        return "PEACE";
      }

      // STOP SIGN - All fingers extended
      if (!fingerFoldStatus[0] && !fingerFoldStatus[1] && !fingerFoldStatus[2] && !fingerFoldStatus[3] && thumb[0].y < thumb[1].y) {
        return "STOP";
      }

      // FORWARD - Index finger pointing up
      if (!fingerFoldStatus[0] && fingerFoldStatus[1] && fingerFoldStatus[2] && fingerFoldStatus[3]) {
        return "FORWARD";
      }

      // I LOVE YOU - Index, pinky and thumb extended
      if (!fingerFoldStatus[0] && fingerFoldStatus[1] && fingerFoldStatus[2] && !fingerFoldStatus[3] && thumb[0].x > thumb[1].x) {
        return "I LOVE YOU";
      }

      return "No recognized gesture";
    };

    const predictHands = async (): Promise<void> => {
      if (!detectorRef.current || !videoRef.current) {
        animationFrameId = requestAnimationFrame(predictHands);
        return;
      }

      try {
        // Detect hand poses
        const predictions = await detectorRef.current.estimateHands(videoRef.current);

        console.log("Predictions: ", JSON.stringify(predictions)); // Use stringify for cleaner logs

        if (predictions.length > 0) {
          const hand = predictions[0] as Prediction;

          // Check if we have valid keypoints before proceeding
          const hasValidKeypoints = hand.keypoints.some((kp) => kp.x !== null && kp.y !== null);

          if (!hasValidKeypoints) {
            alert("Detected hand but landmarks have null coordinates");
            setGesture("Hand detected but tracking failed");
            animationFrameId = requestAnimationFrame(predictHands);
            return;
          }

          // Convert to the format our gesture detection expects
          const landmarks =
            hand.keypoints3D ||
            hand.keypoints.map((kp) => ({
              x: kp.x / videoRef.current!.videoWidth,
              y: kp.y / videoRef.current!.videoHeight,
              z: 0,
            }));

          console.log("Landmarks: ", landmarks);

          // Detect gesture based on landmarks
          const detectedGesture = detectGesture(landmarks);
          setGesture(detectedGesture);
        } else {
          setGesture("No hand detected");
        }
      } catch (error) {
        console.error("Error predicting hand pose:", error);
      }

      // Continue prediction loop
      animationFrameId = requestAnimationFrame(predictHands);
    };

    // Initialize everything
    const init = async (): Promise<void> => {
      await loadModel();
      await startWebcam();
    };

    init();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full rounded-md transform scale-x-[-1]" />

      {/* Model loading indicator */}
      {!isModelLoaded && !errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading hand detection model...</p>
          </div>
        </div>
      )}

      {/* Overlay for gesture display */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 ${gesture !== "No hand detected" && gesture !== "No recognized gesture" ? "bg-green-500" : "bg-gray-700"} text-white font-bold text-xl text-center`}>{gesture}</div>

      {/* Error message */}
      {errorMessage && <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">{errorMessage}</div>}
    </div>
  );
};

export default WebcamStream;
