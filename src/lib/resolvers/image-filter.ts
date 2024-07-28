import { Result } from "@sapphire/framework";
import { type APIEmbedField, inlineCode } from "discord.js";

export type ImageFilter = Pick<APIEmbedField, "name" | "value"> & { description: string };

export const filtersAvailable: ImageFilter[] = [
    {
        name: "Oceanic",
        value: "oceanic",
        description: "Add an aquamarine-tinted hue to an image.",
    },
    {
        name: "Islands",
        value: "islands",
        description: "Aquamarine tint.",
    },
    {
        name: "Marine",
        value: "marine",
        description: "Add a green/blue mixed hue to an image.",
    },
    {
        name: "Sea Green",
        value: "seagreen",
        description: "Dark green hue, with tones of blue.",
    },
    {
        name: "Flag Blue",
        value: "flagblue",
        description: "Royal blue tint.",
    },
    {
        name: "Liquid",
        value: "liquid",
        description: "Blue-inspired tint.",
    },
    {
        name: "Diamante",
        value: "diamante",
        description: "Custom filter with a blue/turquoise tint.",
    },
    {
        name: "Radio",
        value: "radio",
        description: "Fallout-style radio effect.",
    },
    {
        name: "Twenties",
        value: "twenties",
        description: "Slight-blue tinted historical effect.",
    },
    {
        name: "Rose Tint",
        value: "rosetint",
        description: "Rose-tinted filter.",
    },
    {
        name: "Mauve",
        value: "mauve",
        description: "Purple-infused filter.",
    },
    {
        name: "Blue Chrome",
        value: "bluechrome",
        description: "Blue monochrome effect.",
    },
    {
        name: "Vintage",
        value: "vintage",
        description: "Vintage filter with a red tint.",
    },
    {
        name: "Perfume",
        value: "perfume",
        description: "Increase the blue channel, with moderate increases in the Red and Green channels.",
    },
    {
        name: "Serenity",
        value: "serenity",
        description: "Custom filter with an increase in the Blue channel's values.",
    },
];

export function resolveImageFilter(filterName: string): Result<string, string[]> {
    const filter: ImageFilter | undefined = filtersAvailable.find(
        (f: ImageFilter): boolean => f.name.toLowerCase() === filterName.toLowerCase(),
    );

    if (!filter) {
        const filterList: string[] = filtersAvailable.map((f) => inlineCode(f.name));
        return Result.err(filterList);
    }

    return Result.ok(filter?.value);
}
