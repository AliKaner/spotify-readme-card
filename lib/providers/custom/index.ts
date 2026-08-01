import { z } from "zod";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { toDataUriUntrusted } from "../../image";
import { buildProductCard } from "../../cards/productCard";
import { buildSocialCard } from "../../cards/socialCard";
import { buildHobbyStatCard } from "../../cards/hobbyStatCard";
import { buildGalleryStackCard, type GalleryImage } from "../../cards/galleryCard";
import { renderSingleItemLayout, type SingleItemGenericLayout } from "../../cards/layouts/singleItem";
import { renderRankedListLayout, type RankedItem, type RankedListGenericLayout } from "../../cards/layouts/rankedList";
import type { CardTypeDef, Provider } from "../types";

const SINGLE_ITEM_LAYOUTS = ["full", "compact", "terminal", "badge", "portrait", "split"] as const;

const galleryConfigSchema = z.object({
  title: z.string().min(1).max(40).default("Gallery"),
  images: z
    .array(z.object({ url: z.string().url(), caption: z.string().max(30).optional() }))
    .min(1)
    .max(6),
  layout: z.enum(["stack", "grid", "avatars", "terminal", "bars", "compact"]).default("stack"),
});

const productConfigSchema = z.object({
  name: z.string().min(1).max(60),
  price: z.string().max(20).optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().max(80).optional(),
  layout: z.enum(SINGLE_ITEM_LAYOUTS).default("full"),
});

const socialConfigSchema = z.object({
  platform: z.string().min(1).max(30),
  handle: z.string().min(1).max(30),
  followers: z.number().int().min(0).optional(),
  layout: z.enum(SINGLE_ITEM_LAYOUTS).default("full"),
});

const hobbyStatConfigSchema = z.object({
  label: z.string().min(1).max(30),
  value: z.string().min(1).max(24),
  description: z.string().max(60).optional(),
  imageUrl: z.string().url().optional(),
  layout: z.enum(SINGLE_ITEM_LAYOUTS).default("full"),
});

export const customCardTypes: CardTypeDef[] = [
  {
    id: "gallery",
    label: "Gallery",
    configSchema: galleryConfigSchema,
    defaultConfig: { title: "Gallery", images: [], layout: "stack" },
  },
  {
    id: "product",
    label: "Product",
    configSchema: productConfigSchema,
    defaultConfig: { name: "", layout: "full" },
  },
  {
    id: "social",
    label: "Social",
    configSchema: socialConfigSchema,
    defaultConfig: { platform: "", handle: "", layout: "full" },
  },
  {
    id: "hobby-stat",
    label: "Hobby Stat",
    configSchema: hobbyStatConfigSchema,
    defaultConfig: { label: "", value: "", layout: "full" },
  },
];

async function renderCard(args: { userId: Id<"users">; type: string; theme: Theme; config: unknown }): Promise<string> {
  const theme = args.theme;

  if (args.type === "gallery") {
    const parsed = galleryConfigSchema.parse(args.config ?? {});
    const images: GalleryImage[] = await Promise.all(
      parsed.images.map(async (img) => ({ art: await toDataUriUntrusted(img.url), caption: img.caption }))
    );
    if (parsed.layout === "stack") return buildGalleryStackCard(images, theme, parsed.title);
    const items: RankedItem[] = images.map((img) => ({ title: img.caption ?? "", art: img.art }));
    return renderRankedListLayout(parsed.layout as RankedListGenericLayout, items, theme, parsed.title);
  }

  if (args.type === "product") {
    const parsed = productConfigSchema.parse(args.config ?? {});
    const art = await toDataUriUntrusted(parsed.imageUrl);
    if (parsed.layout === "full") {
      return buildProductCard({ name: parsed.name, price: parsed.price, description: parsed.description }, art, theme);
    }
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: parsed.name, subtitle: parsed.price ?? parsed.description ?? "", art, statusLabel: "Product" },
      theme
    );
  }

  if (args.type === "social") {
    const parsed = socialConfigSchema.parse(args.config ?? {});
    if (parsed.layout === "full") return buildSocialCard(parsed, theme);
    const handle = parsed.handle.startsWith("@") ? parsed.handle : `@${parsed.handle}`;
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: handle, subtitle: parsed.platform, art: null, statusLabel: "Social" },
      theme
    );
  }

  if (args.type === "hobby-stat") {
    const parsed = hobbyStatConfigSchema.parse(args.config ?? {});
    const art = await toDataUriUntrusted(parsed.imageUrl);
    if (parsed.layout === "full") return buildHobbyStatCard(parsed, art, theme);
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: parsed.value, subtitle: parsed.label, art, statusLabel: "Hobby Stat" },
      theme
    );
  }

  throw new Error(`Unknown custom card type: ${args.type}`);
}

export const customProvider: Provider = {
  id: "custom",
  displayName: "Custom",
  status: "live",
  requiresConnection: false,
  cardTypes: customCardTypes,
  renderCard,
};
