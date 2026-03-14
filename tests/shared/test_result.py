from app.shared.result import err, ok


def test_ok_wrapper() -> None:
    result = ok(123)
    assert result.ok is True
    assert result.value == 123


def test_err_wrapper() -> None:
    result = err("boom")
    assert result.ok is False
    assert result.error == "boom"
