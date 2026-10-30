// Стили для инфо-модального окна
const infoStyle = document.createElement("style");
infoStyle.innerHTML = `
  .sq-info-modal {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.75); z-index: 10005; display: flex;
    justify-content: center; align-items: center; font-family: sans-serif;
  }
  .sq-info-content {
    background: #1e1e1e; width: min(620px, 94vw); max-height: 90vh; overflow-y: auto; border-radius: 10px;
    padding: 16px; display: flex; flex-direction: column; color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6); position: relative; box-sizing: border-box;
  }
  .sq-info-top {
    display: flex; gap: 14px; align-items: flex-start; flex-shrink: 0;
  }
  
  .sq-info-img-box {
    width: 90px; height: 110px; flex-shrink: 0;
    padding: 8px; box-sizing: border-box;
    background: #252525; border: 1px solid #444; border-radius: 8px;
    display: flex; justify-content: center; align-items: center; overflow: hidden;
  }
  .sq-info-img-box img {
    width: 74px; height: 94px; object-fit: cover; border-radius: 4px; background: #111;
  }
  
  .sq-info-right {
    flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0;
  }
  .sq-info-title {
    font-size: 13px; font-weight: bold; word-break: break-all; line-height: 1.3;
    color: #fff; margin-bottom: 2px;
  }
  .sq-info-form {
    display: flex; flex-direction: column; gap: 10px;
    margin-top: 12px;
  }
  .sq-info-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .sq-info-label {
    font-size: 11px; color: #aaa; margin-bottom: -2px;
  }
  
  .sq-info-input {
    width: 100%; min-height: 34px; padding: 6px 10px; background: #2a2a2a; border: 1px solid #444;
    border-radius: 6px; color: #fff; font-size: 12px; outline: none; box-sizing: border-box;
    resize: vertical; font-family: sans-serif; line-height: 1.3;
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

  .sq-info-footer {
    display: flex; justify-content: space-between; align-items: center; margin-top: 10px; flex-shrink: 0;
  }
  .sq-info-footer-text {
    font-size: 10px; color: #aaa; line-height: 1.3; max-width: 350px;
  }
  .sq-info-error { color: #ff8080; font-size: 12px; min-height: 14px; }
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
  let infoData = {};
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
        <img id="sq-info-image" alt="LoRA preview" />
      </div>
      <div class="sq-info-right">
        <div class="sq-info-title" id="sq-info-title"></div>
        <div class="sq-info-label">Forge metadata is stored beside this LoRA in its .json file.</div>
      </div>
    </div>

    <div class="sq-info-form">
      <label class="sq-info-field">
        <span class="sq-info-label">Description</span>
        <textarea class="sq-info-input" id="sq-info-description" rows="2"></textarea>
      </label>
      <label class="sq-info-field">
        <span class="sq-info-label">Activation Text / Trigger Words</span>
        <textarea class="sq-info-input" id="sq-info-activation" rows="2"></textarea>
      </label>
      <label class="sq-info-field">
        <span class="sq-info-label">Negative Prompt</span>
        <textarea class="sq-info-input" id="sq-info-negative" rows="2"></textarea>
      </label>
      <label class="sq-info-field">
        <span class="sq-info-label">Notes</span>
        <textarea class="sq-info-input" id="sq-info-notes" rows="3"></textarea>
      </label>
      <label class="sq-info-field">
        <span class="sq-info-label">URL (ComfyUI)</span>
        <input class="sq-info-input" id="sq-info-url" type="text">
      </label>
      <div class="sq-info-field">
        <span class="sq-info-label">Default Strength for new ComfyUI rows</span>
        <div class="sq-info-strength-container">
          <input type="range" class="sq-info-slider" id="sq-info-strength-range" min="-10" max="10" step="0.05">
          <div class="sq-info-strength-val" id="sq-info-strength-display"></div>
        </div>
      </div>
    </div>
    <div class="sq-info-error" id="sq-info-error"></div>

    <div class="sq-info-footer">
      <div class="sq-info-footer-text">Forge fields use .json; URL and ComfyUI strength use .sq_lora.json.</div>
      <div class="sq-info-buttons-group">
        <button class="sq-info-btn-common" id="sq-info-exit">Exit</button>
        <button class="sq-info-btn-common" id="sq-info-save">Save</button>
      </div>
    </div>
  `;

  modal.appendChild(content);

  content.querySelector("#sq-info-image").src = lora.preview || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23333'><rect width='100%' height='100%'/></svg>";
  content.querySelector("#sq-info-title").textContent = lora.displayName;
  content.querySelector("#sq-info-description").value = infoData.description ?? "";
  content.querySelector("#sq-info-activation").value = infoData.activation_text ?? infoData.triggers ?? "";
  content.querySelector("#sq-info-negative").value = infoData.negative_text ?? "";
  content.querySelector("#sq-info-notes").value = infoData.notes ?? "";
  content.querySelector("#sq-info-url").value = infoData.url ?? "";

  const rangeInput = content.querySelector("#sq-info-strength-range");
  const displayVal = content.querySelector("#sq-info-strength-display");
  rangeInput.value = currentStrength;
  displayVal.textContent = currentStrength.toFixed(2);

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
    const description = content.querySelector("#sq-info-description").value;
    const activation_text = content.querySelector("#sq-info-activation").value;
    const negative_text = content.querySelector("#sq-info-negative").value;
    const notes = content.querySelector("#sq-info-notes").value;
    const strength = parseFloat(rangeInput.value);

    try {
      const response = await fetch("/sq_lora_loader/save_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lora.name, url, description, activation_text, negative_text, notes, strength })
      });
      if (!response.ok) throw new Error(`Save failed (${response.status})`);
      if (typeof onSaveCallback === "function") {
        onSaveCallback(strength, activation_text);
      }
      closeModal();
    } catch (e) {
      content.querySelector("#sq-info-error").textContent = e.message || "Unable to save metadata";
    }
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.body.appendChild(modal);
}
