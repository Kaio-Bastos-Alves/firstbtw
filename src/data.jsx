import RightSide from './pages/RightSide';
import TankLight from "./pages/TankLight";
import FastDash from "./pages/FastDash";
import SwordSide from './pages/SwordSide';
import React, { useState } from "react";

import rightSideImg from './assets/rightisde.jpg'

const Pages = [
    { name: "Right Side", page: <RightSide />, image: rightSideImg, description: "Defenda as quatro direções de mobs implacáveis!" },
    { name: "Tank Light v.2", page: <TankLight />, image: null, description: "Controle o tanque com mira precisa do mouse e destrua os inimigos." },
    { name: "Fast Dash", page: <FastDash />, image: null, description: "Teste suas habilidades com ganchos e muita velocidade." },
    { name: "Sem Nome Ainda", page: <SwordSide />, image: null, description: "Defenda as esquerda e a direita de formas que não param!" },
  ];

export default Pages