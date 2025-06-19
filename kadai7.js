const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const size = 8;
const cellSize = canvas.width / size;

let board = [];
let currentPlayer = "B"; // "B" = Black, "W" = White
let gameOver = false;

function initBoard() {
  board = Array.from({ length: size }, () => Array(size).fill(null));
  // 初期配置
  board[3][3] = "W";
  board[3][4] = "B";
  board[4][3] = "B";
  board[4][4] = "W";
  gameOver = false;
  currentPlayer = "B";
  drawBoard();
  updateStatus();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // グリッド
  ctx.strokeStyle = "#000";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }

  // 石の描画
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x]) {
        drawStone(x, y, board[y][x]);
      }
    }
  }
}

function drawStone(x, y, color) {
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2.5,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color === "B" ? "black" : "white";
  ctx.fill();
  ctx.stroke();
}

canvas.addEventListener("click", e => {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  if (isValidMove(x, y, currentPlayer)) {
    placeStone(x, y, currentPlayer);
    currentPlayer = currentPlayer === "B" ? "W" : "B";

    if (!hasValidMove(currentPlayer)) {
      currentPlayer = currentPlayer === "B" ? "W" : "B";
      if (!hasValidMove(currentPlayer)) {
        gameOver = true;
      }
    }
    drawBoard();
    updateStatus();
  }
});

function isValidMove(x, y, player) {
  if (board[y][x]) return false;

  return getFlippableStones(x, y, player).length > 0;
}

function getFlippableStones(x, y, player) {
  const opponent = player === "B" ? "W" : "B";
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [-1, -1], [1, -1], [-1, 1]
  ];
  let flippable = [];

  for (let [dx, dy] of directions) {
    let nx = x + dx;
    let ny = y + dy;
    let stones = [];

    while (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === opponent) {
      stones.push([nx, ny]);
      nx += dx;
      ny += dy;
    }

    if (stones.length > 0 && nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === player) {
      flippable.push(...stones);
    }
  }

  return flippable;
}

function placeStone(x, y, player) {
  board[y][x] = player;
  const toFlip = getFlippableStones(x, y, player);
  for (let [fx, fy] of toFlip) {
    board[fy][fx] = player;
  }
}

function hasValidMove(player) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isValidMove(x, y, player)) {
        return true;
      }
    }
  }
  return false;
}

function updateStatus() {
  if (gameOver) {
    const countB = board.flat().filter(v => v === "B").length;
    const countW = board.flat().filter(v => v === "W").length;
    let result = `ゲーム終了：黒 ${countB} - 白 ${countW} → `;
    if (countB > countW) result += "黒の勝ち！";
    else if (countW > countB) result += "白の勝ち！";
    else result += "引き分け！";
    document.getElementById("status").textContent = result;
  } else {
    document.getElementById("status").textContent =
      `現在の手番：${currentPlayer === "B" ? "黒" : "白"}`;
  }
}

function resetGame() {
  initBoard();
}

initBoard();
