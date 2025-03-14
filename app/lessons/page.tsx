// COMP 3450: Mfon Udoh, Pasang Sherpa, Shubham Jangra
"use client";

import Link from "next/link";
import { CheckCircle, Lock, BookOpen, Star } from "lucide-react";
import { useState, useEffect } from "react";
import ASLLogo from "@/components/asl-logo";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonsPage() {
  const [currentLevel, setCurrentLevel] = useState(3);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatingLesson, setAnimatingLesson] = useState<number | null>(null);
  
  const lessons = [
    { 
      id: 1, 
      title: "Introduction to ASL", 
      description: "Learn the basics of American Sign Language",
      stars: 3, // Out of 3
      completionPercentage: 100
    },
    { 
      id: 2, 
      title: "Numbers & Counting", 
      description: "Learn to count and express numbers",
      stars: 0,
      completionPercentage: 0
      
    },
    { 
      id: 3, 
      title: "Common Greetings", 
      description: "Master everyday greetings and introductions",
      stars: 2,
      completionPercentage: 75 
    },
    { 
      id: 4, 
      title: "Family & Relationships", 
      description: "Signs for family members and relationships",
      stars: 0,
      completionPercentage: 0
    },
    { 
      id: 5, 
      title: "Everyday Objects", 
      description: "Common items you use every day",
      stars: 0,
      completionPercentage: 0
    },
    { 
      id: 6, 
      title: "Conversations", 
      description: "Put it all together in basic conversations",
      stars: 0,
      completionPercentage: 0
    },
  ];

  const handleLessonClick = (lessonId: number) => {
    if (lessonId < currentLevel) {
      setAnimatingLesson(lessonId);
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        setAnimatingLesson(null);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6eb]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="grid grid-cols-3 items-center mb-12">
          {/* Logo on left */}
          <div className="flex items-start justify-start">
            <ASLLogo />
          </div>
          
          {/* Title centered */}
          <div className="flex justify-center">
            <h1 className="text-2xl font-medium text-gray-700 text-center">Your Learning Journey</h1>
          </div>
          
          {/* Level indicator on right */}
          <div className="flex justify-end">
            <div className="bg-white px-5 py-3 rounded-full shadow-md">
              <span className="font-medium">Level {currentLevel}</span>
            </div>
          </div>
        </header>

        {/* Overall progress indicator */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">
              {Math.round((lessons.filter(l => l.completionPercentage === 100).length / lessons.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${(lessons.filter(l => l.completionPercentage === 100).length / lessons.length) * 100}%`
              }}>
            </div>
          </div>
        </div>

        {/* Lesson Pathway with SVG Path */}
        <div className="relative max-w-2xl mx-auto py-10">
          {/* SVG Path */}
          <svg 
            className="absolute left-1/2 top-0 h-full transform -translate-x-1/2 z-0 w-40" 
            viewBox="0 0 100 800" 
            preserveAspectRatio="none"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="pathGradient" gradientUnits="userSpaceOnUse"
                x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ddd" />
                <stop offset="30%" stopColor="#3b6e29" />
                <stop offset="70%" stopColor="#3b6e29" />
                <stop offset="100%" stopColor="#ddd" />
              </linearGradient>
            </defs>
            
            {/* Main path */}
            <path 
              d="M50,0 C70,100 30,200 50,300 C70,400 30,500 50,600 C70,700 50,800 50,800" 
              stroke="url(#pathGradient)" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
              strokeDasharray="5,5"
            />
            
            {/* Progress overlay - filled up to current level */}
            <path 
              d="M50,0 C70,100 30,200 50,300 C70,400 30,500 50,600 C70,700 50,800 50,800" 
              stroke="#3b6e29" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
              strokeDashoffset="0"
              strokeDasharray={`${(currentLevel - 1) * 200}, 1000`} // Simple calculation to show progress
            />
          </svg>

          {/* Lesson Nodes */}
          <div className="relative z-10">
            {lessons.map((lesson, index) => {
              const isCompleted = lesson.id < currentLevel;
              const isCurrent = lesson.id === currentLevel;
              const isLocked = lesson.id > currentLevel;
              
              // Alternate left and right
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={lesson.id}
                  className={`flex items-center mb-32 ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative flex items-center justify-center
                      ${isLeft ? 'ml-8 mr-auto' : 'mr-8 ml-auto'}
                      ${isLocked ? 'opacity-60' : 'opacity-100'}
                    `}
                    style={{ width: 'calc(50% - 32px)' }}
                  >
                    {/* Connector path to main line */}
                    <div 
                      className={`absolute top-1/2 h-px bg-gray-300 ${isLeft ? 'right-full' : 'left-full'}`}
                      style={{ width: '30px' }}
                    >
                      {/* Animated dot moving along connector on hover */}
                      {(isCompleted || isCurrent) && (
                        <motion.div 
                          className="absolute top-1/2 h-2 w-2 bg-green-500 rounded-full"
                          initial={isLeft ? { right: '100%' } : { left: '100%' }}
                          animate={isLeft ? { right: '0%' } : { left: '0%' }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5, 
                            repeatType: 'reverse'
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Lesson card */}
                    <motion.div
                      whileHover={!isLocked ? { scale: 1.03 } : {}}
                      onClick={() => !isLocked && handleLessonClick(lesson.id)}
                      className={`
                        relative block w-full p-6 rounded-xl shadow-md transition-all
                        ${isCurrent ? 'bg-[#b8e0ff]' : 'bg-white'}
                        ${isLocked ? 'cursor-default border-2 border-gray-200' : 'cursor-pointer'}
                        ${isCompleted ? 'border-2 border-[#3b6e29]' : ''}
                        ${isCurrent ? 'border-2 border-[#3b6e29]' : ''}
                      `}
                    >
                      {/* Celebration animation overlay */}
                      <AnimatePresence>
                        {showAnimation && animatingLesson === lesson.id && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center rounded-xl overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-green-500 bg-opacity-20"
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.5, 1] }}
                              transition={{ duration: 0.8 }}
                            />
                            {/* Confetti effect */}
                            {Array.from({ length: 20 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{ 
                                  background: ['#FFD700', '#FF6347', '#7FFFD4', '#BA55D3'][i % 4],
                                  top: '50%',
                                  left: '50%'
                                }}
                                initial={{ x: 0, y: 0 }}
                                animate={{ 
                                  x: (Math.random() - 0.5) * 150, 
                                  y: (Math.random() - 0.5) * 150,
                                  opacity: [1, 0]
                                }}
                                transition={{ duration: 1 }}
                              />
                            ))}
                            <motion.div 
                              className="text-white text-3xl font-bold z-10"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 0.5, times: [0, 0.3, 0.6, 1] }}
                            >
                              Great Job!
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Status icon */}
                      <div className="absolute -left-5 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg z-10">
                        {isCompleted && (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        )}
                        {isCurrent && (
                          <BookOpen className="w-8 h-8 text-blue-600" />
                        )}
                        {isLocked && (
                          <Lock className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{lesson.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                      
                      {/* Progress indicators */}
                      <div className="mt-4">
                        {!isLocked && (
                          <>
                            {/* Star rating */}
                            <div className="flex space-x-1 mb-2">
                              {[...Array(3)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < lesson.stars
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${lesson.completionPercentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-right mt-1 text-gray-500">
                              {lesson.completionPercentage}% Complete
                            </div>
                          </>
                        )}
                        
                        {isLocked && (
                          <div className="text-xs text-gray-400 mt-2">
                            Complete previous lessons to unlock
                          </div>
                        )}
                      </div>
                      
                      {/* Call to action button */}
                      {(isCompleted || isCurrent) && (
                        <Link 
                          href={`/lessons/${lesson.id}`}
                          className={`
                            mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium
                            ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          `}
                        >
                          {isCompleted ? 'Review Lesson' : 'Start Learning'}
                        </Link>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

