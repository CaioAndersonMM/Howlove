const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");

const playerImg = new Image();
playerImg.src = "assets/player.png";

const player = {
    x: 5,
    y: 5,
    frame: 0,
    frameCount: 4,
    frameWidth: 20,
    frameHeight: 30,
    animSpeed: 0.2,
    animTimer: 0,
    moving: false,
    direction: "idle"
};

const playerSprites = {
    idle: new Image(),
    left: new Image(),
    right: new Image(),
    up: new Image(),
    down: new Image()
};

const objectSprites = {};
const objectNames = ["jukebox", "computador", "livro", "cartilhadanoite", "portal"];

objectNames.forEach(name => {
    const img = new Image();
    img.src = `assets/${name}.png`;
    objectSprites[name] = img;
});


playerSprites.idle.src = "assets/player.png";
playerSprites.left.src = "assets/playerleft.png";
playerSprites.right.src = "assets/playerright.png";
playerSprites.up.src = "assets/player.png";
playerSprites.down.src = "assets/playerdown.png";

const target = { x: 5, y: 5 };

const musicSystem = {
    currentTrack: 0,
    isPlaying: false,
    audio: null,
    tracks: [
        { name: "PARTY N ONE", artist: "Arctic Monkeys", file: "party.mp3" },
        { name: "Do I Wanna Know?", artist: "Arctic Monkeys", file: "doiwannaknow.mp3" },
        { name: "R U Mine?", artist: "Arctic Monkeys", file: "umyne.mp3" },
        { name: "Qualquer uma de Rubel", artist: "Rubel kkkkk", file: "" }
    ],

    init() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.volume = 0.7;
        this.loadTrack(0);
    },

    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            this.currentTrack = index;
            this.audio.src = `assets/${this.tracks[index].file}`;
        }
    },

    play() {
        this.audio.play().catch(e => console.log("Erro ao tocar música:", e));
        this.isPlaying = true;
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    },

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) this.play();
    },

    prevTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) this.play();
    },

    getCurrentTrack() {
        return this.tracks[this.currentTrack];
    }
};

musicSystem.init();

const quadradimWidth = 64;
const quadradimHeight = 32;
const mapWidth = 10;
const mapHeight = 10;

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

    // maps[0].data[4][4].type = "obj:computador:onStep";
    // maps[0].data[4][4].color = "#9999ff";

    maps[0].data[6][3].type = "obj:livro:onClick:Não é um livro qualquer, mas não tem nada aqui ainda, meu amor";
    maps[0].data[6][3].color = "#ffcc00";

    maps[1].data[6][3].type = "obj:cartilhadanoite:onClick:Ainda não disponibilizamos a cartilha da noite para a leitura";
    maps[1].data[6][3].color = "#ffcc00";

    maps[0].data[0][8].type = "obj:jukebox:onClick";
    maps[0].data[0][8].color = "#ffcc00";

}

generateMaps();

let currentMapIndex = 0;
let map = maps[currentMapIndex].data;

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
    map.flat().forEach(tile => {
        drawTile(tile);

        if (tile.type.startsWith("obj:")) {
            const [_, nome] = tile.type.split(":");

            const sprite = objectSprites[nome];
            if (sprite && sprite.complete && sprite.naturalHeight > 0) {
                const pos = cartToIso(tile.x, tile.y);


                width = 50;
                height = 56;
                offsetY = -56;

                ctx.drawImage(
                    sprite,
                    pos.x + quadradimWidth / 2 - width / 2,
                    pos.y + quadradimHeight / 2 + offsetY,
                    width, height
                );
            }
        }
    });
}

function drawPlayer() {
    const pos = cartToIso(player.x, player.y);
    const spriteX = Math.floor(player.frame) * player.frameWidth;

    let currentSprite = playerSprites.idle;
    if (player.direction !== "idle") {
        currentSprite = playerSprites[player.direction];
    }

    ctx.drawImage(
        currentSprite,
        spriteX, 0, player.frameWidth, player.frameHeight,
        pos.x + quadradimWidth / 2 - player.frameWidth / 2,
        pos.y + quadradimHeight / 2 - player.frameHeight + 8,
        player.frameWidth, player.frameHeight
    );
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

    if (moved) {
        const deltaX = target.x - player.x;
        const deltaY = target.y - player.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            player.direction = deltaX > 0 ? "right" : "left";
        } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
            player.direction = deltaY > 0 ? "down" : "up";
        } else if (Math.abs(deltaX) > speed) {
            player.direction = deltaX > 0 ? "right" : "left";
        } else if (Math.abs(deltaY) > speed) {
            player.direction = deltaY > 0 ? "down" : "up";
        }
    }

    player.moving = moved;

    if (moved) {
        player.animTimer += player.animSpeed;
        if (player.animTimer >= 1) {
            player.frame = (player.frame + 1) % player.frameCount;
            player.animTimer = 0;
        }
    } else {
        player.frame = 0;
        player.direction = "idle";
    }

    if (!moved) {
        checkPortal();

        const tile = map[Math.round(player.y)]?.[Math.round(player.x)];
        if (tile?.type?.startsWith("obj:")) {
            const [_, nome, modo] = tile.type.split(":");
            if (modo === "onStep") {
                openModal(`Você chegou até o(a) ${nome}`);
            }
        }
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
                    const [_, nome, modo, conteudo] = tile.type.split(":");

                    if (modo === "onClick") {
                        if (nome === "jukebox") {
                            openModal("Jukebox", "", true);
                        } else {
                            openModal(`Você clicou em um(a) ${nome}`, conteudo);
                        }
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