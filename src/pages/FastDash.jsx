import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from 'react-game-engine';

let X = 0;
let Y = 0;
let move = 0;

const Box = (props) => {
  const { size, body, backgroundColor } = props;
  return (
    <div style={{
      position: 'absolute',
      left: body[0],
      top: body[1],
      width: size[0],
      height: size[1],
      backgroundColor: backgroundColor || 'white',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      boxShadow: `0 0 6px ${backgroundColor || 'white'}`,
      imageRendering: 'pixelated',
      mixBlendMode: 'normal',
      transition: 'transform 0.1s',
    }} />
  );
};

const RedArea = (props) => {
  const { radius, body } = props;
  return (
    <div style={{
      position: 'absolute',
      left: body[0],
      top: body[1],
      width: radius,
      height: radius,
      backgroundColor: "rgba(255, 0, 0, 0.15)",
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      imageRendering: 'pixelated',
      mixBlendMode: 'normal',
      transition: 'transform 0.1s',
      borderRadius: "50%",
      boxShadow: "0 0 10px rgba(255, 0, 0, 0.15)",
    }}>
      <div style={{
        position: 'absolute',
        left: '42%',
        top: '42%',
        width: radius / 5,
        height: radius / 5,
        backgroundColor: "rgba(255, 0, 0, 0.6)",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        mixBlendMode: 'normal',
        transition: 'transform 0.1s',
        borderRadius: "50%",
        boxShadow: "0 0 10px rgba(255, 0, 0, 0.6)",
      }} />
    </div>
  );
};

const TemplateFunction = (entities, { input }) => {
entities.player.body[1] = Y
entities.player.body[0] = X;
  return entities;
};

export default function FastDash() {
  // Alterado: Agora esta ref vai apontar para o elemento HTML real (div container)
  const containerRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

  const initialEntities = {
    danger_: {
      body:[20,20],
      radius: 120,
      renderer: <RedArea />
    },
    player: {
      body:[20,20],
      size:[20,20],
      backgroundColor: 'white',
      renderer: <Box />
    }
  };

 const handleMouseDown = (e, entities) => {
  if (containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calcula a posição exata do mouse RELATIVA à tela do jogo
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    X = e.clientX - 220;
    Y = e.clientY - 77;

    return entities
  }
};


  return (
    <div className={isShaking ? "screen-shake" : ""} style={{ display: "inline-block" }}>
      {/* 
        A ref foi movida para esta div wrapper. Ela possui o mesmo tamanho exato do jogo, 
        garantindo que o rect retorne os valores corretos da tela do GameEngine.
      */}
      <div 
        ref={containerRef} 
        onMouseDown={handleMouseDown}
        style={{ width: 400, height: 400,cursor: "crosshair" }}
      >
        <GameEngine
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#222",
            position: "relative",
            overflow: "hidden",
          }}
          systems={[TemplateFunction]}
          entities={initialEntities}
        />
      </div>
    </div>
  );
}
