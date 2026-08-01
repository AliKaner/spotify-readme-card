import type { ZodTypeAny } from "zod";
import type { Doc } from "../../convex/_generated/dataModel";
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
  cardTypes: CardTypeDef[];
  renderCard(args: { connection: Doc<"connections">; type: string; theme: Theme; config: unknown }): Promise<string>;
}
