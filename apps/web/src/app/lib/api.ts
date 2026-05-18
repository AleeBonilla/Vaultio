const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4000";

export interface Career {
  id: number;
  code: string;
  name: string;
  studyPlan: string;
  institutionId: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  careerIds: number[];
  resourcesCount?: number;
}

export interface ResourceSummary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  courseId: number;
  courseCode?: string;
  course: string;
  resourceTypeId: number;
  type: string;
  rating: number;
  ratingsCount: number;
  downloads: number;
  views: number;
  author: string;
  authorId: string;
  date: string;
  professor: string | null;
  fileExtension?: string;
  fileSize?: number;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  likes: number;
  dislikes: number;
  userVote: -1 | 0 | 1;
  author: {
    id?: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  } | null;
}

export interface ResourceDetail extends ResourceSummary {
  storageProvider: string;
  storageBucket: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileUrl: string;
  academicPeriod: { id: number; name: string; year: number; institutionId: number } | null;
  saved?: boolean;
  userRating?: number | null;
  comments: ResourceComment[];
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  careerIds: number[];
  courseIds?: number[];
  reputationScore: number;
  photoUrl?: string | null;
  bio?: string | null;
}

export interface UserStats {
  uploads: number;
  saved: number;
  ratingsGiven: number;
  avgRatingReceived: number;
  ratingsReceived: number;
  totalDownloads: number;
  totalViews: number;
}

export interface PublicStats {
  users: number;
  resources: number;
  courses: number;
  careers: number;
}

export interface CreateResourceInput {
  title: string;
  description: string;
  courseId: number;
  resourceTypeId: number;
  academicPeriodId?: number;
  professorId?: number;
  tags?: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  storageProvider?: string;
  storageBucket?: string;
  storageKey?: string;
  publicUrl?: string;
  externalUrl?: string;
}

export interface CreateUploadUrlInput {
  originalFilename: string;
  mimeType: string;
  resourceId?: string;
  scope?: "resource" | "profile-photo";
}

export interface UserReport {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reportedUserId?: string | null;
}

export interface PublicProfile {
  user: User;
  stats: UserStats;
  uploads: ResourceSummary[];
}

interface ListResponse<T> {
  items: T[];
}

interface ItemResponse<T> {
  item: T;
}

let tokenProvider: () => Promise<string | null> = async () => null;

export function setApiTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await tokenProvider().catch(() => null);
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Error al comunicarse con Vaultio API");
  }
  return payload as T;
}

export const authApi = {
  async me() {
    return apiFetch<{ user: User }>("/auth/me");
  },
};

export const usersApi = {
  async stats() {
    return apiFetch<UserStats>("/users/me/stats");
  },

  async uploads() {
    const { items } = await apiFetch<ListResponse<ResourceSummary>>("/users/me/resources");
    return items;
  },

  async saved() {
    const { items } = await apiFetch<ListResponse<ResourceSummary>>("/users/me/saved");
    return items;
  },

  async updateMe(input: Partial<Pick<User, "username" | "firstName" | "lastName" | "bio" | "photoUrl">> & { careerIds?: number[] }) {
    const { user } = await apiFetch<{ user: User }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return user;
  },

  async courses() {
    const { items } = await apiFetch<ListResponse<Course>>("/users/me/courses");
    return items;
  },

  async updateCourses(courseIds: number[]) {
    const { items } = await apiFetch<ListResponse<Course>>("/users/me/courses", {
      method: "PATCH",
      body: JSON.stringify({ courseIds }),
    });
    return items;
  },

  async publicProfile(id: string) {
    return apiFetch<PublicProfile>(`/users/${id}`);
  },

  async publicUploads(id: string) {
    const { items } = await apiFetch<ListResponse<ResourceSummary>>(`/users/${id}/resources`);
    return items;
  },

  async reportUser(id: string, reason: string) {
    return apiFetch<{ item: UserReport }>(`/users/${id}/report`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

export const catalogApi = {
  async careers() {
    const { items } = await apiFetch<ListResponse<Career>>("/catalog/careers");
    return items;
  },

  async coursesByCareer(careerId: string | number) {
    const { items } = await apiFetch<ListResponse<Course>>(`/catalog/careers/${careerId}/courses`);
    return items;
  },

  async courses() {
    const { items } = await apiFetch<ListResponse<Course>>("/catalog/courses");
    return items;
  },

  async resourceTypes() {
    const { items } = await apiFetch<ListResponse<{ id: number; name: string; description: string }>>(
      "/catalog/resource-types",
    );
    return items;
  },

  async academicPeriods() {
    const { items } = await apiFetch<ListResponse<{ id: number; name: string; year: number; institutionId: number }>>(
      "/catalog/academic-periods",
    );
    return items;
  },

  async professors(courseId?: number) {
    const suffix = courseId ? `?courseId=${courseId}` : "";
    const { items } = await apiFetch<ListResponse<{ id: number; firstName: string; lastName: string; courseIds: number[] }>>(
      `/catalog/professors${suffix}`,
    );
    return items;
  },
};

export const resourcesApi = {
  async list(
    params: {
      search?: string;
      careerId?: string | number;
      courseId?: string | number;
      typeId?: string | number;
      professorId?: string | number;
      academicPeriodId?: string | number;
      minRating?: string | number;
      extension?: string;
      kind?: "file" | "link";
      sort?: string;
    } = {},
  ) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : "";
    const { items } = await apiFetch<ListResponse<ResourceSummary>>(`/resources${suffix}`);
    return items;
  },

  async detail(id: string) {
    const { item } = await apiFetch<ItemResponse<ResourceDetail>>(`/resources/${id}`);
    return item;
  },

  async create(input: CreateResourceInput) {
    const { item } = await apiFetch<ItemResponse<ResourceDetail>>("/resources", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return item;
  },

  async download(id: string) {
    return apiFetch<{ url: string; downloads: number }>(`/resources/${id}/download`, { method: "POST" });
  },

  async rate(id: string, stars: number) {
    return apiFetch<{ item: { id: string; stars: number }; rating: number; ratingsCount: number }>(
      `/resources/${id}/ratings`,
      {
        method: "POST",
        body: JSON.stringify({ stars }),
      },
    );
  },

  async save(id: string) {
    return apiFetch<{ saved: boolean }>(`/resources/${id}/save`, { method: "POST" });
  },

  async unsave(id: string) {
    return apiFetch<{ saved: boolean }>(`/resources/${id}/save`, { method: "DELETE" });
  },

  async comment(id: string, content: string, parentId?: string | null) {
    return apiFetch<{ item: ResourceComment }>(`/resources/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId }),
    });
  },

  async voteComment(id: string, commentId: string, voteType: 1 | -1) {
    return apiFetch<{ item: ResourceComment }>(`/resources/${id}/comments/${commentId}/vote`, {
      method: "POST",
      body: JSON.stringify({ voteType }),
    });
  },

  async unvoteComment(id: string, commentId: string) {
    return apiFetch<{ item: ResourceComment }>(`/resources/${id}/comments/${commentId}/vote`, { method: "DELETE" });
  },

  async deleteComment(id: string, commentId: string) {
    return apiFetch<{ item: ResourceComment }>(`/resources/${id}/comments/${commentId}`, { method: "DELETE" });
  },
};

export const storageApi = {
  publicObjectUrl(storageKey: string) {
    return `${API_URL}/storage/public?key=${encodeURIComponent(storageKey)}`;
  },

  async createUploadUrl(input: CreateUploadUrlInput) {
    return apiFetch<{
      provider: string;
      bucket: string;
      storageKey: string;
      uploadUrl: string;
      expiresIn: number;
      publicUrl: string;
    }>("/storage/uploads", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

export const publicApi = {
  async stats() {
    return apiFetch<PublicStats>("/stats");
  },
};
