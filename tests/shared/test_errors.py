from app.shared.errors import NotFoundError


def test_not_found_maps_to_404() -> None:
    err = NotFoundError("missing")
    assert err.status_code == 404
    assert err.code == "not_found"
