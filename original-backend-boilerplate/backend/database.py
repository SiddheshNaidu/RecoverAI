"""Supabase client singleton — reads SUPABASE_URL and SUPABASE_KEY from environment."""

import os
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_supabase: Optional[Client] = None


def get_supabase() -> Client:
    """Return a single shared Supabase client (lazy init)."""
    global _supabase
    if _supabase is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set (e.g. in .env)"
            )
        _supabase = create_client(url, key)
    return _supabase
