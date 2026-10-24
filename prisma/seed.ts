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
    update: {
      nameAr: "الدفعة الأولى",
      currentWeekNumber: 3,
    },
    create: {
      slug: "cohort-01",
      name: "Cohort 01",
      nameAr: "الدفعة الأولى",
      startsOn: new Date("2026-10-01"),
      endsOn: new Date("2026-11-26"),
      currentWeekNumber: 3,
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

  const weekAssignments = [
    {
      weekNumber: 1,
      title: "Navigate the codebase and open a focused PR",
      status: "published" as const,
      labels: ["frontend", "backend", "review"],
    },
    {
      weekNumber: 2,
      title: "State and data modeling: extend Prisma and API contract",
      status: "published" as const,
      labels: ["backend", "contract"],
    },
    {
      weekNumber: 3,
      title: "Asynchronous flow: webhook verification and background queue",
      status: "published" as const,
      labels: ["backend", "worker"],
    },
    {
      weekNumber: 4,
      title: "Authentication and authorization: session guards and capabilities",
      status: "draft" as const,
      labels: ["backend", "security"],
    },
    {
      weekNumber: 5,
      title: "Validation and reliability: request schemas and error envelopes",
      status: "draft" as const,
      labels: ["backend", "frontend"],
    },
    {
      weekNumber: 6,
      title: "Testing: unit tests and isolated regression coverage",
      status: "draft" as const,
      labels: ["testing", "quality"],
    },
    {
      weekNumber: 7,
      title: "Performance: query optimization and payload reduction",
      status: "draft" as const,
      labels: ["database", "performance"],
    },
    {
      weekNumber: 8,
      title: "Delivery: CI parity, packaging, and release verification",
      status: "draft" as const,
      labels: ["devops", "release"],
    },
  ];

  for (const item of weekAssignments) {
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

    for (const name of item.labels) {
      const label = await prisma.label.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      await prisma.assignmentLabel.upsert({
        where: {
          assignmentId_labelId: {
            assignmentId: assignment.id,
            labelId: label.id,
          },
        },
        update: {},
        create: {
          assignmentId: assignment.id,
          labelId: label.id,
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
