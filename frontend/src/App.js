import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register"; // นำเข้า Register
import Home from "./home"; // นำเข้า Home
import ProfileSetup from "./ProfileSetup"; // นำเข้า ProfileSetup
import Report from "./AdminReport"; // นำเข้า Report
import AdminStatSlip from "./Stat-slip"; // ชื่อ component ต้องตรงกับที่ export
import Checklist from "./checklist";
import ImageQueue from "./ImageQueue";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} /> {/* หน้าแรกสุด */}
        <Route path="/home" element={<Home />} /> {/* หน้า Home */}
        <Route path="/report" element={<Report />} /> {/* หน้า Report */}
        <Route path="/profile-setup" element={<ProfileSetup />} /> {/* เส้นทางใหม่ */}
        <Route path="/stat-slip" element={<AdminStatSlip />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/image-queue" element={<ImageQueue />} />
      </Routes>
    </Router>
  );
}

export default App;
