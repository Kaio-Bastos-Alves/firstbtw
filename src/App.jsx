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
  const Colors = ["blue", "black", "red", "purple", "white"]
  entities.box.body.backgroundColor = Colors[Math.floor(Math.random() * Colors.length)];
  // up = u; down = d; left = l; right = r;
  const { payload } = input.find(x => x.name === "onKeyDown") || { payload: {} };

  // Movimentação do Box
  if (payload.key === "ArrowRight") { entities.box.body.direction = "r"; }
  if (payload.key === "ArrowLeft") { entities.box.body.direction = "l"; }
  if (payload.key === "ArrowDown") { entities.box.body.direction = "d"; }
  if (payload.key === "ArrowUp") { entities.box.body.direction = "u"; }

  // Limites da tela para o Box
  if (entities.box.body[0] >= 360) entities.box.body[0] = 360;
  if (entities.box.body[0] <= 0) entities.box.body[0] = 0;
  if (entities.box.body[1] >= 360) entities.box.body[1] = 360;
  if (entities.box.body[1] <= 0) entities.box.body[1] = 0;

  // DISPARAR: Se apertar Espaço, criamos uma bala nova
  if (payload.key === " ") {
    bulletId++;
    const newBulletKey = `bullet_${bulletId}`;
    console.log(entities.box.body.direction)
    // Inicia a bala exatamente no centro/frente do jogador
    entities[newBulletKey] = {
      body: [entities.box.body[0] + 15, entities.box.body[1] + 13, entities.box.body.direction], // x (frente), y (meio)
      size: [10, 10], // Bala menorzinha
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
      if (entities[key].body[2] == "r") entities[key].body[0] += 8;
      else if (entities[key].body[2] == "l") entities[key].body[0] -= 8;
      else if (entities[key].body[2] == "d") entities[key].body[1] += 8;
      else if (entities[key].body[2] == "u") entities[key].body[1] -= 8;

      // DESTRUIÇÃO: Se a bala passar do limite da tela (400px), deleta do jogo
      if (entities[key].body[0] > 400 || entities[key].body[0] < 1 || entities[key].body[1] > 400 || entities[key].body[1] < 10) {
        delete entities[key];
      }
    }
  });

  return entities;
};

const SpawnMobs = (entities) => {

  const mob = entities.mob;
  if (mob && mob.body) {
    mob.launch = false
    mob.body.backgroundColor = "red";
    mob.body[0] = 189
  }

  const mob2 = entities.mob2;
  if (mob2 && mob2.body) {
    mob2.launch = false
    mob2.body.backgroundColor = "purple";
    mob2.body[1] = 169
  }

  const mob3 = entities.mob3;
  if (mob3 && mob3.body) {
    mob3.launch = false
    mob3.body.backgroundColor = "blue";
    mob3.body[0] = 189
  }
  const mob4 = entities.mob4;
  if (mob4 && mob4.body) {
    mob4.launch = false
    mob4.body.backgroundColor = "pink";
    mob4.body[1] = 169
  }
  const value = 1.2
  const sum = 0.2

  if (mob.launch) {
    mob.body[1] += mob.vel || 1;
    if (mob.body[1] > 145) { mob.body[1] = 0; mob.vel = Math.random() * value + sum }
  }
  else {
    mob.body[1] = 0
  }

  if (mob2.launch) {
    mob2.body[0] += mob2.vel || 1;
    if (mob2.body[0] > 158) { mob2.body[0] = 0; mob2.vel = Math.random() * value + sum }
  } else {
    mob2.body[0] = 0
  }

  if (mob3.launch) {
    mob3.body[1] -= mob3.vel || 1;
    if (mob3.body[1] < 200) { mob3.body[1] = 380; mob3.vel = Math.random() * value + sum }
  } else {
    mob3.body[1] = 380
  }

  if (mob4.launch) {
    mob4.body[0] -= mob4.vel || 1;
    if (mob4.body[0] < 220) { mob4.body[0] = 380; mob4.vel = Math.random() * value + sum }
  }
  else {
    mob4.body[0] = 380
  }

  return entities;
};


export default function App() {
  // Criamos uma referência para a posição da caixa para podermos mexer via teclado fora do engine
  const entities = {
    box: { body: [200, 200], size: [40, 40], renderer: <Box /> },
    bullet: { body: [20, 20], size: [20, 20], renderer: <Box /> },
    mob: { body: [180, 200], size: [20, 20], renderer: <Box /> },
    mob2: { body: [180, 200], size: [20, 20], renderer: <Box /> },
    mob3: { body: [180, 200], size: [20, 20], renderer: <Box /> },
    mob4: { body: [180, 200], size: [20, 20], renderer: <Box /> }
  };
  const initialEntities = {
    box: { body: [180, 160], size: [40, 40], renderer: <Box /> },
    mob: { body: [189, 0], size: [20, 20], renderer: <Box /> },
    mob2: { body: [0, 169], size: [20, 20], renderer: <Box /> },
    mob3: { body: [189, 380], size: [20, 20], renderer: <Box /> },
    mob4: { body: [380, 0], size: [20, 20], renderer: <Box /> }
  };

  // Usamos o useEffect para escutar o teclado na janela inteira do navegador
  useEffect(() => {
    const handleKeyDown = (e) => {

      if (e.key === "ArrowRight") {
        entities.box.body[0] += 15;
      } else if (e.key === "ArrowLeft") {
        entities.box.body[0] -= 15;
      } else if (e.key === "ArrowDown") {
        entities.box.body[1] += 15;
      } else if (e.key === "ArrowUp") {
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
        systems={[MoveBox, MoveBullet, SpawnMobs]}
        entities={initialEntities}
      />
    </div>
  );
}