import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from 'react-game-engine';
import HeartIcon from '../assets/heart.png'

let X = 0;
let Y = 0;
let particleId = 0;
let dangerId = 0;
let healId = 0;

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

const Particle = (props) => {
  const { size, body, backgroundColor, backgroundImage, round } = props;
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
        // ====== 3 PROPRIEDADES QUE CORRIGEM O PNG =======
        imageRendering: "pixelated", // CORREÇÃO PARA PIXEL ART: Mantém as bordas nítidas sem borrar
        mixBlendMode: "normal", // Garante que o canal alfa (transparência) renderize corretamente
        // ===============================================

        boxShadow: `0 0 6px ${backgroundColor}`,
        borderRadius: round ? "50%" : '0%',
        transform: `rotate(${body.angle}deg)`,
        transition: 'transform 0.1s'
      }}
    />
  );
};

const RedArea = (props) => {
  const { radius, body, color } = props;
  return (
    <div style={{
      position: 'absolute',
      left: body[0],
      top: body[1],
      width: radius,
      height: radius,
      backgroundColor: color,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      imageRendering: 'pixelated',
      mixBlendMode: 'normal',
      transition: 'transform 0.1s',
      borderRadius: "50%",
      boxShadow: `0 0 10px ${color}`,
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

const GreenArea = (props) => {
  const { radius, body, color } = props;
  return (
    <div style={{
      position: 'absolute',
      left: body[0],
      top: body[1],
      width: radius,
      height: radius,
      backgroundColor: color,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      imageRendering: 'pixelated',
      mixBlendMode: 'normal',
      transition: 'transform 0.1s',
      borderRadius: "50%",
      boxShadow: `0 0 10px ${color}`,
    }}>
      <div style={{
        position: 'absolute',
        left: '42%',
        top: '42%',
        width: radius / 5,
        height: radius / 5,
        backgroundColor: "rgba(115, 255, 0, 0.6)",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        mixBlendMode: 'normal',
        transition: 'transform 0.1s',
        borderRadius: "50%",
        boxShadow: "0 0 10px rgba(115, 255, 0, 0.6)",
      }} />
    </div>
  );
};

const TextRenderer = (props) => {
  const { value, color, x, y, size } = props;

  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: "1px" }}>
      <span style={{
        color: color,
        fontSize: size ? size : "20px",
        fontWeight: "bold",
        fontFamily: '"Press Start 2P", system-ui',
        imageRendering: "pixelated",
        fontSmooth: "never",
        WebkitFontSmoothing: "none",
        userSelect: "none",
        WebkitUserSelect: "none", // Safari
        msUserSelect: "none",     // IE/Edge antigo
      }}>
        {Math.floor(value)}
      </span>
    </div>
  );
};

const LifeRenderer = (props) => {
  const { value, color, x, y } = props;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: "1px" }}>
      {/* Ícone do coração */}
      <img
        src={HeartIcon}
        alt="Coração"
        style={{
          width: "40px", height: "40px", imageRendering: "pixelated",
          userSelect: "none",
          WebkitUserSelect: "none", // Safari
          msUserSelect: "none",     // IE/Edge antigo
        }}
      />
      <span style={{
        color: color || "white",
        fontSize: "30px",
        fontWeight: "bold",
        // Modificado para garantir fallbacks retro caso o navegador demore 1ms a mais para montar
        fontFamily: '"Press Start 2P", system-ui',
        imageRendering: "pixelated",
        fontSmooth: "never",
        WebkitFontSmoothing: "none",
        userSelect: "none",
        WebkitUserSelect: "none", // Safari
        msUserSelect: "none",     // IE/Edge antigo
      }}>
        {value}
      </span>
    </div>
  );
};

const TemplateFunction = (entities, { input }) => {

  const multPcent = 10;
  const minDist = 2;

  const atualX = entities.player.body[0];
  const atualY = entities.player.body[1];
  const destinoX = X;
  const destinoY = Y;

  
  const { payload } = input.find(x => x.name === "onKeyDown") || { payload: {} };
  if (payload.key === "Escape") entities.global.paused = !entities.global.paused
  if(entities.global.paused || entities.global.died) return entities;
  const distY = destinoY - atualY;
  const distX = destinoX - atualX;

  const distanciaTotal = Math.sqrt(distX * distX + distY * distY);

  if (!entities.player.canHit) {
    entities.player.cool++;
    entities.player.backgroundColor = "#ffffff18"
    if (entities.player.cool > 180) {
      console.log("turned!")
      entities.player.backgroundColor = 'white'
      entities.player.canHit = true;
      entities.player.cool = 0;
    }
  }

  if (distanciaTotal > minDist) {
    let velX = (Math.random() - 0.5) * 0.7;
    let velY = (Math.random() - 0.5) * 0.7;
    GenerateParticles(
      [entities.player.body[0],     //posição inicial X
      entities.player.body[1]],     //posição inicial Y
      "#ffffff18",                //cor da particula
      entities.player.size[1] / 2,  //tamanho da particula
      1,                            // quantas serão geradas
      entities,                     //passando entities para a função
      velX,
      velY,
      false
    )

    entities.player.body[0] += distX * (multPcent / 100);
    entities.player.body[1] += distY * (multPcent / 100);
  } else {
    entities.player.body[0] = destinoX;
    entities.player.body[1] = destinoY;
  }
  return entities;
};

const DangerManager = (entities) => {
  const times = [40, 50]
  const player = entities.player;
  const chosenTime = entities.global.cooldown || 30;
  if(entities.global.paused || entities.global.died) return entities;

  entities.global.time++;

  if (entities.global.time > chosenTime) {
    entities.global.cooldown = times[Math.floor(Math.random() * times.length)]
    entities.global.time = 0;
    dangerId++;
    let dkey = `danger_${dangerId}`
    const lif = Math.random() * 100 + 120;
    let pos = [40 + Math.random() * 300, 40 + Math.random() * 300]
    const raio = 50 + Math.random() * 100
    if (Math.random() < 0.5) {
      pos = [entities.player.body[0] - raio / 2, entities.player.body[1] - raio / 2]
    }

    entities[dkey] = {
      renderer: RedArea,
      radius: raio,
      body: pos,
      life: lif,
      maxLife: lif,
      color: "rgba(255, 0, 0, 0.15)"
    }
  }
  Object.keys(entities).forEach((key) => {
    if (key.startsWith("danger_")) {
      let d = entities[key];

      // Atualiza a cor com base na vida atual
      let pcentLife = (d.life / d.maxLife) * 100;
      d.color = `rgba(255, 0, 0, ${getAlpha(pcentLife)})`;

      if (d.life <= 0) {
        // 1. Posições dos centros reais do jogador e do inimigo para colisão
        const playerCenterX = player.body[0] + player.size[0] / 2;
        const playerCenterY = player.body[1] + player.size[1] / 2;

        const dangerCenterX = d.body[0] + d.radius / 2;
        const dangerCenterY = d.body[1] + d.radius / 2;

        const disX = playerCenterX - dangerCenterX;
        const disY = playerCenterY - dangerCenterY;
        const distance = Math.sqrt(disX * disX + disY * disY);

        const playerRadius = player.size[0] / 2;
        const dangerRadius = d.radius / 2;

        // Checa colisão entre as duas circunferências no momento do estouro
        if (distance <= playerRadius + dangerRadius) {
          LoseLife(entities);
        }

        // 2. Geração de partículas centralizadas no meio do círculo de perigo
        GenerateParticles(
          [dangerCenterX, dangerCenterY], // Posição exata do centro da explosão
          "#ff0000",
          5,
          40,
          entities,
          0, // As velocidades individuais são calculadas dentro do GenerateParticles se aleatory=true
          0,
          true,
          15
        );

        entities.global.triggerExplo();
        delete entities[key]; // Deleta a entidade do perigo que explodiu
        return; // Avança para a próxima iteração do forEach
      }

      // 3. Aplica o dano contínuo apenas se o inimigo ainda estiver vivo
      d.life--;
    }
  });
  return entities;
}

const HealingManager = (entities) => {
  const times = [300, 500]
  const player = entities.player;
  const chosenTime2 = entities.global.healcooldown || 30;
  if(entities.global.paused || entities.global.died) return entities;

  if(entities.healthText.value <= 1)entities.global.healtime++;
  if (entities.global.healtime > chosenTime2) {
    entities.global.healcooldown = times[Math.floor(Math.random() * times.length)]
    entities.global.healtime = 0;
    healId++;
    let dkey = `heal_${healId}`
    const lif = Math.random() * 100 + 120;
    let pos = [40 + Math.random() * 300, 40 + Math.random() * 300]
    const raio = 50 + Math.random() * 50

    entities[dkey] = {
      renderer: GreenArea,
      radius: raio,
      body: pos,
      life: lif,
      maxLife: lif,
      color: "rgba(51, 255, 0, 0.15)"
    }
  }
  Object.keys(entities).forEach((key) => {
    if (key.startsWith("heal_")) {
      let d = entities[key];

      // Atualiza a cor com base na vida atual
      let pcentLife = (d.life / d.maxLife) * 100;
      d.color = `rgba(51, 255, 0, ${getAlpha(pcentLife)})`;

      if (d.life <= 0) {
        // 1. Posições dos centros reais do jogador e do inimigo para colisão
        const playerCenterX = player.body[0] + player.size[0] / 2;
        const playerCenterY = player.body[1] + player.size[1] / 2;

        const dangerCenterX = d.body[0] + d.radius / 2;
        const dangerCenterY = d.body[1] + d.radius / 2;

        const disX = playerCenterX - dangerCenterX;
        const disY = playerCenterY - dangerCenterY;
        const distance = Math.sqrt(disX * disX + disY * disY);

        const playerRadius = player.size[0] / 2;
        const dangerRadius = d.radius / 2;

        // Checa colisão entre as duas circunferências no momento do estouro
        if (distance <= playerRadius + dangerRadius) {
          entities.healthText.value++;
        }
        delete entities[key]; // Deleta a entidade do perigo que explodiu
        return; // Avança para a próxima iteração do forEach
      }

      // 3. Aplica o dano contínuo apenas se o inimigo ainda estiver vivo
      d.life--;
    }
  });
  return entities;
}

const LoseLife = (entities) => {
  const player = entities.player;
  const playerRadius = player.size[0] / 2;
  const velX = (Math.random() - 0.5) * 15;
  const velY = (Math.random() - 0.5) * 15;
  if (!player.canHit) { console.log("could?"); return entities }

  console.log("wha");
  player.canHit = false;
  entities.healthText.value--;
  entities.global.triggerShake();
  GenerateParticles(
    [player.body[0] + playerRadius, player.body[1] + playerRadius],
    "#ffffff",
    4,
    20,
    entities,
    velX,
    velY,
    true, 10
  );
  return entities
}

const GenerateParticles = (body, color, size, hmtimes, entities, velX, velY, aleatory, mult) => {
  for (let i = 0; i < hmtimes; i++) {
    particleId++;
    const pKey = `particle_${particleId}`;
    let life = 40
    if (aleatory) {
      velX = velX = (Math.random() - 0.5) * mult;
      velY = velY = (Math.random() - 0.5) * mult;
      life = 20 + Math.random() * 20
    }
    entities[pKey] = {
      body: [body[0], body[1], velX, velY],
      size: [size, size],
      backgroundColor: color,
      life: life,
      renderer: <Particle />,
      maxLife: life,
      round: true,
    };
  }
  return
}

const UpdateParticles = (entities) => {
  Object.keys(entities).forEach((key) => {
    if (key.startsWith("particle_")) {

      let p = entities[key];
      p.body[0] += p.body[2]; // soma velX
      p.body[1] += p.body[3]; // soma velY

      p.life--;
      let pcent = (p.life / p.maxLife) + 0.2
      let newSize = p.size[0] * pcent
      p.size = [newSize, newSize]
      if (p.life <= 0) {
        delete entities[key];
      }
    }
  });
  return entities;
};

const getAlpha = (pcentLife) => {
  // 1. Tratamento para a fase final (crítica): de 0% a 5%
  if (pcentLife <= 10) {
    // Math.floor garante que 4.5 vire 4, batendo com a lógica de intervalos [4-5], [3-4], etc.
    return Math.floor(pcentLife) % 2 === 0 ? 0.15 : 0.53;
  }

  // 2. Tratamento para a fase intermediária: de 5% a 30% (intervalos de 5 em 5)
  if (pcentLife < 50) {
    return Math.floor(pcentLife / 5) % 2 === 0 ? 0.15 : 0.53;
  }

  // 3. Tratamento para a fase inicial: de 30% a 100% (intervalos de 20 em 20)
  // Usamos um ajuste (+1) para inverter a ordem e começar com 0.53 no topo (90-100)
  return Math.floor((pcentLife - 10) / 10) % 2 === 0 ? 0.15 : 0.53;
}


export default function FastDash() {
  // Alterado: Agora esta ref vai apontar para o elemento HTML real (div container)
  const containerRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

  const initialEntities = {
    global: {
      died: false,
      paused: false,
      time: 0,
      healtime:0,
      cooldown: 0,
      healcooldown:0,
      triggerShake: () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 500); },
      triggerExplo: () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 100); },

    },
    player: {
      body: [20, 20],
      size: [20, 20],
      backgroundColor: 'white',
      renderer: <Box />,
      canHit: true,
      cool: 0,
    },

    pointsText: { value: 0, color: 'white', x: 50, y: 70, size: 20, renderer: TextRenderer },
    healthText: { value: 3, color: '#ff0000ff', x: 30, y: 30, renderer: LifeRenderer },
  };

  const handleMouseDown = (e, entities) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      // Calcula a posição exata do mouse RELATIVA à tela do jogo
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      X = mouseX - 10;
      Y = mouseY - 10;

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
        style={{ width: 400, height: 400, cursor: "crosshair" }}
      >
        <GameEngine
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#222",
            position: "relative",
            overflow: "hidden",
          }}
          systems={[TemplateFunction, UpdateParticles, DangerManager,HealingManager]}
          entities={initialEntities}
        />
      </div>
    </div>
  );
}
