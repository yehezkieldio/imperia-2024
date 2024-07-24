import { Piece } from "@sapphire/pieces";

export abstract class Utility<Options extends Utility.Options = Utility.Options> extends Piece<Options, "utilities"> {}

export namespace Utility {
    export type Context = LoaderContext;
    export type LoaderContext = Piece.LoaderContext<"utilities">;
    export type Options = Piece.Options;
    export type JSON = Piece.JSON;
    export type LocationJSON = Piece.LocationJSON;
}
