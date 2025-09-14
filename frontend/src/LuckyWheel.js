import React, { useState, useRef, useEffect } from "react";
import "./LuckyWheel.css";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const defaultColors = [
  "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#38bdf8", "#818cf8"
];

function LuckyWheel() {
  const [segments, setSegments] = useState(["โต๊ะ 1", "โต๊ะ 2", "โต๊ะ 3"]);
  const [input, setInput] = useState("");
  const [tableRange, setTableRange] = useState({ from: "", to: "" });
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupEffect, setPopupEffect] = useState(false);
  const [reward, setReward] = useState("");
  const textareaRef = useRef(null);
  const wheelRef = useRef(null);

  // เพิ่มชื่อช่องใหม่จาก textarea (แยกบรรทัด)
  const handleAddFromTextarea = () => {
    const lines = input
      .split("\n")
      .map(line => line.trim())
      .filter(line => line);
    if (lines.length > 0) {
      setSegments([...segments, ...lines]);
      setInput("");
    }
  };

  // เพิ่มโต๊ะตามช่วงที่กรอก
  const handleAddTables = () => {
    const from = parseInt(tableRange.from);
    const to = parseInt(tableRange.to);
    if (!isNaN(from) && !isNaN(to) && from <= to && from > 0 && to - from < 200) {
      const newTables = [];
      for (let i = from; i <= to; i++) {
        newTables.push(`โต๊ะ ${i}`);
      }
      setSegments([...segments, ...newTables]);
      setTableRange({ from: "", to: "" });
    }
  };

  // ลบช่อง
  const handleDelete = (idx) => {
    setSegments(segments.filter((_, i) => i !== idx));
    if (editIndex === idx) setEditIndex(null);
  };

  // ลบทั้งหมด
  const handleDeleteAll = () => {
    setSegments([]);
    setEditIndex(null);
  };

  // แก้ไขชื่อช่อง
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditValue(segments[idx]);
  };
  const handleEditSave = (idx) => {
    if (editValue.trim()) {
      const newSeg = [...segments];
      newSeg[idx] = editValue.trim();
      setSegments(newSeg);
      setEditIndex(null);
    }
  };

  // หมุนวงล้อ
  const spinWheel = () => {
    if (segments.length < 2 || spinning) return;
    setWinner(null);
    setSpinning(true);
    setShowPopup(false);
    setPopupEffect(false);
    const winnerIdx = getRandomInt(0, segments.length - 1);
    const degPerSeg = 360 / segments.length;
    const randomTurns = getRandomInt(5, 8);
    const finalDeg = 360 * randomTurns + (360 - winnerIdx * degPerSeg - degPerSeg / 2);

    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = `rotate(0deg)`;
      setTimeout(() => {
        wheelRef.current.style.transition = "transform 4s cubic-bezier(.17,.67,.83,.67)";
        wheelRef.current.style.transform = `rotate(${finalDeg}deg)`;
      }, 50);
    }

    setTimeout(() => {
      setSpinning(false);
      setWinner(winnerIdx);
      setShowPopup(true);
      setTimeout(() => setPopupEffect(true), 50);
    }, 4100);
  };

  // ปิดป๊อปอัพ
  const closePopup = () => {
    setPopupEffect(false);
    setTimeout(() => setShowPopup(false), 300);
  };

  // วาดวงล้อ
const renderWheel = () => {
  const segs = segments.length;
  const arc = 2 * Math.PI / segs;
  const radius = 160; // ✅ ขยายรัศมีวงล้อ
  const viewBox = 360; // ✅ ขยาย viewBox
  // ปรับตำแหน่งให้อยู่ตรงกลางจริงๆ
  const center = viewBox / 2;
  return (
    <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`}>
      <g transform={`translate(${center},${center})`}>
        {segments.map((seg, i) => {
          const startAngle = i * arc - Math.PI / 2;
          const endAngle = (i + 1) * arc - Math.PI / 2;
          const x1 = radius * Math.cos(startAngle);
          const y1 = radius * Math.sin(startAngle);
          const x2 = radius * Math.cos(endAngle);
          const y2 = radius * Math.sin(endAngle);
          const largeArc = arc > Math.PI ? 1 : 0;
          const pathData = `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            Z
          `;
          return (
            <g key={i}>
              <path
                d={pathData}
                fill={defaultColors[i % defaultColors.length]}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={((radius + 20) / 2) * Math.cos(startAngle + arc / 2)}
                y={((radius + 20) / 2) * Math.sin(startAngle + arc / 2)}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={segments.length > 20 ? 12 : 16}
                fill="#222"
                transform={`rotate(${(startAngle + arc / 2) * 180 / Math.PI},${((radius + 20) / 2) * Math.cos(startAngle + arc / 2)},${((radius + 20) / 2) * Math.sin(startAngle + arc / 2)})`}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {seg.length > 16 ? seg.slice(0, 14) + "…" : seg}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};


  // กดสเปซบาร์ใน textarea เพื่อเพิ่มช่องใหม่
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const handleKeyDown = (e) => {
      if (e.key === " " && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        // ถ้าเป็นช่องว่างธรรมดา ให้แทรกช่องว่าง
        return;
      }
      if (e.key === "Enter" || e.key === " " && e.ctrlKey) {
        e.preventDefault();
        handleAddFromTextarea();
      }
    };
    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [input, segments]);

  return (
    <div className="lucky-wheel-flex">
      <div className="lucky-wheel-left">
        <div className="wheel-area" style={{ width: 380, height: 380 }}>
          {/* สี่เหลี่ยมแหลมชี้เข้าในวงล้อ */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              transform: "translateX(-50%)",
              width: 36,
              height: 36,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <svg width="36" height="36">
              <polygon
                points="18,24 28,0 18,6 8,0"
                fill="#f59e42"
                stroke="#eab308"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div
            className="wheel-svg"
            ref={wheelRef}
            style={{
              width: 360,
              height: 360,
              margin: "0 auto",
              borderRadius: "50%",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              background: "#fff",
              transition: "transform 4s cubic-bezier(.17,.67,.83,.67)"
            }}
          >
            {renderWheel()}
          </div>
        </div>
        <button
          className="spin-btn"
          onClick={spinWheel}
          disabled={spinning || segments.length < 2}
          style={{ marginTop: 18, fontSize: 20, padding: "8px 32px" }}
        >
          {spinning ? "กำลังหมุน..." : "หมุนวงล้อ"}
        </button>
        <div className="reward-row">
          <label>ของรางวัล:</label>
          <input
            type="text"
            className="reward-input"
            placeholder="กรอกของรางวัลสำหรับการสุ่ม"
            value={reward}
            onChange={e => setReward(e.target.value)}
            disabled={spinning}
          />
        </div>
      </div>
      <div className="lucky-wheel-right">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <h3 style={{margin:0}}>เพิ่มชื่อช่อง</h3>
          <button className="delete-all-btn" onClick={handleDeleteAll} disabled={spinning || segments.length === 0}>ลบทั้งหมด</button>
        </div>
        <textarea
          ref={textareaRef}
          className="wheel-textarea"
          placeholder="พิมพ์ชื่อแต่ละช่อง แล้วกด Enter"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={6}
          disabled={spinning}
        />
        <button
          className="add-btn"
          onClick={handleAddFromTextarea}
          disabled={spinning || !input.trim()}
        >
          เพิ่มช่อง
        </button>
        <div className="table-range-row">
          <input
            type="number"
            placeholder="โต๊ะจาก"
            style={{ width: 80 }}
            value={tableRange.from}
            onChange={e => setTableRange({ ...tableRange, from: e.target.value })}
            disabled={spinning}
          />
          <input
            type="number"
            placeholder="ถึง"
            style={{ width: 80 }}
            value={tableRange.to}
            onChange={e => setTableRange({ ...tableRange, to: e.target.value })}
            disabled={spinning}
          />
          <button onClick={handleAddTables} disabled={spinning || !tableRange.from || !tableRange.to}>เพิ่มโต๊ะ</button>
        </div>
        <div className="wheel-edit-list small">
          {segments.map((seg, idx) => (
            <div key={idx} className="wheel-segment-edit small">
              {editIndex === idx ? (
                <>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEditSave(idx)}
                    autoFocus
                    style={{ width: 90 }}
                  />
                  <button onClick={() => handleEditSave(idx)}>บันทึก</button>
                  <button onClick={() => setEditIndex(null)}>ยกเลิก</button>
                </>
              ) : (
                <>
                  <span>{seg}</span>
                  <button onClick={() => handleEdit(idx)} disabled={spinning}>แก้ไข</button>
                  <button onClick={() => handleDelete(idx)} disabled={spinning}>ลบ</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Popup winner */}
      {showPopup && winner !== null && (
        <div className={`winner-popup ${popupEffect ? "show" : ""}`} onClick={closePopup}>
          <div className="winner-popup-content">
            <div className="winner-firework">&#127881;</div>
            <div className="winner-title">ผลลัพธ์</div>
            <div className="winner-name">{segments[winner]}</div>
            <div className="winner-reward">
              {reward && (
                <>
                  <span>ของรางวัล:</span>
                  <span className="winner-reward-value">{reward}</span>
                </>
              )}
            </div>
            <div className="winner-firework">&#127881;</div>
            <button className="winner-close-btn" onClick={closePopup}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LuckyWheel;
