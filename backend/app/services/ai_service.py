import os
from anthropic import AsyncAnthropic


TENANCY_SYSTEM_PROMPT = (
    "Explain UK residential tenancy text in plain English. You are not a solicitor "
    "and must not give definitive legal advice. Only discuss supplied text; do not "
    "invent clauses. Flag unclear or important wording as questions to raise with "
    "Shelter, Citizens Advice or a qualified adviser. Housing law differs across "
    "England, Wales, Scotland and Northern Ireland. Structure: Plain-English overview; "
    "Important clauses; Potential questions or concerns; Missing information to check. "
    "Be balanced."
)


PROPERTY_SYSTEM_PROMPT = (
    "You are RentReady's rental listing warning assistant. Help UK tenants assess "
    "information in rental adverts and messages from prospective landlords or agents. "
    "Identify possible warning signs such as requests for money before a viewing, "
    "unusual payment methods, pressure to pay immediately, claims that a landlord is "
    "overseas and cannot arrange a viewing, unusually low rent without explanation, "
    "inconsistent details, and missing landlord or agent information. "
    "Only assess the information supplied. Never claim that a property or person is "
    "definitely fraudulent or definitely safe. A warning sign is not proof of fraud, "
    "and missing information is not proof of wrongdoing. Do not invent market prices, "
    "property details, identities or verification results. "
    "Explain what the tenant should independently verify before paying money or "
    "signing anything. Distinguish serious warning signs from ordinary missing "
    "information. Be balanced and practical. "
    "Structure your response using these headings: "
    "Overall assessment; Warning signs identified; Information still missing; "
    "Questions to ask; Safer next steps. "
    "End by reminding the user that this is an automated screening tool, not a "
    "guarantee or legal advice."
)


def get_anthropic_client():
    key = os.getenv("ANTHROPIC_API_KEY")

    if not key:
        return None

    return AsyncAnthropic(api_key=key)


async def explain_tenancy(document_text: str):
    client = get_anthropic_client()

    if not client:
        return {
            "mode": "demo",
            "analysis": (
                "Text extraction succeeded. To enable AI explanations, "
                "add ANTHROPIC_API_KEY to backend/.env and restart the backend."
            )
        }

    response = await client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1800,
        system=TENANCY_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    "Explain this tenancy agreement extract:\n\n"
                    + document_text[:40000]
                )
            }
        ]
    )

    answer = "\n".join(
        block.text
        for block in response.content
        if getattr(block, "type", None) == "text"
    )

    return {
        "mode": "ai",
        "analysis": answer
    }


async def analyse_property_listing(
    title: str,
    location: str,
    monthly_rent: str,
    listing_text: str,
    landlord_message: str
):
    client = get_anthropic_client()

    if not client:
        return {
            "mode": "demo",
            "analysis": "Add ANTHROPIC_API_KEY to backend/.env to enable AI property analysis."
        }

    user_content = f"""
Assess the following rental listing information.

PROPERTY TITLE:
{title or "Not provided"}

LOCATION:
{location or "Not provided"}

ADVERTISED MONTHLY RENT:
{monthly_rent or "Not provided"}

LISTING DESCRIPTION:
{listing_text or "Not provided"}

LANDLORD OR AGENT MESSAGE:
{landlord_message or "Not provided"}

Assess only the supplied information. Do not assume that missing
information proves fraud. Explain what should be verified independently.
"""

    response = await client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1600,
        system=PROPERTY_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": user_content
            }
        ]
    )

    answer = "\n".join(
        block.text
        for block in response.content
        if getattr(block, "type", None) == "text"
    )

    return {
        "mode": "ai",
        "analysis": answer
    }

