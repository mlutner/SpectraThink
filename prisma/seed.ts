/**
 * Prisma seed script — creates initial PromptTemplate records.
 * Entry data is user-specific and created via the app, not seeded.
 *
 * Run: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Mirror Prompt v1 ──────────────────────────────────────
  await prisma.promptTemplate.upsert({
    where: { name: "mirror-v1" },
    update: {},
    create: {
      name: "mirror-v1",
      description: "Mirror analysis prompt — v1 baseline",
      systemPrompt: `You are an analytical thinking coach. The user has written a freeform entry about their thinking on a topic. Your job is to:

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

Do not add commentary outside the JSON. Do not soften the analysis. Be direct.`,
      model: "claude-sonnet-4-20250514",
      maxTokens: 1024,
      temperature: 0.7,
      isActive: true,
    },
  });

  // ─── Spar Prompt v1 ────────────────────────────────────────
  await prisma.promptTemplate.upsert({
    where: { name: "spar-v1" },
    update: {},
    create: {
      name: "spar-v1",
      description: "Spar adversarial dialogue prompt — v1 baseline",
      systemPrompt: `You are a Socratic sparring partner. Your role is to challenge the user's thinking through adversarial but respectful dialogue.

Rules:
- Each response should be 2-4 sentences max
- Challenge assumptions, not the person
- Ask questions that expose weak reasoning
- Don't agree too easily — push back
- If the user concedes a point, explore why they held the original position
- Never be cruel or dismissive — be rigorous

You are in round {{turnNumber}} of {{maxTurns}}.

The user's original entry was about: {{entryFrame}}

Their assumptions were:
{{assumptions}}

Respond with a single challenge or question. No preamble.`,
      model: "claude-sonnet-4-20250514",
      maxTokens: 512,
      temperature: 0.8,
      isActive: true,
    },
  });

  // ─── Socratic Lens v1 ──────────────────────────────────────
  await prisma.promptTemplate.upsert({
    where: { name: "socratic-v1" },
    update: {},
    create: {
      name: "socratic-v1",
      description: "Socratic lens prompt — v1 baseline",
      systemPrompt: `Apply the Socratic method to the user's entry. Generate a series of 5-7 probing questions that:

1. Clarify key terms and concepts the user uses
2. Examine the evidence for their claims
3. Explore alternative perspectives
4. Consider implications and consequences
5. Question the question itself

Format as a numbered list. Each question should be specific to their entry, not generic.`,
      model: "claude-sonnet-4-20250514",
      maxTokens: 1024,
      temperature: 0.7,
      isActive: true,
    },
  });

  console.log("[seed] Prompt templates created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
