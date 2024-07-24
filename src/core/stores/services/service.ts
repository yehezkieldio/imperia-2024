import { Piece } from "@sapphire/pieces";

export abstract class Service<Options extends Service.Options = Service.Options> extends Piece<Options, "services"> {}

export namespace Service {
    export type LoaderContext = Piece.LoaderContext<"services">;
    export type Options = Piece.Options;
    export type JSON = Piece.JSON;
    export type LocationJSON = Piece.LocationJSON;
}
