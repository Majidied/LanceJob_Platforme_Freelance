import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Userayout from "./pages/user";
import FreelancerLayout from "./pages/freelancer";

const App = () => {
  return (
    <Routes>
      <Route path="user/*" element={<Userayout />} />
      <Route path="/" element={<Navigate to="/user" replace />} />
      <Route path="freelancer/*" element={<FreelancerLayout />} />
    </Routes>
  );
};

export default App;
