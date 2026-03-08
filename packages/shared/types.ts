/**
 * Spectra Shared Types
 * 
 * These mirror the Prisma schema but are usable on both frontend and backend.
 * Keep in sync with prisma/schema.prisma.
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export type InputMode = "text" | "voice";

export type AssumptionStatus = "identified" | "examined" | "revised" | "recurring";

export type EngagementType = "engage" | "deflect" | "concede";

export type LensType = "socratic" | "inversion" | "steelman" | "firstprinciples" | "systems";

export type MilestoneType =
  | "assumptions_examined"
  | "lens_diversity"
  | "spar_resilience"
  | "recurrence_drop"
  | "entry_streak"
  | "first_mirror"
  | "first_spar"
  | "custom";

// ─── Core Entities ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  userId: string;
  content: string;
  title?: string;
  inputMode: InputMode;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, populated when included)
  mirrorAnalysis?: MirrorAnalysis;
  sparSession?: SparSession;
  lensApplications?: LensApplication[];
  assumptions?: Assumption[];
}

export interface MirrorAnalysis {
  id: string;
  entryId: string;
  frame: string;
  avoidedQuestion: string;
  promptVersion: string;
  createdAt: string;
  assumptions?: Assumption[];
}

export interface Assumption {
  id: string;
  mirrorId: string;
  entryId: string;
  userId: string;
  text: string;
  domain?: string;
  status: AssumptionStatus;
  occurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  linkedAssumptionId?: string;
}

export interface SparSession {
  id: string;
  entryId: string;
  turnCount: number;
  maxTurns: number;
  promptVersion: string;
  synthesis?: string;
  completedAt?: string;
  createdAt: string;
  turns?: SparTurn[];
}

export interface SparTurn {
  id: string;
  sessionId: string;
  turnNumber: number;
  challengeMsg: string;
  userResponse: string;
  engagementType?: EngagementType;
  createdAt: string;
}

export interface LensApplication {
  id: string;
  entryId: string;
  lensType: LensType;
  output: string;
  domain?: string;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  userId: string;
  concept: string;
  frequency: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  entryIds: string[];
}

export interface CognitiveProfile {
  id: string;
  userId: string;
  lastComputed: string;
  totalAssumptions: number;
  recurrenceRate: number;
  examinedRate: number;
  avgSparTurns: number;
  avgEngagement: number;
  totalSparSessions: number;
  frameworkDist: Record<LensType, number>;
  blindSpots: string[];
  developmentTrajectory: ProfileSnapshot[];
}

export interface ProfileSnapshot {
  date: string;
  recurrenceRate: number;
  examinedRate: number;
  avgSparTurns: number;
  frameworkDist: Record<LensType, number>;
}

export interface Milestone {
  id: string;
  userId: string;
  type: MilestoneType;
  achievedAt: string;
  metadata: Record<string, unknown>;
  dismissed: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Shape ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ─── Entry List Item (frontend-specific) ────────────────────────────────────

export interface EntryListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  inputMode: InputMode;
  hasMirror: boolean;
  hasSpar: boolean;
  lensTypes: LensType[];
}
