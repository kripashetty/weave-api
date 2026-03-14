from __future__ import annotations

import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import settings
from app.shared.errors import AppError, InternalError, ValidationError
from app.shared.result import Err, Result, err, ok


def _load_key() -> Result[bytes, AppError]:
    if len(settings.encryption_key) != 64:
        return err(ValidationError("ENCRYPTION_KEY must be a 64-character hex string"))
    try:
        return ok(bytes.fromhex(settings.encryption_key))
    except ValueError:
        return err(ValidationError("ENCRYPTION_KEY must be valid hex"))


def encrypt(plaintext: str) -> Result[str, AppError]:
    key_result = _load_key()
    if isinstance(key_result, Err):
        return err(key_result.error)

    try:
        iv = os.urandom(12)
        aes = AESGCM(key_result.value)
        ciphertext = aes.encrypt(iv, plaintext.encode("utf-8"), None)
        token = base64.urlsafe_b64encode(iv + ciphertext).decode("utf-8")
        return ok(token)
    except Exception as exc:  # pragma: no cover
        return err(InternalError(f"Encryption failed: {exc}"))


def decrypt(token: str) -> Result[str, AppError]:
    key_result = _load_key()
    if isinstance(key_result, Err):
        return err(key_result.error)

    try:
        payload = base64.urlsafe_b64decode(token.encode("utf-8"))
        iv, ciphertext = payload[:12], payload[12:]
        aes = AESGCM(key_result.value)
        plaintext = aes.decrypt(iv, ciphertext, None).decode("utf-8")
        return ok(plaintext)
    except Exception as exc:  # pragma: no cover
        return err(InternalError(f"Decryption failed: {exc}"))
