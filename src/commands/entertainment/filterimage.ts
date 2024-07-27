import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { filtersAvailable } from "@/lib/resolvers/image-filter";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    UserError,
} from "@sapphire/framework";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import * as phonton from "@silvia-odwyer/photon-node";
import { type Attachment, AttachmentBuilder, type Message, SlashCommandBuilder } from "discord.js";

export class FilterImageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Apply a filte or tint to an image.",
            tags: ["image", "image-processing"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addAttachmentOption((option) =>
                option.setName("image").setDescription("The image to apply a filter to.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("filter")
                    .setDescription("The filter to apply to the image.")
                    .setRequired(true)
                    .addChoices([...filtersAvailable.map(({ name, value }) => ({ name, value }))]),
            );

        void registry.registerChatInputCommand(command);
    }

    #reply = "˖ ݁𖥔 ݁˖ Here's what I converted for you~";
    #invalidExtension = "( •́ ⍨ •̀) Make sure to provide an image with a valid file extension (jpg, jpeg, png).";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply();
        const image: Attachment = interaction.options.getAttachment("image", true);

        if (!this.container.utilities.toolbox.isValidAttachment(image)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: this.#invalidExtension,
            });
        }

        const filter: string = interaction.options.getString("filter", true);
        const filteredImage: AttachmentBuilder = await this.applyFilterToImage(image, filter);

        return interaction.editReply({
            files: [filteredImage],
            content: `${this.#reply}\n\nApplied filter: ${capitalizeFirstLetter(filter)}`,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const filterArgument: ResultType<string> = await args.pickResult("imageFilter");

        if (filterArgument.isErr()) {
            const error: UserError | ArgumentError<string> = filterArgument.unwrapErr();

            if (error.identifier === ImperiaIdentifiers.ArgumentFilterImageError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: error.message,
                });
            }

            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(?_?) Please provide a filter to apply to the image!",
            });
        }

        if (message.attachments.size === 0) {
            throw new UserError({
                identifier: ImperiaIdentifiers.InvalidArgumentProvided,
                message: "(o_O)? You didn't attach an image for me to filter! Please attach an image and try again.",
            });
        }

        const image: Attachment | undefined = message.attachments.first();
        if (!image) {
            throw new UserError({
                identifier: ImperiaIdentifiers.InvalidArgumentProvided,
                message: "(o_O)? Did Discord eat the image you attached? I can't find it.",
            });
        }

        if (!this.container.utilities.toolbox.isValidAttachment(image)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: this.#invalidExtension,
            });
        }

        const filter: string = filterArgument.unwrap();
        const filteredImage: AttachmentBuilder = await this.applyFilterToImage(image, filter);

        return message.reply({
            files: [filteredImage],
            content: `${this.#reply}\n\nApplied filter: ${capitalizeFirstLetter(filter)}`,
        });
    }

    private async applyFilterToImage(image: Attachment, filter: string): Promise<AttachmentBuilder> {
        const base64Image: string = await this.convertImagetoBase64(image.url);
        const phontonImage: phonton.PhotonImage = phonton.PhotonImage.new_from_base64(base64Image);

        phonton.filter(phontonImage, filter);

        const uint8Array: Uint8Array = phontonImage.get_bytes();
        const buffer: Buffer = Buffer.from(uint8Array);

        return new AttachmentBuilder(buffer, {
            name: `${image.url}-imperia_filtered.jpg`,
        });
    }

    private async convertImagetoBase64(url: string): Promise<string> {
        const response: Buffer = await fetch(url, FetchResultTypes.Buffer);

        return response.toString("base64");
    }
}
