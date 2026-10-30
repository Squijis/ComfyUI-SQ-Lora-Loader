import asyncio
import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock


class Routes:
    def get(self, _path):
        return lambda handler: handler

    post = get


class Request:
    def __init__(self, name, body=None):
        self.query = {"name": name}
        self.body = body

    async def json(self):
        return self.body


class ForgeMetadataTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        folder_paths = types.ModuleType("folder_paths")
        comfy = types.ModuleType("comfy")
        comfy.sd = types.ModuleType("comfy.sd")
        server = types.ModuleType("server")
        server.PromptServer = types.SimpleNamespace(instance=types.SimpleNamespace(routes=Routes()))
        aiohttp = types.ModuleType("aiohttp")
        aiohttp.web = types.SimpleNamespace(json_response=lambda data: data)
        cls.module_patch = mock.patch.dict(sys.modules, {
            "folder_paths": folder_paths,
            "comfy": comfy,
            "comfy.sd": comfy.sd,
            "server": server,
            "aiohttp": aiohttp,
        })
        cls.module_patch.start()
        spec = importlib.util.spec_from_file_location("sq_lora_loader_test", Path(__file__).resolve().parents[1] / "__init__.py")
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)
        cls.folder_paths = folder_paths

    @classmethod
    def tearDownClass(cls):
        cls.module_patch.stop()

    def test_forge_fields_round_trip_without_losing_other_metadata(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as directory:
            lora = Path(directory) / "Akiya.safetensors"
            lora.write_bytes(b"")
            forge_path = lora.with_suffix(".json")
            legacy_path = lora.with_suffix(".sq_lora.json")
            forge_path.write_text(json.dumps({
                "description": "Forge description",
                "sd version": "zit",
                "activation text": "Forge activation",
                "preferred weight": 0.7,
                "negative text": "bad quality",
                "notes": "Forge notes",
                "unrelated": {"keep": True},
            }), encoding="utf-8")
            legacy_path.write_text(json.dumps({
                "url": "https://example.test/lora",
                "triggers": "Old trigger",
                "notes": "Old notes",
                "strength": 1.25,
            }), encoding="utf-8")
            self.folder_paths.get_full_path = lambda _kind, _name: str(lora)
            self.folder_paths.get_filename_list = lambda _kind: [lora.name]

            info = asyncio.run(self.module.get_lora_info(Request(lora.name)))
            self.assertEqual(info["activation_text"], "Forge activation")
            self.assertEqual(info["notes"], "Forge notes")
            self.assertNotIn("sd_version", info)
            self.assertNotIn("preferred_weight", info)
            self.assertEqual(info["url"], "https://example.test/lora")
            self.assertEqual(info["strength"], 1.25)
            gallery = asyncio.run(self.module.get_loras(Request(lora.name)))
            self.assertEqual(gallery[0]["triggers"], "Forge activation")

            body = {
                "name": lora.name,
                "description": "Updated description",
                "sd_version": "xl",
                "activation_text": "Updated activation",
                "preferred_weight": 0.9,
                "negative_text": "Updated negative",
                "notes": "Updated notes",
                "url": "https://example.test/new",
                "strength": 1.1,
            }
            result = asyncio.run(self.module.save_lora_info(Request(lora.name, body)))
            self.assertEqual(result["status"], "success")
            saved_forge = json.loads(forge_path.read_text(encoding="utf-8"))
            self.assertEqual(saved_forge["unrelated"], {"keep": True})
            self.assertEqual(saved_forge["description"], "Updated description")
            self.assertEqual(saved_forge["sd version"], "zit")
            self.assertEqual(saved_forge["activation text"], "Updated activation")
            self.assertEqual(saved_forge["preferred weight"], 0.7)
            self.assertEqual(saved_forge["negative text"], "Updated negative")
            self.assertEqual(saved_forge["notes"], "Updated notes")
            saved_legacy = json.loads(legacy_path.read_text(encoding="utf-8"))
            self.assertEqual(saved_legacy["url"], "https://example.test/new")
            self.assertEqual(saved_legacy["strength"], 1.1)

            saved_forge["activation text"] = ""
            forge_path.write_text(json.dumps(saved_forge), encoding="utf-8")
            gallery = asyncio.run(self.module.get_loras(Request(lora.name)))
            self.assertEqual(gallery[0]["triggers"], "")

            forge_path.unlink()
            info = asyncio.run(self.module.get_lora_info(Request(lora.name)))
            self.assertEqual(info["activation_text"], "Updated activation")
            self.assertEqual(info["notes"], "Updated notes")


if __name__ == "__main__":
    unittest.main()
