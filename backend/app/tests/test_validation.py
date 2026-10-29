from app.schemas import ProposalRequest, ProposalSection
from app.validation import render_full_text, validate_proposal

def test_render_full_text():
    p = ProposalSection(opening="Hello", understanding="Need API", approach="Test it",
        relevant_evidence=["Built a prototype"], questions=["Deadline?"], closing="Thanks")
    assert "Hello" in render_full_text(p)
    assert "Deadline?" in render_full_text(p)

def test_missing_evidence_warning():
    req = ProposalRequest(job_description="Build a Python API with AI document search for our product.",
                          skills=["Python", "FastAPI", "AI"])
    p = ProposalSection(opening="I can help with Python.", understanding="You need an API.",
        approach="I will clarify requirements and test the result.", relevant_evidence=[],
        questions=[], closing="Let's discuss scope.")
    assert any(i.code == "NO_EVIDENCE" for i in validate_proposal(req, p))

def test_skill_gap_warning():
    req = ProposalRequest(job_description="Build a Python FastAPI service with AI retrieval.",
        skills=["Python", "FastAPI", "AI"], experience_summary="Built Python APIs.")
    p = ProposalSection(opening="I can help with Python.", understanding="You need an API.",
        approach="I will test the result.", relevant_evidence=["Built Python APIs."],
        questions=[], closing="Let's discuss.")
    assert any(i.code == "SKILLS_NOT_MENTIONED" for i in validate_proposal(req, p))
