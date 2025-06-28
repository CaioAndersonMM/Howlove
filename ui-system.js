const UISystem = {
  styles: {
    jukebox: {
      container: `
        background:#2a2a2a;
        border:3px solid #ffcc00;
        border-radius:12px;
        padding:20px;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        text-align:center;
        color:#fff;
        min-width:300px;
      `,
      title: `
        font-size:1.4em;
        font-weight:bold;
        margin-bottom:12px;
        text-align:center;
      `,
      nowPlaying: `
        font-size:1.1em;
        color:#ffcc00;
        margin-bottom:8px;
      `,
      trackName: `
        font-size:1.2em;
        font-weight:bold;
        margin-bottom:4px;
      `,
      artist: `
        font-size:0.9em;
        color:#ccc;
        margin-bottom:16px;
      `,
      controls: `
        display:flex;
        gap:10px;
        justify-content:center;
        margin-bottom:16px;
      `,
      buttonSecondary: `
        padding:8px 12px;
        background:#555;
        color:#fff;
        border:2px solid #ffcc00;
        border-radius:6px;
        cursor:pointer;
      `,
      buttonPrimary: `
        padding:8px 12px;
        background:#ffcc00;
        color:#000;
        border:2px solidrgb(0, 26, 255);
        border-radius:6px;
        cursor:pointer;
        font-weight:bold;
      `,
      trackInfo: `
        font-size:0.8em;
        color:#aaa;
      `
    },
    default: {
      container: `
        background:#fff;
        border:2px solidrgb(17, 0, 255);
        border-radius:8px;
        padding:12px 16px;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);
        display:inline-block;
      `,
      title: `
        font-size:1.2em;
        font-weight:bold;
        margin-bottom:8px;
      `,
      content: `
        font-size:1em;
        color:#444;
        margin-top:8px;
      `
    }
  },

  createJukeboxModal(title) {
    const currentTrack = musicSystem.getCurrentTrack();
    return `
      <div style="${this.styles.jukebox.title}">
        🎵 ${title} 🎵
      </div>
      <div style="${this.styles.jukebox.container}">
        <div style="${this.styles.jukebox.nowPlaying}">
          🎶 Tocando Agora 🎶
        </div>
        <div style="${this.styles.jukebox.trackName}">
          ${currentTrack.name}
        </div>
        <div style="${this.styles.jukebox.artist}">
          ${currentTrack.artist}
        </div>
        <div style="${this.styles.jukebox.controls}">
          <button onclick="musicSystem.prevTrack(); UISystem.openJukebox();" 
                  style="${this.styles.jukebox.buttonSecondary}">
            ⏮️ Anterior
          </button>
          <button onclick="musicSystem.isPlaying ? musicSystem.pause() : musicSystem.play(); UISystem.openJukebox();" 
                  style="${this.styles.jukebox.buttonPrimary}">
            ${musicSystem.isPlaying ? '⏸️ Pausar' : '▶️ Tocar'}
          </button>
          <button onclick="musicSystem.nextTrack(); UISystem.openJukebox();" 
                  style="${this.styles.jukebox.buttonSecondary}">
            ⏭️ Próxima
          </button>
        </div>
        <div style="${this.styles.jukebox.trackInfo}">
          Faixa ${musicSystem.currentTrack + 1} de ${musicSystem.tracks.length}
        </div>
      </div>
    `;
  },

  createDefaultModal(title, content) {
    return `
      <div style="${this.styles.default.title}">
        ${title}
      </div>
      <div style="${this.styles.default.container}">
        ${content ? `<div style="${this.styles.default.content}">${content}</div>` : ""}
      </div>
    `;
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

function closeModal() {
  UISystem.close();
}

function openInfoModal(title, message) {
    const modal = document.getElementsByClassName("modal-info")[0];
    const modalText = document.getElementsByClassName("modal-text-info")[0];
    
    if (!modal || !modalText) {
        console.error("Elementos do modal-info não encontrados!");
        console.log("modal:", modal, "modalText:", modalText);
        return;
    }
    
    modalText.innerHTML = UISystem.createDefaultModal(title, message);
    modal.style.display = "block";
}

function closeInfoModal() {
    const modal = document.getElementsByClassName("modal-info")[0];
    if (modal) {
        modal.style.display = "none";
    }
}

// Funções para Patch Notes
function openPatchNotesSection() {
    const patchNotesSection = document.getElementById("patch-notes");
    if (patchNotesSection) {
        patchNotesSection.style.display = "block";
        // Scroll suave para a seção
        patchNotesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function closePatchNotes() {
    const patchNotesSection = document.getElementById("patch-notes");
    if (patchNotesSection) {
        patchNotesSection.style.display = "none";
        // Volta para o topo da página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
