# ComfyUI-SQ-Lora-Loader

## 🚀 Features

* 🖼 **Visual Gallery:** Convenient LoRA selection interface featuring a card grid with preview images (supports `.png`, `.jpg`, `.jpeg`, `.webp`).

* 📂 **Categorization:** Automatic sorting of LoRA models based on subfolders inside your `models/loras` directory.

* 🔍 **Smart Search & Zoom:** Quick search by filename or display name, alongside flexible card scaling in the gallery.

* ⚡ **Quick Trigger Words Copy:** Easily copy trigger words to your clipboard with a single click directly from the preview card.

* ⚙️ **Detailed Info per LoRA:** A dedicated modal window (`i` button) for each file where you can configure and save:

  * Source URL (Civitai, etc.).

  * Trigger words.

  * Default strength.

  * Personal notes.

* 📤 **On-the-Fly Preview Upload:** The `+` button on each card lets you quickly upload or update preview images directly inside the ComfyUI interface.

* 🎛 **Inline Node Controls:** Global toggle (Toggle All), convenient weight (strength) adjustments via step buttons or manual input, and easy row management.

## 📦 Installation

1. Navigate to your **ComfyUI** root directory (typically `ComfyUI/custom_nodes/`).

2. Clone the repository or extract the project folder into `ComfyUI-SQ-Lora-Loader`:

   ```bash
   cd custom_nodes
   git clone https://github.com/your-username/ComfyUI-SQ-Lora-Loader.git
   ```

3. Restart ComfyUI.

## 🛠 Usage

1. Right-click in ComfyUI -> **Add Node** -> **loaders** -> **SQ Lora Loader**.

2. Connect the node to your `MODEL` and `CLIP` pipelines.

3. Click on any empty slot inside the node to open the **LoRA Picker modal**.

4. Use categories and the search bar to find your desired model. Click a card to add it to your active list.

5. Adjust the strength directly on the node or click the `i` icon to set personal trigger words, notes, and links.

## 📁 Configuration Structure

All metadata (URLs, trigger words, notes, and default strength) is saved next to your actual LoRA files as local `.sq_lora.json` sidecar files (e.g., `my_lora.sq_lora.json`), keeping your configurations localized and portable.