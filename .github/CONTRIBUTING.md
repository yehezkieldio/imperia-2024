# Contributing to Imperia

Imperia is written in TypeScript, utilizing the [sapphire/framework](https://sapphirejs.dev/) to interact with the Discord API, and runs on [Bun](https://bun.sh/), a drop-in replacement for [Node.js](https://nodejs.org/). With a few adjustments, you might be able to run the project on Node.js, but you'll be on your own if you choose to do so.

### Prerequisites

To run this project, ensure you have [Bun](https://bun.sh/) installed *(v1.1.22 or higher)*, as well as [PostgreSQL](https://www.postgresql.org/) for data storage. [Dragonfly](https://www.dragonflydb.io/) is also required for caching and additional features, though [Redis](https://redis.io/) can be used as a substitute. Alternatively, if [Docker](https://www.docker.com/) is installed, you can easily set up both PostgreSQL and Dragonfly using the provided docker-compose.yml file.

### Initial Setup

- Create a `.env` file following the [.env.example](../.env.example) template, and fill in the required values.

- Use the [Makefile](../Makefile) to use docker-compose to set up PostgreSQL and Dragonfly.

    ```bash
    # Initialize the PostgreSQL and Dragonfly services
    make up

    # Destroy the PostgreSQL and Dragonfly services
    make down
    ```

- Install dependencies using `bun install`.

- Perform database migration or push the schema.

    ```bash
    # Migrate the database schema
    bun run db:migrate

    # Push the database schema
    bun run db:push
    ```

## Contributing Guidelines

### Version Control

All edits to the source code must be based in the `master` branch. The `stable` branch is used for the latest stable release. Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### Code Formatting and Linting

This project uses [Biome](https://biomejs.dev/) to enforce code style and formatting. View the [configuration file](../biome.json) for more information. Lefthook is used to run the linting and formatting checks before each commit.