import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from 'react-game-engine';

let EnemyID =0;
const Box = (props) => {
    const { size, body, backgroundColor, angle } = props; //pego as propriedades enviadas por quem criou o objeto com esse renderer
    return (
        <div
            style={{
                position: 'absolute',
                left: body[0] - size[0]/2, //utilizando a variavel criada para defininir a posição
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

const EnemyManager = (entities) =>{
    
    Object.keys(entities).forEach((key) =>{
        if (key.startsWith("enemy_")) {
            let enemy = entities[key]
            if(enemy.side == "right"){
                enemy.body[0] -= enemy.vel
                if(enemy.body[0] < 240  && entities.player.angle > 0 && enemy.body[0] > 209){
                    entities.global.triggerShake()
                    delete entities[key]
                }
                if(enemy.body[0] < 209){
                    //bater
                }
            }
            else if(enemy.side == "left") {
                enemy.body[0] += enemy.vel
                if(enemy.body[0] > 160 && entities.player.angle < 0 && enemy.body[0] < 191){
                    entities.global.triggerShake()
                    delete entities[key]
                }
                if(enemy.body[0] > 191) {
                    //bater
                }
            }
        }
    })

    entities.global.timeCounted++;
    if(entities.global.timeCounted > entities.global.cooldown){
    const Timers = [30,45,60,90,120]
    entities.global.cooldown = Timers[Math.floor(Math.random() * Timers.length)]
    entities.global.timeCounted = 0;
    EnemyID++
    const side= Math.random() > 0.5 ? "right" : "left"
    let x = 0
    if(side == "left") x = 20
     if(side == "right") x = 380
    const enemyCod = "enemy_" + EnemyID
    entities[enemyCod] = {
         body: [x,290],
         size: [10, 10],
         backgroundColor: "blue",
         angle: 0,
         side: side,
         vel: 1,
         renderer: <Box />,
       };
    }


    return entities
}

export default function SwordSide() {
    const [isShaking, setIsShaking] = useState(false);
    // Definindo as entidades iniciais do jogo
    const initialEntities = {
        player: {
            body: [200, 275], //defino as posições
            size: [2, 50], //defino o tamanho do objeto
            backgroundColor: 'red', //defino a cor do objeto
            renderer: <Box />, //pra onde serão enviados as variaveis e enfim tratadas.
            angle: 0,
            SetDirection: (dir) => {
                if (dir === "ArrowLeft" || dir === "a") {
                    initialEntities.player.angle = -85;
                } else if (dir === "ArrowRight" || dir === "d") {
                    initialEntities.player.angle = 85; // Corrigido de -200 para 0
                }
                setTimeout(() => initialEntities.player.angle = 0, 100);
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
                systems={[PlayerMovement,EnemyManager]}
                entities={initialEntities}
            />
        </div>
    );
}
