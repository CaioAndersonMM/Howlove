const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");

const quadradimWidth = 64;
const quadradimHeight = 32;
const mapWidth = 10;
const mapHeight = 10;

function openModal(text) {
    modalText.textContent = text;
    modal.style.display = "block";
}
function closeModal() {
    modal.style.display = "none";
}

const maps = [
    { name: "Sala Inicial", data: [] },
    { name: "Sala Secundária", data: [] }
];

function generateMaps() {
    for (let m = 0; m < maps.length; m++) {
        for (let y = 0; y < mapHeight; y++) {
            maps[m].data[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                maps[m].data[y][x] = {
                    x,
                    y,
                    type: "normal",
                    color: m === 0 ? "#cceeff" : "#d2f0d2"
                };
            }
        }
    }

    maps[0].data[0][0].type = "portal";
    maps[0].data[0][0].color = "#ff6666";

    maps[1].data[9][3].type = "portal";
    maps[1].data[9][3].color = "#ff6666";

    // Objetos interativos
    maps[0].data[4][4].type = "obj:computador:onStep";
    maps[0].data[4][4].color = "#9999ff";

    maps[0].data[6][3].type = "obj:livro:onClick";
    maps[0].data[6][3].color = "#ffcc00";
}

generateMaps();

let currentMapIndex = 0;
let map = maps[currentMapIndex].data;

const player = { x: 5, y: 5 };
const target = { x: 5, y: 5 };

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

function drawMap() {
    map.flat().forEach(drawTile);
}

function drawPlayer() {
    const pos = cartToIso(player.x, player.y);
    ctx.fillStyle = "blue";
    ctx.fillRect(pos.x + quadradimWidth / 2 - 8, pos.y + quadradimHeight / 2 - 16, 16, 16);
}
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
}

function checkPortal() {
    const tile = map[Math.round(player.y)]?.[Math.round(player.x)];
    if (tile?.type === "portal") {
        let portalCoord = null;
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                if (map[y][x]?.type === "portal") {
                    portalCoord = { x, y };
                    break;
                }
            }
            if (portalCoord) break;
        }

        currentMapIndex = currentMapIndex === 0 ? 1 : 0;
        map = maps[currentMapIndex].data;

        target.x = portalCoord.x;
        target.y = portalCoord.y;
    }
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

    if (!moved) {
        checkPortal();
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
                const tile = map[y][x];

                if (tile.type.startsWith("obj:")) {
                    const [_, nome, modo] = tile.type.split(":");

                    if (modo === "onClick") {
                        openModal(`Você clicou em um(a) ${nome}`);
                        return;
                    }

                    closeModal();
                    target.x = x;
                    target.y = y;
                    return;
                }

                closeModal();
                target.x = x;
                target.y = y;
                return;
            }
        }
    }
});

update();