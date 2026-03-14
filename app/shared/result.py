from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar, Union

T = TypeVar("T")
E = TypeVar("E")


@dataclass(frozen=True)
class Ok(Generic[T]):  # noqa: UP046
    value: T
    ok: bool = True


@dataclass(frozen=True)
class Err(Generic[E]):  # noqa: UP046
    error: E
    ok: bool = False


Result = Union[Ok[T], Err[E]]  # noqa: UP007


def ok(value: T) -> Ok[T]:  # noqa: UP047
    return Ok(value=value)


def err(error: E) -> Err[E]:  # noqa: UP047
    return Err(error=error)
