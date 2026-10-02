import "./App.css";
import RightSide from './pages/RightSide'
import TankLight from "./pages/TankLight";
import FastDash from "./pages/FastDash";

import Template from "./pages/Template";
import React, { useEffect, useState } from "react";

export default function App() {
  const [pager,SetPager] = useState('Fast Dash')
  const Pages = [
    {name: "Right Side",page: <RightSide/>},
    {name: "Tank Light v.2",page: <TankLight/>},
    {name: "Fast Dash", page: <FastDash/>},
    //{name: "Template", page: <Template/>},
  ]

  return (
    <div>
      <div className="header">
        <li>
          {Pages.map((page) => (
            <button className="header-btn" onClick={()=> SetPager(page.name)}>{page.name}</button>
        ))}
        </li>
      </div>  

      <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "10px" }}>
        {Pages.map((page) => (
          pager == page.name ? page.page : null
        ))}
      </div>
    </div>
  );
}