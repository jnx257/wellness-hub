CREATE TABLE "journal" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"journal_description" text NOT NULL,
	"mood_tag" text,
	"task_id" integer,
	"goal_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"birth_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "missed_reason" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "adjustment_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "declined_adjustment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;