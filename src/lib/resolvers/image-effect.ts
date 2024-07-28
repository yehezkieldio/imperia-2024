import { Result } from "@sapphire/framework";
import { type APIEmbedField, inlineCode } from "discord.js";

export type ImageEffect = Pick<APIEmbedField, "name" | "value"> & { description: string };

export const effectAvailable: ImageEffect[] = [
    {
        name: "Oil",
        value: "oil",
        description: "Turn an image into an oil painting",
    },
    {
        name: "Solarize",
        value: "solarize",
        description: "Applies a solarizing effect to an image.",
    },
    {
        name: "Offset Red",
        value: "offset_red",
        description: "Adds an offset to the red channel by a certain number of pixels.",
    },
    {
        name: "Offset Blue",
        value: "offset_blue",
        description: "Adds an offset to the blue channel by a certain number of pixels.",
    },
    {
        name: "Offset Green",
        value: "offset_green",
        description: "Adds an offset to the green channel by a certain number of pixels.",
    },
];

export function resolveImageEffect(effectName: string): Result<string, string[]> {
    const filter: ImageEffect | undefined = effectAvailable.find(
        (f: ImageEffect): boolean => f.name.toLowerCase() === effectName.toLowerCase(),
    );

    if (!filter) {
        const filterList: string[] = effectAvailable.map((f) => inlineCode(f.name));
        return Result.err(filterList);
    }

    return Result.ok(filter?.value);
}
