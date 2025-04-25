# Second Brain - Visual Knowledge Management Platform

## Overview

Second Brain is an interactive knowledge management application that transforms how users organize and consume digital content. The platform allows users to visually arrange YouTube and Twitter content as zoomable cards on an infinite canvas, creating a spatial knowledge map that's persistent and easily navigable.

## Features

- **Interactive Canvas**: Click anywhere to create and position content cards
- **Media Integration**: Embed YouTube videos and Twitter posts directly into cards
- **Spatial Organization**: Arrange your knowledge visually in a way that makes sense to you
- **Zoom & Pan**: Navigate your knowledge landscape with intuitive zoom and pan controls
- **Persistent Storage**: Your knowledge map saves automatically and loads when you return
- **Secure Authentication**: User accounts with secure login functionality
- **Shareable Views**: Generate links to share specific views of your canvas with others

## Tech Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **react-zoom-pan-pinch**: For canvas zooming and panning functionality
- **react-router-dom**: For application routing and navigation
- **react-dom**: For efficient DOM rendering

### Backend
- **Express.js**: Node.js web application framework for building APIs
- **MongoDB**: NoSQL database for storing user data and cards
- **Zod**: TypeScript-first schema validation library

## Application Flow

1. User logs in through the authentication page
2. Upon successful login, the interactive canvas is displayed
3. User can click anywhere on the canvas to create a new card
4. In the popup dialog, users can paste YouTube or Twitter links
5. Cards are created and can be dragged to any position on the canvas
6. The canvas state is automatically saved to the database
7. Users can share specific views of their canvas through generated links

## Installation

```bash
# Clone the repository
git clone https://github.com/Andyok45/Second_brain.git

# Navigate to project directory
cd Second_brain

# Install dependencies for both frontend and backend
npm install

# Start the development server 
npm start
```

## Current Status

- ✅ Canvas with zoom and pan functionality
- ✅ Card creation from YouTube and Twitter links
- ✅ Drag-and-drop card positioning
- ✅ MongoDB integration for data persistence
- ✅ Share link generation
- ⚠️ Performance issues with dragging (in progress)
- ⚠️ Login page and canvas connection (in progress)
- ⚠️ Shared view page design (in progress)

## Screenshots

![Canvas with Card](https://github.com/Andyok45/Second_Brain/tree/main/SecondBrainFE/public/Canvas.png)
![Card Creation Box](https://github.com/Andyok45/Second_Brain/tree/main/SecondBrainFE/public/DialogBox.png)
