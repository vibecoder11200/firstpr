ALTER TABLE "issues" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "repo_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "repo_metrics" ALTER COLUMN "repo_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "repos" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "scores" ALTER COLUMN "issue_id" SET DATA TYPE bigint;