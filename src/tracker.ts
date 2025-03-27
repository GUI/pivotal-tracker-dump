import axios from "axios";
import { pRateLimit } from "p-ratelimit";

const projectId = process.env.TRACKER_PROJECT_ID;
const TrackerToken = process.env.TRACKER_TOKEN;

// 200 per minute per user
const limit = pRateLimit({
  interval: 1000,
  rate: 3,
  concurrency: 1,
});

const PIVOTAL_TRACKER_HOST = `https://www.pivotaltracker.com`;
const request = axios.create({
  baseURL: `${PIVOTAL_TRACKER_HOST}/services/v5`,
});

request.interceptors.request.use((config) => {
  config.headers.set("X-TrackerToken", TrackerToken);
  return config;
});

export type ApiProject = {
  id: number;
  kind: string;
  name: string;
  version: number;
  iteration_length: number;
  week_start_day: string;
  point_scale: string;
  public: boolean;

  project_type: string;
  start_time: Date;
  created_at: Date;
  updated_at: Date;

  current_iteration_number: number;
};

export async function getProject() {
  const response = await limit(() =>
    request.get<ApiProject>(`/projects/${projectId}`)
  );
  return response.data;
}

export type ApiMembership = {
  kind: string;
  project_id: number;
  id: number;
  last_viewed_at: Date;
  created_at: Date;
  updated_at: Date;
  role: string;
  project_color: string;
  favorite: boolean;
  wants_comment_notification_emails: boolean;
  will_receive_mention_notifications_or_emails: boolean;
  person: {
    kind: string;
    id: number;
    name: string;
    email: string;
    initials: string;
    username: string;
  };
};

export async function getMemberships() {
  const response = await limit(() =>
    request.get<ApiMembership[]>(`/projects/${projectId}/memberships`)
  );
  return response.data;
}

export type ApiLabel = {
  id: number;
  project_id: number;
  kind: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export async function getLabels() {
  const response = await limit(() =>
    request.get<ApiLabel[]>(`/projects/${projectId}/labels`)
  );
  return response.data;
}

export type ApiStory = {
  kind: string;
  id: number;
  created_at: string;
  updated_at: string;
  accepted_at: string;
  estimate?: number;
  story_type: string;
  story_priority: string;
  name: string;
  description?: string;
  current_state: string;
  requested_by_id: number;
  url: string;
  project_id: number;
  owner_ids: number[];
  labels: ApiLabel[];
  // blockers: ApiBlocker[]
  owned_by_id?: number;
};

export type PaginationControl = {
  offset: number;
  limit: number;
};

export type PaginationReturn<T> = {
  data: T;
  total: number;
};

export async function getStories(pagination: PaginationControl) {
  const response = await limit(() =>
    request.get<ApiStory[]>(
      `/projects/${projectId}/stories?fields=id,created_at,updated_at,accepted_at,estimate,story_type,story_priority,name,description,current_state,requested_by_id,url,project_id,owner_ids,labels,owned_by_id,blockers`,
      { params: { ...pagination } }
    )
  );
  const data = response.data;
  const totalHeader = response.headers["x-tracker-pagination-total"];
  const total = totalHeader ? parseInt(totalHeader, 10) : 0;
  return { data, total } as PaginationReturn<ApiStory[]>;
}

export type ApiComment = {
  id: number;
  story_id: number;
  text: string;
  person_id: number;
  created_at: string;
  updated_at: string;
  file_attachments: ApiFileAttachment[];
};

export type ApiFileAttachment = {
  kind: string;
  id: number;
  filename: string;
  created_at: string;
  uploader_id: number;
  thumbnailable: boolean;
  height: number;
  width: number;
  size: number;
  download_url: string;
  content_type: string;
  uploaded: boolean;
  big_url: string;
  thumbnail_url: string;
};

export async function getStoryComments(storyId: number) {
  const response = await limit(() =>
    request.get<ApiComment[]>(
      `/projects/${projectId}/stories/${storyId}/comments?fields=id,story_id,text,person_id,created_at,updated_at,file_attachments`
    )
  );
  return response.data;
}

export async function downloadFileAttachment(id: number) {
  const downloadUrl = `${PIVOTAL_TRACKER_HOST}/file_attachments/${id}/download`;

  const response = await limit(() =>
    request.get(downloadUrl, {
      responseType: "arraybuffer",
    })
  );
  return Buffer.from(response.data);
}
