import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from 'react-game-engine';
import "./css/SwordSide.css"

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

  entities.player.colodown++;
  if (entities.player.colodown < 20) return entities;

  const validKeys = ["a", "ArrowLeft", "d", "ArrowRight"];
  if (validKeys.includes(payload.key)) {
    
    // DEFINA A DISTÂNCIA MÁXIMA EM PIXELS (Exemplo: 150px)
    const DISTANCIA_MAXIMA = entities.player.size[1] + 5; 
    const playerX = entities.player.body[0];

    // Verifica se existe algum inimigo dentro do raio de distância
    const inimigoProximo = Object.keys(entities).some(key => {
      if (key.startsWith('enemy_') && entities[key].body) {
        const enemyX = entities[key].body[0];
        const distancia = Math.abs(playerX - enemyX);
        
        return distancia <= DISTANCIA_MAXIMA;
      }
      return false;
    });

    if (inimigoProximo) {
      entities.player.SetDirection(payload.key);
      entities.player.backgroundColor = '#ff0000';
    } else {
      entities.player.backgroundColor = '#ff000065';
      entities.player.colodown = 0;
      return entities;
    }
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
      if (enemy.body[1] < 205) {
        enemy.body[1] += enemy.vel;
      } else if (enemy.body[0] > playerX && enemy.body[1] > 203 && enemy.body[1] < 207) {
        enemy.body[0] -= enemy.vel;
      } else if (enemy.body[0] < playerX && enemy.body[1] > 203 && enemy.body[1] < 207) {
        enemy.body[0] += enemy.vel;
      }

      const distanceToPlayer = Math.abs(enemy.body[0] - playerX);
      // 2. COLISÃO: PLAYER -> INIMIGO (Player atacando)
      if (player.isAttacking) {
        // Verifica se o player atacou para o lado CORRETO em que o inimigo está
        const hitLeft = player.angle < 0 && enemy.body[0] < playerX;
        const hitRight = player.angle > 0 && enemy.body[0] > playerX;

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


  entities.global.timeCounted++;
  if (entities.global.timeCounted > entities.global.cooldown) {
    const Timers = [50,55,60];
    const SpawnPosition =[[20,205],[380,205],[330+Math.random()*50,20],[20+Math.random()*50,20]]
    const Colors = [
  // Tons Originais

  // Tons Vibrantes e Neon (Todos reduzidos para o teto de 1.3)
  { color: '#ff0055', speed: 1.3 }, // Rosa Choque
  { color: '#a020f0', speed: 1.3 }, // Roxo Neon

  // Tons Pastéis e Suaves
  { color: '#ffb3ba', speed: 0.7 }, // Rosa Pastel
  { color: '#baffc9', speed: 1.1 }, // Verde Menta
  { color: '#bae1ff', speed: 1.3 }, // Azul Bebê
  { color: '#e8c4ff', speed: 0.8 }, // Lavanda
  { color: '#ffdfba', speed: 1.3 }, // Pêssego (Limitado ao máximo)

  // Tons Profundos e Sóbrios
  { color: '#3c3c68ff', speed: 0.7 }, // Azul Noturno
  { color: '#0c4c99ff', speed: 1.3 }, // Azul Profundo (Limitado ao máximo)
  { color: '#e94560', speed: 1.3 },   // Carmim (Limitado ao máximo)
  { color: '#314888ff', speed: 1.2 }  // Escuro Sóbrio
];

    const CorDefinida = Colors[Math.floor(Math.random()*Colors.length)]
    entities.global.cooldown = Timers[Math.floor(Math.random() * Timers.length)];
    entities.global.timeCounted = 0;
    const body = SpawnPosition[Math.floor(Math.random()*SpawnPosition.length)]

    EnemyID++;
    const enemyCod = "enemy_" + EnemyID;

    entities[enemyCod] = {
      body: body,
      size: [10,10],
      backgroundColor: CorDefinida.color,
      angle: 0,
      vel: CorDefinida.speed,
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
            backgroundColor: '#ff0000',
            renderer: <Box />,
            angle: 0,
            colodown:30,
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
            triggerShake: () => {setIsShaking(true); setTimeout(() => setIsShaking(false), 300); },
            cooldown: 60,
            timeCounted: 0,
        },
        ground: {
            body: [200, 210], //defino as posições
            size: [400, 200], //defino o tamanho do objeto
            backgroundColor: '#464646',
            renderer: <Box/>
        }
    };


    return (
        <div className={isShaking ? "screen-shake-sword" : ""} style={{ display: "inline-block" }}>
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
