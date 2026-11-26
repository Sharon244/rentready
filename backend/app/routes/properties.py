from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai_service import analyse_property_listing

router = APIRouter()

DEMO = [
    {
        "id": "demo-1",
        "title": "Example shared flat near the city centre",
        "location": "York",
        "monthly_rent": 575,
        "bedrooms": 1,
        "description": "Illustrative listing only; not a real property.",
        "is_demo": True
    },
    {
        "id": "demo-2",
        "title": "Example studio apartment",
        "location": "York",
        "monthly_rent": 725,
        "bedrooms": 1,
        "description": "Illustrative listing only; not a real property.",
        "is_demo": True
    },
    {
        "id": "demo-3",
        "title": "Example two-bedroom house share",
        "location": "Leeds",
        "monthly_rent": 490,
        "bedrooms": 2,
        "description": "Illustrative listing only; not a real property.",
        "is_demo": True
    }
]


class PropertyAnalysisRequest(BaseModel):
    title: str = Field(default="", max_length=300)
    location: str = Field(default="", max_length=200)
    monthly_rent: str = Field(default="", max_length=100)
    listing_text: str = Field(default="", max_length=12000)
    landlord_message: str = Field(default="", max_length=6000)


@router.get("/")
def properties(location: str | None = None):
    items = [
        p for p in DEMO
        if not location or location.lower() in p["location"].lower()
    ]

    return {
        "notice": "Demo data only. These are not live or verified property listings.",
        "properties": items
    }


@router.post("/check")
async def check_property(request: PropertyAnalysisRequest):
    if not request.listing_text.strip() and not request.landlord_message.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide a property description or landlord message."
        )

    try:
        result = await analyse_property_listing(
            title=request.title,
            location=request.location,
            monthly_rent=request.monthly_rent,
            listing_text=request.listing_text,
            landlord_message=request.landlord_message
        )

        return result

    except Exception as error:
        print(f"Property analysis error: {error}")

        raise HTTPException(
            status_code=502,
            detail="The property analysis service could not complete your request. Please try again."
        )
