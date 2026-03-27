"""Pydantic v2 schemas for the Supabase `items` table."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    type: str
    content: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    type: str | None = None
    content: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None


class Item(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
