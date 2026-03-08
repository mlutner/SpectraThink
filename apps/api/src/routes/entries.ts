import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const entryRoutes = Router();

// All entry routes require authentication
entryRoutes.use(requireAuth);

// ─── Schemas ────────────────────────────────────────────────

const createEntrySchema = z.object({
  content: z.string().min(1, "Content is required"),
  inputMode: z.enum(["text", "voice"]).default("text"),
});

const updateEntrySchema = z.object({
  content: z.string().min(1).optional(),
  title: z.string().max(100).optional(),
});

// ─── Helpers ────────────────────────────────────────────────

function extractTitle(content: string): string {
  // Strip HTML tags, take first line, truncate
  const text = content.replace(/<[^>]*>/g, "").trim();
  const firstLine = text.split("\n")[0] ?? "";
  return firstLine.slice(0, 100) || "Untitled";
}

function countWords(content: string): number {
  const text = content.replace(/<[^>]*>/g, "").trim();
  return text.split(/\s+/).filter(Boolean).length;
}

// ─── Routes ─────────────────────────────────────────────────

/**
 * POST /api/entries — Create a new entry
 */
entryRoutes.post("/", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const body = createEntrySchema.parse(req.body);

    const entry = await prisma.entry.create({
      data: {
        userId,
        content: body.content,
        title: extractTitle(body.content),
        inputMode: body.inputMode,
        wordCount: countWords(body.content),
      },
    });

    res.status(201).json({ data: entry, error: null });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/entries — List all entries for the authenticated user
 */
entryRoutes.get("/", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;

    const entries = await prisma.entry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        wordCount: true,
        inputMode: true,
        mirrorAnalysis: { select: { id: true } },
        sparSession: { select: { id: true } },
        lensApplications: { select: { lensType: true } },
      },
    });

    const items = entries.map((e) => ({
      id: e.id,
      title: e.title ?? "Untitled",
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      wordCount: e.wordCount,
      inputMode: e.inputMode,
      hasMirror: !!e.mirrorAnalysis,
      hasSpar: !!e.sparSession,
      lensTypes: e.lensApplications.map((l) => l.lensType),
    }));

    res.json({ data: items, error: null, meta: { total: items.length } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/entries/:id — Get a single entry
 */
entryRoutes.get("/:id", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { id } = req.params;

    const entry = await prisma.entry.findFirst({
      where: { id, userId }, // userId scoping!
    });

    if (!entry) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Entry not found" },
      });
      return;
    }

    res.json({ data: entry, error: null });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/entries/:id — Update an entry
 */
entryRoutes.patch("/:id", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { id } = req.params;
    const body = updateEntrySchema.parse(req.body);

    // Verify ownership first
    const existing = await prisma.entry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Entry not found" },
      });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (body.content !== undefined) {
      updateData.content = body.content;
      updateData.title = body.title ?? extractTitle(body.content);
      updateData.wordCount = countWords(body.content);
    }
    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: entry, error: null });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/entries/:id — Soft delete (for now, hard delete)
 */
entryRoutes.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.entry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Entry not found" },
      });
      return;
    }

    await prisma.entry.delete({ where: { id } });

    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
});
