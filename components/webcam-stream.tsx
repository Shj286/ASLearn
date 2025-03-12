"use client";

import { getGesture, getNumber } from "@/app/actions";
import React, { useRef, useEffect, useState } from "react";

interface WebcamStreamProps {
  mode?: "gesture" | "number";
}

const WebcamStream: React.FC<WebcamStreamProps> = ({ mode = "gesture" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<string>("No hand detected");

  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImageAsBase64 = (): string | null => {
    if (!videoRef.current) return null;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw the current video frame to the canvas
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 string (default is PNG format)
    // You can specify 'image/jpeg' and quality (0-1) as additional parameters if needed
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1]; // Remove the data URL prefix
  };

  const detectGesture = async () => {
    const imageBase64 = captureImageAsBase64();
    if (!imageBase64) return;

    try {
      let result;
      if (mode === "number") {
        result = await getNumber(imageBase64);
      } else {
        result = await getGesture(imageBase64);
      }
      setGesture(result.gesture || "No gesture detected");
      console.log(
        `${mode === "number" ? "Number" : "Gesture"} detected:`,
        result.gesture
      );
    } catch (error) {
      console.error(
        `Error detecting ${mode === "number" ? "number" : "gesture"}:`,
        error
      );
      setGesture(`Error detecting ${mode === "number" ? "number" : "gesture"}`);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(detectGesture, 100);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full rounded-md transform scale-x-[-1]"
      />

      {/* Overlay for gesture display */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 ${
          gesture !== "No hand detected" && gesture !== "No recognized gesture"
            ? "bg-green-500"
            : "bg-gray-700"
        } text-white font-bold text-xl text-center`}>
        {mode === "number" ? "Number: " : "Gesture: "}
        {gesture}
      </div>
    </div>
  );
};

export default WebcamStream;
