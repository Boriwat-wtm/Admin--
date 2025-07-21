import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { verifyPassword, hashPassword } from './hashPasswords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// สร้างโฟลเดอร์ uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// เสิร์ฟไฟล์รูปภาพ
app.use('/uploads', express.static(uploadsDir));

// เก็บข้อมูลรูปภาพ (ในการใช้งานจริงควรใช้ฐานข้อมูล)
let imageQueue = [];

// ฟังก์ชันโหลดข้อมูลผู้ใช้จาก users.json
async function loadUsers() {
  try {
    const data = await fs.promises.readFile("users.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log("users.json not found, creating default users...");
    // สร้างผู้ใช้เริ่มต้นถ้าไม่มีไฟล์
    const defaultUsers = [
      { username: "admin", password: await hashPassword("admin123") },
      { username: "cms1", password: await hashPassword("dfhy1785") },
      { username: "cms2", password: await hashPassword("sdgsd5996") },
    ];
    
    await fs.promises.writeFile("users.json", JSON.stringify(defaultUsers, null, 2));
    console.log("Default users created and saved to users.json");
    return defaultUsers;
  }
}

// ฟังก์ชันค้นหาผู้ใช้
async function findUser(username) {
  const users = await loadUsers();
  return users.find(user => user.username === username);
}

// API สำหรับ login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("=== Login attempt:", username);
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" 
      });
    }
    
    // ค้นหาผู้ใช้จาก users.json
    const user = await findUser(username);
    
    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ 
        success: false, 
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
      });
    }
    
    // ตรวจสอบรหัสผ่านด้วย bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (isPasswordValid) {
      console.log("Login successful for:", username);
      res.json({ 
        success: true, 
        message: "เข้าสู่ระบบสำเร็จ",
        user: {
          username: user.username,
          role: "admin"
        }
      });
    } else {
      console.log("Invalid password for:", username);
      res.status(401).json({ 
        success: false, 
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในระบบ" 
    });
  }
});

// API สำหรับรับข้อมูลจาก User backend
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    console.log("=== Received upload request");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    const { text, type, time, price, sender, textColor } = req.body;
    
    const newImage = {
      id: Date.now().toString(),
      text: text || "",
      type,
      time: parseInt(time) || 0,
      price: parseFloat(price) || 0,
      sender: sender || "Unknown",
      textColor: textColor || 'white',
      filePath: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };
    
    imageQueue.push(newImage);
    console.log('Added to queue:', newImage);
    console.log('Current queue length:', imageQueue.length);
    
    res.json({ success: true, message: 'Upload received successfully' });
  } catch (error) {
    console.error('Error receiving upload:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API สำหรับดูคิวรูปภาพ - เรียงตามวันที่เวลา (เก่าไปใหม่)
app.get("/api/queue", (req, res) => {
  try {
    console.log("=== Queue request received");
    console.log("Current queue length:", imageQueue.length);
    
    // เรียงตามเวลาที่รับมา เก่าไปใหม่ (FIFO - First In First Out)
    const sortedImages = imageQueue.sort((a, b) => {
      const dateA = new Date(a.receivedAt);
      const dateB = new Date(b.receivedAt);
      return dateA - dateB;
    });
    
    console.log("Returning sorted images:", sortedImages);
    res.json(sortedImages);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API สำหรับอนุมัติรูปภาพ
app.post("/api/approve/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log("=== Approving image:", id);
    
    const imageIndex = imageQueue.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    // บันทึกการอนุมัติ (สำหรับ log หรือสถิติ)
    const approvedImage = { ...imageQueue[imageIndex], status: 'approved', approvedAt: new Date().toISOString() };
    console.log('Image approved:', approvedImage);
    
    // ลบออกจากคิว
    imageQueue.splice(imageIndex, 1);
    
    res.json({ success: true, message: 'Image approved and removed from queue' });
  } catch (error) {
    console.error('Error approving image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API สำหรับปฏิเสธรูปภาพ
app.post("/api/reject/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log("=== Rejecting image:", id);
    
    const imageIndex = imageQueue.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    // บันทึกการปฏิเสธ (สำหรับ log หรือสถิติ)
    const rejectedImage = { ...imageQueue[imageIndex], status: 'rejected', rejectedAt: new Date().toISOString() };
    console.log('Image rejected:', rejectedImage);
    
    // ลบไฟล์รูปภาพ
    if (imageQueue[imageIndex].filePath) {
      const imagePath = path.join(__dirname, imageQueue[imageIndex].filePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image file deleted:', imagePath);
      }
    }
    
    // ลบออกจากคิว
    imageQueue.splice(imageIndex, 1);
    
    res.json({ success: true, message: 'Image rejected and removed from queue' });
  } catch (error) {
    console.error('Error rejecting image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API สำหรับลบรูปภาพที่ถูกปฏิเสธ
app.delete("/api/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    const imageIndex = imageQueue.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    // ลบไฟล์รูปภาพ
    if (imageQueue[imageIndex].filePath) {
      const imagePath = path.join(__dirname, imageQueue[imageIndex].filePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // ลบออกจากคิว
    imageQueue.splice(imageIndex, 1);
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API สำหรับสถิติสลิป
app.post("/api/stat-slip", (req, res) => {
  console.log('Received stat-slip:', req.body);
  res.json({ success: true });
});

// API สำหรับดูรายงานจาก User backend
app.get("/api/admin/report", async (req, res) => {
  try {
    console.log("=== Admin report request received");
    
    // อ่านไฟล์ report.json
    const reportPath = path.join(__dirname, 'report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.log("report.json not found");
      return res.json([]);
    }
    
    const data = await fs.promises.readFile(reportPath, 'utf8');
    const reports = JSON.parse(data);
    
    console.log("Returning reports:", reports.length);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// API สำหรับรับรายงานจาก User backend
app.post("/api/report", (req, res) => {
  try {
    console.log('=== Received report from User backend:', req.body);
    
    // บันทึกข้อมูลลงไฟล์ report.json
    const reportPath = path.join(__dirname, 'report.json');
    let reports = [];
    
    // อ่านข้อมูลเดิม (ถ้ามี)
    if (fs.existsSync(reportPath)) {
      const data = fs.readFileSync(reportPath, 'utf8');
      reports = JSON.parse(data);
    }
    
    // เพิ่มรายงานใหม่
    const newReport = {
      ...req.body,
      id: Date.now().toString(),
      receivedAt: new Date().toISOString()
    };
    
    reports.push(newReport);
    
    // บันทึกลงไฟล์
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
    
    console.log('Report saved successfully');
    res.json({ success: true, message: 'Report received successfully' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    queueLength: imageQueue.length
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`Admin backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Queue API: http://localhost:${PORT}/api/queue`);
  console.log(`Login API: http://localhost:${PORT}/login`);
  console.log(`Report API: http://localhost:${PORT}/api/admin/report`);
  
  // โหลดและแสดงผู้ใช้ที่มีอยู่
  try {
    const users = await loadUsers();
    console.log("Available users:");
    users.forEach(user => {
      console.log(`- ${user.username}`);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
});

