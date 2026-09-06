export type Locale = "ar" | "en";
export type MembershipRole = "participant" | "mentor" | "maintainer" | "admin";
export type Capability =
  | "portal.view"
  | "products.read"
  | "cohorts.read"
  | "assignments.read"
  | "submissions.read"
  | "reviews.read";

export type SessionUser = {
  id: string;
  displayName: string;
  email: string;
  locale: Locale;
};

export type Membership = {
  id: string;
  userId: string;
  engagementId: string;
  role: MembershipRole;
};

export type SessionResponse = {
  user: SessionUser;
  roles: MembershipRole[];
  capabilities: Capability[];
  memberships: Membership[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "active" | "archived";
  repository: { githubOwner: string; githubRepo: string } | null;
};

export type Engagement = {
  id: string;
  status: "planned" | "active" | "completed";
  cohort: {
    id: string;
    slug: string;
    name: string;
    startsOn: string;
    endsOn: string;
  };
  product: Product;
};

export type Assignment = {
  id: string;
  weekNumber: number;
  title: string;
  status: "draft" | "published" | "closed";
  engagementId: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    requestId: string | null;
  };
};

export type ElWarshaClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export class ElWarshaApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null,
  ) {
    super(body?.error.message ?? `Request failed with ${status}`);
  }
}

export function createElWarshaClient(options: ElWarshaClientOptions) {
  const fetchImpl = options.fetch ?? fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchImpl(`${options.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      throw new ElWarshaApiError(response.status, body);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    version: "0.1.0",
    health: () => request<{ status: string }>("/healthz"),
    ready: () => request<{ status: string }>("/readyz"),
    loginUrl: () => `${options.baseUrl}/api/v1/auth/login`,
    me: () => request<SessionResponse>("/api/v1/auth/me"),
    logout: () => request<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" }),
    listProducts: () => request<Product[]>("/api/v1/products"),
    listEngagements: () => request<Engagement[]>("/api/v1/engagements"),
    listAssignments: () => request<Assignment[]>("/api/v1/assignments"),
  };
}

export type ElWarshaClient = ReturnType<typeof createElWarshaClient>;
