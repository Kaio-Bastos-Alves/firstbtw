import "regenerator-runtime/runtime";
import React, { useEffect, useState } from "react";
import { GameEngine } from "react-game-engine";
import HeartIcon from '../assets/heart.png'
import Player from '../assets/Seta.png'
import Bullet from '../assets/bullet.png'
import "./css/RightSide.css";

let bulletId = 0;
let particleId = 0;

// 1. Componente visual da caixinha
const Box = (props) => {
  const { size, body, backgroundColor, backgroundImage,round } = props;
  return (
    <div
      style={{
        position: "absolute",
        left: body[0],
        top: body[1],
        width: size[0],
        height: size[1],

        backgroundColor: backgroundImage ? 'transparent' : backgroundColor || "white",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        borderRadius: round ? "50%" : '0%',
        boxShadow: `0 0 6px ${backgroundColor}`,
        // ====== 3 PROPRIEDADES QUE CORRIGEM O PNG =======
        imageRendering: "pixelated", // CORREÇÃO PARA PIXEL ART: Mantém as bordas nítidas sem borrar
        mixBlendMode: "normal", // Garante que o canal alfa (transparência) renderize corretamente
        // ===============================================

        transform: `rotate(${body.angle}deg)`,
        transition: 'transform 0.1s'
      }}
    />
  );
};

// 2. Componente visual para a vida do personagem
const GameText = (props) => {
  const { value, color, x, y } = props;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: "1px" }}>
      {/* Ícone do coração */}
      <img
        src={HeartIcon}
        alt="Coração"
        style={{ width: "40px", height: "40px", imageRendering: "pixelated" }}
      />
      <span style={{
        color: color || "white",
        fontSize: "30px",
        fontWeight: "bold",
        // Modificado para garantir fallbacks retro caso o navegador demore 1ms a mais para montar
        fontFamily: '"Press Start 2P", system-ui',
        imageRendering: "pixelated",
        fontSmooth: "never",
        WebkitFontSmoothing: "none"
      }}>
        {value}
      </span>
    </div>
  );
};

// 3. Componente visual para textos
const PointsText = (props) => {
  const { value, color, x, y, size } = props;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: "1px" }}>
      <span style={{
        color: color || "white",
        fontSize: size ? size : "20px",
        fontWeight: "bold",
        // Modificado para garantir fallbacks retro caso o navegador demore 1ms a mais para montar
        fontFamily: '"Press Start 2P", system-ui',
        imageRendering: "pixelated",
        fontSmooth: "never",
        WebkitFontSmoothing: "none"
      }}>
        {value}
      </span>
    </div>
  );
};

const MoveBox = (entities, { input }) => {
  entities.box.backgroundColor = 'transparent';
  entities.box.backgroundImage = Player
  entities.global.cooldown++
  // up = u; down = d; left = l; right = r;
  const { payload } = input.find(x => x.name === "onKeyDown") || { payload: {} };

  if (payload.key === "r") {
    entities.global.died = false;
    entities.global.paused = true;
    entities.healthText.value = 3;
    if (entities.Points.value > 0) {
      const novaPontuacao = entities.Points.value;

      if (novaPontuacao > 0) {
        // Adiciona a pontuação atual à lista existente
        let recordes = entities.global.pointsValues;
        recordes.push(novaPontuacao);

        // Ordena do maior para o menor e mantém apenas os 3 primeiros (Top 3)
        recordes.sort((a, b) => b - a);
        recordes = recordes.slice(0, 3);

        // Atualiza a global com os novos recordes ordenados
        entities.global.pointsValues = recordes;
      }
    }
    if (entities.global.updateScoreBoard) {
      entities.global.updateScoreBoard([...entities.global.pointsValues]);
    }

    entities.Points.value = 0;
  }

  if (payload.key === " " && entities.global.paused) {
    entities.global.paused = false;
  }

  if (payload.key === "Escape") entities.global.paused = !entities.global.paused

  if (entities.global.died || entities.global.paused) { return entities; }

  // Movimentação do Box
  if (payload.key === "ArrowRight") { entities.box.body.direction = "r"; entities.box.body.angle = 0; }
  else if (payload.key === "ArrowLeft") { entities.box.body.direction = "l"; entities.box.body.angle = 180; }
  else if (payload.key === "ArrowDown") { entities.box.body.direction = "d"; entities.box.body.angle = 90; }
  else if (payload.key === "ArrowUp") { entities.box.body.direction = "u"; entities.box.body.angle = -90; }

  // Limites da tela para o Box
  if (entities.box.body[0] >= 360) entities.box.body[0] = 360;
  if (entities.box.body[0] <= 0) entities.box.body[0] = 0;
  if (entities.box.body[1] >= 360) entities.box.body[1] = 360;
  if (entities.box.body[1] <= 0) entities.box.body[1] = 0;


  // DISPARAR: Se apertar Espaço e já ter passado 60 frames (1 seg) de cooldown, enfim, criamos uma bala nova
  if (payload.key === " " && entities.global.cooldown > 20) {

    bulletId++;
    entities.global.cooldown = 0
    const newBulletKey = `bullet_${bulletId}`;
    const bulletBody = [
      entities.box.body[0] + 15,
      entities.box.body[1] + 13,
      entities.box.body.direction
    ];
    if (bulletBody[2] == "u") {
      bulletBody.angle = 0
    }
    else if (bulletBody[2] == "d") {
      bulletBody.angle = -180
    }
    else if (bulletBody[2] == "r") {
      bulletBody.angle = 90
    }
    else if (bulletBody[2] == "l") {
      bulletBody.angle = -90
    }
    else {
      bulletBody[2] = "r"
      bulletBody.angle = 90
    }

    // Inicia a bala exatamente no centro/frente do jogador
    entities[newBulletKey] = {
      body: bulletBody, // x (frente), y (meio)
      size: [10, 10], // Bala menorzinha
      backgroundImage: Bullet,
      renderer: <Box />,
    };
  }

  return entities;
};

const MoveBullet = (entities) => {
  // Procura por todas as entidades que começam com "bullet_"
  if (entities.global.died || entities.global.paused) { return entities; }

  Object.keys(entities).forEach((key) => {
    if (key.startsWith("bullet_")) {
      // Move a bala para a direção recebida do 

      if (entities[key].body[2] == "r") entities[key].body[0] += 8;
      else if (entities[key].body[2] == "l") entities[key].body[0] -= 8;
      else if (entities[key].body[2] == "d") entities[key].body[1] += 8;
      else if (entities[key].body[2] == "u") entities[key].body[1] -= 8;
      else entities[key].body[0] += 8;

      // DESTRUIÇÃO: Se a bala passar do limite da tela (400px), deleta do jogo
      if (entities[key].body[0] > 400 || entities[key].body[0] < 1 || entities[key].body[1] > 400 || entities[key].body[1] < 10) {
        delete entities[key];
      }
    }
  });

  return entities;
};

const CheckCollisions = (entities) => {
  Object.keys(entities).forEach((bulletKey) => {
    if (bulletKey.startsWith("bullet_")) {
      const bullet = entities[bulletKey];
      const direction = bullet.body[2]; // Direção salva no índice 2 da bala
      let targetEnemyKey = null;

      // Filtra dinamicamente para testar a colisão apenas com o inimigo daquele respectivo lado
      if (direction === "u") targetEnemyKey = "mob";  // Bala para cima -> Inimigo vindo de cima (red)
      if (direction === "l") targetEnemyKey = "mob2"; // Bala para direita -> Inimigo vindo da esquerda (purple)
      if (direction === "d") targetEnemyKey = "mob3"; // Bala para baixo -> Inimigo vindo de baixo (blue)
      if (direction === "r") targetEnemyKey = "mob4"; // Bala para esquerda -> Inimigo vindo da direita (pink)

      const enemy = entities[targetEnemyKey];

      // A colisão só é processada se o inimigo alvo estiver ativo no mapa
      if (enemy && enemy.launch) {
        const bX = bullet.body[0];
        const bY = bullet.body[1];
        const bW = bullet.size[0];
        const bH = bullet.size[1];

        const eX = enemy.body[0];
        const eY = enemy.body[1];
        const eW = enemy.size[0];
        const eH = enemy.size[1];

        // Lógica matemática retangular AABB
        if (
          bX < eX + eW &&
          bX + bW > eX &&
          bY < eY + eH &&
          bY + bH > eY
        ) {
          GenerateParticles([eX, eY],
            entities[bulletKey].body[2] === "u" ? "#ff0c0c" :
              entities[bulletKey].body[2] === "d" ? "#0c10ff" :
                entities[bulletKey].body[2] === "l" ? "#a0fc0d" :
                  entities[bulletKey].body[2] === "r" ? "#ff0ceb" : '',
            2, 40, entities
          )

          delete entities[bulletKey]; // Destrói a entidade da bala
          enemy.launch = false;       // Torna falso o launch do mob afetado
          entities.Points.value++;


        }
      }
    }
  });

  return entities;
};

const LaunchEnemy = (entities) => {
  entities.global.time++;
  if (entities.global.died || entities.global.paused) { return entities; }

  // 1. Criamos dinamicamente o tempo alvo usando a dificuldade
  // Quanto maior o difficult (ex: 3), menor é o tempo base, acelerando o jogo
  const baseTime = 200 + Math.random() * 300;
  const tempoAlvo = baseTime - (entities.global.difficult * 50);

  if (entities.global.time > Math.max(50, tempoAlvo)) {
    entities.global.time = 0; // Reseta o cronômetro

    const Pos = [entities.mob, entities.mob2, entities.mob3, entities.mob4];
    const choosenOne = Pos[Math.floor(Math.random() * Pos.length)];

    // Opcional: só lança se o mob já não estiver ativo (evita sobrescrever um mob que já está a andar)
    if (!choosenOne.launch) {
      choosenOne.launch = true;
    }
  }

  return entities;
};

const SpawnMobs = (entities) => {

  //PRIMEIRO
  const mob = entities.mob;
  if (mob && mob.body) {
    if (mob.launch) mob.backgroundColor = "#ff0000";
    else mob.backgroundColor = "#381f1f"
    mob.body[0] = 189
  }

  //SEGUNDO
  const mob2 = entities.mob2;
  if (mob2 && mob2.body) {
    if (mob2.launch) mob2.backgroundColor = "#33ff00";
    else mob2.backgroundColor = "#35532e"
    mob2.body[1] = 169
  }

  //TERCEIRO
  const mob3 = entities.mob3;
  if (mob3 && mob3.body) {
    if (mob3.launch) mob3.backgroundColor = "#0008ff";
    else mob3.backgroundColor = "#1f2038";
    mob3.body[0] = 189
  }

  //QUARTO
  const mob4 = entities.mob4;
  if (mob4 && mob4.body) {
    if (mob4.launch) mob4.backgroundColor = "#dd00ff";
    else mob4.backgroundColor = "#564159"
    mob4.body[1] = 169
  }


  if (entities.global.died || entities.global.paused) { return entities }


  var value = 1.5
  if (entities.global.difficult == 1) { value = 1.2 }
  else if (entities.global.difficult == 2) { value = 1.6 }
  else if (entities.global.difficult == 3) { value = 2.1 }

  var sum = 0.4

  if (entities.global.difficult == 1) { sum = 0.4 }
  else if (entities.global.difficult == 2) { sum = 0.7 }
  else if (entities.global.difficult == 3) { sum = 1.0 }

  const LoseLife = () => {
    entities.healthText.value--;
    entities.global.triggerShake()
    GenerateParticles([40, 40], 'red', 2, 20, entities)

  }

  //PRIMEIRO
  if (mob.launch) {
    mob.body[1] += mob.vel || 1;
    mob.vel = Math.random() * value + sum;
    if (mob.body[1] > 145) {
      mob.launch = false;
      mob.body[1] = 0;
      mob.vel = Math.random() * value + sum;
      LoseLife()
    }
  }
  else {
    mob.body[1] = 0
  }

  //SEGUNDO
  if (mob2.launch) {
    mob2.body[0] += mob2.vel || 1;
    mob2.vel = Math.random() * value + sum;
    if (mob2.body[0] > 158) {
      mob2.launch = false;
      mob2.body[0] = 0;
      mob2.vel = Math.random() * value + sum;
      LoseLife()
    }
  } else {
    mob2.body[0] = 0
  }

  //TERCEIRO
  if (mob3.launch) {
    mob3.body[1] -= mob3.vel || 1;
    mob3.vel = Math.random() * value + sum;
    if (mob3.body[1] < 200) {
      mob3.launch = false;
      mob3.body[1] = 380;
      mob3.vel = Math.random() * value + sum;
      LoseLife()
    }
  } else {
    mob3.body[1] = 380
  }

  //QUARTO
  if (mob4.launch) {
    mob4.body[0] -= mob4.vel || 1;
    mob4.vel = Math.random() * value + sum;
    if (mob4.body[0] < 220) {
      mob4.body[0] = 380;
      mob4.vel = Math.random() * value + sum;
      mob4.launch = false;
      LoseLife()
    }
  }
  else {
    mob4.body[0] = 380
  }

  if (entities.healthText.value <= 0) {
    entities.global.died = true;
    entities.PausedText.value = "DIED"
  }

  return entities;
};

const Paused = (entities) => {
  if (entities.global.died) {
    entities.boxShadow.backgroundColor = "rgba(14, 13, 13, 0.5)"
    entities.PausedText.color = "#ffffff"
    entities.PausedText.value = "DIED"
    entities.deadText.color = "#ffffff"
    entities.PausedText.x = 130
    return entities
  }
  else if (entities.global.paused) {
    entities.boxShadow.backgroundColor = "rgba(14, 13, 13, 0.5)"
    entities.PausedText.color = "#ffffff"
    entities.PausedText.x = 90
    entities.PausedText.value = "PAUSED"
    entities.deadText.color = "rgba(0,0,0,0)"
    return entities
  }
  else {
    entities.boxShadow.backgroundColor = "rgba(14, 13, 13, 0.0)"
    entities.PausedText.color = "#ffffff00"
    return entities;
  }
}

const GenerateParticles = (body, color, size, hmtimes, entities) => {
  for (let i = 0; i < hmtimes; i++) {
    particleId++;
    const pKey = `particle_${particleId}`;
    let velX = (Math.random() - 0.5) * 6;
    let velY = (Math.random() - 0.5) * 6;
    // Sorteia direções espalhadas (para cima, baixo, esquerda, direita)
    let life = (0.4 + Math.random()) * 40

    entities[pKey] = {
      body: [body[0], body[1], velX, velY], // X, Y, VelocidadeX, VelocidadeY
      size: [size, size],              // Partícula bem pequenininha
      backgroundColor: color,
      life: life,
      renderer: <Box />,
      maxLife: life,
      round: true,
    };
  }
  return
}


const UpdateParticles = (entities) => {
  Object.keys(entities).forEach((key) => {
    if (key.startsWith("particle_")) {

      if (entities.global.died || entities.global.paused) { delete entities[key]; return entities }
      let p = entities[key];
      p.body[0] += p.body[2]; // soma velX
      p.body[1] += p.body[3]; // soma velY

      p.life--;
      console.log(p)
      let pcent = (p.life / p.maxLife) + (Math.random() / 3)
      let newSize = p.size[0] * pcent
      p.size = [newSize, newSize]
      if (p.life <= 0) {
        delete entities[key];
      }
    }
  });
  return entities;
};

export default function RightSide() {
  const [isShaking, setIsShaking] = useState(false);
  const [difficult, setDifficult] = useState(3);
  const [record, setRecord] = useState([0, 0, 0])
  const entities = {
    box: { body: [200, 200], size: [40, 40], renderer: <Box /> },
    bullet: { body: [20, 20], size: [10, 10], renderer: <Box /> },
    mob: { body: [180, 200], size: [20, 20], launch: false, renderer: <Box /> },
    mob2: { body: [180, 200], size: [20, 20], launch: false, renderer: <Box /> },
    mob3: { body: [180, 200], size: [20, 20], launch: false, renderer: <Box /> },
    mob4: { body: [180, 200], size: [20, 20], launch: false, renderer: <Box /> },
  };
  const initialEntities = {
    box: { body: [180, 160], size: [40, 40], renderer: <Box /> },
    mob: { body: [189, 0], size: [20, 20], launch: false, renderer: <Box /> },
    mob2: { body: [0, 169], size: [20, 20], launch: false, renderer: <Box /> },
    mob3: { body: [189, 380], size: [20, 20], launch: false, renderer: <Box /> },
    mob4: { body: [380, 0], size: [20, 20], launch: false, renderer: <Box /> },
    global: {
      time: 0, cooldown: 0, index: 1, difficult: difficult, died: false, paused: true,
      triggerShake: () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 300); },
      updateScoreBoard: (props) => { setRecord(props) },
      pointsValues: [],
    },
    healthText: { value: 3, color: "#ff0000", x: 20, y: 20, renderer: <GameText /> },
    Points: { value: 0, color: "#ffffff", x: 320, y: 20, renderer: <PointsText /> },
    boxShadow: { body: [0, 0], size: [400, 400], backgroundColor: "transparent", renderer: <Box /> },
    PausedText: { value: "PAUSED", color: "#ffffff00", x: 130, y: 170, size: 40, renderer: <PointsText /> },
    deadText: { value: "Press R to restart.", color: "#ffffff", x: 120, y: 220, size: 10, renderer: <PointsText /> },

  };
  // Usamos o useEffect para escutar o teclado na janela inteira do navegador
  useEffect(() => {
    const handleKeyDown = () => {
    };

    window.addEventListener("keydown", handleKeyDown);

    // Limpa o evento quando o componentemorrer
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "10px" }}>

      {/* Contendedor geral para alinhar o jogo e o pódio lado a lado */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "20px" }}>

        {/* Jogo */}
        <div className={isShaking ? "screen-shake" : ""} style={{ display: "inline-block" }}>
          <GameEngine
            key={difficult}
            style={{
              width: 400,
              height: 400,
              backgroundColor: "#222",
              position: "relative",
              overflow: "hidden",
            }}
            systems={[MoveBox, MoveBullet, SpawnMobs, LaunchEnemy, CheckCollisions, Paused, UpdateParticles]}
            entities={initialEntities}
          />
        </div>

        {/* Placar Top 3 ao lado */}
        <div style={{
          backgroundColor: "#222",
          padding: "20px",
          borderRadius: "8px",
          color: "white",
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: "14px",
          textAlign: "left",
          minWidth: "150px"
        }}>
          <p style={{ margin: "0 0 15px 0", color: "#ffd700" }}>TOP 3</p>
          <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {record.map((score, index) => (
              <li key={index}>
                {index + 1}º - {score} pts
              </li>
            ))}
          </ul>
        </div>

      </div>
      <div className="Buttons">
        <button className="button-a" onClick={() => setDifficult(1)}>1</button>
        <button className="button-l" onClick={() => setDifficult(2)}>2</button>
        <button className="button-v" onClick={() => setDifficult(3)}>3</button>
      </div>
    </div>
  );
}