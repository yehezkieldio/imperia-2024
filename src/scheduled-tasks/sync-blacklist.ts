import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";

export class SyncBlacklistTask extends ScheduledTask {
    public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
        super(context, {
            ...options,
            pattern: "0 0 * * *",
            timezone: "Asia/Makassar",
            customJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
            },
        });
    }

    public async run(): Promise<void> {
        const { repos, services } = this.container;

        const users: string[] = await services.blacklist.getUsers();
        const guilds: string[] = await services.blacklist.getServers();

        if (users.length !== 0) {
            await repos.blacklist.deleteUsers();
            await repos.blacklist.createUsers(users);

            this.container.logger.info("SyncBlacklistTask: Synced the user blacklist from Dragonfly to Postgres.");
        }

        if (guilds.length !== 0) {
            await repos.blacklist.deleteServers();
            await repos.blacklist.createServers(guilds);

            this.container.logger.info("SyncBlacklistTask: Synced the server blacklist from Dragonfly to Postgres.");
        }
    }
}
