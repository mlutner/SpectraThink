import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

export const authRoutes = Router();

// ─── First-run example entry ────────────────────────────────

const EXAMPLE_ENTRY_CONTENT = `<p>I've been thinking about how our team makes decisions. We default to consensus — everyone needs to agree before we move forward. It feels democratic, but I'm starting to wonder if it's actually slowing us down.</p>
<p>Last week we spent three meetings debating a feature that two engineers could have prototyped in a day. The people closest to the problem had strong convictions, but we kept looping back to get buy-in from stakeholders who didn't have the context.</p>
<p>Maybe the real issue isn't the decision-making process itself — it's that we've conflated "everyone has input" with "everyone has veto power." Those are very different things. Input means your perspective is heard and considered. Veto means nothing moves without your approval.</p>
<p>I think we're afraid of making someone feel excluded. But by trying to include everyone in every decision, we might be excluding the thing that matters most: momentum.</p>`;

/**
 * Creates a single example entry for first-time users so the app
 * doesn't feel empty. Content is long enough to trigger Mirror (200+ chars).
 */
async function createFirstRunEntry(userId: string): Promise<void> {
  const text = EXAMPLE_ENTRY_CONTENT.replace(/<[^>]*>/g, "").trim();
  await prisma.entry.create({
    data: {
      userId,
      content: EXAMPLE_ENTRY_CONTENT,
      title: "Consensus vs. momentum in team decisions",
      wordCount: text.split(/\s+/).filter(Boolean).length,
      inputMode: "text",
    },
  });
}

/**
 * POST /api/auth/sync
 * Called after Clerk sign-in. Creates or updates User record.
 * On first creation, seeds an example entry.
 */
authRoutes.post("/sync", async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({
        data: null,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }

    // Clerk session claims provide basic user info
    const { sessionClaims } = getAuth(req);
    const email = (sessionClaims?.email as string) ?? "";
    const name = (sessionClaims?.name as string) ?? undefined;
    const avatarUrl = (sessionClaims?.image_url as string) ?? undefined;

    // Check if this is a new user
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { email, name, avatarUrl },
      create: { id: userId, email, name, avatarUrl },
    });

    // Seed example entry for brand-new users
    if (!existing) {
      try {
        await createFirstRunEntry(userId);
      } catch (seedErr) {
        // Non-fatal — user can still use the app
        console.error("[auth] Failed to create first-run entry:", seedErr);
      }
    }

    res.json({ data: user, error: null });
  } catch (err) {
    next(err);
  }
});
