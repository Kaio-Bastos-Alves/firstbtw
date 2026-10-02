import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from 'react-game-engine';

const Box = (props) => {
    const { size, body, backgroundColor } = props; //pego as propriedades enviadas por quem criou o objeto com esse renderer
    return (
        <div
            style={{
                position: 'absolute',
                left: body[0], //utilizando a variavel criada para defininir a posição
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
                transition: 'transform 0.1s',
            }}
        />
    );
};

// O sistema precisa retornar as entidades modificadas a cada tick
const TemplateFunction = (entities, { input }) => {
    // Exemplo: Você pode acessar os inputs de teclado/mouse aqui
    return entities;
};

export default function Template() {
  const [isShaking, setIsShaking] = useState(false);
    // Definindo as entidades iniciais do jogo
    const initialEntities = {
        box1: {
            body: [40, 40], //defino as posições
            size: [40, 40], //defino o tamanho do objeto
            backgroundColor: 'red', //defino a cor do objeto
            renderer: <Box /> //pra onde serão enviados as variaveis e enfim tratadas.
        },
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
                systems={[TemplateFunction]}
                entities={initialEntities}
            />
        </div>
    );
}
