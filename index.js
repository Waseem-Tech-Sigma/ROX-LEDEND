
```js
const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const app = express();
const { default: P } = require("pino");
const path = require("path");
require("dotenv").config();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

const { state, saveState } = useSingleFileAuthState("./auth.json");

async function startSock() {
  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
   const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(msg.key.remoteJid, { text: "Hello from ROX-LEGEND Bot 🤖" });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      startSock();
    }
  });
}

startSock();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on http://localhost:" + port);
});
```
