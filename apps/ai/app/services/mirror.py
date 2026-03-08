"""Mirror analysis service — structured thinking decomposition.

Takes an entry's content and returns a structured analysis:
- Frame: the mental model the user is operating within
- Assumptions: 2-3 beliefs taken for granted (each with domain tag)
- Avoided question: the uncomfortable question they're not asking
"""

import json
import logging

from pydantic import BaseModel

from app.services.anthropic_client import get_client
from app.services.prompt_loader import get_prompt

logger = logging.getLogger(__name__)

FALLBACK_SYSTEM_PROMPT = """You are an analytical thinking coach. The user has written a freeform entry about their thinking on a topic. Your job is to:

1. Identify the FRAME — the perspective or mental model the user is operating within. State it as a short phrase (3-8 words).

2. Surface 2-3 ASSUMPTIONS — beliefs the user is taking for granted. Each assumption should be:
   - A clear, falsifiable statement
   - Something the user hasn't explicitly questioned
   - Tagged with a domain (e.g., "strategy", "pricing", "team", "market", "technology")

3. Pose the AVOIDED QUESTION — the one question the user seems to be not asking themselves. This should be uncomfortable but constructive.

Respond in this exact JSON format:
{
  "frame": "string",
  "assumptions": [
    { "text": "string", "domain": "string" },
    { "text": "string", "domain": "string" }
  ],
  "avoidedQuestion": "string"
}

Do not add commentary outside the JSON. Do not soften the analysis. Be direct."""


class AssumptionResult(BaseModel):
    text: str
    domain: str


class MirrorResult(BaseModel):
    frame: str
    assumptions: list[AssumptionResult]
    avoidedQuestion: str


async def analyze_entry(content: str) -> tuple[MirrorResult, str]:
    """Run Mirror analysis on entry content.

    Returns (parsed_result, prompt_version) tuple.
    """
    # Try to load prompt from DB, fall back to hardcoded
    prompt_version = "mirror-v1"
    try:
        template = await get_prompt("mirror-v1")
        system_prompt = template["systemPrompt"]
        model = template.get("model", "claude-sonnet-4-20250514")
        max_tokens = template.get("maxTokens", 1024)
        temperature = template.get("temperature", 0.7)
        prompt_version = template.get("id", "mirror-v1")
    except Exception:
        logger.warning("Failed to load mirror prompt from DB, using fallback")
        system_prompt = FALLBACK_SYSTEM_PROMPT
        model = "claude-sonnet-4-20250514"
        max_tokens = 1024
        temperature = 0.7

    client = get_client()

    # Strip HTML tags from content for cleaner AI input
    import re
    clean_content = re.sub(r"<[^>]*>", "", content).strip()

    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": clean_content}],
    )

    raw_text = response.content[0].text

    # Parse JSON response
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        import re as re2
        match = re2.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re2.DOTALL)
        if match:
            parsed = json.loads(match.group(1))
        else:
            raise ValueError(f"Mirror response was not valid JSON: {raw_text[:200]}")

    result = MirrorResult(**parsed)

    # Enforce 2-3 assumptions
    if len(result.assumptions) < 2:
        raise ValueError(f"Mirror returned {len(result.assumptions)} assumptions, need at least 2")
    if len(result.assumptions) > 3:
        result.assumptions = result.assumptions[:3]

    return result, prompt_version
