import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from 'react-game-engine';

let EnemyID = 0;
const Box = (props) => {
    const { size, body, backgroundColor, angle } = props; //pego as propriedades enviadas por quem criou o objeto com esse renderer
    return (
        <div
            style={{
                position: 'absolute',
                left: body[0] - size[0] / 2, //utilizando a variavel criada para defininir a posição
                top: body[1],
                width: size[0], //utilizando a variavel criada para definir a largura
                height: size[1],
                backgroundColor: backgroundColor || 'white', //utilizando a variavel criada para definir a cor de fundo
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                boxShadow: `0 0 6px ${backgroundColor || 'white'}`,
                imageRendering: 'pixelated',
                mixBlendMode: 'normal',
                transition: 'transform 0.05s ease-out',
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                transformOrigin: 'center bottom',
            }}
        />
    );
};

// O sistema precisa retornar as entidades modificadas a cada tick
const PlayerMovement = (entities, { input }) => {
    const { payload } = input.find(x => x.name === "onKeyDown") || { payload: {} };
    if (payload.key == "a" || payload.key == "ArrowLeft" || payload.key == "d" || payload.key == "ArrowRight") {
        entities.player.SetDirection(payload.key)
    }
    return entities;
};
const EnemyManager = (entities) => {
  const player = entities.player;
  const playerX = player.body[0];
  const attackRange = 50; // O alcance da sua espada para ambos os lados
  const bodyRadius = 10;  // A largura do corpo do player para receber dano

  Object.keys(entities).forEach((key) => {
    if (key.startsWith("enemy_")) {
      let enemy = entities[key];
      
      // 1. Movimentação dos Inimigos
      if (enemy.side == "right") {
        enemy.body[0] -= enemy.vel;
      } else if (enemy.side == "left") {
        enemy.body[0] += enemy.vel;
      }

      const distanceToPlayer = Math.abs(enemy.body[0] - playerX);

      // 2. COLISÃO: PLAYER -> INIMIGO (Player atacando)
      if (player.isAttacking) {
        // Verifica se o player atacou para o lado CORRETO em que o inimigo está
        const hitLeft = player.angle < 0 && enemy.side === "left" && enemy.body[0] < playerX;
        const hitRight = player.angle > 0 && enemy.side === "right" && enemy.body[0] > playerX;

        if ((hitLeft || hitRight) && distanceToPlayer <= attackRange) {
          entities.global.triggerShake();
          delete entities[key]; // Inimigo derrotado
          return; // Pula para o próximo inimigo
        }
      }

      // 3. COLISÃO: INIMIGO -> PLAYER (Inimigo dando dano)
      // Se o inimigo chegou perto o suficiente do corpo do player e não foi morto
      if (distanceToPlayer <= bodyRadius) {
        console.log("Player recebeu DANO!");
        // Aqui você reduz a vida do player. Ex: entities.global.hp -= 1;
        
        delete entities[key]; // Remove o inimigo após ele atacar (ou faça ele recuar)
      }
    }
  });

  // --- Sistema de Spawn de Inimigos (Mantido e Otimizado) ---
  entities.global.timeCounted++;
  if (entities.global.timeCounted > entities.global.cooldown) {
    const Timers = [30,45,60];
    entities.global.cooldown = Timers[Math.floor(Math.random() * Timers.length)];
    entities.global.timeCounted = 0;
    
    EnemyID++;
    const side = Math.random() > 0.5 ? "right" : "left";
    let x = side === "left" ? 20 : 380;
    const enemyCod = "enemy_" + EnemyID;

    entities[enemyCod] = {
      body: [x, 200],
      size: [10,10],
      backgroundColor: "blue",
      angle: 0,
      side: side,
      vel: 1,
      renderer: <Box />,
    };
  }

  return entities;
};


export default function SwordSide() {
    const [isShaking, setIsShaking] = useState(false);
    // Definindo as entidades iniciais do jogo
    const initialEntities = {
        player: {
            body: [200, 185], //defino as posições
            size: [2, 50], //defino o tamanho do objeto
            backgroundColor: 'red',
            renderer: <Box />,
            angle: 0,
            isAttacking: false, // Nova flag para controle de colisão de dano
            SetDirection: function (dir) { // Mudado para function para o 'this' referenciar a entidade atualizada do motor
                if (dir === "ArrowLeft" || dir === "a") {
                    this.angle = -85;
                } else if (dir === "ArrowRight" || dir === "d") {
                    this.angle = 85;
                }
                this.isAttacking = true;

                setTimeout(() => {
                    this.angle = 0;
                    this.isAttacking = false;
                }, 50);
            },
        },
        global: {
            triggerShake: () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 300); },
            cooldown: 60,
            timeCounted: 0,
        }
    };


    return (
        <div className={isShaking ? "screen-shake" : ""} style={{ display: "inline-block" }}>
            <GameEngine
                style={{
                    width: 400,
                    height: 400,
                    backgroundColor: "#222",
                    position: "relative",
                    overflow: "hidden",
                }}
                systems={[PlayerMovement, EnemyManager]}
                entities={initialEntities}
            />
        </div>
    );
}
