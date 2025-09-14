import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./home.css";

const socket = io("http://localhost:4005");

function Home() {
  const [systemOn, setSystemOn] = useState(true);
  const [mode, setMode] = useState("image");
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    socket.on("configUpdate", (config) => {
      setSystemOn(config.systemOn);
    });
    socket.emit("getConfig");
    return () => socket.off("configUpdate");
  }, []);

  const handleToggleSystem = () => {
    setSystemOn((prev) => {
      const newStatus = !prev;
      socket.emit("adminUpdateConfig", { systemOn: newStatus });
      return newStatus;
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