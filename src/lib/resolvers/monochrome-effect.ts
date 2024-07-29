import { Result } from "@sapphire/framework";
import { type APIEmbedField, inlineCode } from "discord.js";

export type ImageMonochrome = Pick<APIEmbedField, "name" | "value"> & { description: string };

export enum RGBChannel {
    RED = 0,
    GREEN = 1,
    BLUE = 2,
}

export const monochromesAvailable: ImageMonochrome[] = [
    {
        name: "Grayscale",
        value: "grayscale",
        description: "Add an grayscale effect to an image.",
    },
    {
        name: "Sepia",
        value: "sepia",
        description: "Add a sepia effect to an image.",
    },
    {
        name: "Decompose Max",
        value: "decompose_max",
        description: "Uses max decomposition algorithm to create a monochrome image.",
    },
    {
        name: "Decompose Min",
        value: "decompose_min",
        description: "Uses min decomposition algorithm to create a monochrome image.",
    },
    {
        name: "Threshold",
        value: "threshold",
        description: "Uses threshold algorithm to create a monochrome image.",
    },
    {
        name: "Blue Grayscale",
        value: "bluegrayscale",
        description: "Utilizes blue channel to create a grayscale image.",
    },
    {
        name: "Green Grayscale",
        value: "greengrayscale",
        description: "Utilizes green channel to create a grayscale image.",
    },
    {
        name: "Red Grayscale",
        value: "redgrayscale",
        description: "Utilizes red channel to create a grayscale image.",
    },
];

export function resolveMonochromeEffect(monochromeName: string): Result<string, string[]> {
    const monochrome: ImageMonochrome | undefined = monochromesAvailable.find(
        (f: ImageMonochrome): boolean => f.name.toLowerCase() === monochromeName.toLowerCase(),
    );

    if (!monochrome) {
        const filterList: string[] = monochromesAvailable.map((f) => inlineCode(f.name));
        return Result.err(filterList);
    }

    return Result.ok(monochrome?.value);
}
