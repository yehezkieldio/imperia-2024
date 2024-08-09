## Contribung to Imperia

Imperia is built with TypeScript, leveraging the [Sapphire Framework](https://sapphirejs.dev/) for seamless interaction with the Discord API. The project runs on [Bun](https://bun.sh/), a high-performance alternative to [Node.js](https://nodejs.org/). While it’s possible to adapt the project to run on Node.js with some modifications, official support is only provided for Bun.

### Prerequisites

To get started with this project, you’ll need to have the following dependencies installed:

- [Bun](https://bun.sh/) (v1.1.22 or higher): The primary runtime for the project.
- [PostgreSQL](https://www.postgresql.org/): Used for data storage.
- [Dragonfly](https://www.dragonflydb.io/): Required for caching and additional features. Alternatively, you can use [Redis](https://redis.io/) as a substitute.
- [Docker](https://www.docker.com/) (optional): If Docker is installed, you can easily set up PostgreSQL and Dragonfly using the provided `compose.yml` file.


### Initial Setup

1. Create the `.env` file in the root directory of the project:
   - Duplicate the `.env.example` file and rename it to .env.
   - Fill in the required values as specified in the example file.

2. Set up PostgreSQL and Dragonfly with Docker:
   - Use the provided Makefile to manage Docker services.

        ```bash
        # Initialize the PostgreSQL and Dragonfly services
        make up

        # Tear down the PostgreSQL and Dragonfly services
        make down
        ```

3. Install project dependencies:
   - Run the following command to install the necessary packages:

        ```bash
        bun install
        ```

4. Perform database migrations:
   - Migrate the database schema or push the existing schema to the database:

        ```bash
        # Migrate the database schema
        bun run db:migrate

        # Push the database schema
        bun run db:push
        ```

## Contributing Guidelines

### Version Control

- **Branching Strategy**: All development work should be based on the `master` branch. The `stable` branch is reserved for the latest stable release.
- **Commit Messages**: Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for writing commit messages to ensure clarity and consistency.

### Code Formatting and Linting

- **Code Style**: The project uses [Biome](https://biomejs.dev/) to enforce consistent code formatting and styling. Refer to the [Biome configuration file](../biome.json) for detailed settings.
- **Pre-Commit Hooks**: Lefthook is configured to automatically run linting and formatting checks before each commit, ensuring that all code adheres to the established guidelines.

