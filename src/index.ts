import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { logger } from "./logger";
import * as trackerApi from "./tracker";
import * as schema from "./schema";
import path from "path";
import _ from "lodash";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { SingleBar, Presets as BarPresets } from "cli-progress";
import fse from "fs-extra";

const BATCH_SIZE = 100;

const DB_FILE_NAME =
  process.env.DB_FILE_NAME || `file:ptdump_${new Date().getTime()}.db`;

const FILE_ATTACHMENTS_DIR = process.env.FILE_ATTACHMENTS_DIR;

const DB_MIGRATIONS_DIR = path.resolve(__dirname, "../drizzle");

const PROGERSS_BAR_FORMAT =
  "[{bar}] {percentage}% | {value}/{total} | {message}";

const storyProgressBar = new SingleBar(
  {
    format: PROGERSS_BAR_FORMAT,
  },
  BarPresets.shades_classic
);

main();

async function main() {
  const db = drizzle(DB_FILE_NAME);

  logger.info(`Using databse: ${DB_FILE_NAME}`);
  await migrate(db, { migrationsFolder: DB_MIGRATIONS_DIR });

  logger.info("Start dumping data from Pivotal Tracker");

  const project = await trackerApi.getProject();
  await db.insert(schema.project).values(project);
  logger.info(`Project: ${project.name}`);

  const memberships = await trackerApi.getMemberships();
  const persons = memberships.map((m) => m.person);
  await db.insert(schema.person).values(persons);
  logger.info(`Fetched ${memberships.length} memberships`);

  const labels = await trackerApi.getLabels();
  await db.insert(schema.label).values(labels);
  logger.info(`Fetched ${labels.length} labels`);

  let offset: number = 0,
    total: number = 0;
  do {
    const params: trackerApi.PaginationControl = { offset, limit: BATCH_SIZE };
    const storiesResponse = await trackerApi.getStories(params);
    const stories = storiesResponse.data;
    total = storiesResponse.total;
    if (total === 0 || _.isNaN(total)) {
      break;
    }

    if (!storyProgressBar.isActive) {
      storyProgressBar.start(total, 0, { message: "Inserting stories..." });
    } else {
      storyProgressBar.setTotal(total);
    }

    for (const story of stories) {
      await handleStoryInsertions(db, story);
      storyProgressBar.increment();
    }
    offset += BATCH_SIZE;
  } while (offset < total);
  storyProgressBar.stop();

  logger.info(`Fetched ${total} stories`);

  await db.$client.close();
  logger.info("Dumping data from Pivotal Tracker is done");
}

function updateStoryProgressBarMessage(message: string) {
  storyProgressBar.update({ message });
  logger.debug(message);
}
async function handleStoryInsertions(
  db: LibSQLDatabase,
  story: trackerApi.ApiStory
) {
  const story_id = story.id;

  // insert story
  await db.insert(schema.story).values(story);
  updateStoryProgressBarMessage(`Inserted story: ${story.name}`);

  // insert story owners
  if (story.owner_ids.length > 0) {
    const owners = _.map(
      story.owner_ids,
      (person_id) =>
        ({
          story_id: story.id,
          person_id,
        } satisfies typeof schema.storyOwner.$inferInsert)
    );
    await db.insert(schema.storyOwner).values(owners);
    updateStoryProgressBarMessage(
      `Inserted ${owners.length} owners for #${story_id}`
    );
  }

  // insert story labels
  if (story.labels.length > 0) {
    const labels = _.map(
      story.labels,
      (label) =>
        ({
          label_id: label.id,
          story_id: story.id,
        } satisfies typeof schema.storyLabel.$inferInsert)
    );
    await db.insert(schema.storyLabel).values(labels);
    updateStoryProgressBarMessage(
      `Inserted ${labels.length} labels for #${story_id}`
    );
  }

  // fetch and insert comments
  const comments = await trackerApi.getStoryComments(story_id);
  if (comments.length > 0) {
    await db.insert(schema.comment).values(comments);
    updateStoryProgressBarMessage(
      `Inserted ${comments.length} comments for #${story_id}`
    );

    // fetch and insert file attachments
    for (const comment of comments) {
      for (const fileAttachment of comment.file_attachments) {
        const content = await trackerApi.downloadFileAttachment(
          fileAttachment.id
        );
        updateStoryProgressBarMessage(
          `Downloaded file attachment: ${fileAttachment.filename}`
        );

        const attachment: typeof schema.fileAttachment.$inferInsert = {
          ...fileAttachment,
          comment_id: comment.id,
        };
        await db.insert(schema.fileAttachment).values(attachment);

        const file: typeof schema.fileAttachmentFile.$inferInsert = {
          file_attachment_id: fileAttachment.id,
          blob: content,
        };
        await db.insert(schema.fileAttachmentFile).values(file);
        updateStoryProgressBarMessage(
          `Inserted file attachment: ${fileAttachment.filename}`
        );

        // persist file attachment to disk if FILE_ATTACHMENTS_DIR is set
        if (FILE_ATTACHMENTS_DIR) {
          fse.ensureDirSync(FILE_ATTACHMENTS_DIR);
          const filename = path.join(
            FILE_ATTACHMENTS_DIR,
            `${fileAttachment.id}_${fileAttachment.filename}`
          );
          fse.writeFileSync(filename, content);
        }
      }
    }
  }
}
