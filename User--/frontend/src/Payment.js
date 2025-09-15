import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Payment.css";
import promptpayLogo from "./data-icon/promptpay-logo.png";
import paymentLogo from "./data-icon/payment-logo.jpg";
import { incrementQueueNumber } from "./utils";
import SlipUpload from "./SlipUpload";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const uploadId = queryParams.get("uploadId"); // เพิ่มดึง uploadId
  const type = queryParams.get("type");
  const time = queryParams.get("time");
  const price = queryParams.get("price");

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    console.log("[Payment] handleConfirmPayment");
    setIsProcessing(true);
    setErrorMessage("");
    try {
      const pendingUploadId = localStorage.getItem("pendingUploadId");
      const CONFIRM_URL = "http://localhost:5001/api/confirm-payment"; // ตรวจให้ตรงพอร์ต backend

      if (pendingUploadId || uploadId) {
        const response = await fetch(CONFIRM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId: pendingUploadId || uploadId })
        });
        if (!response.ok) {
          throw new Error("confirm failed");
        }
      }

      // อัพเดตคิว
      const q = incrementQueueNumber();
      localStorage.setItem(
        "order",
        JSON.stringify({
          uploadId: uploadId || pendingUploadId || null,
          type,
          time,
          price,
          queueNumber: q,
          paidAt: new Date().toISOString()
        })
      );

      // เคลียร์ draft
      localStorage.removeItem("pendingUploadId");
      localStorage.removeItem("uploadFormDraft");
      localStorage.removeItem("uploadFormImage");

      // ปิด popup แล้วกลับทันที
      setShowPopup(false);
      navigate("/"); // กลับหน้าหลักทันที
    } catch (e) {
      console.error(e);
      setErrorMessage("❌ ยืนยันการชำระเงินล้มเหลว");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSelection = (method) => {
    if (!method) return;
    setPaymentMethod(method);
    setShowPopup(true);
    setErrorMessage("");
  };

  const closePopup = () => {
    if (isProcessing) return;
    setShowPopup(false);
  };

  return (
    <div className="payment-container">
      {/* ...existing UI (คงเดิม) ... */}
      {/* ปุ่มเลือกวิธีชำระ */}
      {/* ... */}
      {showPopup && paymentMethod === "promptpay" && (
        <div className="modal-overlay" onClick={closePopup}>
          <div
            className="modal-content payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>ชำระเงินผ่าน PromptPay</h3>
              <button className="close-button" onClick={closePopup} disabled={isProcessing}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="qr-section">
                <img src={paymentLogo} alt="QR Code" className="qr-code" />
                <div className="amount-display">
                  <span className="amount-label">ยอดชำระ</span>
                  <span className="amount-value">฿{price}</span>
                </div>
              </div>
              <div className="payment-steps">
                <h4>ขั้นตอนการชำระเงิน</h4>
                <ol>
                  <li>สแกน QR</li>
                  <li>โอนเงิน</li>
                  <li>อัปโหลดสลิป</li>
                </ol>
              </div>
              <SlipUpload
                price={price}
                disabled={isProcessing}
                onSuccess={() => {
                  console.log("[Payment] SlipUpload onSuccess");
                  handleConfirmPayment();
                }}
              />
              {errorMessage && (
                <div style={{ marginTop: 12, color: "#d00", fontWeight: 600 }}>
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;

// ลบ 2 บรรทัดล้าง localStorage ที่เคยอยู่นอก component ออก (อย่าใส่ไว้ข้างล่าง)
// localStorage.removeItem("uploadFormDraft");
// localStorage.removeItem("uploadFormImage");