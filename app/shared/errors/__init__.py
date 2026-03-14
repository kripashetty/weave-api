from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException


@dataclass
class AppError(Exception):
    message: str
    status_code: int = 500
    code: str = "internal_error"

    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=self.status_code,
            detail={"code": self.code, "message": self.message},
        )


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message=message, status_code=404, code="not_found")


class UnauthorisedError(AppError):
    def __init__(self, message: str = "Unauthorised") -> None:
        super().__init__(message=message, status_code=401, code="unauthorised")


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden") -> None:
        super().__init__(message=message, status_code=403, code="forbidden")


class ConflictError(AppError):
    def __init__(self, message: str = "Conflict") -> None:
        super().__init__(message=message, status_code=409, code="conflict")


class ValidationError(AppError):
    def __init__(self, message: str = "Validation failed") -> None:
        super().__init__(message=message, status_code=400, code="validation_error")


class InternalError(AppError):
    def __init__(self, message: str = "Internal server error") -> None:
        super().__init__(message=message, status_code=500, code="internal_error")
