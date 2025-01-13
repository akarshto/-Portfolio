import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt'; // MQTT library for establishing MQTT connection
import './style.css'; // Importing the external CSS for styling

// Main component for the broker interface
function BrokerInterface() {
  // State to manage visibility of connected broker display
  const [connectedBrokerVisible, setConnectedBrokerVisible] = useState(false);
  
  // State for broker URL input
  const [brokerUrl, setBrokerUrl] = useState('');
  
  // State for the topic to subscribe to
  const [topic, setTopic] = useState('');
  
  // State for storing transformations (rotation, translation, and scaling values)
  const [transformations, setTransformations] = useState({
    roll: 0,
    pitch: 0,
    yaw: 0,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  });

  // State for showing tabs in the broker interface
  const [showTabs, setShowTabs] = useState(false);
  
  // State for selected tab ('transform' or 'hotspot')
  const [selectedTab, setSelectedTab] = useState('');
  
  // State for displaying random message from server
  const [randomMessage, setRandomMessage] = useState('');
  
  // State for managing the MQTT client connection
  const [mqttClient, setMqttClient] = useState(null);
  
  // State for checking if the transformation loop is active
  const [isLoopActive, setIsLoopActive] = useState(false);
  
  // State for storing the interval ID to manage the transformation loop
  const [intervalId, setIntervalId] = useState(null);

  // Effect hook for handling MQTT connection and subscribing to topics
  useEffect(() => {
    if (mqttClient) {
      // Handler for successful connection to the broker
      mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        if (topic) {
          mqttClient.subscribe(topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}`);
            } else {
              console.log(`Subscribed to topic: ${topic}`);
            }
          });
        }
      });

      // Handler for incoming messages on the subscribed topic
      mqttClient.on('message', (topic, message) => {
        try {
          const parsedData = JSON.parse(message.toString()); // Parse the incoming message
          setTransformations({
            roll: parsedData.rotation?.roll || 0,
            pitch: parsedData.rotation?.pitch || 0,
            yaw: parsedData.rotation?.yaw || 0,
            translateX: parsedData.translation?.x || 0,
            translateY: parsedData.translation?.y || 0,
            translateZ: parsedData.translation?.z || 0,
            scaleX: parsedData.scale?.x || 1,
            scaleY: parsedData.scale?.y || 1,
            scaleZ: parsedData.scale?.z || 1,
          });
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      });
    }

    return () => {
      if (mqttClient) {
        mqttClient.end(); // Clean up MQTT connection when component is unmounted
      }
    };
  }, [mqttClient, topic]); // Depend on mqttClient and topic to trigger effect

  // Handle input changes for transformations
  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setTransformations((prev) => ({
      ...prev,
      [id]: parseFloat(value) || 0, // Update the transformation value based on input
    }));
  };

  // Function to apply transformations and start the transformation loop if it's not active
  const ApplyTransformations = () => {
    setConnectedBrokerVisible(true); // Show the connected broker interface
    if (!isLoopActive) {
      setIsLoopActive(true); // Set the loop as active
      startTransformationLoop(); // Start the transformation loop
    }
  };

  // Start an interval loop to update transformations periodically
  const startTransformationLoop = () => {
    const id = setInterval(() => {
      setTransformations((prev) => ({
        roll: prev.roll + 1,
        pitch: prev.pitch + 1,
        yaw: prev.yaw + 1,
        translateX: prev.translateX + 1,
        translateY: prev.translateY + 1,
        translateZ: prev.translateZ + 1,
        scaleX: Math.sin(prev.roll / 100) + 1,
        scaleY: Math.cos(prev.pitch / 100) + 1,
        scaleZ: Math.sin(prev.yaw / 100) + 1,
      }));
    }, 1000); // Update every second
    setIntervalId(id); // Save the interval ID to allow stopping it later
  };

  // Stop the transformation loop by clearing the interval
  const stopTransformationLoop = () => {
    clearInterval(intervalId); // Clear the interval
    setIsLoopActive(false); // Mark the loop as inactive
  };

  // Reset transformations to their default values
  const resetTransformations = () => {
    setTransformations({
      roll: 0,
      pitch: 0,
      yaw: 0,
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    });
    stopTransformationLoop(); // Stop the transformation loop when resetting
  };

  // Fetch a random message from the server
  const fetchRandomMessage = async () => {
    const response = await fetch('http://localhost:5000/random-message');
    const data = await response.json();
    setRandomMessage(data.message); // Set the fetched message
  };

  // Handle click on the hotspot pin to fetch a random message
  const handleHotspotClick = () => {
    fetchRandomMessage();
  };

  // Close the tabs when the close button is clicked
  const closeTabs = () => {
    setShowTabs(false); // Hide the tabs
  };

  // Function to connect to the broker using the specified URL
  const connectToBroker = () => {
    const client = mqtt.connect(brokerUrl); // Connect to the MQTT broker
    setMqttClient(client); // Set the MQTT client state
  };

  return (
    <div>
      <h2>Broker Interface</h2>
      <div id="brokerTable">
        <div id="wrapper">
          <h2>New Broker</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="brokerUrl">Broker URL:</label>
            <input
              type="text"
              id="brokerUrl"
              placeholder="Enter broker URL"
              style={{ width: '50%', marginBottom: '8px' }}
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
            />
            <label htmlFor="topic">Topic:</label>
            <input
              type="text"
              id="topic"
              placeholder="Enter topic"
              style={{ width: '50%', marginBottom: '16px' }}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button onClick={connectToBroker}>Connect to Broker</button>
          </div>

          <table>
            <tbody>
              <tr>
                <th>Rotation</th>
                <td>
                  <label htmlFor="roll">Roll:</label>
                  <input
                    type="number"
                    id="roll"
                    value={transformations.roll}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label htmlFor="pitch">Pitch:</label>
                  <input
                    type="number"
                    id="pitch"
                    value={transformations.pitch}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label htmlFor="yaw">Yaw:</label>
                  <input
                    type="number"
                    id="yaw"
                    value={transformations.yaw}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Translation</th>
                <td>
                  <label htmlFor="translateX">Translate X:</label>
                  <input
                    type="number"
                    id="translateX"
                    value={transformations.translateX}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label htmlFor="translateY">Translate Y:</label>
                  <input
                    type="number"
                    id="translateY"
                    value={transformations.translateY}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label htmlFor="translateZ">Translate Z:</label>
                  <input
                    type="number"
                    id="translateZ"
                    value={transformations.translateZ}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Scale</th>
                <td>
                  <label htmlFor="scaleX">Scale X:</label>
                  <input
                    type="number"
                    id="scaleX"
                    value={transformations.scaleX}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label htmlFor="scaleY">Scale Y:</label>
                  <input
                    type="number"
                    id="scaleY"
                    value={transformations.scaleY}
                    onChange={handleInputChange}
                  />
                  <br />
                  <label htmlFor="scaleZ">Scale Z:</label>
                  <input
                    type="number"
                    id="scaleZ"
                    value={transformations.scaleZ}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button id="applyTransformationBtn" onClick={ApplyTransformations}>
            Apply Transformations
          </button>
          <button onClick={resetTransformations}>Reset Transformations</button>
        </div>
      </div>

      {connectedBrokerVisible && (
        <div id="connected-broker">
          <h2 id="title">DISPLAY</h2>
          <div id="cubewrapper">
            <div
              id="cube"
              className="cube"
              onMouseEnter={() => setShowTabs(true)}
              style={{
                transform: `rotateX(${transformations.pitch}deg) rotateY(${transformations.yaw}deg) rotateZ(${transformations.roll}deg) translate3d(${transformations.translateX}px, ${transformations.translateY}px, ${transformations.translateZ}px) scale3d(${transformations.scaleX}, ${transformations.scaleY}, ${transformations.scaleZ})`,
                transition: 'transform 0.5s ease', // Smooth transition for the transformations
              }}
            ></div>
          </div>

          {showTabs && (
            <div
              id="tabs"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'white',
                padding: '10px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                zIndex: 10,
              }}
            >
              <button onClick={() => setSelectedTab('transform')}>Add Remote Transformation</button>
              <button onClick={() => setSelectedTab('hotspot')}>Add Hotspot</button>

              {selectedTab === 'transform' && (
                <div>
                  <h3>Remote Transformations</h3>
                  <table>
                    <tbody>
                      <tr>
                        <th>Rotation</th>
                        <td>
                          <label htmlFor="roll">Roll:</label>
                          <input
                            type="number"
                            id="roll"
                            value={transformations.roll}
                            onChange={handleInputChange}
                          />
                          <br />
                          <label htmlFor="pitch">Pitch:</label>
                          <input
                            type="number"
                            id="pitch"
                            value={transformations.pitch}
                            onChange={handleInputChange}
                          />
                          <br />
                          <label htmlFor="yaw">Yaw:</label>
                          <input
                            type="number"
                            id="yaw"
                            value={transformations.yaw}
                            onChange={handleInputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Translation</th>
                        <td>
                          <label htmlFor="translateX">Translate X:</label>
                          <input
                            type="number"
                            id="translateX"
                            value={transformations.translateX}
                            onChange={handleInputChange}
                          />
                          <br />
                          <label htmlFor="translateY">Translate Y:</label>
                          <input
                            type="number"
                            id="translateY"
                            value={transformations.translateY}
                            onChange={handleInputChange}
                          />
                          <br />
                          <label htmlFor="translateZ">Translate Z:</label>
                          <input
                            type="number"
                            id="translateZ"
                            value={transformations.translateZ}
                            onChange={handleInputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Scale</th>
                        <td>
                          <label htmlFor="scaleX">Scale X:</label>
                          <input
                            type="number"
                            id="scaleX"
                            value={transformations.scaleX}
                            onChange={handleInputChange}
                          />
                          <br />
                          <label htmlFor="scaleY">Scale Y:</label>
                          <input
                            type="number"
                            id="scaleY"
                            value={transformations.scaleY}
                            onChange={handleInputChange}
                          />
                          <br />
                          <label htmlFor="scaleZ">Scale Z:</label>
                          <input
                            type="number"
                            id="scaleZ"
                            value={transformations.scaleZ}
                            onChange={handleInputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button onClick={ApplyTransformations}>Apply Transformations</button>
                  <button onClick={resetTransformations}>Reset Transformations</button>
                </div>
              )}

              {selectedTab === 'hotspot' && (
                <div>
                  <h3>Hotspot</h3>
                  <div 
                    id="hotspot-pin" 
                    onClick={handleHotspotClick} 
                    style={{
                      cursor: 'pointer',
                      fontSize: '40px',
                      display: 'inline-block',
                    }}
                  >
                    📍
                  </div>
                  <p>{randomMessage}</p>
                </div>
              )}
              <button onClick={closeTabs}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrokerInterface;
