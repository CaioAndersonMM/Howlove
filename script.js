const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const quadradimWidth = 64;
const quadradimHeight = 32;
const mapWidth = 10;
const mapHeight = 10;

const map = [];

for (let y = 0; y < mapHeight; y++) {
  map[y] = [];
  for (let x = 0; x < mapWidth; x++) {
    map[y][x] = { x, y, color: "#cceeff" };
  }
}

const player = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

function cartToIso(x, y) {
  return {
    x: (x - y) * quadradimWidth / 2 + canvas.width / 2,
    y: (x + y) * quadradimHeight / 2
  };
}

function isPointConvert(px, py, tileX, tileY) {
  const iso = cartToIso(tileX, tileY);
  const centerX = iso.x + quadradimWidth / 2;
  const centerY = iso.y + quadradimHeight / 2;
  const dx = Math.abs(px - centerX);
  const dy = Math.abs(py - centerY);
  return dx / (quadradimWidth / 2) + dy / (quadradimHeight / 2) <= 1;
}

function drawTile(tile) {
  const { x, y } = cartToIso(tile.x, tile.y);
  ctx.beginPath();
  ctx.moveTo(x, y + quadradimHeight / 2);
  ctx.lineTo(x + quadradimWidth / 2, y);
  ctx.lineTo(x + quadradimWidth, y + quadradimHeight / 2);
  ctx.lineTo(x + quadradimWidth / 2, y + quadradimHeight);
  ctx.closePath();
  ctx.fillStyle = tile.color;
  ctx.fill();
  ctx.strokeStyle = "#888";
  ctx.stroke();
}

function drawPlayer() {
  const pos = cartToIso(player.x, player.y);
  ctx.fillStyle = "blue";
  ctx.fillRect(pos.x + quadradimWidth / 2 - 8, pos.y + quadradimHeight / 2 - 16, 16, 16);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map.flat().forEach(drawTile);
  drawPlayer();
}

function update() {
  const speed = 0.05;
  let moved = false;

  if (Math.abs(player.x - target.x) > speed) {
    player.x += player.x < target.x ? speed : -speed;
    moved = true;
  } else {
    player.x = target.x;
  }

  if (Math.abs(player.y - target.y) > speed) {
    player.y += player.y < target.y ? speed : -speed;
    moved = true;
  } else {
    player.y = target.y;
  }

  render();
  requestAnimationFrame(update);
}

canvas.addEventListener("click", (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (isPointConvert(mouseX, mouseY, x, y)) {
        target.x = x;
        target.y = y;
        return;
      }
    }
  }
});

update();