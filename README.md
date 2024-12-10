## Setup Instructions

Follow the steps below to set up the project locally:

1. Install Dependencies
   After cloning the repository, install the project dependencies using `pnpm`:

```sh
pnpm install
```

2. Set Up PostgreSQL with Docker Compose
   Start PostgreSQL using Docker Compose. Make sure your PostgreSQL server on port `5432` is not running before proceeding. Run the following command:

```sh
docker-compose up -d
```

This will launch PostgreSQL in a Docker container, and it will be ready for use.

3. Configure Environment Variables
   Create a `.env` file in the root directory of the project. You can either:

- Copy the contents of `.env.example` into a new `.env` file, or
- Rename `.env.example` to `.env`.

4. Run Migrations, Seed Data, and Generate TypeScript Types
   Run the following commands to apply database migrations, seed data, and generate TypeScript types for your schema:

```sh
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:codegen
```

5. Run the Server Locally
   To run the server locally, use the following command:

```sh
pnpm start:dev
```

6. Build and Start the Application
   To build the application, run:

```sh
pnpm build
```

Once the build is complete, you can start the application using:

```sh
pnpm start
```

---

## Related Packages

- `class-transformer` and `class-validator`:
  These packages are used for validating request fields. They help ensure the correct data types, required fields, and validity of the data in incoming requests. They also support nested or embedded fields, making them useful for complex validation scenarios.

- `jsonwebtoken`:
  This package is used for encoding and decoding JSON Web Tokens (JWT) for user authentication. It secures the authentication process by signing tokens with a private key, ensuring that only valid tokens are accepted.

- `kysely and pg`:
  kysely is a type-safe SQL query builder, and pg is the PostgreSQL database driver for Node.js. Together, they provide a robust way to interact with a PostgreSQL database, allowing type-safe SQL queries and database operations.

- `kysely-codegen`:
  This package generates TypeScript code that provides a type-safe schema for the database. It automatically infers the types of tables and columns, reducing errors and improving developer experience by ensuring that database operations are type-safe.

- `husky`:
  husky is used for managing Git hooks. It automatically runs a linter before committing code, ensuring that all code adheres to the project’s style and quality standards before it is committed to the repository.

- `prisma`:
  prisma is an ORM (Object-Relational Mapping) tool that simplifies database access. It is used for generating migration scripts and seeding data in a PostgreSQL database. It helps in maintaining the schema and ensures the database structure is in sync with the application.

- `uuid`:
  This package is used to generate universally unique identifiers (UUIDs). UUIDs are often used as primary keys in databases because they are globally unique and reduce the risk of key collisions, especially in distributed systems.

---

## How to Run Unit Tests

- To run all unit tests with a coverage summary, use the following command:

```sh
pnpm test:cov
```

- To run all end-to-end tests, use the following command:

```sh
pnpm test:e2e
```
