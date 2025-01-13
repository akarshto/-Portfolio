// const mqtt = require("mqtt");
import mqtt from "mqtt";
var mqttClient;

// Change this to point to your MQTT broker or DNS name
const mqttHost = "127.0.0.1";
const protocol = "mqtt";
const port = "1883";

export function connectToBroker() {
  const clientId = "client" + Math.random().toString(36).substring(7);

  // Change this to point to your MQTT broker
  const hostURL = `${protocol}://${mqttHost}:${port}`;

  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  mqttClient = mqtt.connect(hostURL, options);

  mqttClient.on("error", (err) => {
    console.log("Error: ", err);
    mqttClient.end();
  });

  mqttClient.on("reconnect", () => {
    console.log("Reconnecting...");
  });

  mqttClient.on("connect", () => {
    console.log("Client connected:" + clientId);
  });

  // Received Message
  mqttClient.on("message", (topic, message, packet) => {
    console.log(
      "Received Message: " + message + "\nOn topic: " + topic
    );
  });
}

export function subscribeToTopic(topic) {
  console.log(`Subscribing to Topic: ${topic}`);

  mqttClient.subscribe(topic, { qos: 0 });

  mqttClient.on("message", (topic, message, packet) => {
    // console.log(
    //   "Received Message: " + message + "\nOn topic: " + topic
    // );
    return message;
  });
  
}

connectToBroker();
// subscribeToTopic("temperature");
subscribeToTopic("motion");

