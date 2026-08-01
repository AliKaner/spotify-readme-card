import type { ZodTypeAny } from "zod";
import type { Id } from "../../convex/_generated/dataModel";
import type { Theme } from "../themes";

export interface CardTypeDef {
  id: string;
  label: string;
  configSchema: ZodTypeAny;
  defaultConfig: Record<string, unknown>;
}

export interface Provider {
  id: string;
  displayName: string;
  status: "live" | "coming-soon";
  /** Whether card creation needs an existing row in the `connections` table (OAuth-style
   * providers like Spotify) — false for providers that read public data by identity alone
   * (GitHub) or need no external data at all (custom/user-authored cards). */
  requiresConnection: boolean;
  cardTypes: CardTypeDef[];
  renderCard(args: { userId: Id<"users">; type: string; theme: Theme; config: unknown }): Promise<string>;
}
