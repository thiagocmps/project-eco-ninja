const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const scoreboard = document.getElementById("scoreboard");
const Background = new Image();
Background.src = "assets/background/background.png";
const trashSize = 100;
const trashSpeed = 2;
const totalTrash = 15;

const yellowTrashImg = new Image();
yellowTrashImg.src = "assets/trash verdadeiro/yellowTrash.png";
const blueTrashImg = new Image();
blueTrashImg.src = "assets/trash verdadeiro/blueTrash.png";
const grayTrashImg = new Image();
grayTrashImg.src = "assets/trash verdadeiro/grayTrash.png";
const greenTrashImg = new Image();
greenTrashImg.src = "assets/trash verdadeiro/greenTrash.png";

let trashTypes = [
  { color: "yellow", key: "ArrowUp", x: canvas.width / 2, y: 0 },
  { color: "blue", key: "ArrowRight", x: canvas.width / 2, y: 0 },
  { color: "gray", key: "ArrowDown", x: canvas.width / 2, y: 0 },
  { color: "green", key: "ArrowLeft", x: canvas.width / 2, y: 0 },
];

let trashQueue = [];
let currentTrash = null;
let score = { hit: 0, miss: 0 };
let trashIndex = 0;
let gameStarted = false;
let startTime = 0;

let isMovingToBin = false; // <<<<<<<<<<<<<< NOVO

const bins = {
  up: { x: canvas.width / 2, y: 200, color: "yellow" },
  right: { x: canvas.width - 80, y: canvas.height / 2 - 150, color: "blue" },
  down: { x: canvas.width / 2, y: canvas.height - 350, color: "gray" },
  left: { x: 100, y: canvas.height / 2 - 150, color: "green" },
};

// Inicia o jogo
function startGame() {
  generateRandomTrash();
  trashIndex = 0;
  score = { hit: 0, miss: 0 };
  currentTrash = trashQueue[0];
  gameStarted = true;
  startTime = Date.now();
  scoreboard.textContent = "";
  animation();
}

// cria fila de lixo aleatória
function generateRandomTrash() {
  trashQueue = [];
  for (let i = 0; i < totalTrash; i++) {
    let t = trashTypes[Math.floor(Math.random() * trashTypes.length)];
    trashQueue.push({ ...t, x: canvas.width / 2, y: -trashSize, rotation: 0 });
  }
}

// Loop de animação
function animation() {
  if (!gameStarted) return;
  /* ctx.clearRect(0, 0, canvas.width, canvas.height); */
  ctx.drawImage(Background, 0, 0, canvas.width, canvas.height);
  updateTrash();
  drawTrash();
  requestAnimationFrame(animation);
}

//Atualiza posição do lixo caindo
function updateTrash() {
  if (!currentTrash || isMovingToBin) return;
  if (currentTrash.y < canvas.height / 2 - trashSize / 2) {
    currentTrash.y += 4;
    currentTrash.rotation += 0.1;
  }
}

// Desenha o lixo atual
function drawTrash() {
  if (!currentTrash) return;

  ctx.save();
  ctx.translate(currentTrash.x, currentTrash.y + trashSize / 2);
  ctx.rotate(currentTrash.rotation);

  const imgs = {
    yellow: yellowTrashImg,
    blue: blueTrashImg,
    gray: grayTrashImg,
    green: greenTrashImg
  };

  ctx.drawImage(imgs[currentTrash.color], -trashSize / 2, -trashSize / 2, trashSize, trashSize);
  ctx.restore();
}

// Move lixo para lixeira após tecla pressionada
function moveToBin(key) {
  if (isMovingToBin || !currentTrash) return; 
  isMovingToBin = true;

  let target;

  if (key === "ArrowUp") target = bins.up;
  else if (key === "ArrowRight") target = bins.right;
  else if (key === "ArrowDown") target = bins.down;
  else if (key === "ArrowLeft") target = bins.left;

  if (!target) return;

  const targetX = target.x;
  const targetY = target.y;

  const duration = 25;
  let frame = 0;

  const startX = currentTrash.x;
  const startY = currentTrash.y;

  function animateMove() {
    frame++;

    const t = frame / duration;
    const ease = t * (2 - t);

    currentTrash.x = startX + (targetX - startX) * ease;
    currentTrash.y = startY + (targetY - startY) * ease;
    currentTrash.rotation += 0.2;

    if (frame < duration) {
      requestAnimationFrame(animateMove);
      return;
    }

    if (currentTrash.color === target.color) {
      score.hit++;
    } else {
      shakeCanvas();
      score.miss++;
    }

    isMovingToBin = false;
    nextTrash();
  }

  requestAnimationFrame(animateMove);
}

function shakeCanvas() {
  canvas.classList.add("shake");
  setTimeout(() => {
    canvas.classList.remove("shake");
  }, 400);
}

// Passa para próximo lixo
function nextTrash() {
  trashIndex++;
  if (trashIndex >= totalTrash) {
    endGame();
  } else {
    currentTrash = trashQueue[trashIndex];
  }
}

// Termina o jogo
function endGame() {
  gameStarted = false;

  let elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const gameOverModal = document.getElementById("gameOverModal");
  const finalScore = document.getElementById("finalScore");

  gameOverModal.classList.add("active");

  finalScore.textContent =
    `Acertos: ${score.hit} | Erros: ${score.miss} | Tempo: ${elapsed}s`;

  scoreboard.textContent =
    `Acertos: ${score.hit} | Erros: ${score.miss} | Tempo: ${elapsed}s`;

  scoreboard.style.fontSize = "20px";
  scoreboard.style.color = "white";
}

document.addEventListener("keydown", (e) => {
  if (gameStarted) {
    if (["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(e.key)) {
      moveToBin(e.key);
    }
  }
});

startBtn.addEventListener("click", () => {
  startGame();
  startBtn.style.display = "none";
});

document.getElementById("restartBtn").addEventListener("click", () => {
  startGame();
  document.getElementById("gameOverModal").classList.remove("active");
});
