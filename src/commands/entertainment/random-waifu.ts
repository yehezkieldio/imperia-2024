import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { RegisterBehavior } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class RandomWaifuCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Retrive a random waifu image from the internet",
            requiredClientPermissions: ["SendMessages"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        return interaction.reply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(`~Here's your waifu! :3`).setImage(await this.getWaifu()),
            ],
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });
    }

    public async getWaifu() {
        const response = await fetch("https://api.waifu.pics/sfw/waifu", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
            },
        });
        const data = await response.json();
        return data.url;
    }
}
