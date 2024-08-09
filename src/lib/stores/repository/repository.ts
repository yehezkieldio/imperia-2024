import { Piece } from "@sapphire/framework";

export abstract class Repository<Options extends Repository.Options = Repository.Options> extends Piece<
    Options,
    "repos"
> {}

export namespace Repository {
    export type LoaderContext = Piece.LoaderContext<"repos">;
    export type Options = Piece.Options;
    export type JSON = Piece.JSON;
    export type LocationJSON = Piece.LocationJSON;
}
