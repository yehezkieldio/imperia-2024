import { userOptions } from "@/internal/constants/user-settings";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from "discord.js";

type ParsedData = ApplicationCommandOptionChoiceData<string | number>[];

export class UserSettingOptionHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: "user-setting-option-handler",
            interactionHandlerType: InteractionHandlerTypes.Autocomplete,
        });
    }

    public parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "user-settings") return this.none();

        const focusedOption = interaction.options.getFocused(true);

        switch (focusedOption.name) {
            case "setting": {
                return this.some(userOptions.map((option) => ({ name: option.name, value: option.value })));
            }
            default:
                return this.none();
        }
    }

    public async run(interaction: AutocompleteInteraction, result: ParsedData) {
        return interaction.respond(result);
    }
}
