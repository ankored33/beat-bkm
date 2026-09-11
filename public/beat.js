// 「殴る」機能。jQuery / SoundJS を使わず Web Audio API のみで実装する。
// iOS Safari は無音状態で作った AudioContext がユーザー操作なしには鳴らない
// ことがあるため、チェックボックスON（ユーザー操作）のタイミングで
// AudioContext を作る/resumeする。クラシック版がスマホで音が鳴らなかった
// 原因はおそらくこれ（MODERNIZATION_PLAN.md 参照）。

(function () {
  "use strict";

  const SOUND_FILES = {
    beat0: "/sound/beat00.mp3",
    beat1: "/sound/beat01.mp3",
    beat2: "/sound/beat02.mp3",
    beat3: "/sound/beat03.mp3",
    scream0: "/sound/scream00.mp3",
    scream1: "/sound/scream01.mp3",
    scream2: "/sound/scream02.mp3",
    scream3: "/sound/scream03.mp3",
    scream4: "/sound/scream04.mp3",
    scream5: "/sound/scream05.mp3",
    "rival-cool": "/sound/rival/cool/die.mp3",
    "rival-hero": "/sound/rival/hero/die.mp3",
    "rival-priest": "/sound/rival/priest/die.mp3",
    "rival-witch": "/sound/rival/witch/die.mp3",
  };

  class SoundBank {
    constructor(base) {
      this.base = base;
      this.ctx = null;
      this.buffers = {};
      this.loaded = null;
    }

    // ユーザー操作の中から呼ぶこと（AudioContext 生成/resumeにジェスチャーが要る）
    unlock() {
      if (!this.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return Promise.resolve();
        this.ctx = new Ctx();
        this.loaded = this.loadAll();
      }
      if (this.ctx.state === "suspended") {
        return this.ctx.resume().then(() => this.loaded);
      }
      return this.loaded;
    }

    async loadAll() {
      const entries = Object.entries(SOUND_FILES);
      await Promise.all(
        entries.map(async ([id, path]) => {
          try {
            const res = await fetch(this.base + path);
            const bytes = await res.arrayBuffer();
            this.buffers[id] = await this.ctx.decodeAudioData(bytes);
          } catch (e) {
            // 1つの音声が読めなくても他の音は鳴らしたいので握りつぶす
            console.warn("[beat-bkm] sound load failed:", id, e);
          }
        })
      );
    }

    play(id) {
      const buffer = this.buffers[id];
      if (!this.ctx || !buffer) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.2; // クラシック版と同じ音量
      source.connect(gain).connect(this.ctx.destination);
      source.start(0);
    }
  }

  function pick(n) {
    return Math.floor(Math.random() * n);
  }

  function rivalKind(user) {
    const c = (user || "").trim().charAt(0).toLowerCase();
    if (c >= "a" && c <= "g") return "cool";
    if (c >= "h" && c <= "n") return "hero";
    if (c >= "o" && c <= "u") return "priest";
    return "witch";
  }

  function flyAway(item) {
    const dx = Math.round(Math.random() * 260 - 60) + "px";
    const dy = Math.round(Math.random() * 80 + 40) * -1 + "px";
    item.style.setProperty("--dx", dx);
    item.style.setProperty("--dy", dy);
    item.classList.add("hit");
    item.addEventListener("transitionend", () => item.remove(), { once: true });
  }

  function init() {
    const list = document.getElementById("bkm-list");
    const toggle = document.getElementById("beat-toggle-input");
    if (!list || !toggle) return; // ブコメ一覧ページ以外では何もしない

    const base = document.body.dataset.base || "";
    const sounds = new SoundBank(base);
    const counter = document.getElementById("bkm-remaining-figure");
    let remaining = list.children.length;
    let enabled = false;

    toggle.addEventListener("change", () => {
      enabled = toggle.checked;
      Array.from(list.children).forEach((li) => li.classList.toggle("beatable", enabled));
      if (enabled) sounds.unlock();
    });

    list.addEventListener("click", (event) => {
      if (!enabled) return;
      const item = event.target.closest(".bkm-item");
      if (!item || item.classList.contains("hit")) return;

      const commentText = item.querySelector(".bkm-comment")?.textContent || "";
      const userText = item.querySelector(".bkm-user")?.textContent || "";
      const len = commentText.length;

      if (len <= 40) {
        sounds.play("beat" + pick(4));
      } else if (len <= 100) {
        sounds.play("scream" + pick(6));
      } else {
        item.classList.add("defeated");
        sounds.play("rival-" + rivalKind(userText));
      }

      flyAway(item);

      remaining = Math.max(0, remaining - 1);
      if (counter) counter.textContent = String(remaining);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
