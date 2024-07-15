import { DEVELOPERS } from "@/internal/constants/developers";
import { commandCategories } from "@/internal/utils/command-utils";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from "discord.js";

type ParsedData = ApplicationCommandOptionChoiceData<string | number>[];

export class CommandCategoryOptionHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: "command-category-option-handler",
            interactionHandlerType: InteractionHandlerTypes.Autocomplete,
        });
    }

    public parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "commands") return this.none();

        const focusedOption = interaction.options.getFocused(true);
        const categories = commandCategories;

        if (!DEVELOPERS.includes(interaction.user.id)) {
            categories.splice(
                categories.findIndex((category) => category.name === "System"),
                1,
            );
        }

        switch (focusedOption.name) {
            case "category": {
                return this.some(categories.map((option) => ({ name: option.name, value: option.value })));
            }
            default:
                return this.none();
        }
    }

    public async run(interaction: AutocompleteInteraction, result: ParsedData) {
        return interaction.respond(result);
    }
}
