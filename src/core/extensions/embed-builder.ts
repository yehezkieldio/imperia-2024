import { COLORS } from "@/core/constants";
import { EmbedBuilder as BaseEmbedBuilder } from "discord.js";

export class ImperiaEmbedBuilder extends BaseEmbedBuilder {
    public constructor() {
        super();

        this.setColor(COLORS.primary);
    }

    isErrorEmbed(): this {
        this.setColor(COLORS.error);
        return this;
    }

    isSuccessEmbed(): this {
        this.setColor(COLORS.success);
        return this;
    }

    isInformationEmbed(): this {
        this.setColor(COLORS.info);
        return this;
    }

    isWarningEmbed(): this {
        this.setColor(COLORS.warning);
        return this;
    }
}
