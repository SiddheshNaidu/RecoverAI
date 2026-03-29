"""Shared limiter instance (works with or without SlowAPI installed)."""

from __future__ import annotations

from typing import Any, Callable

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
except Exception:  # noqa: BLE001
    class _NoopLimiter:
        def shared_limit(self, *_args: Any, **_kwargs: Any) -> Callable:
            def decorator(func: Callable) -> Callable:
                return func

            return decorator

    limiter = _NoopLimiter()
