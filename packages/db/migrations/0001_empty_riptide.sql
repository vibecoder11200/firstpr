ALTER TABLE "repos" ADD COLUMN "is_bot_owned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "repo_metrics_computed_at_idx" ON "repo_metrics" USING btree ("computed_at");