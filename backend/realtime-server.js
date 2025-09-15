import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";

const settingsPath = "./settings.json";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});w

let config = {
  systemOn: true,
  enableImage: true,
  enableText: true,
  price: 100,
  time: 10,
  settings: [] // เก็บแพ็คเกจ
};

// โหลด settings จากไฟล์
if (fs.existsSync(settingsPath)) {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    config = { ...config, ...saved };
  } catch (e) {
    console.error("อ่าน settings.json ไม่ได้:", e);
  }
}

// REST API (optional สำหรับ fallback)
app.get("/api/status", (req, res) => res.json(config));

// WebSocket
io.on("connection", (socket) => {
  // ส่งสถานะล่าสุดให้ client ที่เพิ่งเชื่อมต่อ
  socket.emit("status", config);

  // รับสถานะใหม่จาก admin
  socket.on("updateStatus", (newStatus) => {
    config = { ...config, ...newStatus };
    io.emit("status", config);
  });

  socket.on("getConfig", () => {
    socket.emit("configUpdate", config);
  });

  socket.on("adminUpdateConfig", (newConfig) => {
    config = { ...config, ...newConfig };
    io.emit("configUpdate", config);

    // บันทึกลงไฟล์ทุกครั้งที่มีการเปลี่ยน
    fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
  });

  socket.on("addSetting", (setting) => {
    config.settings = config.settings || [];
    config.settings.unshift(setting);
    fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
    io.emit("status", config); // broadcast ให้ TimeHistory และ User
  });

  socket.on("removeSetting", (id) => {
    config.settings = (config.settings || []).filter(item => item.id !== id);
    fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
    io.emit("status", config);
  });
});

server.listen(4005, () => console.log("Server running on port 4005"));