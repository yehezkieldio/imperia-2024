import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import * as phonton from "@silvia-odwyer/photon-node";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";

interface ImageFilter {
    name: string;
    value: string;
    description: string;
}

const filters: ImageFilter[] = [
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

export class FilterImageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Apply a filter to an provided image.",
            requiredClientPermissions: ["SendMessages"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addAttachmentOption((option) =>
                option.setName("image").setDescription("The image to apply the filter to.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("filter")
                    .setDescription("The filter to apply to the image.")
                    .setRequired(true)
                    .addChoices([...filters.map(({ name, value }) => ({ name, value }))]),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });

        const image = interaction.options.getAttachment("image", true);
        const filter = interaction.options.getString("filter", true);

        if (!this.isImageURL(image.url)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "The provided image is not a valid image URL. The valid image formats are JPG, JPEG, and PNG.",
            });
        }

        interaction.editReply({
            content: "Please wait while the filter is being applied to the image...",
        });

        const imageToBase64 = async (url: string) => {
            const response = await fetch(url);
            return response.arrayBuffer();
        };

        const phtn_image = phonton.PhotonImage.new_from_base64(
            Buffer.from(await imageToBase64(image.url)).toString("base64"),
        );

        phonton.filter(phtn_image, filter);

        const output = phtn_image.get_bytes();
        const buffer_output = Buffer.from(output);
        const filteredImage = new AttachmentBuilder(buffer_output, {
            name: `filter-image-${interaction.user.id}.png`,
        });

        return interaction.editReply({
            files: [filteredImage],
            content: `Applied filter/tint:\n${filter}, ${filters.find((f) => f.value === filter)?.description}`,
        });
    }

    private isImageURL(url: string) {
        const imageExtensionPattern = /\.(jpg|jpeg|png)$/i;

        try {
            const urlObject = new URL(url);
            return imageExtensionPattern.test(urlObject.pathname);
        } catch {
            return false;
        }
    }
}
