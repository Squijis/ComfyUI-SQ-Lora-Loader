# ComfyUI-SQ-Lora-Loader

## 🚀 Features

* 🖼 **Visual Gallery:** Convenient LoRA selection interface featuring a card grid with preview images (supports `.png`, `.jpg`, `.jpeg`, `.webp`).

* 📂 **Categorization:** Automatic sorting of LoRA models based on subfolders inside your `models/loras` directory.

* 🔍 **Gallery controls:** Search by filename or display name, switch between vertical and square cards, sort by name or file modification time, and scale cards from 0.50 to 1.20.

* ⚡ **Quick Trigger Words Copy:** Easily copy trigger words to your clipboard with a single click directly from the preview card.

* ⚙️ **Detailed Info per LoRA:** A dedicated modal window (`i` button) for each file where you can configure and save:

  * Source URL (Civitai, etc.).

  * Activation text / trigger words, description, and negative prompt shared with Forge.

  * Default strength.

  * Personal notes.

* 📤 **On-the-Fly Preview Upload:** The `+` button on each card lets you quickly upload or update preview images directly inside the ComfyUI interface.

* 🎛 **Inline Node Controls:** Global toggle (Toggle All), weight (strength) adjustment by dragging the number, step buttons, or manual input, and easy row management.

## 📦 Installation

1. Navigate to your **ComfyUI** root directory (typically `ComfyUI/custom_nodes/`).

2. Clone the repository or extract the project folder into `ComfyUI-SQ-Lora-Loader`:

   ```bash
   cd custom_nodes
   git clone https://github.com/Squijis/ComfyUI-SQ-Lora-Loader.git
   ```

3. Restart ComfyUI.

## 🛠 Usage

1. Right-click in ComfyUI -> **Add Node** -> **loaders** -> **SQ Lora Loader**.

2. Connect the node to your `MODEL` and `CLIP` pipelines.

3. Click on any empty slot inside the node to open the **LoRA Picker modal**.

4. Use categories, search, view, sort, and size controls to find your desired model. Click a card to add it to your active list.

5. Drag a strength number left or right, click its arrows for 0.05 steps, or click the number to type a value. Click the `i` icon for trigger words, notes, and links.

## 📁 Configuration Structure

Forge-compatible fields are read from and saved to the LoRA's `.json` file (e.g., `my_lora.json`), preserving other keys already in that file. ComfyUI-specific URL and default strength remain in `.sq_lora.json`; existing trigger words and notes in that file are used when the corresponding Forge fields are absent.
