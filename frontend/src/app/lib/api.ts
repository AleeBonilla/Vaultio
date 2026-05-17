const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

export interface ResourceDetail extends ResourceSummary {
  storageProvider: string;
  storageBucket: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileUrl: string;
  academicPeriod: { id: number; name: string; year: number; institutionId: number } | null;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
    } | null;
  }>;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  careerIds: number[];
  reputationScore: number;
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
}

interface ListResponse<T> {
  items: T[];
}

interface ItemResponse<T> {
  item: T;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Error al comunicarse con Vaultio API");
  }

  return payload as T;
}

export const authStorage = {
  getToken() {
    return window.localStorage.getItem("vaultio_token");
  },

  setSession(token: string, user: User) {
    window.localStorage.setItem("vaultio_token", token);
    window.localStorage.setItem("vaultio_user", JSON.stringify(user));
  },

  clear() {
    window.localStorage.removeItem("vaultio_token");
    window.localStorage.removeItem("vaultio_user");
  },
};

export const authApi = {
  async login(input: { email: string; password: string }) {
    const payload = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    authStorage.setSession(payload.token, payload.user);
    return payload;
  },

  async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    careerId?: number;
  }) {
    const payload = await apiFetch<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    authStorage.setSession(payload.token, payload.user);
    return payload;
  },
};

export const catalogApi = {
  async careers() {
    const payload = await apiFetch<ListResponse<Career>>("/catalog/careers");
    return payload.items;
  },

  async coursesByCareer(careerId: string | number) {
    const payload = await apiFetch<ListResponse<Course>>(`/catalog/careers/${careerId}/courses`);
    return payload.items;
  },

  async courses() {
    const payload = await apiFetch<ListResponse<Course>>("/catalog/courses");
    return payload.items;
  },

  async resourceTypes() {
    const payload = await apiFetch<ListResponse<{ id: number; name: string; description: string }>>("/catalog/resource-types");
    return payload.items;
  },

  async academicPeriods() {
    const payload = await apiFetch<ListResponse<{ id: number; name: string; year: number; institutionId: number }>>("/catalog/academic-periods");
    return payload.items;
  },

  async professors(courseId?: number) {
    const suffix = courseId ? `?courseId=${courseId}` : "";
    const payload = await apiFetch<ListResponse<{ id: number; firstName: string; lastName: string; courseIds: number[] }>>(`/catalog/professors${suffix}`);
    return payload.items;
  },
};

export const resourcesApi = {
  async list(params: { search?: string; careerId?: string; courseId?: string } = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    const suffix = search.toString() ? `?${search.toString()}` : "";
    const payload = await apiFetch<ListResponse<ResourceSummary>>(`/resources${suffix}`);
    return payload.items;
  },

  async detail(id: string) {
    const payload = await apiFetch<ItemResponse<ResourceDetail>>(`/resources/${id}`);
    return payload.item;
  },

  async create(input: CreateResourceInput) {
    const token = authStorage.getToken();
    if (!token) throw new Error("Debes iniciar sesion para subir recursos");

    const payload = await apiFetch<ItemResponse<ResourceDetail>>("/resources", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    return payload.item;
  },
};
