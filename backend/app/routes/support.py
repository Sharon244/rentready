from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SupportRequest(BaseModel):
    uk_nation: str = "England"
    situation: str = "private_renter"
    student: bool = False
    income_pressure: bool = False


def resource(name: str, why: str, url: str):
    return {
        "name": name,
        "why": why,
        "url": url
    }


@router.post("/signpost")
def signpost(data: SupportRequest):

    nation = data.uk_nation.strip().lower()
    situation = data.situation.strip().lower()

    items = []

    # General housing advice
    items.append(
        resource(
            "Shelter",
            "Get housing advice about renting, deposits, eviction, "
            "repairs and homelessness.",
            "https://www.shelter.org.uk/"
        )
    )

    items.append(
        resource(
            "Citizens Advice",
            "Get independent advice about housing, benefits, "
            "debt, budgeting and your rights.",
            "https://www.citizensadvice.org.uk/"
        )
    )

    items.append(
        resource(
            "Find your local council",
            "Contact your council about housing options, "
            "homelessness prevention and local support.",
            "https://www.gov.uk/find-local-council"
        )
    )

    # Financial support
    if data.income_pressure:

        items.append(
            resource(
                "GOV.UK benefits calculators",
                "Check whether you may qualify for benefits "
                "or other financial support.",
                "https://www.gov.uk/benefits-calculators"
            )
        )

        items.append(
            resource(
                "Universal Credit housing costs",
                "Find out how Universal Credit can help with "
                "eligible rent and housing costs. Eligibility "
                "depends on your circumstances.",
                "https://www.gov.uk/housing-and-universal-credit"
            )
        )

        if nation == "england":
            items.append(
                resource(
                    "Crisis and Resilience Fund",
                    "Ask your local council about help with "
                    "essential costs and housing payments, "
                    "including possible rent shortfalls, "
                    "deposits and moving costs.",
                    "https://www.gov.uk/cost-living-help-local-council"
                )
            )

        elif nation == "scotland":
            items.append(
                resource(
                    "Scottish Welfare Fund",
                    "Find out whether you can receive a "
                    "Community Care Grant or Crisis Grant.",
                    "https://www.mygov.scot/scottish-welfare-fund"
                )
            )

            items.append(
                resource(
                    "Discretionary Housing Payments",
                    "Ask your council whether additional "
                    "help with housing costs is available.",
                    "https://www.gov.uk/discretionary-housing-payments"
                )
            )

        elif nation == "wales":
            items.append(
                resource(
                    "Discretionary Assistance Fund",
                    "Check whether you can receive emergency "
                    "financial assistance in Wales.",
                    "https://www.gov.wales/discretionary-assistance-fund-daf"
                )
            )

            items.append(
                resource(
                    "Discretionary Housing Payments",
                    "Ask your council about possible additional "
                    "help with eligible housing costs.",
                    "https://www.gov.uk/discretionary-housing-payments"
                )
            )

        elif nation in ("northern ireland", "ni"):
            items.append(
                resource(
                    "Discretionary Support",
                    "Check whether you can get help with "
                    "essential costs through Northern Ireland's "
                    "Discretionary Support scheme.",
                    "https://www.nidirect.gov.uk/articles/discretionary-support"
                )
            )

    # Student support
    if data.student:
        items.append(
            resource(
                "University hardship and welfare support",
                "Contact your university's student support "
                "or welfare team about hardship funds, "
                "emergency financial help and accommodation advice.",
                "https://www.gov.uk/student-finance"
            )
        )

        items.append(
            resource(
                "Students' Union",
                "Ask your Students' Union about independent "
                "housing advice, financial support and "
                "student welfare services.",
                "https://www.nus.org.uk/"
            )
        )

    # Homelessness or risk of eviction
    if any(word in situation for word in (
        "homeless",
        "eviction",
        "threatened",
        "rent_arrears",
        "at_risk"
    )):
        items.append(
            resource(
                "Homelessness and housing options",
                "Contact your local council as soon as possible "
                "if you have nowhere to live or may lose your "
                "home. In England, councils have homelessness "
                "prevention duties for eligible people at risk "
                "of homelessness within 56 days.",
                "https://www.gov.uk/if-youre-homeless-or-at-risk-of-homelessness"
            )
        )

    # Deposit or moving costs
    if any(word in situation for word in (
        "deposit",
        "moving",
        "new_rental"
    )):
        items.append(
            resource(
                "Help with rent deposits and moving costs",
                "Ask your local council about possible help "
                "with deposits, rent in advance and moving costs. "
                "Availability and eligibility vary.",
                "https://www.gov.uk/find-local-council"
            )
        )

    # Repairs and poor housing conditions
    if any(word in situation for word in (
        "repair",
        "conditions",
        "unsafe",
        "maintenance"
    )):
        items.append(
            resource(
                "Report a housing problem",
                "Contact your local council's environmental "
                "health or housing team about serious hazards, "
                "unsafe conditions or unresolved repairs.",
                "https://www.gov.uk/find-local-council"
            )
        )

    # Remove duplicate resources
    unique_items = []
    seen_urls = set()

    for item in items:
        if item["url"] not in seen_urls:
            unique_items.append(item)
            seen_urls.add(item["url"])

    return {
        "notice": (
            "These resources provide guidance and signposting, "
            "not a decision that you qualify for support. "
            "Eligibility, funding and application processes vary "
            "by UK nation, council and individual circumstances. "
            "Contact the relevant organisation to confirm."
        ),
        "suggestions": unique_items
    }
