"""
Rule-based loan eligibility scoring.
"""

from app.schemas.eligibility import (
    ApprovalStatus,
    EligibilityRequest,
    EligibilityResponse,
    EmploymentType,
)


def _credit_risk(credit_score: int) -> tuple[int, list[str]]:
    if credit_score >= 750:
        return 10, ["Strong credit score (750+)."]
    if credit_score >= 650:
        return 25, ["Acceptable credit score (650–749)."]
    return 45, ["Low credit score (below 650)."]


def _income_risk(income: float) -> tuple[int, list[str]]:
    if income >= 75_000:
        return 5, ["High monthly income (Rs. 75,000+)."]
    if income >= 35_000:
        return 15, ["Moderate monthly income (Rs. 35,000-74,999)."]
    if income >= 20_000:
        return 30, ["Low monthly income (Rs. 20,000-34,999)."]
    return 40, ["Very low monthly income (below Rs. 20,000)."]


def _employment_risk(employment_type: EmploymentType) -> tuple[int, list[str]]:
    match employment_type:
        case EmploymentType.SALARIED:
            return 0, ["Stable salaried employment."]
        case EmploymentType.SELF_EMPLOYED:
            return 15, ["Self-employed — income variability considered."]
        case EmploymentType.CONTRACT:
            return 20, ["Contract employment — shorter job stability."]
        case EmploymentType.UNEMPLOYED:
            return 50, ["No current employment."]


def _approval_from_risk(risk_score: int) -> ApprovalStatus:
    if risk_score <= 35:
        return ApprovalStatus.APPROVED
    if risk_score <= 65:
        return ApprovalStatus.PENDING
    return ApprovalStatus.REJECTED


def evaluate_eligibility(request: EligibilityRequest) -> EligibilityResponse:
    """
    Compute risk score (0–100) and approval from income, credit score, and employment.
    """
    credit_pts, credit_notes = _credit_risk(request.credit_score)
    income_pts, income_notes = _income_risk(request.income)
    employment_pts, employment_notes = _employment_risk(request.employment_type)

    risk_score = min(100, credit_pts + income_pts + employment_pts)
    approval_status = _approval_from_risk(risk_score)

    notes = credit_notes + income_notes + employment_notes

    if approval_status == ApprovalStatus.APPROVED:
        summary = "Applicant meets eligibility criteria."
    elif approval_status == ApprovalStatus.PENDING:
        summary = "Applicant requires manual review before final decision."
    else:
        summary = "Applicant does not meet minimum eligibility criteria."

    reason = f"{summary} {' '.join(notes)}"

    return EligibilityResponse(
        approval_status=approval_status,
        risk_score=risk_score,
        reason=reason.strip(),
    )
