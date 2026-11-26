from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class AffordabilityRequest(BaseModel):
    monthly_income: float = Field(ge=0)
    rent: float = Field(ge=0)
    electricity_gas: float = Field(default=0, ge=0)
    water: float = Field(default=0, ge=0)
    council_tax: float = Field(default=0, ge=0)
    internet: float = Field(default=0, ge=0)
    food: float = Field(default=0, ge=0)
    transport: float = Field(default=0, ge=0)
    other_expenses: float = Field(default=0, ge=0)
    deposit: float = Field(default=0, ge=0)
    moving_costs: float = Field(default=0, ge=0)

@router.post("/calculate")
def calculate(data: AffordabilityRequest):
    housing = data.rent + data.electricity_gas + data.water + data.council_tax + data.internet
    total = housing + data.food + data.transport + data.other_expenses
    remaining = data.monthly_income - total
    pct = housing / data.monthly_income * 100 if data.monthly_income else 0
    status = "Over budget" if remaining < 0 else (
        "Very tight budget" if data.monthly_income and remaining < data.monthly_income * .10 else "Within budget"
    )
    return {
        "housing_costs": round(housing, 2), "total_expenses": round(total, 2),
        "remaining_income": round(remaining, 2), "housing_percentage": round(pct, 1),
        "initial_moving_cost": round(data.deposit + data.rent + data.moving_costs, 2),
        "status": status,
        "disclaimer": "An estimate based on the figures entered, not financial advice."
    }
