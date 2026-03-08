import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

export const authRoutes = Router();

/**
 * POST /api/auth/sync
 * Called after Clerk sign-in. Creates or updates User record.
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

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { email, name, avatarUrl },
      create: { id: userId, email, name, avatarUrl },
    });

    res.json({ data: user, error: null });
  } catch (err) {
    next(err);
  }
});
