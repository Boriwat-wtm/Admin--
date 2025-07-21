
import React, { useEffect, useState } from "react";

function Checklist() {
  const [files, setFiles] = useState([]);
  const [fileMeta, setFileMeta] = useState({});
  const [popupFile, setPopupFile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/uploads")
      .then(res => res.json())
      .then(data => setFiles(data.files || []));

    fetch("http://localhost:4000/api/uploads-meta")
      .then(res => res.json())
      .then(data => setFileMeta(data || {}));
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 32,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(30,41,59,0.10)",
        fontFamily: "Segoe UI, sans-serif"
      }}
    >
      <h1 style={{
        textAlign: "center",
        color: "#1a237e",
        marginBottom: 32,
        fontWeight: 700,
        letterSpacing: 1
      }}>
        ไฟล์ที่ลูกค้าอัปโหลด
      </h1>
      {files.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888", padding: 32 }}>
          ไม่มีไฟล์ที่อัปโหลด
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#f8fafc", borderRadius: 12, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#e3e8f0" }}>
              <th style={{ padding: "10px 6px", border: "1px solid #cbd5e1" }}>ลำดับคิว</th>
              <th style={{ padding: "10px 6px", border: "1px solid #cbd5e1" }}>ข้อมูลโปรไฟล์ (ชื่อ)</th>
              <th style={{ padding: "10px 6px", border: "1px solid #cbd5e1" }}>ประเภทอัปโหลด</th>
              <th style={{ padding: "10px 6px", border: "1px solid #cbd5e1" }}>ข้อมูลเพิ่มเติม</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr key={file} style={{ background: idx % 2 === 0 ? "#fff" : "#f1f5f9" }}>
                <td style={{ padding: "8px 6px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ padding: "8px 6px", border: "1px solid #e2e8f0" }}>
                  {fileMeta[file]?.sender ? fileMeta[file].sender : "ไม่ทราบชื่อผู้ส่ง"}
                </td>
                <td style={{ padding: "8px 6px", border: "1px solid #e2e8f0" }}>
                  {fileMeta[file]?.type ? fileMeta[file].type : "-"}
                </td>
                <td style={{ padding: "8px 6px", border: "1px solid #e2e8f0" }}>
                  <button
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 14px",
                      fontWeight: 500,
                      fontSize: "1rem",
                      cursor: "pointer"
                    }}
                    onClick={() => setPopupFile(file)}
                  >
                    ดูข้อมูลเพิ่มเติม
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Popup แสดงรูปภาพ */}
      {popupFile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setPopupFile(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 320,
              maxWidth: 500,
              boxShadow: "0 4px 24px rgba(30,41,59,0.18)",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "2px 10px",
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={() => setPopupFile(null)}
            >
              ปิด
            </button>
            <h3 style={{ textAlign: "center", color: "#1a237e", marginBottom: 16 }}>ข้อมูลเพิ่มเติม</h3>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={`http://localhost:4000/uploads/${popupFile}`}
                alt={popupFile}
                style={{
                  width: "100%",
                  maxWidth: 320,
                  maxHeight: 320,
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 1px 4px rgba(30,41,59,0.10)"
                }}
              />
            </div>
            <div style={{ color: "#334155", fontSize: 16 }}>
              <div><b>ชื่อไฟล์:</b> {popupFile}</div>
              <div><b>ชื่อผู้ส่ง:</b> {fileMeta[popupFile]?.sender || "-"}</div>
              <div><b>ประเภทอัปโหลด:</b> {fileMeta[popupFile]?.type || "-"}</div>
              {/* เพิ่มข้อมูลอื่น ๆ ได้ตามต้องการ */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checklist;
