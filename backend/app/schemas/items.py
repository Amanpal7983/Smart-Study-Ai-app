from typing import Any
from pydantic import BaseModel

class ItemSummary(BaseModel):
    id: int
    type: str
    subject: str
    title: str
    saved: bool
    source: str
    createdAt: str
    result: str | None = None

class ItemDetail(ItemSummary):
    input: Any
    output: Any
