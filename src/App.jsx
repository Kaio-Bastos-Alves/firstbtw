import "regenerator-runtime/runtime";
import React, { useEffect } from "react";
import { GameEngine } from "react-game-engine";

// 1. Componente visual da caixinha
const Box = (props) => {
  const { size, body } = props;
  return (
    <div
      style={{
        position: "absolute",
        left: body[0],
        top: body[1],
        width: size[0],
        height: size[1],
        backgroundColor: "red",
      }}
    />
  );
};

// 2. Nosso sistema de movimento (agora atualiza baseado em uma variável global ou referência)
// Vamos simplificar controlando a posição direto na entidade.
const MoveBox = (entities, { time }) => {
  // O sistema roda a 60fps, aqui podemos colocar lógicas contínuas se quisermos
  return entities;
};

export default function App() {
  // Criamos uma referência para a posição da caixa para podermos mexer via teclado fora do engine
  const entities = {
    box: { body: [50, 50], size: [60, 40], renderer: <Box /> },
  };

  // Usamos o useEffect para escutar o teclado na janela inteira do navegador
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log(entities.box); // Vai aparecer sempre no console agora!

      if (e.key === "ArrowRight") {
        entities.box.body[0] += 15;
      } else if (e.key === "ArrowLeft") {
        entities.box.body[0] -= 15;
      } else if(e.key === "ArrowDown"){
        entities.box.body[1] -= 15;
      } else if(e.key === "ArrowUp"){
        entities.box.body[1] += 15;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Limpa o evento quando o componentemorrer
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Meu Primeiro Jogo em React</h1>
      
      <GameEngine
        style={{
          width: 400,
          height: 400,
          backgroundColor: "#222",
          position: "relative",
          margin: "0 auto",
          overflow: "hidden",
        }}
        systems={[MoveBox]}
        entities={entities}
      />
    </div>
  );
}