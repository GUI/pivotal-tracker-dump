CREATE TABLE `story_comment` (
	`id` integer PRIMARY KEY NOT NULL,
	`story_id` integer NOT NULL,
	`text` text,
	`person_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE INDEX `story_comment_idx_1` ON `story_comment` (`story_id`);--> statement-breakpoint
CREATE TABLE `file_attachment` (
	`id` integer PRIMARY KEY NOT NULL,
	`filename` text,
	`content_type` text,
	`size` integer,
	`download_url` text,
	`uploader_id` integer,
	`created_at` text,
	`comment_id` integer
);
--> statement-breakpoint
CREATE INDEX `file_attachment_idx_1` ON `file_attachment` (`comment_id`);--> statement-breakpoint
CREATE TABLE `file_attachment_file` (
	`file_attachment_id` integer PRIMARY KEY NOT NULL,
	`blob` blob NOT NULL
);
--> statement-breakpoint
CREATE INDEX `file_attachment_file_idx_1` ON `file_attachment_file` (`file_attachment_id`);--> statement-breakpoint
CREATE TABLE `label` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `person` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`initials` text,
	`username` text
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `story` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`story_type` text NOT NULL,
	`current_state` text NOT NULL,
	`estimate` real,
	`accepted_at` text,
	`created_at` text NOT NULL,
	`owned_by_id` integer,
	`requested_by_id` integer NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `story_label` (
	`_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`story_id` integer NOT NULL,
	`label_id` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `story_label_idx_1` ON `story_label` (`story_id`);--> statement-breakpoint
CREATE INDEX `story_label_idx_2` ON `story_label` (`label_id`);--> statement-breakpoint
CREATE TABLE `story_owner` (
	`_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`story_id` integer NOT NULL,
	`person_id` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `story_idx_1` ON `story_owner` (`story_id`);