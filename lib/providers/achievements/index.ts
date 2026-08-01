import { z } from "zod";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { getAllBadgesForUser } from "../../achievementsData";
import { buildBadgesCard } from "../../cards/badgesCard";
import type { CardTypeDef, Provider } from "../types";

const badgesConfigSchema = z.object({
  selectedIds: z.array(z.string()).max(9).optional(),
});

export const achievementsCardTypes: CardTypeDef[] = [
  { id: "badges", label: "Badges", configSchema: badgesConfigSchema, defaultConfig: {} },
];

async function renderCard(args: {
  userId: Id<"users">;
  type: string;
  theme: Theme;
  config: unknown;
}): Promise<string> {
  const parsed = badgesConfigSchema.parse(args.config ?? {});
  const badges = await getAllBadgesForUser(args.userId);
  const earned = badges.filter((b) => b.earned);

  // Users can hand-pick which earned badges to showcase; otherwise show their first 9.
  const shown = parsed.selectedIds?.length
    ? (parsed.selectedIds.map((id) => earned.find((b) => b.id === id)).filter(Boolean) as typeof earned)
    : earned;

  return buildBadgesCard(shown, args.theme, badges.length);
}

export const achievementsProvider: Provider = {
  id: "achievements",
  displayName: "Achievements",
  status: "live",
  requiresConnection: false,
  cardTypes: achievementsCardTypes,
  renderCard,
};
