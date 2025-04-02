<!-- COMP 3450: Mfon Udoh, Pasang Sherpa, Shubham Jangra -->

# ASLearn - American Sign Language Learning Platform

ASLearn is an interactive web application designed to help users learn American Sign Language through real-time feedback and AI-powered gesture recognition. The application utilizes webcam input to analyze hand gestures and provides immediate feedback on sign accuracy.

## Features

- **Real-Time Gesture Recognition**: Uses TensorFlow.js and MediaPipe to detect and analyze hand gestures
- **Interactive Tutorials**: Learn various ASL signs through guided lessons
- **User Authentication**: Create an account to track your progress
- **AI Integration**: Advanced gesture recognition for accurate feedback

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Authentication**: NextAuth.js 5 with MongoDB adapter
- **Machine Learning**: TensorFlow.js, MediaPipe Hands
- **Backend**: Python Flask server for gesture recognition processing
- **Styling**: TailwindCSS with custom animations

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- Python 3.8 or later
- npm or pnpm package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Shj286/ASLearn.git
   cd aslearn
   ```

2. Install JavaScript dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   MONGODB_URI=your_mongodb_connection_string
   ```

### Running the Application

Run the development server (starts both Next.js frontend and Python gesture recognition server):

```bash
npm run dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

To run only the Next.js frontend:

```bash
npm run next-dev
```

To run only the Python gesture recognition server:

```bash
npm run python-server
```

## Available Lessons

The application currently includes:

- Basic gesture recognition (I love you, Right, Left, Forward, Like, Dislike, Peace)
- Number signs (0-5)

## Project Structure

- `/app` - Next.js application pages and routes
- `/components` - Reusable React components
- `/gesture_recognizer` - Python backend for gesture recognition
- `/public` - Static assets like videos
- `/lib` - Utility functions

## Contributing

This project was made by [Pasang Sherpa](https://github.com/Yangzeex), [Shubham Jangra](https://github.com/Shj286), and [Mfon Udoh](https://github.com/Mfon-19)
