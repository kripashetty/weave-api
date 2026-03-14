from app.shared.encryption import decrypt, encrypt


def test_encrypt_round_trip() -> None:
    value = "secret"
    encrypted = encrypt(value)
    assert encrypted.ok is True
    decrypted = decrypt(encrypted.value)
    assert decrypted.ok is True
    assert decrypted.value == value
