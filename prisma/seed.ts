import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const product = await prisma.product.upsert({
    where: { slug: "elwarsha-web" },
    update: {},
    create: {
      slug: "elwarsha-web",
      name: "ElWarsha Web",
      status: "active",
      repository: {
        create: {
          githubOwner: "elwarsha",
          githubRepo: "elwarsha-web",
          installationId: 1,
        },
      },
    },
  });

  const cohort = await prisma.cohort.upsert({
    where: { slug: "cohort-01" },
    update: {},
    create: {
      slug: "cohort-01",
      name: "Cohort 01",
      startsOn: new Date("2026-10-01"),
      endsOn: new Date("2026-11-26"),
    },
  });

  const engagement = await prisma.cohortProductEngagement.upsert({
    where: {
      cohortId_productId: {
        cohortId: cohort.id,
        productId: product.id,
      },
    },
    update: { status: "active" },
    create: {
      cohortId: cohort.id,
      productId: product.id,
      status: "active",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "participant@elwarsha.dev" },
    update: { displayName: "Test Participant" },
    create: {
      displayName: "Test Participant",
      email: "participant@elwarsha.dev",
      locale: "ar",
      identities: {
        create: {
          provider: "fake",
          providerSubject: "fake-user-1",
          githubUserId: 1001,
        },
      },
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_engagementId: {
        userId: user.id,
        engagementId: engagement.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      engagementId: engagement.id,
      role: "participant",
    },
  });

  // 1. إنشاء/تأكيد وجود الـ Labels الثابتة وحفظ الـ IDs الخاصة بها
  const labelNames = ["frontend", "backend", "review"];
  const labelsMap: Record<string, string> = {};

  for (const name of labelNames) {
    const label = await prisma.label.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    labelsMap[name] = label.id;
  }

  // 2. قائمة الـ 15 تاسك لتغطية اختبار الـ Pagination والـ Filters وحالات الـ Status المختلفة
  const mockAssignments = [
    {
      weekNumber: 1,
      title: "Navigate the codebase and open a focused PR",
      status: "published",
      labels: ["frontend", "backend", "review"],
    },
    {
      weekNumber: 2,
      title: "Setup local development environment and run tests",
      status: "closed",
      labels: ["frontend"],
    },
    {
      weekNumber: 3,
      title: "Implement user authentication endpoint using JWT",
      status: "published",
      labels: ["backend"],
    },
    {
      weekNumber: 4,
      title: "Create responsive navigation bar and mobile drawer",
      status: "published",
      labels: ["frontend"],
    },
    {
      weekNumber: 5,
      title: "Refactor PostgreSQL database queries for optimization",
      status: "draft",
      labels: ["backend"],
    },
    {
      weekNumber: 6,
      title: "Review peer Pull Request for design token integration",
      status: "published",
      labels: ["review"],
    },
    {
      weekNumber: 7,
      title: "Add unit tests for assignment filtering logic",
      status: "published",
      labels: ["frontend", "review"],
    },
    {
      weekNumber: 8,
      title: "Design and build task status badge components",
      status: "published",
      labels: ["frontend"],
    },
    {
      weekNumber: 9,
      title: "Configure rate-limiting middleware on API routes",
      status: "draft",
      labels: ["backend"],
    },
    {
      weekNumber: 10,
      title: "Perform security audit on environment variables",
      status: "closed",
      labels: ["backend"],
    },
    {
      weekNumber: 11,
      title: "Review Pull Request for pagination cursor handler",
      status: "published",
      labels: ["review"],
    },
    {
      weekNumber: 12,
      title: "Implement infinite scroll pagination for assignment list",
      status: "published",
      labels: ["frontend", "backend"],
    },
    {
      weekNumber: 13,
      title: "Setup CI/CD GitHub Actions pipeline for frontend build",
      status: "draft",
      labels: ["review"],
    },
    {
      weekNumber: 14,
      title: "Integrate i18n translation strings for Arabic language",
      status: "published",
      labels: ["frontend"],
    },
    {
      weekNumber: 15,
      title: "Write end-to-end integration tests using Vitest and MSW",
      status: "closed",
      labels: ["backend", "review"],
    },
  ];

  // 3. إدخال أو تحديث الـ Assignments وربطها بالـ Labels عبر الجدول الوسيط AssignmentLabel
  for (const item of mockAssignments) {
    const assignment = await prisma.assignment.upsert({
      where: {
        engagementId_weekNumber: {
          engagementId: engagement.id,
          weekNumber: item.weekNumber,
        },
      },
      update: {
        title: item.title,
        status: item.status,
      },
      create: {
        engagementId: engagement.id,
        weekNumber: item.weekNumber,
        title: item.title,
        status: item.status,
      },
    });

    for (const labelName of item.labels) {
      const labelId = labelsMap[labelName];

      await prisma.assignmentLabel.upsert({
        where: {
          assignmentId_labelId: {
            assignmentId: assignment.id,
            labelId,
          },
        },
        update: {},
        create: {
          assignmentId: assignment.id,
          labelId,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });