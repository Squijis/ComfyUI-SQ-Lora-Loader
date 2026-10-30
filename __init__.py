import os
import json
import tempfile
from urllib.parse import urlencode
import folder_paths
import comfy.sd
from server import PromptServer
from aiohttp import web


def preview_url_for_image(image_path):
    query = urlencode({"path": image_path.replace(os.sep, "/"), "t": os.path.getmtime(image_path)})
    return f"/sq_lora_loader/preview?{query}"


def read_metadata(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"Invalid LoRA metadata: {path}")
    return data


def write_metadata(path, data):
    fd, temp_path = tempfile.mkstemp(prefix=".sq_lora_", suffix=".tmp", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        os.replace(temp_path, path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# Эндпоинт для отдачи картинок прямо из папки loras или рядом с ними
@PromptServer.instance.routes.get("/sq_lora_loader/preview")
async def get_lora_preview(request):
    image_path = request.query.get("path", "")
    if image_path and os.path.exists(image_path):
        return web.FileResponse(image_path)
    return web.Response(status=404)

# Эндпоинт для получения списка LoRA с путями к превью, категориями и метаданными
@PromptServer.instance.routes.get("/sq_lora_loader/get_loras")
async def get_loras(request):
    lora_files = folder_paths.get_filename_list("loras")
    results = []
    
    for lora in lora_files:
        full_path = folder_paths.get_full_path("loras", lora)
        preview_url = None
        
        folder_name = os.path.dirname(lora)
        if not folder_name:
            folder_name = "Root"
        else:
            folder_name = folder_name.replace("\\", "/")

        file_name_only = os.path.basename(lora)
        
        if full_path:
            base_path = os.path.splitext(full_path)[0]
            for ext in [".png", ".jpg", ".jpeg", ".webp", ".preview.png"]:
                img_path = base_path + ext
                if os.path.exists(img_path):
                    preview_url = preview_url_for_image(img_path)
                    break
        
        # Forge хранит activation text в .json, старые данные ComfyUI — в .sq_lora.json.
        triggers = ""
        if full_path:
            base_path = os.path.splitext(full_path)[0]
            try:
                forge_data = read_metadata(base_path + ".json")
            except (OSError, ValueError):
                forge_data = {}
            try:
                legacy_data = read_metadata(base_path + ".sq_lora.json")
            except (OSError, ValueError):
                legacy_data = {}
            triggers = forge_data.get("activation text", legacy_data.get("triggers", ""))
        
        results.append({
            "name": lora,
            "displayName": file_name_only,
            "category": folder_name,
            "preview": preview_url,
            "triggers": triggers,
            "modified": os.path.getmtime(full_path) if full_path and os.path.exists(full_path) else 0
        })
        
    return web.json_response(results)

# Эндпоинт для чтения JSON с информацией о LoRA
@PromptServer.instance.routes.get("/sq_lora_loader/get_info")
async def get_lora_info(request):
    lora_name = request.query.get("name", "")
    if not lora_name:
        return web.Response(status=400)
    
    full_path = folder_paths.get_full_path("loras", lora_name)
    if not full_path:
        return web.json_response({"url": "", "triggers": "", "notes": "", "strength": 1.0})
    
    base_path = os.path.splitext(full_path)[0]
    try:
        forge_data = read_metadata(base_path + ".json")
    except (OSError, ValueError):
        forge_data = {}
    try:
        legacy_data = read_metadata(base_path + ".sq_lora.json")
    except (OSError, ValueError):
        legacy_data = {}

    try:
        strength = float(legacy_data.get("strength", 1.0))
    except (TypeError, ValueError):
        strength = 1.0
    data = {
        "url": legacy_data.get("url", ""),
        "triggers": forge_data.get("activation text", legacy_data.get("triggers", "")),
        "notes": forge_data.get("notes", legacy_data.get("notes", "")),
        "strength": strength,
        "description": forge_data.get("description", ""),
        "activation_text": forge_data.get("activation text", legacy_data.get("triggers", "")),
        "negative_text": forge_data.get("negative text", ""),
    }
    return web.json_response(data)

# Эндпоинт для сохранения JSON с информацией о LoRA
@PromptServer.instance.routes.post("/sq_lora_loader/save_info")
async def save_lora_info(request):
    try:
        body = await request.json()
        lora_name = body.get("name", "")
        if not lora_name:
            return web.Response(status=400)
            
        full_path = folder_paths.get_full_path("loras", lora_name)
        if not full_path:
            return web.Response(status=404)
            
        base_path = os.path.splitext(full_path)[0]
        forge_path = base_path + ".json"
        legacy_path = base_path + ".sq_lora.json"
        forge_data = read_metadata(forge_path)
        legacy_data = read_metadata(legacy_path)

        forge_fields = {
            "description": "description",
            "activation_text": "activation text",
            "negative_text": "negative text",
            "notes": "notes",
        }
        for input_key, forge_key in forge_fields.items():
            if input_key in body:
                forge_data[forge_key] = str(body[input_key])
        if "activation_text" not in body and "triggers" in body:
            forge_data["activation text"] = str(body["triggers"])
        for key in ("url", "strength", "notes"):
            if key in body:
                legacy_data[key] = float(body[key]) if key == "strength" else str(body[key])
        if "activation_text" in body or "triggers" in body:
            legacy_data["triggers"] = str(body.get("activation_text", body.get("triggers", "")))

        write_metadata(forge_path, forge_data)
        write_metadata(legacy_path, legacy_data)
            
        return web.json_response({"status": "success"})
    except Exception as e:
        return web.Response(status=500, text=str(e))

# Эндпоинт для загрузки и сохранения нового превью-изображения LoRA (через FormData)
@PromptServer.instance.routes.post("/sq_lora_loader/upload_preview")
async def upload_preview(request):
    try:
        post = await request.post()
        lora_name = post.get("name")
        image_field = post.get("image")
        
        if not lora_name or not image_field:
            return web.Response(status=400, text="Missing name or image")
            
        full_path = folder_paths.get_full_path("loras", lora_name)
        if not full_path:
            return web.Response(status=404, text="Lora not found")
            
        base_path = os.path.splitext(full_path)[0]
        
        # Удаляем старые превью-файлы с любыми расширениями
        for ext in [".png", ".jpg", ".jpeg", ".webp", ".preview.png"]:
            old_path = base_path + ext
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception:
                    pass

        # Получаем расширение загружаемого файла
        filename = getattr(image_field, "filename", "preview.png")
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".png", ".jpg", ".jpeg", ".webp"]:
            ext = ".png"
            
        target_preview_path = base_path + ext
        
        # Читаем содержимое файла из мультипарт-запроса и сохраняем на диск
        file_bytes = image_field.file.read()
        with open(target_preview_path, "wb") as f:
            f.write(file_bytes)
            
        preview_url = preview_url_for_image(target_preview_path)
        
        return web.json_response({"status": "success", "preview": preview_url})
    except Exception as e:
        return web.Response(status=500, text=str(e))


class SQLoraLoader:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "lora_data": ("STRING", {"default": "[]", "multiline": True, "hidden": True}),
            }
        }

    RETURN_TYPES = ("MODEL", "CLIP")
    RETURN_NAMES = ("MODEL", "CLIP")
    FUNCTION = "process_loras"
    CATEGORY = "loaders"

    def process_loras(self, model, clip, lora_data):
        try:
            loras = json.loads(lora_data)
        except Exception:
            loras = []

        curr_model = model
        curr_clip = clip

        for lora in loras:
            if lora.get("active", True) and lora.get("name"):
                lora_name = lora["name"]
                strength = float(lora.get("strength", 1.0))
                
                lora_path = folder_paths.get_full_path("loras", lora_name)
                if lora_path and os.path.exists(lora_path):
                    curr_model, curr_clip = comfy.sd.load_lora_for_models(
                        curr_model, curr_clip, comfy.utils.load_torch_file(lora_path),
                        strength, strength
                    )

        return (curr_model, curr_clip)

NODE_CLASS_MAPPINGS = {
    "SQLoraLoader": SQLoraLoader
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "SQLoraLoader": "SQ Lora Loader"
}

WEB_DIRECTORY = "./web"
