import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";

export const mirrorRoutes = Router();

mirrorRoutes.use(requireAuth);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

// ─── Schemas ────────────────────────────────────────────────

const triggerMirrorSchema = z.object({
  entryId: z.string().min(1),
});

// ─── Routes ─────────────────────────────────────────────────

/**
 * POST /api/mirror/analyze — Trigger Mirror analysis for an entry
 *
 * Flow:
 * 1. Verify entry ownership
 * 2. Check entry doesn't already have a Mirror analysis
 * 3. Send content to AI service
 * 4. Store MirrorAnalysis + Assumption records
 * 5. Return the full analysis
 */
mirrorRoutes.post("/analyze", aiRateLimit, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { entryId } = triggerMirrorSchema.parse(req.body);

    // 1. Verify entry ownership
    const entry = await prisma.entry.findFirst({
      where: { id: entryId, userId },
      include: { mirrorAnalysis: true },
    });

    if (!entry) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Entry not found" },
      });
      return;
    }

    // 2. Check for existing analysis
    if (entry.mirrorAnalysis) {
      res.status(409).json({
        data: null,
        error: {
          code: "ALREADY_EXISTS",
          message: "Entry already has a Mirror analysis",
        },
      });
      return;
    }

    // 3. Call AI service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/ai/mirror/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entry_id: entryId,
        content: entry.content,
        user_id: userId,
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("[mirror] AI service error:", aiResponse.status, errorBody);
      res.status(502).json({
        data: null,
        error: {
          code: "AI_SERVICE_ERROR",
          message: "Mirror analysis failed",
        },
      });
      return;
    }

    const aiResult = await aiResponse.json();
    const analysis = aiResult.data;
    const promptVersion = aiResult.prompt_version;

    // 4. Store MirrorAnalysis + Assumptions in a transaction
    const mirror = await prisma.$transaction(async (tx) => {
      const mirrorRecord = await tx.mirrorAnalysis.create({
        data: {
          entryId,
          frame: analysis.frame,
          avoidedQuestion: analysis.avoidedQuestion,
          promptVersion,
          rawResponse: JSON.stringify(aiResult),
        },
      });

      // Create individual assumption records
      const assumptions = await Promise.all(
        analysis.assumptions.map(
          (a: { text: string; domain: string }) =>
            tx.assumption.create({
              data: {
                mirrorId: mirrorRecord.id,
                entryId,
                userId,
                text: a.text,
                domain: a.domain,
                status: "identified",
              },
            }),
        ),
      );

      return { ...mirrorRecord, assumptions };
    });

    // 5. Return the full analysis
    res.status(201).json({ data: mirror, error: null });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/mirror/:entryId — Get Mirror analysis for an entry
 */
mirrorRoutes.get("/:entryId", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { entryId } = req.params;

    // Verify entry ownership
    const entry = await prisma.entry.findFirst({
      where: { id: entryId, userId },
    });

    if (!entry) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Entry not found" },
      });
      return;
    }

    const mirror = await prisma.mirrorAnalysis.findUnique({
      where: { entryId },
      include: {
        assumptions: {
          orderBy: { firstSeenAt: "asc" },
        },
      },
    });

    if (!mirror) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "No Mirror analysis found" },
      });
      return;
    }

    // Strip rawResponse from client response (Tier 1 Sacred, debugging only)
    const { rawResponse: _, ...mirrorData } = mirror;

    res.json({ data: mirrorData, error: null });
  } catch (err) {
    next(err);
  }
});
