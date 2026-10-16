import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";

import { hmacSha256 } from "../src/common/crypto.js";
import { HttpExceptionFilter } from "../src/common/http-exception.filter.js";
import { createAppValidationPipe } from "../src/common/validation.pipe.js";
import { AppModule } from "../src/app.module.js";
import { JobService } from "../src/infrastructure/jobs/job.service.js";
import { PrismaService } from "../src/infrastructure/prisma/prisma.service.js";

process.env.DATABASE_URL ??= "postgresql://elwarsha:elwarsha@localhost:5432/elwarsha";
process.env.WEB_ORIGIN ??= "http://localhost:5173";
process.env.SESSION_SECRET ??= "replace-with-32-byte-secret";
process.env.GITHUB_WEBHOOK_SECRET ??= "replace-webhook-secret";

describe("Foundation API (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.use(cookieParser());
    app.useGlobalPipes(createAppValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    const prisma = app.get(PrismaService);
    await prisma.job.deleteMany();
    await prisma.githubWebhookDelivery.deleteMany();
  });

  it("/healthz (GET)", () => {
    return request(app.getHttpServer())
      .get("/healthz")
      .expect(200)
      .expect({ status: "ok" });
  });

  it("/readyz (GET)", () => {
    return request(app.getHttpServer())
      .get("/readyz")
      .expect(200)
      .expect({ status: "ready" });
  });

  it("/api/v1/auth/me without a session (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .expect(401)
      .expect((response) => {
        expect(response.body.error.code).toBe("unauthorized");
      });
  });

  it("rejects an auth callback with mismatched state", async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.get("/api/v1/auth/login").redirects(0).expect(302);

    await agent
      .get("/api/v1/auth/callback?code=fake-code&state=wrong")
      .redirects(0)
      .expect(302)
      .expect("Location", "http://localhost:5173/ar/portal/?auth=failed");
    await agent.get("/api/v1/auth/me").expect(401);
  });

  it("completes fake login, reads the catalog, then logs out", async () => {
    const agent = request.agent(app.getHttpServer());

    const login = await agent
      .get("/api/v1/auth/login")
      .redirects(0)
      .expect(302)
      .expect("Location", /\/api\/v1\/auth\/callback\?code=fake-code/);

    const callbackLocation = login.headers.location as string;
    const callbackUrl = new URL(callbackLocation);
    await agent
      .get(`${callbackUrl.pathname}${callbackUrl.search}`)
      .redirects(0)
      .expect(302)
      .expect("Location", "http://localhost:5173/ar/portal/");

    const me = await agent.get("/api/v1/auth/me").expect(200);
    expect(me.body.user.email).toBe("participant@elwarsha.dev");
    expect(me.body.roles).toEqual(["participant"]);
    expect(me.body.capabilities).toContain("portal.view");
    expect(me.body.memberships).toHaveLength(1);

    const products = await agent.get("/api/v1/products").expect(200);
    expect(products.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ slug: "elwarsha-web" })]),
    );

    const engagements = await agent.get("/api/v1/engagements").expect(200);
    expect(engagements.body).toHaveLength(1);

    const assignments = await agent.get("/api/v1/assignments").expect(200);
    expect(assignments.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ weekNumber: 1 })]),
    );

    await agent.post("/api/v1/auth/logout").expect(201).expect({ ok: true });

    await agent.get("/api/v1/auth/me").expect(401);
    await agent.get("/api/v1/products").expect(401);
  });

  it("preserves requested locale when logging in from English portal", async () => {
    const agent = request.agent(app.getHttpServer());

    const login = await agent
      .get("/api/v1/auth/login?locale=en")
      .redirects(0)
      .expect(302)
      .expect("Location", /\/api\/v1\/auth\/callback\?code=fake-code/);

    const callbackLocation = login.headers.location as string;
    const callbackUrl = new URL(callbackLocation);
    await agent
      .get(`${callbackUrl.pathname}${callbackUrl.search}`)
      .redirects(0)
      .expect(302)
      .expect("Location", "http://localhost:5173/en/portal/");

    const me = await agent.get("/api/v1/auth/me").expect(200);
    expect(me.body.user.email).toBe("participant@elwarsha.dev");
  });

  it("rejects an unsigned GitHub webhook", () => {
    return request(app.getHttpServer())
      .post("/api/v1/github/webhooks")
      .set("x-github-delivery", "delivery-unsigned")
      .set("x-github-event", "ping")
      .send({ zen: "ok" })
      .expect(401)
      .expect((response) => {
        expect(response.body.error.code).toBe("unauthorized");
      });
  });

  it("accepts a signed GitHub webhook once", async () => {
    const body = '{"action":"opened"}';
    const signature = `sha256=${hmacSha256(
      process.env.GITHUB_WEBHOOK_SECRET ?? "replace-webhook-secret",
      body,
    )}`;
    const deliveryId = `delivery-${Date.now()}`;

    await request(app.getHttpServer())
      .post("/api/v1/github/webhooks")
      .set("content-type", "application/json")
      .set("x-hub-signature-256", signature)
      .set("x-github-delivery", deliveryId)
      .set("x-github-event", "pull_request")
      .send(body)
      .expect(201)
      .expect({ accepted: true });

    await request(app.getHttpServer())
      .post("/api/v1/github/webhooks")
      .set("content-type", "application/json")
      .set("x-hub-signature-256", signature)
      .set("x-github-delivery", deliveryId)
      .set("x-github-event", "pull_request")
      .send(body)
      .expect(201)
      .expect({ accepted: true });

    const delivery = await app.get(PrismaService).githubWebhookDelivery.findUnique({
      where: { deliveryId },
      include: { jobs: true },
    });
    expect(delivery?.jobs).toHaveLength(1);
  });

  it("claims a job once and reclaims an abandoned lease", async () => {
    const jobs = app.get(JobService);
    const prisma = app.get(PrismaService);
    const enqueued = await jobs.enqueue("reconcile_pull_requests", {
      requestedAt: new Date().toISOString(),
    });

    const claims = await Promise.all([jobs.claimNext(), jobs.claimNext()]);
    expect(claims.filter((claim) => claim?.id === enqueued.id)).toHaveLength(1);

    await prisma.job.update({
      where: { id: enqueued.id },
      data: { lockedAt: new Date(Date.now() - 6 * 60 * 1000) },
    });
    const reclaimed = await jobs.claimNext();
    expect(reclaimed?.id).toBe(enqueued.id);
    expect(reclaimed?.attemptCount).toBe(2);
  });

  afterEach(async () => {
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// Cohort Application
// ---------------------------------------------------------------------------

describe("Cohort Applications (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const url = "/api/v1/cohorts/cohort-2/applications";

  // Enum values match `ApplyCohortInput` from @elwarsha/api-client.
  const CURRENT_STATUS_VALUES = [
    "student",
    "recent_graduate",
    "employed_tech",
    "career_switcher",
    "other",
  ] as const;

  const GIT_EXPERIENCE_VALUES = ["none", "basics", "comfortable"] as const;

  // Old assignment-doc values that must now be rejected.
  const STALE_STATUS_VALUES = ["graduate", "working in tech", "switching career"];
  const STALE_GIT_VALUES = ["never", "basics only"];

  const buildPayload = (overrides: Record<string, unknown> = {}) => ({
    fullName: "Ahmed Mohamed",
    email: `ahmed-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    whatsappNumber: "+201012345678",
    githubHandle: `ahmed-dev-${Math.random().toString(36).slice(2, 8)}`,
    discordHandle: "ahmed#1234",
    currentStatus: "student",
    collegeMajor: "حاسبات ومعلومات",
    programmingExperience: "سنة",
    technologies: "JavaScript, React",
    gitExperience: "comfortable",
    personalPageUrl: "https://ahmed.dev",
    githubRepoUrl: "https://github.com/ahmed-dev/my-page",
    aiUsage: "استخدمت ChatGPT لتحسين النصوص.",
    motivation: "عايز أتعلم بناء مشاريع حقيقية مع فريق وأطور مهاراتي في العمل الجماعي.",
    ...overrides,
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.use(cookieParser());
    app.useGlobalPipes(createAppValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cohortApplication.deleteMany({ where: { cohortSlug: "cohort-2" } });
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /api/v1/cohorts/cohort-2/applications → 201 with receipt", async () => {
    const payload = buildPayload();

    const response = await request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      cohortSlug: "cohort-2",
      email: payload.email,
      status: "received",
      createdAt: expect.any(String),
    });

    const stored = await prisma.cohortApplication.findUnique({
      where: { id: response.body.id },
    });
    expect(stored).not.toBeNull();
    expect(stored?.githubHandle).toBe(payload.githubHandle);
  });

  it("POST with invalid fields → 422 with structured invalidParams", async () => {
    const response = await request(app.getHttpServer())
      .post(url)
      .send(
        buildPayload({
          email: "not-an-email",
          motivation: "short",
          whatsappNumber: "abc",
          githubHandle: "@invalid",
        }),
      )
      .expect(422);

    expect(response.body).toEqual(
      expect.objectContaining({
        type: "https://elwarsha.dev/errors/validation-failed",
        title: "Validation Failed",
        status: 422,
        detail: "Some fields have invalid values",
        instance: expect.any(String),
      }),
    );
    expect(Array.isArray(response.body.invalidParams)).toBe(true);

    const names = (response.body.invalidParams as { name: string }[]).map(
      (param) => param.name,
    );
    expect(names).toContain("email");
    expect(names).toContain("motivation");
    expect(names).toContain("whatsappNumber");
    expect(names).toContain("githubHandle");

    for (const param of response.body.invalidParams as {
      name: string;
      reason: string;
    }[]) {
      expect(typeof param.name).toBe("string");
      expect(typeof param.reason).toBe("string");
      expect(param.reason.length).toBeGreaterThan(0);
    }
  });

  it("POST with missing required fields → 422 listing every missing field", async () => {
    const response = await request(app.getHttpServer()).post(url).send({}).expect(422);

    const names = (response.body.invalidParams as { name: string }[]).map(
      (param) => param.name,
    );
    for (const field of [
      "fullName",
      "email",
      "whatsappNumber",
      "githubHandle",
      "discordHandle",
      "currentStatus",
      "collegeMajor",
      "programmingExperience",
      "technologies",
      "gitExperience",
      "personalPageUrl",
      "githubRepoUrl",
      "aiUsage",
      "motivation",
    ]) {
      expect(names).toContain(field);
    }
  });

  it("POST with a duplicate email → 409 conflict", async () => {
    const payload = buildPayload();
    await request(app.getHttpServer()).post(url).send(payload).expect(201);

    const response = await request(app.getHttpServer())
      .post(url)
      .send({ ...payload, githubHandle: `other-${Date.now()}` })
      .expect(409);

    expect(response.body).toEqual({
      type: "https://elwarsha.dev/errors/duplicate-application",
      title: "Application Already Submitted",
      status: 409,
      detail:
        "An application with this email or GitHub handle already exists for cohort-2",
      instance: url,
    });
  });

  it("POST with a duplicate GitHub handle → 409 conflict", async () => {
    const payload = buildPayload();
    await request(app.getHttpServer()).post(url).send(payload).expect(201);

    const response = await request(app.getHttpServer())
      .post(url)
      .send({ ...payload, email: `different-${Date.now()}@example.com` })
      .expect(409);

    expect(response.body.type).toBe("https://elwarsha.dev/errors/duplicate-application");
    expect(response.body.status).toBe(409);
  });

  it("allows the same email in a different cohort", async () => {
    const payload = buildPayload();
    await request(app.getHttpServer()).post(url).send(payload).expect(201);

    await request(app.getHttpServer())
      .post("/api/v1/cohorts/cohort-3/applications")
      .send(payload)
      .expect(201);
  });

  it("GET /api/v1/cohorts/cohort-2/applications/:id → 200 with full application", async () => {
    const payload = buildPayload();
    const created = await request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`${url}/${created.body.id}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: created.body.id,
        cohortSlug: "cohort-2",
        email: payload.email,
        fullName: payload.fullName,
        githubHandle: payload.githubHandle,
        status: "received",
      }),
    );
  });

  it("GET with an unknown id → 404", async () => {
    await request(app.getHttpServer())
      .get(`${url}/00000000-0000-0000-0000-000000000000`)
      .expect(404);
  });

  it("accepts every api-client enum value for currentStatus and gitExperience", async () => {
    for (const status of CURRENT_STATUS_VALUES) {
      for (const git of GIT_EXPERIENCE_VALUES) {
        await request(app.getHttpServer())
          .post(url)
          .send(buildPayload({ currentStatus: status, gitExperience: git }))
          .expect(201);
      }
    }
  });

  it("rejects the legacy assignment-doc enum values", async () => {
    for (const stale of STALE_STATUS_VALUES) {
      const response = await request(app.getHttpServer())
        .post(url)
        .send(buildPayload({ currentStatus: stale }))
        .expect(422);

      const names = (response.body.invalidParams as { name: string }[]).map(
        (param) => param.name,
      );
      expect(names).toContain("currentStatus");
    }

    for (const stale of STALE_GIT_VALUES) {
      const response = await request(app.getHttpServer())
        .post(url)
        .send(buildPayload({ gitExperience: stale }))
        .expect(422);

      const names = (response.body.invalidParams as { name: string }[]).map(
        (param) => param.name,
      );
      expect(names).toContain("gitExperience");
    }
  });
});
