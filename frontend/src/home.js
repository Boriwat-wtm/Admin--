import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  const [systemOn, setSystemOn] = useState(true);
  const [mode, setMode] = useState("image");
  const [second, setSecond] = useState("");
  const [minute, setMinute] = useState("");
  const [hour, setHour] = useState("");
  const [price, setPrice] = useState("");

  const handleSave = () => {
    alert(
      `บันทึกสำเร็จ\nประเภท: ${mode === "image" ? "รูปภาพ" : "ข้อความ"}\nเวลา: ${hour} ชม. ${minute} นาที ${second} วินาที\nราคา: ${price} บาท`
    );
  };

  const handleToggleSystem = () => {
    setSystemOn((prev) => !prev);
    // ส่งสถานะไป backend เพื่อ sync กับ user
  };

  return (
    <div className="home-container">
      {/* Header bar */}
      <header
        className="main-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          maxWidth: "100vw",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.2rem 2.5rem",
          boxSizing: "border-box",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(30, 41, 59, 0.08)",
        }}
      >
        <div className="main-header-title" style={{ fontSize: "2.2rem", color: "#1a237e", fontWeight: "bold" }}>
          CMS ADMIN
        </div>
        <div className="status-row-header" style={{ display: "flex", alignItems: "center" }}>
          <Link to="/stat-slip">
            <button
              style={{
                width: 130,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 0",
                fontWeight: 500,
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(30,41,59,0.08)",
                transition: "background 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                marginRight: 18
              }}
              onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
              onMouseOut={e => e.currentTarget.style.background = "#2563eb"}
            >
              Check slip
            </button>
          </Link>
          <Link to="/report">
            <button
              style={{
                width: 130,
                background: "#64748b",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 0",
                fontWeight: 500,
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(30,41,59,0.08)",
                transition: "background 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                marginRight: 18
              }}
              onMouseOver={e => e.currentTarget.style.background = "#475569"}
              onMouseOut={e => e.currentTarget.style.background = "#64748b"}
            >
              Report
            </button>
          </Link>
          <Link to="/image-queue">
            <button
              style={{
                width: 130,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 0",
                fontWeight: 500,
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(30,41,59,0.08)",
                transition: "background 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                marginRight: 18
              }}
              onMouseOver={e => e.currentTarget.style.background = "#b91c1c"}
              onMouseOut={e => e.currentTarget.style.background = "#dc2626"}
            >
              Image Queue
            </button>
          </Link>
          <Link to="/checklist">
            <button
              style={{
                width: 130,
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 0",
                fontWeight: 500,
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(30,41,59,0.08)",
                transition: "background 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                marginRight: 32
              }}
              onMouseOver={e => e.currentTarget.style.background = "#047857"}
              onMouseOut={e => e.currentTarget.style.background = "#059669"}
            >
              Checklist
            </button>
          </Link>
          <span className="status-label" style={{ marginRight: 10 }}>สถานะระบบ:</span>
          <div
            className={`switch-track ${systemOn ? "switch-on" : "switch-off"}`}
            onClick={handleToggleSystem}
            style={{ cursor: "pointer" }}
            title={systemOn ? "ปิดระบบ" : "เปิดระบบ"}
          >
            <div className="switch-thumb"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content" style={{ marginTop: "90px" }}>
        <section className="mode-row">
          <span>ตั้งค่าสำหรับ:</span>
          <button
            className={`mode-btn${mode === "image" ? " active" : ""}`}
            onClick={() => setMode("image")}
            disabled={!systemOn}
          >
            รูปภาพ
          </button>
          <button
            className={`mode-btn${mode === "text" ? " active" : ""}`}
            onClick={() => setMode("text")}
            disabled={!systemOn}
          >
            ข้อความ
          </button>
        </section>
        {!systemOn && (
          <div className="system-off-msg" style={{ marginTop: 10 }}>
            * ระบบถูกปิด ฝั่ง user จะไม่สามารถเลือกส่งภาพหรือข้อความได้
          </div>
        )}

        <section className="setting-row">
          <div className="time-row">
            <label>ตั้งเวลา (เลือกอย่างน้อย 1 ช่อง):</label>
            <div className="time-inputs">
              <input
                type="number"
                min="1"
                max="59"
                placeholder="วินาที"
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                disabled={!systemOn}
              />
              <input
                type="number"
                min="1"
                max="59"
                placeholder="นาที"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                disabled={!systemOn}
              />
              <input
                type="number"
                min="1"
                max="24"
                placeholder="ชั่วโมง"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                disabled={!systemOn}
              />
            </div>
          </div>

          <div className="price-row">
            <label>ตั้งราคา (บาท):</label>
            <input
              type="number"
              min="1"
              placeholder="ราคา"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={!systemOn}
            />
          </div>

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!systemOn}
          >
            บันทึก
          </button>
        </section>
      </main>
    </div>
  );
}

export default Home;