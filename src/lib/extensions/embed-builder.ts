import { COLORS } from "@/lib/colors";
import { EmbedBuilder } from "discord.js";

export class ImperiaEmbedBuilder extends EmbedBuilder {
    public constructor() {
        super();
        this.setColor(COLORS.primary);
    }

    /**
     * Set the color of the embed.
     * @see {@link COLORS} for available colors.
     */
    public setTheme(color: keyof typeof COLORS): this {
        this.setColor(COLORS[color]);
        return this;
    }
}
