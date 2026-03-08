import { useUser } from "@clerk/react";
import { motion } from "motion/react";
import { revealSpring } from "@/lib/spectra-motion";

export function ProfilePage() {
  const { user } = useUser();

  return (
    <motion.div
      className="mx-auto max-w-[var(--content-max-width)] px-8 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={revealSpring}
    >
      {/* Profile Header */}
      <div className="mb-12">
        <h1
          className="font-[var(--font-display)] text-2xl italic text-[var(--white)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your Thinking
        </h1>
        <p className="mt-2 font-[var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--text)]">
          Cognitive Profile
        </p>
      </div>

      {/* User Info */}
      <div className="mb-10 flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5">
        {user?.imageUrl && (
          <img
            src={user.imageUrl}
            alt=""
            className="h-10 w-10 rounded-full"
          />
        )}
        <div>
          <div className="text-sm font-medium text-[var(--white)]">
            {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
          </div>
          <div className="font-[var(--font-mono)] text-[10px] text-[var(--text)]">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </div>
      </div>

      {/* Coming Soon — Sprint 3+ */}
      <div className="space-y-6">
        {[
          {
            label: "Assumption Tracker",
            description: "Track how your assumptions evolve over time",
            color: "var(--amber)",
          },
          {
            label: "Framework Distribution",
            description: "See which thinking lenses you favor",
            color: "var(--violet)",
          },
          {
            label: "Challenge Resilience",
            description: "Measure how you engage with adversarial feedback",
            color: "var(--rose)",
          },
          {
            label: "Blind Spot Map",
            description: "Discover domains you consistently overlook",
            color: "var(--blue)",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-[var(--text-strong)]">
                {item.label}
              </span>
            </div>
            <p className="mt-2 pl-5 text-xs text-[var(--text)]">
              {item.description}
            </p>
            <div className="mt-3 pl-5 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
              Available after 10+ entries with Mirror
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
