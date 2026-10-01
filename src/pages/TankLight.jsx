import "regenerator-runtime/runtime";
import React, { useRef } from "react";
import { GameEngine } from "react-game-engine";
import HeartIcon from '../assets/heart.png'

let particleId = 0;

// --- 1. COMPONENTE VISUAL DO PLAYER ---
const PlayerRenderer = (props) => {
    const { x, y, angle } = props;
    return (
        <div
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: "40px",
                height: "40px",
                backgroundColor: "#ff5722",
                transform: `translate(-50%, -50%) rotate(${angle || 0}deg)`,
                transformOrigin: "center center",
                borderRadius: "4px",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
        >
            <div style={{
                position: "absolute",
                right: "20%",
                top: "30%",
                borderRadius: "50%",
                transform: "translateY(-50%)",
                width: "4px",
                height: "4px",
                backgroundColor: "#fff"
            }} />
            <div style={{
                position: "absolute",
                right: "20%",
                top: "70%",
                borderRadius: "50%",
                transform: "translateY(-50%)",
                width: "4px",
                height: "4px",
                backgroundColor: "#fff"
            }} />
        </div>
    );
};

// --- COMPONENTE VISUAL DA BALA ---
const BulletRenderer = (props) => {
    const { x, y } = props;
    return (
        <div
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: "8px",
                height: "8px",
                backgroundColor: "#ffff00",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 6px #ffff00",
            }}
        />
    );
};

const EnemyRenderer = (props) => {
    const { x, y, color, w, h, angle, round } = props;
    return (
        <div
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
                backgroundColor: color,
                borderRadius: `${round}%`,
                boxShadow: `0 0 6px ${color}`,
                transform: `translate(-50%, -50%) rotate(${angle || 0}deg)`
            }}
        />
    );
}
import React, { useMemo } from 'react';

// Função utilitária para clarear/escurecer uma cor Hex simples
// Se você já passar a cor em formato HSL ou RGB, avise que adaptamos!
const gerarVariacaoHex = (hex, percentual) => {
    // Remove o # se existir
    let limpo = hex.replace('#', '');
    if (limpo.length === 3) {
        limpo = limpo.split('').map(c => c + c).join('');
    }
    
    let num = parseInt(limpo, 16);
    let r = (num >> 16) + percentual;
    let g = ((num >> 8) & 0x00FF) + percentual;
    let b = (num & 0x0000FF) + percentual;

    // Garante que os valores fiquem entre 0 e 255
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const TextRenderer = (props) => {
    const { value, color, x, y, size } = props;

    // O useMemo garante que a variação de cor seja gerada APENAS quando 
    // o componente for montado ou quando a cor base mudar, evitando que o texto 
    // fique piscando em loops de renderização do React.
    const corVariada = useMemo(() => {
        const corBase = color || "#ffffff";
        
        // Retorna a cor padrão caso não seja Hex (ex: "white", "red")
        return corBase;
    }, [color]);

    return (
        <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: "1px" }}>
            <span style={{
                color: corVariada,
                fontSize: size ? size : "20px",
                fontWeight: "bold",
                fontFamily: '"Press Start 2P", system-ui',
                imageRendering: "pixelated",
                fontSmooth: "never",
                WebkitFontSmoothing: "none"
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

const PointsText = (props) => {
    const { value, color, x, y, size } = props;
    return (
        <div style={{ 
            position: "absolute", 
            left: x, 
            top: y, 
            transform: "translateX(-50%)", // Move o elemento 50% da própria largura para a esquerda
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",     // Garante centralização interna do conteúdo
            gap: "1px" 
        }}>
            <span style={{
                color: color || "white",
                fontSize: size ? size : "20px",
                fontWeight: "bold",
                fontFamily: '"Press Start 2P", system-ui',
                imageRendering: "pixelated",
                fontSmooth: "never",
                WebkitFontSmoothing: "none",
                textAlign: "center"            // Garante o alinhamento do bloco de texto
            }}>
                {value}
            </span>
        </div>
    );
};


const Box = (props) => {
    const { size, body, backgroundColor, backgroundImage } = props;
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
                borderRadius: "50%",
                transform: `rotate(${body.angle}deg)`,
                transition: 'transform 0.1s'
            }}
        />
    );
};


// --- 2. SISTEMAS DA GAME ENGINE ---

const LookAtMouseSystem = (entities, { input }) => {
    const { player, global } = entities;

    const mouseMove = input.find(x => x.name === "onMouseMove");
    const { payload } = input.find(x => x.name === "onKeyDown") || { payload: {} };

    if (payload.key === "Escape") entities.global.paused = !entities.global.paused
    if (payload.key === "r") {
        entities.global.died = false;
        entities.global.paused = true;
        entities.healthText.value = 3;
    }
    if (global.died || global.paused) { return entities }

    if (mouseMove && global.engineRect && global.scaleX && global.scaleY) {
        global.mouseX = (mouseMove.payload.clientX - global.engineRect.left) / global.scaleX;
        global.mouseY = (mouseMove.payload.clientY - global.engineRect.top) / global.scaleY;
    }

    const distX = global.mouseX - player.x;
    const distY = global.mouseY - player.y;

    const radians = Math.atan2(distY, distX);
    player.angle = radians * (180 / Math.PI);

    return entities;
};

const BulletSystem = (entities) => {
    const mapWidth = 800;
    const mapHeight = 400;
    const bulletRadius = 4; // Metade do tamanho da bala para bater certinho na borda
    entities.global.tiroCooldown++

    if (entities.global.died || entities.global.paused) { return entities }
    Object.keys(entities).forEach(key => {
        if (key.startsWith("bullet_")) {
            let bullet = entities[key];

            Object.keys(entities).forEach(ekey => {
                if (ekey.startsWith("enemy_")) {
                    let enemy = entities[ekey]

                    const disX = bullet.x - enemy.x;
                    const disY = bullet.y - enemy.y;

                    const distance = Math.sqrt((disX * disX) + (disY * disY))

                    if (distance <= bulletRadius + enemy.h / 2) {
                        delete entities[key]
                        entities.pointsText.value += enemy.speed * (45 - enemy.h);
                        delete entities[ekey]
                        for (let i = 0; i < 40; i++) {
                            particleId++;
                            const pKey = `particle_${particleId}`;

                            // Sorteia direções espalhadas (para cima, baixo, esquerda, direita)
                            let velX = (Math.random() - 0.5) * 6;
                            let velY = (Math.random() - 0.5) * 6;

                            let color = enemy.color
                            entities[pKey] = {
                                body: [bullet.x, bullet.y, velX, velY], // X, Y, VelocidadeX, VelocidadeY
                                size: [2, 2],              // Partícula bem pequenininha
                                backgroundColor: color,
                                life: (0.4 + Math.random()) * 20,                  // Vai durar 20 frames na tela
                                renderer: <Box />
                            };
                        }
                        return
                    }
                }
            })

            // 1. Move a bala usando os vetores de velocidade separados (vx e vy)
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // 2. Reduz o tempo de vida a cada frame (ex: 60 frames por segundo)
            bullet.lifeTime -= 1;
            if (bullet.lifeTime <= 0) {
                delete entities[key];
                return;
            }

            // 3. Colisão e ressalto preciso nas paredes (Bordas do mapa)
            // Parede Esquerda ou Direita
            if (bullet.x - bulletRadius <= 0) {
                bullet.x = bulletRadius; // Corrige para não ficar preso fora
                delete entities[key];  // Inverte a direção horizontal (kika!)
            } else if (bullet.x + bulletRadius >= mapWidth) {
                bullet.x = mapWidth - bulletRadius;
                delete entities[key];
            }

            // Teto ou Chão
            if (bullet.y - bulletRadius <= 0) {
                bullet.y = bulletRadius;
                delete entities[key];
            } else if (bullet.y + bulletRadius >= mapHeight) {
                bullet.y = mapHeight - bulletRadius;
                delete entities[key];
            }
        }
    });


    return entities;
};

const SpawnEnemies = (entities) => {
    entities.global.cooldown++;
    const Timer = [60, 120, 180]

    if (entities.global.died || entities.global.paused) { return entities }

    if (entities.global.cooldown > entities.global.Timer) {
        entities.global.cooldown = 0;
        entities.global.Timer = Timer[Math.floor(Math.random() * Timer.length)]

        const enemyId = "enemy_" + Date.now() + "_" + Math.random();
        const Colors = [
            // Tons Originais
            { color: '#bebebe', speed: 0.9 },
            { color: '#07fd82', speed: 1.4 },

            // Tons Vibrantes e Neon
            { color: '#ff0055', speed: 2.1 }, // Rosa Choque (Muito Rápido)
            { color: '#00e5ff', speed: 1.8 }, // Ocean Neon (Rápido)
            { color: '#ffea00', speed: 2.2 }, // Amarelo Elétrico (Velocidade Máxima)
            { color: '#a020f0', speed: 2.0 }, // Roxo Neon (Rápido)
            { color: '#ff6c00', speed: 1.9 }, // Laranja Vivo (Rápido)

            // Tons Pastéis e Suaves
            { color: '#ffb3ba', speed: 0.7 }, // Rosa Pastel (Mais dinâmico)
            { color: '#baffc9', speed: 1.1 }, // Verde Menta (Moderado)
            { color: '#bae1ff', speed: 1.3 }, // Azul Bebê (Moderado)
            { color: '#e8c4ff', speed: 0.8 }, // Lavanda (Suave)
            { color: '#ffdfba', speed: 1.5 }, // Pêssego (Moderado para Rápido)

            // Tons Profundos e Sóbrios
            { color: '#3c3c68ff', speed: 0.5 }, // Azul Noturno (Ainda o mais lento, mas com movimento)
            { color: '#0c4c99ff', speed: 1.6 }, // Azul Profundo (Rápido)
            { color: '#e94560', speed: 2.15 }, // Carmim (Muito Rápido)
            { color: '#314888ff', speed: 1.2 }  // Escuro Sóbrio (Moderado)
        ];



        const index = Colors[Math.floor(Math.random() * Colors.length)]

        var posx = Math.random() * 110 + 70
        var posy = Math.random() * 300 + 50

        if (Math.random() >= 0.5) {
            posx = Math.random() * 170 + 600
        }
        var Size = 20 + Math.random() * 20
        entities[enemyId] = {
            x: posx,
            y: posy,
            h: Size,
            w: Size,
            renderer: EnemyRenderer,
            color: index.color,
            speed: index.speed,
            round: Math.random() * 51
        };
    }
    return entities
}

const EnemySystem = (entities) => {

    if (entities.global.died || entities.global.paused) { return entities }
    Object.keys(entities).forEach(key => {
        if (key.startsWith("enemy_")) {
            let enemy = entities[key]
            const player = entities.player

            const disX = player.x - enemy.x;
            const disY = player.y - enemy.y;

            const Angular = Math.atan2(disY, disX)

            if (disY >= 0 && disY <= 0 && disX >= 0 && disX <= 0) return

            enemy.x += enemy.speed * Math.cos(Angular);
            enemy.y += enemy.speed * Math.sin(Angular);


            enemy.angle = Angular * (180 / Math.PI);

            Object.keys(entities).forEach(ekey => {
                if (ekey.startsWith("enemy_")) {
                    let enemy = entities[ekey]
                    const enemyColor = enemy.color;

                    const disX = player.x - enemy.x;
                    const disY = player.y - enemy.y;

                    const distance = Math.sqrt((disX * disX) + (disY * disY))

                    if (distance <= 20 + enemy.h / 2) {
                        delete entities[key]
                        entities.healthText.value--
                        if (entities.healthText.value <= 0) {
                            entities.global.died = true
                        }
                        for (let i = 0; i < 40; i++) {
                            particleId++;
                            const pKey = `particle_${particleId}`;

                            // Sorteia direções espalhadas (para cima, baixo, esquerda, direita)
                            let velX = (Math.random() - 0.5) * 6;
                            let velY = (Math.random() - 0.5) * 6;

                            let color = enemyColor
                            entities[pKey] = {
                                body: [enemy.x, enemy.y, velX, velY], // X, Y, VelocidadeX, VelocidadeY
                                size: [2, 2],              // Partícula bem pequenininha
                                backgroundColor: color,
                                life: (0.4 + Math.random()) * 20,                  // Vai durar 20 frames na tela
                                renderer: <Box />
                            };
                        }
                        return
                    }

                }
            }
            )
        }
    })

    return entities;
}

const UpdateParticles = (entities) => {
    Object.keys(entities).forEach((key) => {
        if (key.startsWith("particle_")) {

            if (entities.global.died || entities.global.paused) { delete entities[key]; return entities }
            let p = entities[key];
            p.body[0] += p.body[2]; // soma velX
            p.body[1] += p.body[3]; // soma velY

            p.life--;

            if (p.life <= 0) {
                delete entities[key];
            }
        }
    });
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
        entities.PausedText.value = ""
        entities.deadText.value = ""
        entities.deadText.color = "rgba(0,0,0,0)"
        return entities;
    }
}


// --- 3. COMPONENTE PRINCIPAL ---
export default function TankLight() {
    const engineRef = useRef(null);

    const entitiesRef = useRef({
        player: { x: 400, y: 200, angle: 0, renderer: PlayerRenderer, },
        global: { mouseX: 400, mouseY: 200, engineRect: null, scaleX: 1, scaleY: 1, cooldown: 0, Timer: 240, tiroCooldown: 0, died: false, paused: false },
        pointsText: { value: 0, color: 'white', x: 70, y: 70, size: 20, renderer: TextRenderer },
        healthText: { value: 3, color: '#ff0000ff', x: 30, y: 30, renderer: LifeRenderer },
        boxShadow: { body: [0, 0], size: [800, 400], backgroundColor: "transparent", renderer: <Box /> },
        PausedText: { value: "PAUSED", color: "#ffffff00", x: 130, y: 170, size: 40, renderer: <PointsText /> },
        deadText: { value: "Press R to restart.", color: "#ffffff", x: 120, y: 220, size: 10, renderer: <PointsText /> },
    });

    const updateEngineRect = () => {
        if (engineRef.current) {
            const rect = engineRef.current.getBoundingClientRect();
            entitiesRef.current.global.engineRect = rect;
            entitiesRef.current.global.scaleX = rect.width / 800;
            entitiesRef.current.global.scaleY = rect.height / 400;
        }
    };

    React.useEffect(() => {
        updateEngineRect();
        const handleKeyDown = () => { };
        window.addEventListener("resize", updateEngineRect);
        window.addEventListener("scroll", updateEngineRect);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("resize", updateEngineRect);
            window.removeEventListener("scroll", updateEngineRect);
        };
    }, []);

    const handleMouseDown = () => {
        if (entitiesRef.current.global.tiroCooldown > 30) {
            if (entitiesRef.current.global.died || entitiesRef.current.global.paused) { return }

            entitiesRef.current.global.tiroCooldown = 0
            const entities = entitiesRef.current;
            const player = entities.player;

            const radians = player.angle * (Math.PI / 180);
            const barrelLength = 5;

            const muzzleX = player.x + barrelLength * Math.cos(radians);
            const muzzleY = player.y + barrelLength * Math.sin(radians);
            const speed = 8;

            const bulletId = "bullet_" + Date.now() + "_" + Math.random();

            entities[bulletId] = {
                x: muzzleX,
                y: muzzleY,
                // Em vez de guardar só o ângulo, guardamos os componentes de velocidade (vx e vy)
                vx: speed * Math.cos(radians),
                vy: speed * Math.sin(radians),
                lifeTime: 360, // Dura 180 frames (cerca de 3 segundos a 60fps) antes de desaparecer sozinho
                renderer: BulletRenderer
            };
        }
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "#111",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            <div
                ref={engineRef}
                onMouseEnter={updateEngineRect}
                onMouseDown={handleMouseDown}
                style={{ cursor: "crosshair" }}
            >
                <GameEngine
                    style={{
                        width: 800,
                        height: 400,
                        backgroundColor: "#222",
                        position: "relative",
                        overflow: "hidden",
                    }}
                    systems={[LookAtMouseSystem, BulletSystem, SpawnEnemies, EnemySystem, UpdateParticles, Paused]}
                    entities={entitiesRef.current}
                />
            </div>
        </div>
    );
}