import "regenerator-runtime/runtime";
import React, { useRef } from "react";
import { GameEngine } from "react-game-engine";

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
    const { x, y, color, w, h, angle } = props;
    return (
        <div
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
                backgroundColor: color,
                borderRadius: "4%",
                boxShadow: `0 0 6px ${color}`,
                transform: `translate(-50%, -50%) rotate(${angle || 0}deg)`
            }}
        />
    );
}

const TextRenderer = (props) => {
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
                {Math.floor(value)}
            </span>
        </div>
    );
};

// --- 2. SISTEMAS DA GAME ENGINE ---

const LookAtMouseSystem = (entities, { input }) => {
    const { player, global } = entities;

    const mouseMove = input.find(x => x.name === "onMouseMove");

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
                        entities.pointsText.value += enemy.speed;
                        delete entities[ekey]
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
    const Timer = [60, 120, 180, 240]

    if (entities.global.cooldown > entities.global.Timer) {
        entities.global.cooldown = 0;
        entities.global.Timer = Timer[Math.floor(Math.random() * Timer.length)]

        const enemyId = "enemy_" + Date.now() + "_" + Math.random();
        const Colors = [{ color: '#bebebe', speed: 0.3 }, { color: '#07fd82', speed: 0.5 }]
        const index = Colors[Math.floor(Math.random() * Colors.length)]

        var posx = Math.random() * 110 + 70
        var posy = Math.random() * 300 + 50

        if (Math.random() >= 0.5) {
            posx = Math.random() * 170 + 600
        }
        entities[enemyId] = {
            x: posx,
            y: posy,
            h: 40,
            w: 40,
            renderer: EnemyRenderer,
            color: index.color,
            speed: index.speed
        };
    }
    return entities
}

const EnemySystem = (entities) => {
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
        }
    })

    return entities;
}

// --- 3. COMPONENTE PRINCIPAL ---
export default function TankLight() {
    const engineRef = useRef(null);

    const entitiesRef = useRef({
        player: { x: 400, y: 200, angle: 0, renderer: PlayerRenderer, },
        global: { mouseX: 400, mouseY: 200, engineRect: null, scaleX: 1, scaleY: 1, cooldown: 0, Timer: 240, tiroCooldown: 0 },
        pointsText: { value: 0, color: 'white', x: 30, y: 20, size: 30, renderer: TextRenderer }
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
        window.addEventListener("resize", updateEngineRect);
        window.addEventListener("scroll", updateEngineRect);
        return () => {
            window.removeEventListener("resize", updateEngineRect);
            window.removeEventListener("scroll", updateEngineRect);
        };
    }, []);

    const handleMouseDown = () => {
        if (entitiesRef.current.global.tiroCooldown > 30) {
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
                    systems={[LookAtMouseSystem, BulletSystem, SpawnEnemies, EnemySystem]}
                    entities={entitiesRef.current}
                />
            </div>
        </div>
    );
}