# init-db

Optional SQL run once by the `postgres` container on first boot
(`docker-entrypoint-initdb.d`). Keep the directory present — compose bind-mounts it.

Place `.sql` files here for one-time bootstrap (e.g. `CREATE EXTENSION`).
The app schema is created by Drizzle migrations, not here.
