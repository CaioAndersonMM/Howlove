const UISystem = {
    styles: {
        jukebox: {
            container: `background:#2a2a2a; border:3px solid #ffcc00; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.3); text-align:center; color:#fff; min-width:300px;`,
            title: `font-size:1.4em; font-weight:bold; margin-bottom:12px; text-align:center;`,
            nowPlaying: `font-size:1.1em; color:#ffcc00; margin-bottom:8px;`,
            trackName: `font-size:1.2em; font-weight:bold; margin-bottom:4px;`,
            artist: `font-size:0.9em; color:#ccc; margin-bottom:16px;`,
            controls: `display:flex; gap:10px; justify-content:center; margin-bottom:16px;`,
            buttonSecondary: `padding:8px 12px; background:#555; color:#fff; border:2px solid #ffcc00; border-radius:6px; cursor:pointer;`,
            buttonPrimary: `padding:8px 12px; background:#ffcc00; color:#000; border:2px solid rgb(0, 26, 255); border-radius:6px; cursor:pointer; font-weight:bold;`,
            trackInfo: `font-size:0.8em; color:#aaa;`
        },
       frame: {
            container: `background: #1a1a1a; border: 10px solid #4a301a; border-radius: 4px; padding: 15px; box-shadow: inset 0 0 15px #000, 0 10px 20px rgba(0,0,0,0.5); text-align: center; color: #f0f0f0; max-width: 380px; margin: auto; display: flex; flex-direction: column; align-items: center; gap: 10px;`,
            image: `width: auto; max-width: 100%; height: 180px; border: 4px solid #000; display: block; border-radius: 2px; object-fit: contain; background: #000;`,
            title: `font-family: 'Georgia', serif; font-size: 1em; font-style: italic; color: #e0d0b0; margin: 0;`,
            description: `font-size: 0.8em; line-height: 1.3; color: #bbb; font-family: sans-serif; margin: 0;`
        },
        default: {
            container: `background:#fff; border:2px solid rgb(17, 0, 255); border-radius:8px; padding:12px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:inline-block;`,
            title: `font-size:1.2em; font-weight:bold; margin-bottom:8px;`,
            content: `font-size:1em; color:#444; margin-top:8px;`
        }
    },

    createFrameModal(data) {
        return `
            <div style="${this.styles.frame.container}">
                <img src="${data.url}" style="${this.styles.frame.image}" onerror="this.src='https://placehold.co/100x100?text=Obra+de+Arte'">
                <div style="${this.styles.frame.title}">${data.title}</div>
                <div style="${this.styles.frame.description}">${data.description}</div>
            </div>
        `;
    },

    createJukeboxModal(title) {
        const currentTrack = musicSystem.getCurrentTrack();
        return `
            <div style="${this.styles.jukebox.title}">🎵 ${title} 🎵</div>
            <div style="${this.styles.jukebox.container}">
                <div style="${this.styles.jukebox.nowPlaying}">🎶 Tocando Agora 🎶</div>
                <div style="${this.styles.jukebox.trackName}">${currentTrack.name}</div>
                <div style="${this.styles.jukebox.artist}">${currentTrack.artist}</div>
                <div style="${this.styles.jukebox.controls}">
                    <button onclick="musicSystem.prevTrack(); UISystem.openJukebox();" style="${this.styles.jukebox.buttonSecondary}">⏮️ Anterior</button>
                    <button onclick="musicSystem.isPlaying ? musicSystem.pause() : musicSystem.play(); UISystem.openJukebox();" style="${this.styles.jukebox.buttonPrimary}">${musicSystem.isPlaying ? '⏸️ Pausar' : '▶️ Tocar'}</button>
                    <button onclick="musicSystem.nextTrack(); UISystem.openJukebox();" style="${this.styles.jukebox.buttonSecondary}">⏭️ Próxima</button>
                </div>
                <div style="${this.styles.jukebox.trackInfo}">Faixa ${musicSystem.currentTrack + 1} de ${musicSystem.tracks.length}</div>
            </div>
        `;
    },

    createDefaultModal(title, content) {
        return `
            <div style="${this.styles.default.title}">${title}</div>
            <div style="${this.styles.default.container}">${content ? `<div style="${this.styles.default.content}">${content}</div>` : ""}</div>
        `;
    },

    openFrame(data) {
        const modal = document.getElementById("modal");
        const modalText = document.getElementById("modal-text");
        modalText.innerHTML = this.createFrameModal(data);
        modal.style.display = "block";
    },

    openJukebox() {
        const modal = document.getElementById("modal");
        const modalText = document.getElementById("modal-text");
        modalText.innerHTML = this.createJukeboxModal("Jukebox");
        modal.style.display = "block";
    },

    openDefault(title, content = "") {
        const modal = document.getElementById("modal");
        const modalText = document.getElementById("modal-text");
        modalText.innerHTML = this.createDefaultModal(title, content);
        modal.style.display = "block";
    },

    close() {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    }
};

function openModal(title, content = "", isJukebox = false) {
    if (isJukebox) {
        UISystem.openJukebox();
    } else {
        UISystem.openDefault(title, content);
    }
}

function openFrameModal(url, title, description) {
    UISystem.openFrame({ url, title, description });
}

function closeModal() {
    UISystem.close();
}

function openInfoModal(title, message) {
    const modal = document.getElementsByClassName("modal-info")[0];
    const modalText = document.getElementsByClassName("modal-text-info")[0];
    if (!modal || !modalText) return;
    modalText.innerHTML = UISystem.createDefaultModal(title, message);
    modal.style.display = "block";
}

function closeInfoModal() {
    const modal = document.getElementsByClassName("modal-info")[0];
    if (modal) modal.style.display = "none";
}

function openPatchNotesSection() {
    const patchNotesSection = document.getElementById("patch-notes");
    if (patchNotesSection) {
        patchNotesSection.style.display = "block";
        patchNotesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function closePatchNotes() {
    const patchNotesSection = document.getElementById("patch-notes");
    if (patchNotesSection) {
        patchNotesSection.style.display = "none";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}