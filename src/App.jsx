import "./App.css";
import RightSide from './pages/RightSide';
import TankLight from "./pages/TankLight";
import FastDash from "./pages/FastDash";
import React, { useState } from "react";

import template from './assets/template.png'
import rightSideImg from './assets/rightisde.jpg'

export default function App() {
  const [pager, setPager] = useState('');

  const Pages = [
    { name: "Right Side", page: <RightSide />, image: rightSideImg, description: "Defenda as quatro direções de mobs implacáveis!", difficult: 3 },
    { name: "Tank Light v.2", page: <TankLight />, image: null, description: "Controle o tanque com mira precisa do mouse e destrua os inimigos.", difficult: 3 },
    { name: "Fast Dash", page: <FastDash />, image: null, description: "Teste suas habilidades com ganchos e muita velocidade.", difficult: 3 },
  ];

  // Encontra a página ativa atual
  const activePage = Pages.find((p) => p.name === pager);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111", color: "#fff", fontFamily: '"Press Start 2P", system-ui' }}>

      {pager !== '' && (
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
          <button
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            className="header-btn"
            onClick={() => setPager('')}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#3d0029", color: "#d402ca", padding: "8px 12px", borderStyle: "none", borderRadius: "10px",transition: "transform 0.2s" }}
          >
            <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      )}

      {/* CONTEÚDO DA PÁGINA */}
      <div style={{ textAlign: "center", padding: "0px" }}>
        {pager === '' ? (
          // TELA DE SELEÇÃO (CARDS)
          <div>
            <h1
              style={{ fontSize: "24px", marginBottom: "30px", color: "#d402ca", fontFamily: '"Press Start 2P", system-ui' }}

              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.color = "#ff00f2";
                e.currentTarget.className = "card-hover";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.color = "#7a0074";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.className = "";
              }}
            >MEUS JOGOS
            </h1>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
              {Pages.map((game) => (
                <div
                  key={game.name}
                  onClick={() => setPager(game.name)}
                  style={{
                    backgroundColor: "#222",
                    border: "2px solid #444",
                    borderRadius: "10px",
                    padding: "0px 00px 20px 00px",
                    width: "160px",
                    cursor: "pointer",
                    transition: "transform 0.2s, border-color 0.2s",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.borderColor = "#d402ca";
                    e.currentTarget.style.boxShadow = "0 0 5px #d402ca, 0 0 5px #d402ca, 0 0 10px #d402ca, 0 0 20px #d402ca";
                    e.currentTarget.className = "card-hover";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor = "#444";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.className = "";
                  }}
                >
                  <img src={game.image || template} className="card-image" />
                  <h2 className="card-title" >{game.name}</h2>
                  <p style={{ fontSize: "8px", color: "#aaa", lineHeight: "1.5", marginBottom: "15px" }}>{game.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // RENDERIZA O JOGO SELECIONADO
          activePage ? activePage.page : null
        )}
      </div>

    </div>
  );
}