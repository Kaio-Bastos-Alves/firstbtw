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
        backgroundColor: body.backgroundColor || "white",
      }}
    />
  );
};

let bulletId = 0;

// 2. Nosso sistema de movimento (agora atualiza baseado em uma variável global ou referência)
// Vamos simplificar controlando a posição direto na entidade.
const MoveBox = (entities, { input }) => {
  const Colors = ["blue","black","red","purple","white"]
  entities.box.body.backgroundColor = Colors[Math.floor(Math.random() * Colors.length)];
   // up = u; down = d; left = l; right = r;
 const { payload } = input.find(x => x.name === "onKeyDown") || { payload: {} };
  
  // Movimentação do Box
  if (payload.key === "ArrowRight") {entities.box.body[0] += 15;entities.box.body.direction = "r";}
  if (payload.key === "ArrowLeft")  {entities.box.body[0] -= 15;entities.box.body.direction = "l";}
  if (payload.key === "ArrowDown")  {entities.box.body[1] += 15;entities.box.body.direction = "d";}
  if (payload.key === "ArrowUp")    {entities.box.body[1] -= 15; entities.box.body.direction = "u";}

  // Limites da tela para o Box
  if (entities.box.body[0] >= 360) entities.box.body[0] = 360;
  if (entities.box.body[0] <= 0)   entities.box.body[0] = 0;
  if (entities.box.body[1] >= 360) entities.box.body[1] = 360;
  if (entities.box.body[1] <= 0)   entities.box.body[1] = 0;

  // DISPARAR: Se apertar Espaço, criamos uma bala nova
  if (payload.key === " ") {
    bulletId++;
    const newBulletKey = `bullet_${bulletId}`;
    console.log(entities.box.body.direction)
    // Inicia a bala exatamente no centro/frente do jogador
    entities[newBulletKey] = {
      body: [entities.box.body[0] + 40, entities.box.body[1] + 15], // x (frente), y (meio)
      direction: entities.box.body.direction,
      size:[10,10], // Bala menorzinha
      renderer: <Box />,
    };
  }

  return entities;
};

const MoveBullet = (entities) => {
  // Procura por todas as entidades que começam com "bullet_"
  Object.keys(entities).forEach((key) => {
    if (key.startsWith("bullet_")) {
      // Move a bala para a direita
      entities[key].body[0] += 8;
      //console.log(entities[key].direction)

      // DESTRUIÇÃO: Se a bala passar do limite da tela (400px), deleta do jogo
      if (entities[key].body[0] > 400 || entities[key].body[0] < 1) {
        delete entities[key]; 
      }
    }
  });

  return entities;
};

export default function App() {
  // Criamos uma referência para a posição da caixa para podermos mexer via teclado fora do engine
  const entities = {
    box: { body: [50, 50], size: [40, 40], renderer: <Box /> },
    bullet: { body: [20, 20], size: [20, 20], renderer: <Box /> },
  };
  const initialEntities = {
    box: { body:[50,50], size:[40,40], renderer: <Box /> },
  };

  // Usamos o useEffect para escutar o teclado na janela inteira do navegador
  useEffect(() => {
    const handleKeyDown = (e) => {

      if (e.key === "ArrowRight") {
        entities.box.body[0] += 15;
      } else if (e.key === "ArrowLeft") {
        entities.box.body[0] -= 15;
      } else if(e.key === "ArrowDown"){
        entities.box.body[1] += 15;
      } else if(e.key === "ArrowUp"){
        entities.box.body[1] -= 15;
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
        systems={[MoveBox, MoveBullet]}
        entities={initialEntities}
      />
    </div>
  );
}