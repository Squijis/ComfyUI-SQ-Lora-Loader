import { app } from "../../scripts/app.js";
import { openLoraInfoModal } from "./sq_lora_info.js";

const style = document.createElement("style");
style.innerHTML = `
  .sq-lora-modal {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.75); z-index: 10000; display: flex;
    justify-content: center; align-items: center; font-family: sans-serif;
  }
  .sq-lora-content {
    background: #1e1e1e; width: 80vw; height: 85vh; border-radius: 10px;
    padding: 20px; display: flex; flex-direction: column; color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .sq-lora-header-row {
    display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-shrink: 0; flex-wrap: wrap;
  }
  .sq-lora-search {
    flex: 1; min-width: 180px; padding: 10px 14px; background: #2a2a2a; border: 1px solid #444;
    border-radius: 6px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box;
  }
  .sq-lora-search:focus { border-color: #66c0f4; }
  .sq-gallery-control {
    background: #2a2a2a; border: 1px solid #444; border-radius: 6px;
    color: #ddd; padding: 8px 10px; font-size: 12px; cursor: pointer; flex-shrink: 0;
  }
  .sq-gallery-control:hover, .sq-gallery-control:focus-visible { border-color: #66c0f4; color: #fff; }
  .sq-gallery-control.active { background: #007acc; border-color: #007acc; color: #fff; }
  
  .sq-zoom-container {
    display: flex; align-items: center; gap: 8px; background: #2a2a2a; border: 1px solid #444;
    padding: 8px 12px; border-radius: 6px; flex-shrink: 0;
  }
  .sq-zoom-slider {
    width: 190px; accent-color: #007acc; cursor: pointer; height: 4px; background: #444; border-radius: 2px;
  }
  .sq-zoom-val {
    font-size: 12px; color: #ccc; width: 35px; text-align: right; font-variant-numeric: tabular-nums;
  }

  .sq-lora-tabs {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; flex-shrink: 0;
    max-height: 80px; overflow-y: auto; padding-bottom: 4px;
  }
  .sq-lora-tab {
    background: #2a2a2a; border: 1px solid #444; border-radius: 4px; color: #ccc;
    padding: 6px 12px; font-size: 12px; cursor: pointer; transition: all 0.15s ease;
  }
  .sq-lora-tab:hover { background: #3a3a3a; color: #fff; border-color: #66c0f4; }
  .sq-lora-tab.active { background: #007acc; color: #fff; border-color: #007acc; font-weight: bold; }

  .sq-lora-grid {
    display: grid; 
    justify-content: center;
    align-content: start;
    gap: 15px; overflow-y: auto; flex: 1; padding: 12px 5px;
  }
  .sq-lora-card {
    background: #282828; border-radius: 6px; overflow: hidden; cursor: pointer;
    border: 2px solid transparent; transition: all 0.15s ease; position: relative;
  }
  .sq-lora-card:hover { border-color: #007acc; transform: translateY(-2px); z-index: 2; }
  .sq-lora-card:hover .sq-info-btn,
  .sq-lora-card:hover .sq-upload-btn { opacity: 1; }
  .sq-lora-card img { width: 100%; height: 100%; object-fit: cover; background: #111; display: block; }
  
  .sq-card-overlay { 
    position: absolute; bottom: 0; left: 0; width: 100%; 
    padding: 14px 8px 8px 8px; box-sizing: border-box;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0) 100%);
    display: flex; flex-direction: column; gap: 5px;
  }
  .sq-card-title { 
    font-size: 11px; font-weight: bold; text-align: left; color: #fff;
    word-break: break-all; line-height: 1.2;
  }
  
  .sq-card-triggers { 
    font-size: 10px; text-align: left; color: #aaa;
    background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 3px 6px; border-radius: 4px; width: fit-content; max-width: 100%;
    word-break: break-all; line-height: 1.2; cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    box-sizing: border-box;
  }
  .sq-card-triggers:hover {
    background: rgba(0, 122, 204, 0.9);
    border-color: #66c0f4;
    color: #fff;
  }

  .sq-info-btn {
    position: absolute; top: 4px; right: 4px; width: 24px; height: 24px;
    background: rgba(0, 0, 0, 0.75); border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 6px; color: #fff; font-size: 14px; font-weight: bold;
    display: flex; justify-content: center; align-items: center; cursor: pointer;
    opacity: 0; transition: opacity 0.2s ease, background 0.15s ease; z-index: 5;
    box-shadow: 0 2px 5px rgba(0,0,0,0.4);
  }
  .sq-info-btn:hover { background: rgba(0, 122, 204, 0.95); border-color: #66c0f4; transform: scale(1.05); }

  .sq-upload-btn {
    position: absolute; top: 4px; right: 32px; width: 24px; height: 24px;
    background: rgba(0, 0, 0, 0.75); border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 6px; color: #fff; font-size: 15px; font-weight: bold;
    display: flex; justify-content: center; align-items: center; cursor: pointer;
    opacity: 0; transition: opacity 0.2s ease, background 0.15s ease; z-index: 5;
    box-shadow: 0 2px 5px rgba(0,0,0,0.4); line-height: 1;
  }
  .sq-upload-btn:hover { background: rgba(0, 122, 204, 0.95); border-color: #66c0f4; transform: scale(1.05); }

  .sq-strength-popup {
    position: fixed; z-index: 10001; background: #1e1e1e; border: 1px solid #444;
    border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.6); font-family: sans-serif; color: #fff;
  }
  .sq-strength-popup label { font-size: 12px; color: #aaa; }
  .sq-strength-popup input {
    width: 70px; background: #2a2a2a; border: 1px solid #555; border-radius: 4px;
    color: #fff; padding: 4px 6px; text-align: center; font-size: 13px; outline: none;
  }
  .sq-strength-popup input:focus { border-color: #66c0f4; }
  .sq-strength-popup button {
    background: #333; border: 1px solid #555; border-radius: 4px; color: #fff;
    padding: 4px 10px; cursor: pointer; font-size: 12px;
  }
  .sq-strength-popup button:hover { background: #444; border-color: #66c0f4; }
`;
document.head.appendChild(style);

app.registerExtension({
  name: "SQ.LoraLoader",
  async nodeCreated(node) {
    if (node.comfyClass !== "SQLoraLoader") return;

    node.loraList = [];
    let allActiveState = true;
    
    if (!node.selectedCategory) {
      node.selectedCategory = "All";
    }

    if (!node.selectedZoom) {
      const savedZoom = localStorage.getItem("sq_lora_loader_zoom");
      node.selectedZoom = savedZoom !== null ? parseFloat(savedZoom) : 1.0;
    }
    node.selectedZoom = Number.isFinite(node.selectedZoom) ? Math.max(0.5, Math.min(1.2, node.selectedZoom)) : 1.0;

    if (!node.size || node.size[0] > 350) {
      node.size[0] = 350;
    }

    function ensureEmptyRow() {
      if (!node.loraList) node.loraList = [];
      if (node.loraList.length === 0 || node.loraList[node.loraList.length - 1].name !== "") {
        node.loraList.push({ active: true, name: "", strength: 1.0 });
      }
      updateNodeSize();
    }

    const widget = node.widgets?.find(w => w.name === "lora_data");
    if (widget && widget.value) {
      try {
        const parsed = JSON.parse(widget.value);
        if (Array.isArray(parsed)) {
          node.loraList = parsed;
        }
      } catch (e) {}
    }
    ensureEmptyRow();

    const origOnConfigure = node.onConfigure;
    node.onConfigure = function(o) {
      if (origOnConfigure) origOnConfigure.apply(this, arguments);
      try {
        if (o && o.widgets_values) {
          const widgetIndex = node.widgets?.findIndex(w => w.name === "lora_data");
          if (widgetIndex !== -1 && o.widgets_values[widgetIndex] !== undefined) {
            const parsed = JSON.parse(o.widgets_values[widgetIndex]);
            if (Array.isArray(parsed)) {
              node.loraList = parsed;
            }
          }
        }
      } catch (e) {}
      ensureEmptyRow();
    };

    async function openLoraPicker(onSelect) {
      const res = await fetch("/sq_lora_loader/get_loras");
      const loras = await res.json();

      const modal = document.createElement("div");
      modal.className = "sq-lora-modal";

      const content = document.createElement("div");
      content.className = "sq-lora-content";

      const headerRow = document.createElement("div");
      headerRow.className = "sq-lora-header-row";

      const search = document.createElement("input");
      search.type = "text";
      search.placeholder = "Search LoRA...";
      search.className = "sq-lora-search";

      let viewMode = localStorage.getItem("sq_lora_loader_view") === "square" ? "square" : "vertical";
      let sortMode = localStorage.getItem("sq_lora_loader_sort") === "date" ? "date" : "name";
      let sortDescending = localStorage.getItem("sq_lora_loader_sort_desc") === "true";

      const viewSelect = document.createElement("select");
      viewSelect.className = "sq-gallery-control";
      viewSelect.title = "Card shape";
      for (const [value, label] of [["vertical", "Vertical"], ["square", "Square"]]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        viewSelect.appendChild(option);
      }
      viewSelect.value = viewMode;

      const nameSort = document.createElement("button");
      nameSort.type = "button";
      nameSort.className = "sq-gallery-control";
      const dateSort = document.createElement("button");
      dateSort.type = "button";
      dateSort.className = "sq-gallery-control";
      function updateSortButtons() {
        nameSort.textContent = `Name ${sortMode === "name" ? (sortDescending ? "↓" : "↑") : ""}`;
        dateSort.textContent = `Date ${sortMode === "date" ? (sortDescending ? "↓" : "↑") : ""}`;
        nameSort.classList.toggle("active", sortMode === "name");
        dateSort.classList.toggle("active", sortMode === "date");
        nameSort.title = "Sort by name; click again to reverse";
        dateSort.title = "Sort by file modification time; click again to reverse";
      }
      updateSortButtons();

      const zoomContainer = document.createElement("div");
      zoomContainer.className = "sq-zoom-container";

      const zoomSlider = document.createElement("input");
      zoomSlider.type = "range";
      zoomSlider.className = "sq-zoom-slider";
      zoomSlider.min = "0.50";
      zoomSlider.max = "1.20";
      zoomSlider.step = "0.01";
      zoomSlider.value = node.selectedZoom;

      const zoomValDisplay = document.createElement("div");
      zoomValDisplay.className = "sq-zoom-val";
      zoomValDisplay.textContent = Number(node.selectedZoom).toFixed(2);

      zoomContainer.appendChild(zoomSlider);
      zoomContainer.appendChild(zoomValDisplay);

      headerRow.appendChild(search);
      headerRow.appendChild(viewSelect);
      headerRow.appendChild(nameSort);
      headerRow.appendChild(dateSort);
      headerRow.appendChild(zoomContainer);

      const tabsContainer = document.createElement("div");
      tabsContainer.className = "sq-lora-tabs";

      const grid = document.createElement("div");
      grid.className = "sq-lora-grid";

      let currentFilter = "";

      const categories = ["All", ...new Set(loras.map(l => l.category))];
      
      if (!categories.includes(node.selectedCategory)) {
        node.selectedCategory = "All";
      }

      function updateGridMetrics() {
        const baseW = 190;
        const currentW = Math.round(baseW * node.selectedZoom);
        const currentH = Math.round((viewMode === "square" ? 190 : 278) * node.selectedZoom);

        grid.style.gridTemplateColumns = `repeat(auto-fill, ${currentW}px)`;

        const cards = grid.querySelectorAll(".sq-lora-card");
        cards.forEach(card => {
          card.style.width = `${currentW}px`;
          card.style.height = `${currentH}px`;
        });
      }

      function render() {
        grid.innerHTML = "";
        
        const filtered = loras.filter(l => {
          const matchesCategory = node.selectedCategory === "All" || l.category === node.selectedCategory;
          const matchesSearch = l.name.toLowerCase().includes(currentFilter.toLowerCase()) || 
                                l.displayName.toLowerCase().includes(currentFilter.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        filtered.sort((a, b) => {
          const byName = a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: "base" });
          const result = sortMode === "date" ? (a.modified - b.modified || byName) : byName;
          return sortDescending ? -result : result;
        });

        const baseW = 190;
        const currentW = Math.round(baseW * node.selectedZoom);
        const currentH = Math.round((viewMode === "square" ? 190 : 278) * node.selectedZoom);
        grid.style.gridTemplateColumns = `repeat(auto-fill, ${currentW}px)`;

        filtered.forEach(lora => {
          const card = document.createElement("div");
          card.className = "sq-lora-card";
          card.style.width = `${currentW}px`;
          card.style.height = `${currentH}px`;

          const img = document.createElement("img");
          img.src = lora.preview || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23333'><rect width='100%' height='100%'/></svg>";

          const overlay = document.createElement("div");
          overlay.className = "sq-card-overlay";

          const label = document.createElement("div");
          label.className = "sq-card-title";
          label.textContent = lora.displayName;
          overlay.appendChild(label);

          if (lora.triggers) {
            const triggersEl = document.createElement("div");
            triggersEl.className = "sq-card-triggers";
            triggersEl.textContent = lora.triggers;
            
            triggersEl.onclick = (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(lora.triggers).then(() => {
                const oldText = triggersEl.textContent;
                triggersEl.textContent = "✓ Copied!";
                triggersEl.style.color = "#fff";
                setTimeout(() => {
                  triggersEl.textContent = oldText;
                  triggersEl.style.color = "";
                }, 1200);
              });
            };

            overlay.appendChild(triggersEl);
          }

          const uploadBtn = document.createElement("div");
          uploadBtn.className = "sq-upload-btn";
          uploadBtn.textContent = "+";
          uploadBtn.title = "Upload new preview image";
          uploadBtn.onclick = (e) => {
            e.stopPropagation();
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/png, image/jpeg, image/webp";
            fileInput.onchange = async (event) => {
              const file = event.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("name", lora.name);
              formData.append("image", file);

              try {
                const response = await fetch("/sq_lora_loader/upload_preview", {
                  method: "POST",
                  body: formData
                });
                if (response.ok) {
                  const result = await response.json();
                  lora.preview = result.preview;
                  img.src = result.preview;
                }
              } catch (err) {
                console.error("Failed to upload preview", err);
              }
            };
            fileInput.click();
          };

          const infoBtn = document.createElement("div");
          infoBtn.className = "sq-info-btn";
          infoBtn.textContent = "i";
          infoBtn.onclick = (e) => {
            e.stopPropagation();
            openLoraInfoModal(lora, (newStrength, newTriggers) => {
              if (newTriggers !== undefined) {
                lora.triggers = newTriggers;
                render();
              }
            });
          };

          card.appendChild(img);
          card.appendChild(uploadBtn);
          card.appendChild(infoBtn);
          card.appendChild(overlay);

          card.onclick = async () => {
            let defaultStrength = 1.0;
            try {
              const infoRes = await fetch(`/sq_lora_loader/get_info?name=${encodeURIComponent(lora.name)}`);
              if (infoRes.ok) {
                const info = await infoRes.json();
                if (info.strength !== undefined) {
                  defaultStrength = parseFloat(info.strength);
                }
              }
            } catch (e) {}

            onSelect(lora.name, defaultStrength);
            document.body.removeChild(modal);
          };

          grid.appendChild(card);
        });
      }

      categories.forEach(cat => {
        const tab = document.createElement("div");
        tab.className = `sq-lora-tab ${cat === node.selectedCategory ? "active" : ""}`;
        tab.textContent = cat === "Root" ? "📁 Root" : cat;
        tab.onclick = () => {
          tabsContainer.querySelectorAll(".sq-lora-tab").forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          node.selectedCategory = cat;
          render();
        };
        tabsContainer.appendChild(tab);
      });

      search.oninput = (e) => {
        currentFilter = e.target.value;
        render();
      };

      viewSelect.onchange = () => {
        viewMode = viewSelect.value;
        localStorage.setItem("sq_lora_loader_view", viewMode);
        updateGridMetrics();
      };

      function changeSort(mode) {
        sortDescending = sortMode === mode ? !sortDescending : mode === "date";
        sortMode = mode;
        localStorage.setItem("sq_lora_loader_sort", sortMode);
        localStorage.setItem("sq_lora_loader_sort_desc", String(sortDescending));
        updateSortButtons();
        render();
      }
      nameSort.onclick = () => changeSort("name");
      dateSort.onclick = () => changeSort("date");

      zoomSlider.oninput = (e) => {
        const val = parseFloat(e.target.value);
        node.selectedZoom = val;
        zoomValDisplay.textContent = val.toFixed(2);
        localStorage.setItem("sq_lora_loader_zoom", val);
        updateGridMetrics();
      };

      content.appendChild(headerRow);
      content.appendChild(tabsContainer);
      content.appendChild(grid);
      modal.appendChild(content);

      modal.onclick = (e) => {
        if (e.target === modal) document.body.removeChild(modal);
      };

      document.body.appendChild(modal);
      search.focus();
      render();
    }

    function openStrengthInput(currentVal, clientX, clientY, onChange) {
      const popup = document.createElement("div");
      popup.className = "sq-strength-popup";
      popup.style.left = `${clientX - 60}px`;
      popup.style.top = `${clientY - 25}px`;

      const label = document.createElement("label");
      label.textContent = "Value";

      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.05";
      input.value = currentVal;

      const okBtn = document.createElement("button");
      okBtn.textContent = "OK";

      popup.appendChild(label);
      popup.appendChild(input);
      popup.appendChild(okBtn);
      document.body.appendChild(popup);

      input.focus();
      input.select();

      function submit() {
        let val = parseFloat(input.value);
        if (!isNaN(val)) {
          onChange(Math.max(-10, Math.min(10, val)));
        }
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
      }

      okBtn.onclick = submit;
      input.onkeydown = (e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") document.body.removeChild(popup);
      };

      popup.onmousedown = (e) => e.stopPropagation();
      
      setTimeout(() => {
        const outsideClick = (e) => {
          if (!popup.contains(e.target)) {
            if (document.body.contains(popup)) document.body.removeChild(popup);
            window.removeEventListener("mousedown", outsideClick);
          }
        };
        window.addEventListener("mousedown", outsideClick);
      }, 100);
    }

    function syncData() {
      const widget = node.widgets?.find(w => w.name === "lora_data");
      if (widget) {
        const validLoras = node.loraList.filter(l => l.name !== "");
        widget.value = JSON.stringify(validLoras);
      }
      node.setDirtyCanvas(true, true);
    }

    function updateNodeSize() {
      const baseHeight = 85;
      const rowHeight = 26;
      node.size[1] = baseHeight + node.loraList.length * rowHeight;
      if (node.size[0] < 350) {
        node.size[0] = 350;
      }
    }

    const origOnResize = node.onResize;
    node.onResize = function(size) {
      const baseHeight = 85;
      const rowHeight = 26;
      const minHeight = baseHeight + node.loraList.length * rowHeight;
      if (size[1] < minHeight) {
        size[1] = minHeight;
      }
      if (origOnResize) {
        return origOnResize.apply(this, arguments);
      }
    };

    node.onDrawForeground = function(ctx) {
      if (node.flags.collapsed) return;

      const currentScale = ctx.getTransform().a;
      if (currentScale < 0.55) {
        return;
      }

      const isBypassed = node.mode === 2 || node.mode === 4 || node.mode === 3;
      ctx.save();
      if (isBypassed) {
        ctx.globalAlpha = 0.4;
      }

      const marginX = 10;
      let startY = 82; 

      ctx.fillStyle = allActiveState ? "#4caf50" : "#555";
      ctx.beginPath();
      ctx.arc(marginX + 8, 62, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#aaa";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Toggle All", marginX + 22, 66);
      ctx.fillText("Strength", node.size[0] - 95, 66);

      node.loraList.forEach((item, index) => {
        const y = startY + index * 26;
        const isEmpty = !item.name;

        ctx.save();
        if (!isEmpty && !item.active) {
          ctx.globalAlpha = 0.4;
        }

        const totalW = node.size[0] - marginX * 2;
        const strW = 56;
        const rightOffset = 35;
        const btnH = 20;
        const btnY = y - 7;

        const btnX = marginX + 22;
        const btnW = totalW - 22 - strW - rightOffset - 6;
        const strX = btnX + btnW + 6;
        const delX = strX + strW + 6;
        const delW = 22;

        if (isEmpty) {
          const emptyX = btnX;
          const emptyW = (strX + strW) - emptyX;

          ctx.fillStyle = "#222";
          ctx.strokeStyle = "#444";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(emptyX, btnY, emptyW, btnH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#888";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("+", emptyX + emptyW / 2, btnY + 14);
        } else {
          ctx.fillStyle = item.active ? "#4caf50" : "#555";
          ctx.beginPath();
          ctx.arc(marginX + 8, y + 3, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#222";
          ctx.strokeStyle = "#444";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(btnX, btnY, btnW, btnH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(btnX, btnY, btnW, btnH, 4);
          ctx.clip();

          ctx.fillStyle = "#DDDDDD";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "left";
          const shortName = item.name.includes("/") ? item.name.substring(item.name.lastIndexOf("/") + 1) : (item.name.includes("\\") ? item.name.substring(item.name.lastIndexOf("\\") + 1) : item.name);
          ctx.fillText(shortName, btnX + 10, btnY + 14);
          ctx.restore();

          ctx.fillStyle = "#222";
          ctx.beginPath();
          ctx.roundRect(strX, btnY, strW, btnH, 4);
          ctx.fill();

          ctx.fillStyle = "#DDDDDD";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`◄ ${item.strength.toFixed(2)} ►`, strX + strW / 2, btnY + 14);

          ctx.fillStyle = "#3a2222";
          ctx.strokeStyle = "#553333";
          ctx.beginPath();
          ctx.roundRect(delX, btnY, delW, btnH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ff6b6b";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✕", delX + delW / 2, btnY + 14);
        }

        ctx.restore();
        ctx.textAlign = "left";
      });

      ctx.restore();
    };

    let strengthDrag = null;

    function finishStrengthDrag(e, openInput = true) {
      if (!strengthDrag) return false;
      const drag = strengthDrag;
      strengthDrag = null;
      window.removeEventListener("mouseup", finishStrengthDrag, true);
      window.removeEventListener("blur", cancelStrengthDrag);
      node.captureInput?.(false);
      if (openInput && !drag.moved) {
        openStrengthInput(drag.item.strength, e.clientX, e.clientY, (newVal) => {
          drag.item.strength = newVal;
          syncData();
        });
      }
      return true;
    }

    function cancelStrengthDrag(e) {
      finishStrengthDrag(e, false);
    }

    node.onMouseMove = function(e) {
      if (!strengthDrag) return false;
      if (e.buttons === 0) return finishStrengthDrag(e);
      const distance = e.clientX - strengthDrag.startX;
      if (Math.abs(distance) >= 3) strengthDrag.moved = true;
      if (strengthDrag.moved) {
        const next = Math.max(-10, Math.min(10, Math.round((strengthDrag.startValue + distance / 300) * 100) / 100));
        if (next !== strengthDrag.item.strength) {
          strengthDrag.item.strength = next;
          syncData();
        }
      }
      return true;
    };

    node.onMouseUp = function(e) {
      return finishStrengthDrag(e);
    };

    node.onMouseDown = function(e, pos) {
      if (node.mode === 2 || node.mode === 4 || node.mode === 3) return false;

      if (app && app.canvas && app.canvas.ds && app.canvas.ds.scale < 0.6) {
        return false;
      }

      const marginX = 10;
      let startY = 82;

      if (pos[0] >= marginX && pos[0] <= marginX + 80 && pos[1] >= 50 && pos[1] <= 72) {
        allActiveState = !allActiveState;
        node.loraList.forEach(item => item.active = allActiveState);
        syncData();
        return true;
      }

      for (const [index, item] of node.loraList.entries()) {
        const y = startY + index * 26;
        const isEmpty = !item.name;

        const totalW = node.size[0] - marginX * 2;
        const strW = 56;
        const rightOffset = 35;
        const btnH = 20;
        const btnY = y - 7;

        const btnX = marginX + 22;
        const btnW = totalW - 22 - strW - rightOffset - 6;
        const strX = btnX + btnW + 6;
        const delX = strX + strW + 6;
        const delW = 22;

        if (isEmpty) {
          const emptyX = btnX;
          const emptyW = (strX + strW) - emptyX;

          if (pos[0] >= emptyX && pos[0] <= emptyX + emptyW && pos[1] >= btnY && pos[1] <= btnY + btnH) {
            openLoraPicker((selectedName, selectedStrength) => {
              item.name = selectedName;
              item.strength = selectedStrength !== undefined ? selectedStrength : 1.0;
              if (index === node.loraList.length - 1) {
                node.loraList.push({ active: allActiveState, name: "", strength: 1.0 });
                updateNodeSize();
              }
              syncData();
            });
            return true;
          }
        } else {
          if (pos[0] >= delX && pos[0] <= delX + delW && pos[1] >= btnY && pos[1] <= btnY + btnH) {
            if (node.loraList.length === 1) {
              node.loraList[0] = { active: allActiveState, name: "", strength: 1.0 };
            } else {
              node.loraList.splice(index, 1);
            }
            updateNodeSize();
            syncData();
            return true;
          }

          if (pos[0] >= marginX && pos[0] <= marginX + 18 && pos[1] >= y - 6 && pos[1] <= y + 12) {
            item.active = !item.active;
            syncData();
            return true;
          }

          if (pos[0] >= btnX && pos[0] <= btnX + btnW && pos[1] >= btnY && pos[1] <= btnY + btnH) {
            openLoraPicker((selectedName, selectedStrength) => {
              item.name = selectedName;
              item.strength = selectedStrength !== undefined ? selectedStrength : 1.0;
              syncData();
            });
            return true;
          }

          if (pos[0] >= strX && pos[0] <= strX + strW && pos[1] >= btnY && pos[1] <= btnY + btnH) {
            const localX = pos[0] - strX;
            if (localX < 18) {
              item.strength = Math.max(-10, item.strength - 0.05);
              syncData();
            } else if (localX > strW - 18) {
              item.strength = Math.min(10, item.strength + 0.05);
              syncData();
            } else {
              strengthDrag = { item, startX: e.clientX, startValue: item.strength, moved: false };
              node.captureInput?.(true);
              window.addEventListener("mouseup", finishStrengthDrag, true);
              window.addEventListener("blur", cancelStrengthDrag);
            }
            return true;
          }
        }
      }
      return false;
    };

    updateNodeSize();
  }
});
