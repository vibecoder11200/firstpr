# FirstPR — Postgres restore runbook

> Follow this when you need to restore from a weekly `pg_dump` (custom format,
> gzip'd) produced by `scripts/backup.sh`. Target a **fresh** database first;
> do not restore over live data unless you intend to roll back.

## Prereqs

- Access to the `backups` volume (prod): `docker compose --profile prod exec db-backup sh`
- Local: paste the dump file, or `docker compose cp backups/firstpr-<stamp>.sql.gz db-backup:/backups/`

## Steps

1. **Confirm the dump exists and is intact.**
   ```sh
   ls -lh /backups/firstpr-*.sql.gz
   gzip -t /backups/firstpr-*.sql.gz   # exits 0 if not corrupt
   ```

2. **Create a fresh restore database.**
   ```sh
   docker compose exec postgres psql -U firstpr -c "CREATE DATABASE firstpr_restore;"
   ```

3. **Restore into it** (custom format, from stdin).
   ```sh
   cat /backups/firstpr-<stamp>.sql.gz | gzip -dc | \
     docker compose exec -T postgres pg_restore -U firstpr -d firstpr_restore
   ```
   Or, from the db-backup container directly:
   ```sh
   gzip -dc /backups/firstpr-<stamp>.sql.gz | pg_restore -c -d firstpr_restore
   ```

4. **Verify.**
   ```sh
   docker compose exec postgres psql -U firstpr -d firstpr_restore -c \
     "select count(*) from issues; select count(*) from users;"
   ```

5. **Point the app at the restored DB** (only when rolling back):
   set `DATABASE_URL` to `.../firstpr_restore`, restart api + worker,
   confirm `/api/issues` returns data.

## Alert / failure handling

- If `pg_dump` failed all week (no new `firstpr-*.sql.gz`), restore from the
  newest surviving dump and note the gap in `docs/07-decisions.md`.
- Always test one restore per month so the runbook stays true. Attach the
  successful restore date in the docs log.

## Anti-patterns (do NOT do)

- Do NOT restore while the app is writing (leads to inconsistent snapshot).
- Do NOT point prod at a data dump before verifying row counts.
- Do NOT keep encrypted tokens / backups on an unencrypted volume for prod
  credentials handling — backups hold encrypted-at-rest tokens, but protect
  the volume like a secret anyway.