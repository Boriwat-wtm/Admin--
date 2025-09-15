import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ImageQueue.css";

function ImageQueue() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // สำหรับ Preview และ Queue System
  const [currentPreview, setCurrentPreview] = useState(null);
  const [previewQueue, setPreviewQueue] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseTimeLeft, setPauseTimeLeft] = useState(0);

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, 5000);
    return () => clearInterval(interval);
  }, []);

  // เมื่อเริ่มแสดงรูปใหม่ (ใน processNextInQueue หรือ handleApprove)
  const startPreview = (image) => {
    const now = Date.now();
    setCurrentPreview(image);
    setTimeLeft(image.time * 60);
    setIsActive(true);
    localStorage.setItem("currentPreview", JSON.stringify(image));
    localStorage.setItem("startTimestamp", now);
    localStorage.setItem("duration", image.time * 60);
    localStorage.setItem("isActive", true);
  };

  // Timer effect สำหรับ countdown
  useEffect(() => {
    let interval = null;
    if (isActive && currentPreview) {
      interval = setInterval(() => {
        const startTimestamp = Number(localStorage.getItem("startTimestamp"));
        const duration = Number(localStorage.getItem("duration"));
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestamp) / 1000);
        const left = duration - elapsed;
        setTimeLeft(left > 0 ? left : 0);
        if (left <= 0) {
          setIsActive(false);
          setCurrentPreview(null);
          localStorage.removeItem("currentPreview");
          localStorage.removeItem("startTimestamp");
          localStorage.removeItem("duration");
          localStorage.removeItem("isActive");
          if (previewQueue.length > 0) {
            setIsPaused(true);
            setPauseTimeLeft(15);
          } else {
            fetchImages();
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentPreview, previewQueue.length]);

  const fetchImages = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/queue");
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/approve/${id}`, {
        method: "POST",
      });
      if (response.ok) {
        const imageToApprove = selectedImage;
        if (!currentPreview) {
          startPreview(imageToApprove);
        } else {
          setPreviewQueue(prev => [...prev, imageToApprove]);
        }
        setShowModal(false);
        fetchImages();
      }
    } catch (error) {
      console.error("Error approving image:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reject/${id}`, {
        method: "POST",
      });
      if (response.ok) {
        fetchImages();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error rejecting image:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // เพิ่ม useEffect สำหรับ restore state
  useEffect(() => {
    const savedPreview = localStorage.getItem("currentPreview");
    const savedIsActive = localStorage.getItem("isActive");
    const startTimestamp = Number(localStorage.getItem("startTimestamp"));
    const duration = Number(localStorage.getItem("duration"));
    if (savedPreview && savedIsActive === "true" && startTimestamp && duration) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimestamp) / 1000);
      const left = duration - elapsed;
      if (left > 0) {
        setCurrentPreview(JSON.parse(savedPreview));
        setTimeLeft(left);
        setIsActive(true);
      } else {
        setCurrentPreview(null);
        setIsActive(false);
        localStorage.removeItem("currentPreview");
        localStorage.removeItem("startTimestamp");
        localStorage.removeItem("duration");
        localStorage.removeItem("isActive");
      }
    }
  }, []);

  // ทุกครั้งที่ state เปลี่ยน ให้ sync ลง localStorage
  useEffect(() => {
    if (currentPreview && isActive) {
      localStorage.setItem("currentPreview", JSON.stringify(currentPreview));
      localStorage.setItem("timeLeft", timeLeft);
      localStorage.setItem("isActive", isActive);
      localStorage.setItem("isPaused", isPaused);
      localStorage.setItem("pauseTimeLeft", pauseTimeLeft);
    } else {
      // ถ้าไม่มี preview แล้ว ให้ลบออก
      localStorage.removeItem("currentPreview");
      localStorage.removeItem("timeLeft");
      localStorage.removeItem("isActive");
      localStorage.removeItem("isPaused");
      localStorage.removeItem("pauseTimeLeft");
    }
  }, [currentPreview, timeLeft, isActive, isPaused, pauseTimeLeft]);

  function renderSocialOnImage(socialType, socialName) {
    switch (socialType) {
      case "ig":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" fill="#E1306C"/>
              <circle cx="12" cy="12" r="5" fill="#fff"/>
              <circle cx="18" cy="6" r="1.5" fill="#fff"/>
            </svg>
            {socialName}
          </span>
        );
      case "fb":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F3">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {socialName}
          </span>
        );
      case "line":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#06C755">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="Arial">LINE</text>
            </svg>
            {socialName}
          </span>
        );
      case "tiktok":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
              <path d="M9.5 3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5a5.5 5.5 0 0 0 5.5 5.5h1.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.5A5.5 5.5 0 0 0 14.5 19.5V21a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1.5A5.5 5.5 0 0 0 3 14.5V13a1 1 0 0 1 1-1h1.5A5.5 5.5 0 0 0 9.5 4.5V3z"/>
            </svg>
            {socialName}
          </span>
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="queue-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-container">
      <header className="queue-header">
        <Link to="/home" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          กลับ
        </Link>
        <h1>ตรวจสอบรูปภาพ</h1>
        <div className="queue-stats">
          <span className="queue-count">{images.length}</span>
          <button onClick={fetchImages} className="refresh-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="main-layout">
        {/* ฝั่งซ้าย - Queue (70%) */}
        <div className="queue-section">
          <div className="queue-content">
            {images.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>ไม่มีรูปภาพส่งมา</p>
              </div>
            ) : (
              <div className="images-grid">
                {images.map((image, index) => (
                  <div key={image.id} className="image-card" onClick={() => handleImageClick(image)}>
                    <div className="card-header">
                      <span className="queue-number">#{index + 1}</span>
                      <span className="sender">{image.sender}</span>
                    </div>
                    <div className="image-preview-container" style={{ position: "relative" }}>
                      {image.filePath ? (
                        <>
                          <img
                            src={`http://localhost:5001${image.filePath}`}
                            alt="Preview"
                            className="preview-image"
                          />
                          {(!image.composed && image.socialType && image.socialName) && (
                            <div className="preview-social-overlay">
                              {renderSocialOnImage(image.socialType, image.socialName)}
                            </div>
                          )}
                          {(!image.composed && image.text) && (
                            <div className="preview-text-overlay" style={{ color: image.textColor }}>
                              {image.text}
                            </div>
                          )}
                        </>
                      ) : (
                        // กรณีข้อความล้วนเหมือนเดิม
                        <div
                          className="text-only-card"
                          style={{
                            background: "linear-gradient(135deg,#233046 60%,#1e293b 100%)",
                            borderRadius: "18px",
                            minHeight: "120px",
                            minWidth: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            padding: "24px 0"
                          }}
                        >
                          {image.socialType && image.socialName && (
                            <div
                              style={{
                                marginBottom: "16px",
                                marginTop: "8px",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "24px",
                                maxWidth: "100%",
                                wordBreak: "break-all",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                            >
                              {renderSocialOnImage(image.socialType, image.socialName)}
                            </div>
                          )}
                          <div
                            style={{
                              color: image.textColor || "#fff",
                              fontWeight: "bold",
                              fontSize: "20px",
                              textShadow: image.textColor === "white"
                                ? "0 2px 8px rgba(0,0,0,0.8)"
                                : "0 2px 8px rgba(255,255,255,0.8)",
                              textAlign: "center",
                              wordBreak: "break-all"
                            }}
                          >
                            {image.text}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <div className="time-price">
                        <span className="time">{image.time}นาที</span>
                        <span className="price">฿{image.price}</span>
                      </div>
                      <div className="date">{formatDate(image.receivedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ฝั่งขวา - Preview (30%) */}
        <div className="preview-section">
          <div className="preview-panel">
            <h2>รูปภาพที่กำลังแสดง</h2>
            
            {currentPreview ? (
              <>
                <div className="preview-image-container" style={{ position: "relative" }}>
                  {currentPreview.filePath ? (
                    <img 
                      src={`http://localhost:5001${currentPreview.filePath}`} 
                      alt="Preview"
                      className="preview-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5No Image</text></svg>';
                      }}
                    />
                  ) : (
                    // กรณีไม่มีรูป (ฟังก์ชันส่งข้อความ)
                    <div
                      style={{
                        background: "linear-gradient(135deg,#233046 60%,#1e293b 100%)",
                        borderRadius: "18px",
                        minHeight: "120px",
                        minWidth: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        padding: "24px 0"
                      }}
                    >
                      {currentPreview.socialType && currentPreview.socialName && (
                        <div
                          style={{
                            marginBottom: "16px",
                            marginTop: "8px",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "24px",
                            maxWidth: "100%",
                            wordBreak: "break-all",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          {renderSocialOnImage(currentPreview.socialType, currentPreview.socialName)}
                        </div>
                      )}
                      <div
                        style={{
                          color: currentPreview.textColor || "#fff",
                          fontWeight: "bold",
                          fontSize: "20px",
                          textShadow: currentPreview.textColor === "white"
                            ? "0 2px 8px rgba(0,0,0,0.8)"
                            : "0 2px 8px rgba(255,255,255,0.8)",
                          textAlign: "center",
                          wordBreak: "break-all"
                        }}
                      >
                        {currentPreview.text}
                      </div>
                    </div>
                  )}
                </div>

                <div className="countdown-section">
                  <div className="countdown-label">
                    {isPaused ? "หน่วงเวลาระหว่างรูป:" : "เวลาที่เหลือ:"}
                  </div>
                  <div className={`countdown-timer ${(timeLeft <= 10 && !isPaused) || (pauseTimeLeft <= 5 && isPaused) ? 'warning' : ''}`}>
                    {isPaused ? formatTime(pauseTimeLeft) : formatTime(timeLeft)}
                  </div>
                  {timeLeft === 0 && !isPaused && (
                    <div className="time-up-message">หมดเวลาแล้ว!</div>
                  )}
                  {isPaused && (
                    <div className="pause-message">กำลังเปลี่ยนรูป...</div>
                  )}
                </div>

                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">คิว:</span>
                    <span className="info-value">กำลังแสดง</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">เวลาการแสดง:</span>
                    <span className="info-value">{currentPreview.time} นาที</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">แอปโมชั่น:</span>
                    <span className="info-value">ไม่มี</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">ข้อความ:</span>
                    <span className="info-value">{currentPreview.text || 'ไม่มี'}</span>
                  </div>
                </div>

                {!isPaused && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${((currentPreview.time * 60 - timeLeft) / (currentPreview.time * 60)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {Math.round(((currentPreview.time * 60 - timeLeft) / (currentPreview.time * 60)) * 100)}% เสร็จสิ้น
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-preview">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>ยังไม่มีรูปภาพที่อนุมัติ</p>
                <span>กดอนุมัติรูปภาพเพื่อแสดง Preview</span>
              </div>
            )}

            {/* แสดงคิวที่รออยู่ */}
            {previewQueue.length > 0 && (
              <div className="waiting-queue">
                <h3>คิวที่รออยู่ ({previewQueue.length})</h3>
                <div className="queue-list">
                  {previewQueue.map((queueImage, index) => (
                    <div key={`queue-${index}`} className="queue-item">
                      <div className="queue-item-number">#{index + 1}</div>
                      <div className="queue-item-image">
                        <img 
                          src={`http://localhost:5001${queueImage.filePath}`} 
                          alt="Queue preview"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjlmYWZiIi8+PC9zdmc+';
                          }}
                        />
                      </div>
                      <div className="queue-item-info">
                        <div className="queue-item-time">{queueImage.time}นาที</div>
                        <div className="queue-item-text">
                          {queueImage.text ? queueImage.text.slice(0, 15) + '...' : 'ไม่มีข้อความ'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal สำหรับดูรายละเอียด */}
      {showModal && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>รายละเอียด{selectedImage.filePath ? "รูปภาพ" : "ข้อความ"}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-image-container">
                {selectedImage.filePath ? (
                  <img 
                    src={`http://localhost:5001${selectedImage.filePath}`} 
                    alt="Full preview"
                    className="modal-image"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "400px", // ปรับตามขนาด modal ที่ต้องการ
                      objectFit: "contain",
                      borderRadius: "18px",
                      display: "block",
                      margin: "0 auto"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      background: "linear-gradient(135deg,#233046 60%,#1e293b 100%)",
                      borderRadius: "18px",
                      minHeight: "80px",
                      minWidth: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      padding: "24px 0"
                    }}
                  >
                    {selectedImage.socialType && selectedImage.socialName && (
                      <div
                        style={{
                          marginBottom: "16px",
                          marginTop: "8px",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "24px",
                          maxWidth: "100%",
                          wordBreak: "break-all",
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                      >
                        {renderSocialOnImage(selectedImage.socialType, selectedImage.socialName)}
                      </div>
                    )}
                    <div
                      style={{
                        color: selectedImage.textColor || "#fff",
                        fontWeight: "bold",
                        fontSize: "20px",
                        textShadow: selectedImage.textColor === "white"
                          ? "0 2px 8px rgba(0,0,0,0.8)"
                          : "0 2px 8px rgba(255,255,255,0.8)",
                        textAlign: "center",
                        wordBreak: "break-all"
                      }}
                    >
                      {selectedImage.text}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-details">
                <div className="detail-row">
                  <span className="label">ผู้ส่ง:</span>
                  <span className="value">{selectedImage.sender}</span>
                </div>
                <div className="detail-row">
                  <span className="label">เวลาที่เลือก:</span>
                  <span className="value">{selectedImage.time} นาที</span>
                </div>
                <div className="detail-row">
                  <span className="label">ราคา:</span>
                  <span className="value">฿{selectedImage.price}</span>
                </div>
                <div className="detail-row">
                  <span className="label">ส่งเมื่อ:</span>
                  <span className="value">{formatDate(selectedImage.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="approve-button"
                onClick={() => handleApprove(selectedImage.id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                อนุมัติ
              </button>
              <button 
                className="reject-button"
                onClick={() => handleReject(selectedImage.id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageQueue;