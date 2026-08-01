import { z } from "zod";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { getAllBadgesForUser } from "../../achievementsData";
import { buildBadgesCard } from "../../cards/badgesCard";
import type { CardTypeDef, Provider } from "../types";

const badgesConfigSchema = z.object({});

export const achievementsCardTypes: CardTypeDef[] = [
  { id: "badges", label: "Badges", configSchema: badgesConfigSchema, defaultConfig: {} },
];

async function renderCard(args: {
  userId: Id<"users">;
  type: string;
  theme: Theme;
  config: unknown;
}): Promise<string> {
  const badges = await getAllBadgesForUser(args.userId);
  // The card is a showcase, not a progress tracker — only earned badges are drawn on it,
  // but the total count still shows how many are left to unlock.
  return buildBadgesCard(
    badges.filter((b) => b.earned),
    args.theme,
    badges.length
  );
}

export const achievementsProvider: Provider = {
  id: "achievements",
  displayName: "Achievements",
  status: "live",
  requiresConnection: false,
  cardTypes: achievementsCardTypes,
  renderCard,
};
