CREATE TABLE "sightings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tram_id" integer NOT NULL,
	"seen_at" timestamp DEFAULT now() NOT NULL,
	"photo_url" varchar(500),
	CONSTRAINT "sightings_user_id_tram_id_unique" UNIQUE("user_id","tram_id")
);
--> statement-breakpoint
CREATE TABLE "trams" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"color" varchar(100) NOT NULL,
	"color_base" varchar(30) NOT NULL,
	"year_built" integer NOT NULL,
	"year_note" varchar(200),
	"photo_url" varchar(500),
	"note" text,
	CONSTRAINT "trams_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sightings" ADD CONSTRAINT "sightings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sightings" ADD CONSTRAINT "sightings_tram_id_trams_id_fk" FOREIGN KEY ("tram_id") REFERENCES "public"."trams"("id") ON DELETE cascade ON UPDATE no action;