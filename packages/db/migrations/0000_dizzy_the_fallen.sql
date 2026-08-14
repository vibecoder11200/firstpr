CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"account_id" text NOT NULL,
	"scope" text,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"app_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribution" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contribution_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"pr_url" text NOT NULL,
	"pr_number" integer,
	"repo_full_name" text,
	"issue_title" text,
	"title" text,
	"merged_at" timestamp with time zone,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_first_pr" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" integer PRIMARY KEY NOT NULL,
	"repo_id" integer NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"search_text" text,
	"state" varchar(16) DEFAULT 'open' NOT NULL,
	"pull_request_id" integer,
	"html_url" text,
	"user_login" text,
	"is_good_first_issue" boolean DEFAULT false NOT NULL,
	"labels" jsonb,
	"language" text,
	"stargazers_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"discovered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"score_id" integer,
	"last_score_computed_at" timestamp with time zone,
	"stale" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repo_metrics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "repo_metrics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"repo_id" integer NOT NULL,
	"sample_count" integer DEFAULT 0 NOT NULL,
	"median_first_response_hours" integer,
	"merge_rate_90d" integer,
	"sample_days" integer,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repos" (
	"id" integer PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"description" text,
	"stargazers_count" integer DEFAULT 0 NOT NULL,
	"language" text,
	"archived" boolean DEFAULT false NOT NULL,
	"pushed_at" timestamp with time zone,
	"fork" boolean DEFAULT false NOT NULL,
	"repo_metrics_id" integer,
	"last_crawled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"issue_id" integer NOT NULL,
	"total" integer NOT NULL,
	"score_maintainer" integer,
	"score_repo_health" integer,
	"score_issue_freshness" integer,
	"score_issue_clarity" integer,
	"metric_version" integer DEFAULT 1 NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recomputed_at" timestamp with time zone,
	"confidence" text DEFAULT 'low' NOT NULL,
	"hard_filters" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"github_login" text,
	"token_invalid" boolean DEFAULT false NOT NULL,
	"token_updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_metrics" ADD CONSTRAINT "repo_metrics_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_idx" ON "account" USING btree ("provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contribution_pr_url_uq" ON "contribution" USING btree ("pr_url");--> statement-breakpoint
CREATE INDEX "contribution_user_id_idx" ON "contribution" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issues_repo_number_uq" ON "issues" USING btree ("repo_id","number");--> statement-breakpoint
CREATE INDEX "issues_language_score_idx" ON "issues" USING btree ("language","last_score_computed_at");--> statement-breakpoint
CREATE INDEX "issues_stale_idx" ON "issues" USING btree ("stale");--> statement-breakpoint
CREATE UNIQUE INDEX "repo_metrics_repo_id_uq" ON "repo_metrics" USING btree ("repo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repos_full_name_uq" ON "repos" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "repos_language_idx" ON "repos" USING btree ("language");--> statement-breakpoint
CREATE INDEX "scores_issue_id_idx" ON "scores" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");