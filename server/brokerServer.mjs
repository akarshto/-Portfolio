import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';
var mqttClient;
var messages = [];
const app = express();

app.use(cors({
  origin: "http://localhost:3000", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
}));


app.get('/message/', async(req, res)=>{
    if(messages.length > 0)
        res.send(messages[messages.length - 1]);
    else
        res.send("no messages");
})
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
      "Received Message: " + message.toString() + "\nOn topic: " + topic
    );
    messages[messages.length] = message;
  });
}

export function subscribeToTopic(topic) {
  console.log(`Subscribing to Topic: ${topic}`);

  mqttClient.subscribe(topic, { qos: 0 });
}

connectToBroker();
subscribeToTopic('motion');
app.listen('5000', ()=>{
    console.log("listening on 5000");
})