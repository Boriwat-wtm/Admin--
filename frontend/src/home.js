import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./home.css";

const socket = io("http://localhost:4005");

function Home() {
  const [systemOn, setSystemOn] = useState(true);
  const [enableImage, setEnableImage] = useState(true);
  const [enableText, setEnableText] = useState(true);
  const [mode, setMode] = useState("image");
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    socket.on("configUpdate", (config) => {
      setSystemOn(config.systemOn);
      setEnableImage(config.enableImage);
      setEnableText(config.enableText);
    });
    socket.emit("getConfig");
    return () => socket.off("configUpdate");
  }, []);

  // เมื่อกดปุ่มเปิด/ปิดระบบ
  const handleToggleSystem = () => {
    const newStatus = !systemOn;
    setSystemOn(newStatus);
    // ถ้าปิดระบบ ให้ปิดทุกฟังก์ชันด้วย
    if (!newStatus) {
      setEnableImage(false);
      setEnableText(false);
      socket.emit("adminUpdateConfig", {
        systemOn: newStatus,
        enableImage: false,
        enableText: false,
      });
    } else {
      // ถ้าเปิดระบบใหม่ ให้เปิดทุกฟังก์ชัน
      setEnableImage(true);
      setEnableText(true);
      socket.emit("adminUpdateConfig", {
        systemOn: newStatus,
        enableImage: true,
        enableText: true,
      });
    }
  };

  // เปิด/ปิดฟังก์ชันส่งรูป
  const handleToggleImage = () => {
    const newStatus = !enableImage;
    setEnableImage(newStatus);
    socket.emit("adminUpdateConfig", {
      enableImage: newStatus,
      systemOn,
      enableText,
    });
  };

  // เปิด/ปิดฟังก์ชันข้อความ
  const handleToggleText = () => {
    const newStatus = !enableText;
    setEnableText(newStatus);
    socket.emit("adminUpdateConfig", {
      enableText: newStatus,
      systemOn,
      enableImage,
    });
  };

  const handleSave = () => {
    if (!minute && !second) {
      alert("กรุณากรอกเวลาอย่างน้อย 1 ช่อง");
      return;
    }
    if (!price) {
      alert("กรุณากรอกราคา");
      return;
    }
    const packageData = {
      id: Date.now(),
      mode,
      date: new Date().toLocaleString(),
      duration: `${minute ? minute + " นาที" : ""}${second ? (minute ? " " : "") + second + " วินาที" : ""}`,
      price: price,
    };
    socket.emit("addSetting", packageData);
    setMinute("");
    setSecond("");
    setPrice("");
    alert("บันทึกแพ็คเกจสำเร็จ");
  };

  return (
    <div className="admin-home-minimal">
      <header className="admin-header-minimal">
        <div className="brand-minimal">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3949ab" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span className="brand-title">CMS ADMIN</span>
        </div>
        <nav className="nav-minimal">
          <a href="/TimeHistory">ประวัติการตั้งเวลา</a>
          <a href="/image-queue">ตรวจสอบรูปภาพ</a>
          <a href="/report">รายงาน</a>
          <a href="/check-history">ประวัติการตรวจสอบ</a>
          <a href="/lucky-wheel">วงล้อเสี่ยงดวง</a>
        </nav>
      </header>

      <main className="admin-main-minimal">
        <div className="system-status-row">
          <span className="system-label">สถานะระบบ:</span>
          <div
            className={`switch-minimal ${systemOn ? "on" : "off"}`}
            onClick={handleToggleSystem}
            title={systemOn ? "ปิดระบบ" : "เปิดระบบ"}
          >
            <div className="switch-dot"></div>
          </div>
          <span className={`system-status-text ${systemOn ? "on" : "off"}`}>
            {systemOn ? "เปิด" : "ปิด"}
          </span>
        </div>
        {!systemOn && (
          <div className="system-off-msg-minimal">
            ระบบถูกปิด ฝั่งผู้ใช้จะไม่สามารถใช้งานได้
          </div>
        )}

        {/* ปุ่มเปิด/ปิดฟังก์ชันแต่ละอัน */}
        <div className="function-toggle-row">
          <span>ฟังก์ชันส่งรูปภาพ:</span>
          <button
            className={`toggle-btn-minimal${enableImage ? " on" : " off"}`}
            onClick={handleToggleImage}
            disabled={!systemOn}
          >
            {enableImage ? "เปิด" : "ปิด"}
          </button>
          <span>ฟังก์ชันข้อความ:</span>
          <button
            className={`toggle-btn-minimal${enableText ? " on" : " off"}`}
            onClick={handleToggleText}
            disabled={!systemOn}
          >
            {enableText ? "เปิด" : "ปิด"}
          </button>
        </div>

        <section className="setting-card-minimal">
          <h2>ตั้งค่าแพ็คเกจ</h2>
          <div className="mode-select-row">
            <button
              className={`mode-btn-minimal${mode === "image" ? " active" : ""}`}
              onClick={() => setMode("image")}
              disabled={!systemOn}
            >
              รูปภาพ
            </button>
            <button
              className={`mode-btn-minimal${mode === "text" ? " active" : ""}`}
              onClick={() => setMode("text")}
              disabled={!systemOn}
            >
              ข้อความ
            </button>
          </div>
          <div className="input-row-minimal">
            <input
              type="number"
              min="1"
              max="59"
              placeholder="นาที"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              disabled={!systemOn}
              className="input-minimal"
            />
            <input
              type="number"
              min="1"
              max="59"
              placeholder="วินาที"
              value={second}
              onChange={(e) => setSecond(e.target.value)}
              disabled={!systemOn}
              className="input-minimal"
            />
            <input
              type="number"
              min="1"
              placeholder="ราคา (บาท)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={!systemOn}
              className="input-minimal"
            />
          </div>
          <button
            className="save-btn-minimal"
            onClick={handleSave}
            disabled={!systemOn}
          >
            บันทึกแพ็คเกจ
          </button>
        </section>
      </main>
    </div>
  );
}

export default Home;