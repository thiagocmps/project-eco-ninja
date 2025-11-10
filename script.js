const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const scoreboard = document.getElementById("scoreboard");
const simpleBackground = new Image();
simpleBackground.src = "assets/background/simple-background.gif";
const trashSize = 40; // tamanho do lixo
const trashSpeed = 2; // velocidade do movimento até a lixeira
const totalTrash = 15; // quantidade de lixos por rodada

canvas.style.background = "url(assets/background/background-teste.png)";
canvas.style.backgroundSize = "cover";
canvas.style.backgroundRepeat = "no-repeat";

let trashTypes = [
  { color: "yellow", key: "ArrowUp", x: canvas.width / 2, y: 0 }, // Plástico
  { color: "blue", key: "ArrowRight", x: canvas.width / 2, y: 0 }, // Papel
  { color: "gray", key: "ArrowDown", x: canvas.width / 2, y: 0 }, // Indiferenciado
  { color: "green", key: "ArrowLeft", x: canvas.width / 2, y: 0 }, // Vidro
];

let trashQueue = [];
let currentTrash = null;
let score = { hit: 0, miss: 0 };
let trashIndex = 0;
let gameStarted = false;
let startTime = 0;

const bins = {
  up: { x: canvas.width / 2 - 50, y: 150, color: "yellow" },
  right: { x: canvas.width - 50, y: canvas.height / 2 - 200, color: "blue" },
  down: { x: canvas.width / 2 - 50, y: canvas.height - 150, color: "gray" },
  left: { x: 0, y: canvas.height / 2 - 200, color: "green" },
};

// cria fila de lixo aleatória
function generateTrashQueue() {
  trashQueue = [];
  for (let i = 0; i < totalTrash; i++) {
    let t = trashTypes[Math.floor(Math.random() * trashTypes.length)];
    trashQueue.push({ ...t, x: canvas.width / 2, y: -trashSize, rotation: 0 });
  }
}

// Desenha lixeiras nos cantos
function drawBins() {
  // cima
  ctx.fillStyle = bins.up.color;
  const binImages = {
    up: new Image(),
    right: new Image(),
    down: new Image(),
    left: new Image(),
  };

  binImages.up.src = "assets/trash/yellowTrash-removebg.png";
  binImages.right.src = "assets/trash/blueTrash-removebg.png";
  binImages.down.src = "assets/trash/grayTrash-removebg.png";
  binImages.left.src = "assets/trash/greenTrash-removebg.png";

  //cima
  ctx.drawImage(binImages.up, bins.up.x - 200, bins.up.y - 50, 500, 400);

  // direita
  ctx.drawImage(
    binImages.right,
    bins.right.x - 400,
    bins.right.y - 100,
    700,
    570
  );

  // baixo
  ctx.fillStyle = bins.down.color;
  ctx.fillRect(bins.down.x, bins.down.y, 100, 50);
  // esquerda
  ctx.drawImage(binImages.left, bins.left.x - 250, bins.left.y - 100, 700, 570);
  ctx.fillStyle = bins.left.color;
  //ctx.fillRect(bins.left.x, bins.left.y, 50, 100);
  ctx.drawImage(binImages.down, bins.down.x - 250, bins.down.y - 450, 650, 650);
}

// Desenha o lixo atual
function drawTrash() {
  if (!currentTrash) return;
  //canvas.style.background = "url(assets/background/complex-background.avif)";
  //canvas.style.backgroundSize = "cover";
  //canvas.style.backgroundRepeat = "no-repeat";

  ctx.save();
  ctx.translate(currentTrash.x + trashSize / 2, currentTrash.y + trashSize / 2);
  ctx.rotate(currentTrash.rotation);
  ctx.fillStyle = currentTrash.color;
  ctx.fillRect(-trashSize / 2, -trashSize / 2, trashSize, trashSize);
  ctx.restore();
}

// Atualiza posição do lixo caindo
function updateTrash() {
  if (!currentTrash) return;
  if (currentTrash.y < canvas.height / 2 - trashSize / 2) {
    currentTrash.y += 4; // queda
    currentTrash.rotation += 0.1; // rotação durante a queda
  }
}

// Move lixo para lixeira após tecla pressionada
function moveToBin(key) {
  if (!currentTrash) return;
  let target;
  if (key === "ArrowUp") target = bins.up;
  else if (key === "ArrowRight") target = bins.right;
  else if (key === "ArrowDown") target = bins.down;
  else if (key === "ArrowLeft") target = bins.left;
  if (!target) return;

  // Move com animação
  let dx = (target.x + 50 - (currentTrash.x + trashSize / 2)) / 10;
  let dy = (target.y + 25 - (currentTrash.y + trashSize / 2)) / 10;
  let steps = 0;
  let anim = setInterval(() => {
    currentTrash.x += dx;
    currentTrash.y += dy;
    currentTrash.rotation += 0.3;
    steps++;
    if (steps >= 10) {
      clearInterval(anim);
      // verifica acerto
      if (currentTrash.color === target.color) {
        score.hit++;
        canvas.style.backgroundColor = "green";
        setTimeout(() => {
          canvas.style.background =
            "url(assets/background/background-teste.png)";
          canvas.style.backgroundSize = "cover";
          canvas.style.backgroundRepeat = "no-repeat";
        }, 400);
      } else {
        // insere keyframes de shake se ainda não existir
        if (!document.getElementById("shake-style")) {
          const style = document.createElement("style");
          style.id = "shake-style";
          style.innerHTML = `
        @keyframes shake {
          0% { transform: translate(0,0) rotate(0); }
          10% { transform: translate(-6px,-2px) rotate(-1deg); }
          20% { transform: translate(6px,2px) rotate(1deg); }
          30% { transform: translate(-6px,2px) rotate(-1deg); }
          40% { transform: translate(6px,-2px) rotate(1deg); }
          50% { transform: translate(-6px,0) rotate(0); }
          60% { transform: translate(6px,2px) rotate(1deg); }
          70% { transform: translate(-6px,-2px) rotate(-1deg); }
          80% { transform: translate(6px,0) rotate(0); }
          90% { transform: translate(-3px,2px) rotate(0); }
          100% { transform: translate(0,0) rotate(0); }
        }
        `;
          document.head.appendChild(style);
        }

        // aplica animação de shake ao canvas (será removida após o tempo)
        canvas.style.animation = "shake 0.4s";
        canvas.style.animationTimingFunction = "ease-in-out";

        setTimeout(() => {
          canvas.style.background =
            "url(assets/background/background-teste.png)";
          canvas.style.backgroundSize = "cover";
          canvas.style.backgroundRepeat = "no-repeat";
          // limpa a animação para permitir retrigger futuro
          canvas.style.animation = "";
        }, 400);
        score.miss++;
      }
      nextTrash();
    }
  }, 30);
}

// Passa para próximo lix
function nextTrash() {
  trashIndex++;
  if (trashIndex >= totalTrash) {
    endGame();
  } else {
    currentTrash = trashQueue[trashIndex];
  }
}

// Inicia o jogo
function startGame() {
  generateTrashQueue();
  trashIndex = 0;
  score = { hit: 0, miss: 0 };
  currentTrash = trashQueue[0];
  gameStarted = true;
  startTime = Date.now();
  scoreboard.textContent = "";
  animate();
}

// Termina o jogo
function endGame() {
  gameStarted = false;
  let elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  alert("Jogo terminado!");
  scoreboard.textContent = 
  `Acertos: ${score.hit} | Erros: ${score.miss} | Tempo: ${elapsed}s`;
  // aumentar o texto do scoreboard
  scoreboard.style.fontSize = "20px";
  scoreboard.style.color = "white";
}

// Loop de animação
function animate() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBins();
  updateTrash();
  drawTrash();
  requestAnimationFrame(animate);
}

// Evento de teclado
document.addEventListener("keydown", (e) => {
  if (gameStarted) {
    if (["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(e.key)) {
      moveToBin(e.key);
    }
  }
});

// Botão iniciar
startBtn.addEventListener("click", startGame);
