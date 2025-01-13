const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors());

// Sample random messages
const randomMessages = [
  "Hello, this is a random message!",
  "Great job on the cube transformation!",
  "Keep up the good work!",
  "This is a test message.",
  "You clicked the hotspot pin!",
  "Try moving the cube more!"
];

// Variables to hold the current transformation data
let currentTransformation = {
  rotation: { roll: 0, pitch: 0, yaw: 0 },
  translation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
};

// Function to update transformation data
const updateTransformationData = () => {
  currentTransformation.rotation.roll += 1;
  currentTransformation.rotation.pitch += 2;
  currentTransformation.rotation.yaw += 3;

  currentTransformation.translation.x += 1;
  currentTransformation.translation.y += 2;
  currentTransformation.translation.z += 3;

  currentTransformation.scale.x = Math.sin(currentTransformation.rotation.roll / 180 * Math.PI) + 2;
  currentTransformation.scale.y = Math.cos(currentTransformation.rotation.pitch / 180 * Math.PI) + 2;
  currentTransformation.scale.z = Math.abs(Math.sin(currentTransformation.rotation.yaw / 180 * Math.PI)) + 1;
};

// Route to return the 3D cube transformation data
app.get('/message', (req, res) => {
  updateTransformationData();  // Update the transformation data on each request
  res.json(currentTransformation);  // Send the updated transformation data as JSON
});

// Route to fetch a random message
app.get('/random-message', (req, res) => {
  const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  res.json({ message: randomMessage });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Set an interval to keep updating the transformation data
setInterval(updateTransformationData, 1000);  // Update every 1 second

