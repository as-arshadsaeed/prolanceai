from typing import Literal
from pydantic import BaseModel, Field, field_validator

Tone = Literal["professional", "friendly", "confident", "technical"]
Length = Literal["short", "medium", "long"]

class ProposalRequest(BaseModel):
    job_description: str = Field(min_length=40, max_length=20000)
    skills: list[str] = Field(min_length=1, max_length=40)
    experience_summary: str = Field(default="", max_length=5000)
    portfolio_evidence: list[str] = Field(default_factory=list, max_length=20)
    hourly_rate: str = Field(default="Negotiable", max_length=100)
    tone: Tone = "confident"
    length: Length = "medium"

    @field_validator("skills")
    @classmethod
    def clean_skills(cls, values: list[str]) -> list[str]:
        cleaned = [v.strip() for v in values if v.strip()]
        if not cleaned:
            raise ValueError("Provide at least one non-empty skill.")
        return cleaned

    @field_validator("portfolio_evidence")
    @classmethod
    def clean_evidence(cls, values: list[str]) -> list[str]:
        return [v.strip() for v in values if v.strip()]

class ProposalSection(BaseModel):
    opening: str
    understanding: str
    approach: str
    relevant_evidence: list[str]
    questions: list[str]
    closing: str

class ValidationIssue(BaseModel):
    severity: Literal["info", "warning", "error"]
    code: str
    message: str

class ProposalResponse(BaseModel):
    proposal_id: str
    proposal: ProposalSection
    full_text: str
    validation_issues: list[ValidationIssue]
    demo_mode: bool
