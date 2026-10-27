// Стили для инфо-модального окна (520x400)
const infoStyle = document.createElement("style");
infoStyle.innerHTML = `
  .sq-info-modal {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.75); z-index: 10005; display: flex;
    justify-content: center; align-items: center; font-family: sans-serif;
  }
  .sq-info-content {
    background: #1e1e1e; width: 520px; height: 400px; border-radius: 10px;
    padding: 16px; display: flex; flex-direction: column; color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6); position: relative; box-sizing: border-box;
  }
  .sq-info-top {
    display: flex; gap: 14px; align-items: flex-start; flex-shrink: 0;
  }
  
  .sq-info-img-box {
    width: 120px; height: 176px; flex-shrink: 0;
    padding: 8px; box-sizing: border-box;
    background: #252525; border: 1px solid #444; border-radius: 8px;
    display: flex; justify-content: center; align-items: center; overflow: hidden;
  }
  .sq-info-img-box img {
    width: 104px; height: 160px; object-fit: cover; border-radius: 4px; background: #111;
  }
  
  .sq-info-right {
    flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0;
  }
  .sq-info-title {
    font-size: 13px; font-weight: bold; word-break: break-all; line-height: 1.3;
    color: #fff; margin-bottom: 2px;
  }
  .sq-info-label {
    font-size: 11px; color: #aaa; margin-bottom: -2px;
  }
  
  .sq-info-input {
    width: 100%; height: 46px; padding: 6px 10px; background: #2a2a2a; border: 1px solid #444;
    border-radius: 6px; color: #fff; font-size: 12px; outline: none; box-sizing: border-box;
    resize: none; font-family: sans-serif; overflow-y: auto; line-height: 1.3;
  }
  .sq-info-input:focus { border-color: #66c0f4; }
  
  .sq-info-strength-container {
    display: flex; align-items: center; gap: 10px; margin-top: 4px; margin-bottom: 2px;
  }
  .sq-info-slider {
    flex: 1; accent-color: #007acc; cursor: pointer; height: 6px; background: #2a2a2a; border-radius: 3px;
  }
  .sq-info-strength-val {
    width: 50px; height: 26px; background: #2a2a2a; border: 1px solid #444; border-radius: 6px;
    color: #fff; font-size: 12px; display: flex; justify-content: center; align-items: center; box-sizing: border-box;
  }

  .sq-info-notes-section {
    display: flex; flex-direction: column; gap: 6px; margin-top: 8px; flex: 1;
  }
  .sq-info-textarea {
    width: 100%; flex: 1; background: #2a2a2a; border: 1px solid #444;
    border-radius: 6px; color: #fff; font-size: 12px; padding: 8px 10px; resize: none;
    outline: none; box-sizing: border-box; font-family: sans-serif; min-height: 60px;
  }
  .sq-info-textarea:focus { border-color: #66c0f4; }

  .sq-info-footer {
    display: flex; justify-content: space-between; align-items: center; margin-top: 10px; flex-shrink: 0;
  }
  .sq-info-footer-text {
    font-size: 9px; color: #777; line-height: 1.2; max-width: 240px;
  }
  .sq-info-buttons-group {
    display: flex; gap: 8px; align-items: center;
  }
  .sq-info-btn-common {
    background: #ff7700; border: none; border-radius: 6px; color: #fff;
    padding: 6px 0; width: 90px; text-align: center; font-weight: bold; cursor: pointer; font-size: 12px;
    transition: background 0.15s ease; box-sizing: border-box;
  }
  .sq-info-btn-common:hover { background: #ff8811; }
`;
document.head.appendChild(infoStyle);

export async function openLoraInfoModal(lora, onSaveCallback) {
  let infoData = { url: "", triggers: "", notes: "", strength: 1.0 };
  try {
    const res = await fetch(`/sq_lora_loader/get_info?name=${encodeURIComponent(lora.name)}`);
    if (res.ok) {
      infoData = await res.json();
    }
  } catch (e) {}

  const modal = document.createElement("div");
  modal.className = "sq-info-modal";

  const content = document.createElement("div");
  content.className = "sq-info-content";

  const currentStrength = typeof infoData.strength === "number" ? infoData.strength : 1.0;

  content.innerHTML = `
    <div class="sq-info-top">
      <div class="sq-info-img-box">
        <img src="${lora.preview || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23333'><rect width='100%' height='100%'/></svg>"}" />
      </div>
      <div class="sq-info-right">
        <div class="sq-info-title">${lora.displayName}</div>
        
        <div class="sq-info-label">URL:</div>
        <textarea class="sq-info-input" id="sq-info-url">${infoData.url || ""}</textarea>
        
        <div class="sq-info-label">Trigger Words:</div>
        <textarea class="sq-info-input" id="sq-info-triggers" maxlength="120">${infoData.triggers || ""}</textarea>
      </div>
    </div>

    <div class="sq-info-label" style="margin-top: 8px;">Strength:</div>
    <div class="sq-info-strength-container">
      <input type="range" class="sq-info-slider" id="sq-info-strength-range" min="-10" max="10" step="0.05" value="${currentStrength}">
      <div class="sq-info-strength-val" id="sq-info-strength-display">${currentStrength.toFixed(2)}</div>
    </div>

    <div class="sq-info-notes-section">
      <div class="sq-info-label">Notes:</div>
      <textarea class="sq-info-textarea" id="sq-info-notes">${infoData.notes || ""}</textarea>
    </div>

    <div class="sq-info-footer">
      <div class="sq-info-footer-text">Configuration files are saved in the "...\\Models\\loras" folder and have the ".json" extension.</div>
      <div class="sq-info-buttons-group">
        <button class="sq-info-btn-common" id="sq-info-exit">Exit</button>
        <button class="sq-info-btn-common" id="sq-info-save">Save</button>
      </div>
    </div>
  `;

  modal.appendChild(content);

  const rangeInput = content.querySelector("#sq-info-strength-range");
  const displayVal = content.querySelector("#sq-info-strength-display");

  rangeInput.oninput = (e) => {
    const val = parseFloat(e.target.value);
    displayVal.textContent = val.toFixed(2);
  };

  const closeModal = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  };

  const exitBtn = content.querySelector("#sq-info-exit");
  exitBtn.onclick = closeModal;

  const saveBtn = content.querySelector("#sq-info-save");
  saveBtn.onclick = async () => {
    const url = content.querySelector("#sq-info-url").value;
    const triggers = content.querySelector("#sq-info-triggers").value;
    const notes = content.querySelector("#sq-info-notes").value;
    const strength = parseFloat(rangeInput.value);

    try {
      await fetch("/sq_lora_loader/save_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lora.name, url, triggers, notes, strength })
      });
      
      // Вызываем колбэк и передаем новые триггеры и силу, чтобы обновить превью на лету
      if (typeof onSaveCallback === "function") {
        onSaveCallback(strength, triggers);
      }
    } catch (e) {}

    closeModal();
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.body.appendChild(modal);
}