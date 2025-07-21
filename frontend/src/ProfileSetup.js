import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

function ProfileSetup() {
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("JJ");
  const [status, setStatus] = useState("");
  const [birthDate, setBirthDate] = useState("2004-06-17");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file)); // แสดงตัวอย่างรูป
    }
  };

  const handleSubmit = () => {
    const profileData = {
      name,
      status,
      birthDate,
      gender,
      profileImage,
    };

    console.log("Profile Data:", profileData);
    alert("ข้อมูลส่วนตัวถูกบันทึกเรียบร้อย!");

    // เปลี่ยนหน้าไปยัง Home
    navigate("/home");
  };

  return (
    <div className="profile-setup-container">
      <h1>ตั้งค่าข้อมูลส่วนตัว</h1>
      <div className="profile-image">
        <label htmlFor="profileImage">
          <img
            src={profileImage || "https://via.placeholder.com/150"}
            alt="Profile"
          />
        </label>
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>
      <div className="form-group">
        <label>ชื่อ</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>สถานะ</label>
        <textarea
          placeholder="กรอกสถานะของคุณ..."
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>วันเกิด</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>เพศ</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">เลือกเพศ</option>
          <option value="male">ชาย</option>
          <option value="female">หญิง</option>
          <option value="other">อื่น ๆ</option>
        </select>
      </div>
      <button onClick={handleSubmit}>บันทึก</button>
    </div>
  );
}

export default ProfileSetup;