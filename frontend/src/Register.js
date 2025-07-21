import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // สถานะสำหรับแสดง/ซ่อนรหัสผ่าน
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("เข้าสู่ระบบสำเร็จ!");
        navigate("/home"); // เปลี่ยนไปยังหน้า Home
      } else {
        setErrorMessage(data.message || "Username หรือ Password ไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div className="register-container">
      <h1>Admin Login</h1>
      <div className="register-form">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="กรอก Username"
        />
        <label htmlFor="password">Password</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"} // เปลี่ยน type ตามสถานะ showPassword
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอก Password"
          />
          <span
            className="toggle-password-icon"
            onClick={() => setShowPassword(!showPassword)} // สลับสถานะ showPassword
          >
            {showPassword ? (
              <i className="fas fa-eye"></i> // ไอคอนตาโดนปกติ
            ) : (
              <i className="fas fa-eye-slash"></i> // ไอคอนตาขีด
            )}
          </span>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={handleLogin}>เข้าสู่ระบบ</button>
      </div>
    </div>
  );
}

export default Register;