import "./App.css";
import RightSide from './pages/RightSide'
import TankLight from "./pages/TankLight";
import React, { useEffect, useState } from "react";

export default function App() {
  const [page,SetPage] = useState('tank')

  return (
    <div>
      <div className="header">
        <li>
        <button className="header-btn" onClick={()=> SetPage('right')}>Right Side</button>
        <button className="header-btn" onClick={()=> SetPage('tank')}>Tank Light v.2</button>
        </li>
      </div>  

      <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "10px" }}>
        {page == "right" ? <RightSide/> : null}
        
        {page == "tank" ? <TankLight/> : null}

      </div>
    </div>
  );
}