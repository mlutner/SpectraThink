import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const promptRoutes = Router();

/**
 * GET /api/prompts/:name — Get active prompt template by name
 *
 * Called by the AI service to load prompts from the database (ADR-005).
 * No auth required — internal service-to-service call.
 */
promptRoutes.get("/:name", async (req, res, next) => {
  try {
    const { name } = req.params;

    const template = await prisma.promptTemplate.findFirst({
      where: { name, isActive: true },
    });

    if (!template) {
      res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: `Prompt '${name}' not found` },
      });
      return;
    }

    res.json({ data: template, error: null });
  } catch (err) {
    next(err);
  }
});
