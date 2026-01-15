import { useState } from 'react'
import { Routes, Route } from "react-router-dom"


import './App.css'

import Landing from "./pages/Landing.jsx";

export default function App() {
  return (
    
    <>
    <Routes>
      <Route path="/" element={<Landing />} />
     
    </Routes>
     
     
    </>
  );
}
