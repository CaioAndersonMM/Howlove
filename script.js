const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- 1. Artes - quadrosposts.js ---

const artImages = {};
function preloadArt() {
    // Verifica se a galeria existe no arquivo externo quadrosposts.js
    if (typeof artGallery !== 'undefined') {
        Object.keys(artGallery).forEach(id => {
            const img = new Image();
            img.src = artGallery[id].url;
            artImages[id] = img;
        });
    } else {
        console.warn("Aviso: 'artGallery' não encontrada. Verifique o arquivo quadrosposts.js.");
    }
}

// --- 2. SISTEMA DE ESTRELAS E FUNDO ---
const stars = [];
const meteors = [];

for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        opacity: Math.random(),
        speed: 0.005 + Math.random() * 0.02
    });
}

function drawAnimatedBackground() {
    // Fundo espacial (Azul profundo)
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#050b18");
    grad.addColorStop(1, "#112244");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Brilho das estrelas
    ctx.fillStyle = "white";
    stars.forEach(s => {
        s.opacity += s.speed;
        if (s.opacity > 1 || s.opacity < 0.2) s.speed *= -1;
        ctx.globalAlpha = Math.max(0, s.opacity);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Estrelas cadentes
    if (Math.random() < 0.01) {
        meteors.push({
            x: Math.random() * (canvas.width * 0.7),
            y: 0,
            len: 60,
            speed: 12
        });
    }

    meteors.forEach((m, i) => {
        m.x += m.speed;
        m.y += m.speed;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.len, m.y - m.len);
        ctx.stroke();
        if (m.y > canvas.height + 100) meteors.splice(i, 1);
    });
}

// --- 3. CONFIGURAÇÕES DO JOGADOR E OBJETOS ---
const playerImg = new Image();
playerImg.src = "assets/player.png";

const player = {
    x: 5, y: 5,
    frame: 0, frameCount: 4,
    frameWidth: 20, frameHeight: 30,
    animSpeed: 0.2, animTimer: 0,
    moving: false, direction: "idle"
};

const playerSprites = {
    idle: new Image(), left: new Image(), right: new Image(), up: new Image(), down: new Image()
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

// --- 4. SISTEMA DE MÚSICA ---
const musicSystem = {
    currentTrack: 0,
    isPlaying: false,
    audio: null,
    backgroundAudio: null,
    tracks: [
        { name: "PARTY N ONE", artist: "Arctic Monkeys", file: "party.mp3" },
        { name: "Do I Wanna Know?", artist: "Arctic Monkeys", file: "doiwannaknow.mp3" },
        { name: "R U Mine?", artist: "Arctic Monkeys", file: "umyne.mp3" },
        { name: "Qualquer uma de Rubel", artist: "Rubel kkkkk", file: "" }
    ],

    init() {
        // Jukebox audio
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.volume = 0.7;
        this.loadTrack(0);

        // Background audio (música de fundo)
        this.backgroundAudio = new Audio();
        this.backgroundAudio.src = "assets/aquelasaudade.mp3";
        this.backgroundAudio.loop = true;
        this.backgroundAudio.volume = 0.15; // Volume baixinho
        
        // Inicia música de fundo automaticamente
        this.startBackgroundMusic();
    },

    startBackgroundMusic() {
        this.backgroundAudio.play().catch(e => {
            // Se o navegador bloquear, toca no primeiro clique
            document.addEventListener('click', () => {
                this.backgroundAudio.play().catch(console.log);
            }, { once: true });
        });
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

// --- 5. MAPA E PAREDES ---
const quadradimWidth = 64;
const quadradimHeight = 32;
const wallHeight = 70;
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
                    color: m === 0 ? "#cceeff" : "#d2f0d2",
                    hasWallX: (x === 0),
                    hasWallY: (y === 0)
                };
            }
        }
    }

    maps[0].data[0][3].frame = { id: "quadro1", side: "y" };
    maps[0].data[4][0].frame = { id: "quadro2", side: "x" };

    maps[0].data[0][5].type = "obj:portal";
    maps[0].data[0][5].color = "#ff6666";

    maps[1].data[9][3].type = "obj:portal";
    maps[1].data[9][3].color = "#ff6666";

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
        y: (x + y) * quadradimHeight / 2 + 100
    };
}

function isPointInWall(px, py, x, y, side) {
    const pos = cartToIso(x, y);
    if (side === 'y') {
        return px >= pos.x + 40 && px <= pos.x + 62 && py >= pos.y - 65 && py <= pos.y + 0;
    } else {
        return px >= pos.x + 2 && px <= pos.x + 24 && py >= pos.y - 65 && py <= pos.y + 0;
    }
}

function isPointConvert(px, py, tileX, tileY) {
    const iso = cartToIso(tileX, tileY);
    const centerX = iso.x + quadradimWidth / 2;
    const centerY = iso.y + quadradimHeight / 2;
    const dx = Math.abs(px - centerX);
    const dy = Math.abs(py - centerY);
    return dx / (quadradimWidth / 2) + dy / (quadradimHeight / 2) <= 1;
}

function drawFrameOnWall(x, y, side, artId) {
    const pos = cartToIso(x, y);
    const img = artImages[artId];

    ctx.save();
    if (side === 'y') {
        ctx.fillStyle = "#331a00"; // Cor de madeira mais escura
        ctx.beginPath();
        ctx.moveTo(pos.x + 42, pos.y - 10); ctx.lineTo(pos.x + 60, pos.y - 2);
        ctx.lineTo(pos.x + 60, pos.y - 55); ctx.lineTo(pos.x + 42, pos.y - 63);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Imagem (Preview real ampliado)
        if (img && img.complete) {
            ctx.beginPath();
            ctx.moveTo(pos.x + 45, pos.y - 15); ctx.lineTo(pos.x + 57, pos.y - 10);
            ctx.lineTo(pos.x + 57, pos.y - 50); ctx.lineTo(pos.x + 45, pos.y - 55);
            ctx.clip();
            ctx.drawImage(img, pos.x + 45, pos.y - 55, 12, 45);
        }
    } else {
        ctx.fillStyle = "#331a00";
        ctx.beginPath();
        ctx.moveTo(pos.x + 4, pos.y - 2); ctx.lineTo(pos.x + 22, pos.y - 10);
        ctx.lineTo(pos.x + 22, pos.y - 63); ctx.lineTo(pos.x + 4, pos.y - 55);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Imagem (Preview real ampliado)
        if (img && img.complete) {
            ctx.beginPath();
            ctx.moveTo(pos.x + 7, pos.y - 10); ctx.lineTo(pos.x + 19, pos.y - 15);
            ctx.lineTo(pos.x + 19, pos.y - 55); ctx.lineTo(pos.x + 7, pos.y - 50);
            ctx.clip();
            ctx.drawImage(img, pos.x + 7, pos.y - 55, 12, 45);
        }
    }
    ctx.restore();
}

function drawTile(tile) {
    const { x, y } = cartToIso(tile.x, tile.y);

    if (tile.hasWallY) {
        ctx.fillStyle = "#a8c0d8";
        ctx.beginPath();
        ctx.moveTo(x + quadradimWidth / 2, y);
        ctx.lineTo(x + quadradimWidth, y + quadradimHeight / 2);
        ctx.lineTo(x + quadradimWidth, y + quadradimHeight / 2 - wallHeight);
        ctx.lineTo(x + quadradimWidth / 2, y - wallHeight);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.stroke();
        if (tile.frame && tile.frame.side === 'y') drawFrameOnWall(tile.x, tile.y, 'y', tile.frame.id);
    }

    if (tile.hasWallX) {
        ctx.fillStyle = "#8da3ba";
        ctx.beginPath();
        ctx.moveTo(x, y + quadradimHeight / 2);
        ctx.lineTo(x + quadradimWidth / 2, y);
        ctx.lineTo(x + quadradimWidth / 2, y - wallHeight);
        ctx.lineTo(x, y + quadradimHeight / 2 - wallHeight);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.stroke();
        if (tile.frame && tile.frame.side === 'x') drawFrameOnWall(tile.x, tile.y, 'x', tile.frame.id);
    }

    ctx.beginPath();
    ctx.moveTo(x, y + quadradimHeight / 2);
    ctx.lineTo(x + quadradimWidth / 2, y);
    ctx.lineTo(x + quadradimWidth, y + quadradimHeight / 2);
    ctx.lineTo(x + quadradimWidth / 2, y + quadradimHeight);
    ctx.closePath();
    ctx.fillStyle = tile.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
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
                const width = 50;
                const height = 56;
                const offsetY = -45;

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

// --- 5. RENDERIZAÇÃO E ATUALIZAÇÃO ---
function render() {
    // Desenha primeiro o fundo estrelado animado
    drawAnimatedBackground();

    // Depois desenha o jogo isométrico por cima
    drawMap();
    drawPlayer();
}

function checkPortal() {
    const tile = map[Math.round(player.y)]?.[Math.round(player.x)];
    if (tile?.type === "obj:portal") {
        let portalCoord = null;
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                if (map[y][x]?.type === "obj:portal") {
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

// --- 6. EVENTOS E UI ---
canvas.addEventListener("click", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Percorre o mapa para detectar cliques
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tile = map[y][x];

            // 1. PRIORIDADE: Verificar se clicou na parede onde tem o Quadro
            if (tile.frame) {
                if (isPointInWall(mouseX, mouseY, x, y, tile.frame.side)) {
                    if (typeof artGallery !== 'undefined') {
                        const art = artGallery[tile.frame.id];
                        if (art) {
                            openFrameModal(art.url, art.titulo || art.title, art.desc || art.description);
                            return;
                        }
                    }
                }
            }

            // 2. Verificar se clicou no chão (Tiles e Objetos no chão)
            if (isPointConvert(mouseX, mouseY, x, y)) {
                // Verificar Clique em Objetos (Jukebox, etc)
                if (tile.type.startsWith("obj:")) {
                    const [_, nome, modo, conteudo] = tile.type.split(":");
                    if (modo === "onClick") {
                        if (nome === "jukebox") {
                            openModal("Jukebox", "", true);
                        } else {
                            openModal(nome.charAt(0).toUpperCase() + nome.slice(1), conteudo);
                        }
                        return;
                    }
                }

                // Caminhada Normal
                closeModal();
                target.x = x;
                target.y = y;
                return;
            }
        }
    }
});
// 7. Funções de UI
function openPatchNotesSection() { document.getElementById('patch-notes').style.display = 'block'; }
function closePatchNotes() { document.getElementById('patch-notes').style.display = 'none'; }
function openInfoModal(t, txt) {
    const m = document.querySelector('.modal-info');
    m.style.display = 'block';
    m.querySelector('.modal-text-info').innerHTML = `<b>${t}</b><br>${txt}`;
}
function closeInfoModal() { document.querySelector('.modal-info').style.display = 'none'; }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

// Função para abrir modal de quadros
function openFrameModal(imageUrl, title, description) {
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    
    modalText.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 1.3em; margin-bottom: 12px; font-weight: bold;">
                🖼️ ${title}
            </div>
            <div style="margin: 12px 0;">
                <img src="${imageUrl}" 
                     style="max-width: 280px; max-height: 200px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);" 
                     alt="${title}">
            </div>
            <div style="font-size: 0.95em; margin-top: 10px; line-height: 1.3;">
                ${description}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Controle da música de fundo
function toggleBackgroundMusic() {
    const statusSpan = document.getElementById('bg-music-status');
    
    if (musicSystem.backgroundAudio.paused) {
        musicSystem.backgroundAudio.play().catch(console.log);
        if (statusSpan) {
            statusSpan.textContent = 'ON';
            statusSpan.style.color = '#4caf50';
        }
    } else {
        musicSystem.backgroundAudio.pause();
        if (statusSpan) {
            statusSpan.textContent = 'OFF';
            statusSpan.style.color = '#f44336';
        }
    }
}


window.onload = () => {
    preloadArt();
    update();
};