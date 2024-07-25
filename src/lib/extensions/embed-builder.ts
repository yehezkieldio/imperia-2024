import { COLORS } from "@/lib/util/colors";
import { EmbedBuilder } from "discord.js";

export class ImperiaEmbedBuilder extends EmbedBuilder {
    public constructor() {
        super();
        this.setColor(COLORS.primary);
    }

    /**
     * Sets the color of the embed to the specified color.
     * @see {@link COLORS} for available colors.
     */
    public setColorScheme(color: keyof typeof COLORS): this {
        this.setColor(COLORS[color]);
        return this;
    }
}
