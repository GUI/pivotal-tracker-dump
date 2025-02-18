import { relations } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  real,
  blob,
  index,
} from "drizzle-orm/sqlite-core";

export const project = sqliteTable("project", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
});

export const person = sqliteTable("person", {
  id: integer("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email"),
  initials: text("initials"),
  username: text("username"),
});

export const label = sqliteTable("label", {
  id: integer("id").primaryKey().notNull(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  created_at: text("created_at"),
  updated_at: text("updated_at"),
});

export const story = sqliteTable("story", {
  id: integer("id").primaryKey().notNull(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  story_type: text("story_type").notNull(),
  current_state: text("current_state").notNull(),
  estimate: real("estimate"),
  accepted_at: text("accepted_at"),
  created_at: text("created_at").notNull(),
  owned_by_id: integer("owned_by_id"),
  requested_by_id: integer("requested_by_id").notNull(),
  updated_at: text("updated_at"),
});

export const storyRelations = relations(story, ({ many, one }) => ({
  comments: many(comment),
  owner: one(person, {
    fields: [story.owned_by_id],
    references: [person.id],
  }),
  requester: one(person, {
    fields: [story.requested_by_id],
    references: [person.id],
  }),
  owners: many(storyOwner),
  labels: many(storyLabel),
}));

export const storyOwner = sqliteTable(
  "story_owner",
  {
    _id: integer("_id").primaryKey({ autoIncrement: true }).notNull(),
    story_id: integer("story_id").notNull(),
    person_id: integer("person_id").notNull(),
  },
  (table) => [index("story_idx_1").on(table.story_id)]
);

export const storyOwnerRelations = relations(storyOwner, ({ one }) => ({
  story: one(story, {
    fields: [storyOwner.story_id],
    references: [story.id],
  }),
  owner: one(person, {
    fields: [storyOwner.person_id],
    references: [person.id],
  }),
}));

export const storyLabel = sqliteTable(
  "story_label",
  {
    _id: integer("_id").primaryKey({ autoIncrement: true }).notNull(),
    story_id: integer("story_id").notNull(),
    label_id: integer("label_id").notNull(),
  },
  (table) => [
    index("story_label_idx_1").on(table.story_id),
    index("story_label_idx_2").on(table.label_id),
  ]
);

export const storyLabelRelations = relations(storyLabel, ({ one }) => ({
  story: one(story, {
    fields: [storyLabel.story_id],
    references: [story.id],
  }),
  label: one(label, {
    fields: [storyLabel.label_id],
    references: [label.id],
  }),
}));

export const comment = sqliteTable(
  "story_comment",
  {
    id: integer("id").primaryKey().notNull(),
    story_id: integer("story_id").notNull(),
    text: text("text"),
    person_id: integer("person_id").notNull(),
    created_at: text("created_at").notNull(),
    updated_at: text("updated_at"),
  },
  (table) => [index("story_comment_idx_1").on(table.story_id)]
);

export const commentRelations = relations(comment, ({ one, many }) => ({
  story: one(story, {
    fields: [comment.story_id],
    references: [story.id],
  }),
  attachments: many(fileAttachment),
  commenter: one(person, {
    fields: [comment.person_id],
    references: [person.id],
  }),
}));

export const fileAttachment = sqliteTable(
  "file_attachment",
  {
    id: integer("id").primaryKey().notNull(),
    filename: text("filename"),
    content_type: text("content_type"),
    size: integer("size"),
    download_url: text("download_url"),
    uploader_id: integer("uploader_id"),
    created_at: text("created_at"),
    comment_id: integer("comment_id"),
  },

  (table) => [index("file_attachment_idx_1").on(table.comment_id)]
);

export const fileAttachmentRelations = relations(fileAttachment, ({ one }) => ({
  comment: one(comment, {
    fields: [fileAttachment.comment_id],
    references: [comment.id],
  }),
}));

export const fileAttachmentFile = sqliteTable(
  "file_attachment_file",
  {
    file_attachment_id: integer("file_attachment_id").primaryKey().notNull(),
    blob: blob("blob", { mode: "buffer" }).notNull(),
  },
  (table) => [index("file_attachment_file_idx_1").on(table.file_attachment_id)]
);
