import { Result } from "@sapphire/framework";
import { type APIEmbedField, inlineCode } from "discord.js";

export type ColorsConvert = Pick<APIEmbedField, "name" | "value"> & { description: string };

export const colorsAvailable: ColorsConvert[] = [
    {
        name: "Red",
        value: "red",
        description: "The color red.",
    },
    {
        name: "Red",
        value: "red",
        description: "The color red.",
    },
    {
        name: "Pink",
        value: "pink",
        description: "The color pink.",
    },
    {
        name: "Purple",
        value: "purple",
        description: "The color purple.",
    },
    {
        name: "Blue",
        value: "blue",
        description: "The color blue.",
    },
    {
        name: "Turquoise",
        value: "turquoise",
        description: "The color turquoise.",
    },
    {
        name: "Light Blue",
        value: "lightblue",
        description: "The color light blue.",
    },
    {
        name: "Light Green",
        value: "lightgreen",
        description: "The color light green.",
    },
    {
        name: "Green",
        value: "green",
        description: "The color green.",
    },
    {
        name: "Yellow",
        value: "yellow",
        description: "The color yellow.",
    },
    {
        name: "Orange",
        value: "orange",
        description: "The color orange.",
    },
    {
        name: "Black",
        value: "black",
        description: "The color black.",
    },
    {
        name: "Grey",
        value: "grey",
        description: "The color grey.",
    },
    {
        name: "White",
        value: "white",
        description: "The color white.",
    },
];

export const rgbMap: Record<string, string> = {
    red: "255 0 0",
    pink: "255 192 203",
    purple: "128 0 128",
    blue: "0 0 255",
    turquoise: "64 224 208",
    lightblue: "173 216 230",
    lightgreen: "144 238 144",
    green: "0 128 0",
    yellow: "255 255 0",
    orange: "255 165 0",
    black: "0 0 0",
    grey: "128 128 128",
    white: "255 255 255",
};

export function getColorRGB(colorValue: string): string {
    const rgb = rgbMap[colorValue.toLowerCase()];
    return rgb ? rgb : "Color not available";
}

export function resolveMonochromeEffect(colorName: string): Result<string, string[]> {
    const color: ColorsConvert | undefined = colorsAvailable.find(
        (f: ColorsConvert): boolean => f.name.toLowerCase() === colorName.toLowerCase(),
    );

    if (!color) {
        const filterList: string[] = colorsAvailable.map((f) => inlineCode(f.name));
        return Result.err(filterList);
    }

    return Result.ok(color?.value);
}
