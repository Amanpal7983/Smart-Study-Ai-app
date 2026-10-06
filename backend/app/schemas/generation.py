from pydantic import BaseModel, Field, field_validator

class AssessmentRequest(BaseModel):
    subject: str
    level: str
    examDate: str
    goals: str = ""

class PlannerRequest(BaseModel):
    subjects: list[str]
    hoursPerDay: int | float = 3
    intensity: str = "Medium"
    startDate: str = ""
    examDate: str = ""

class MaterialsRequest(BaseModel):
    subject: str
    topic: str
    type: str = "Study Notes"

class SaveRequest(BaseModel):
    saved: bool
