import aiofiles
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import AppException


class StorageService:
    def __init__(self):
        self.local_dir = Path(settings.local_upload_dir)
        self.local_dir.mkdir(parents=True, exist_ok=True)

    async def upload_file(self, file: UploadFile, folder: str) -> str:
        if settings.storage_type == "azure" and settings.azure_storage_connection_string:
            return await self._upload_to_azure(file, folder)
        return await self._save_locally(file, folder)

    async def _save_locally(self, file: UploadFile, folder: str) -> str:
        orig = Path(file.filename or "file").name
        name = f"{uuid.uuid4().hex}_{orig}"
        path = self.local_dir / folder
        path.mkdir(parents=True, exist_ok=True)
        filepath = path / name
        content = await file.read()
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)
        base = settings.local_upload_dir.rstrip("/")
        return f"/{base}/{folder}/{name}"

    async def _upload_to_azure(self, file: UploadFile, folder: str) -> str:
        try:
            from azure.storage.blob import BlobServiceClient
        except ImportError:
            raise AppException("azure-storage-blob not installed", status_code=501)
        ext = Path(file.filename or "").suffix or ".bin"
        blob_name = f"{folder}/{uuid.uuid4().hex}{ext}"
        client = BlobServiceClient.from_connection_string(settings.azure_storage_connection_string)
        container = client.get_container_client("uploads")
        blob = container.get_blob_client(blob_name)
        content = await file.read()
        blob.upload_blob(content, overwrite=True)
        return blob.url

    async def save_upload(self, content: bytes, filename: str, subdir: str = "uploads") -> str:
        if settings.storage_type not in ("local", ""):
            raise AppException("Use upload_file for Azure", status_code=501)
        ext = Path(filename).suffix or ".bin"
        name = f"{uuid.uuid4().hex}{ext}"
        path = self.local_dir / subdir
        path.mkdir(parents=True, exist_ok=True)
        filepath = path / name
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)
        return f"/{settings.local_upload_dir.rstrip('/')}/{subdir}/{name}"

    async def save_avatar(self, content: bytes, filename: str, user_id: str) -> str:
        return await self.save_upload(content, filename, subdir=f"avatars/{user_id}")


storage_service = StorageService()
