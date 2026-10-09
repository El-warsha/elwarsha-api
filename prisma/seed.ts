import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const assignmentsData = [
  {
    weekNumber: 1,
    title: "Navigate the codebase and open a focused PR",
    labels: ["frontend", "backend", "review"],
  },
  {
    weekNumber: 2,
    title: "Build a reusable React component",
    labels: ["frontend"],
  },
  {
    weekNumber: 3,
    title: "Add a REST endpoint with NestJS",
    labels: ["backend"],
  },
  {
    weekNumber: 4,
    title: "Connect the frontend to the API",
    labels: ["frontend", "backend"],
  },
  {
    weekNumber: 5,
    title: "Review a teammate's pull request",
    labels: ["review"],
  },
];

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

  for (const item of assignmentsData) {
    const assignment = await prisma.assignment.upsert({
      where: {
        engagementId_weekNumber: {
          engagementId: engagement.id,
          weekNumber: item.weekNumber,
        },
      },
      update: { title: item.title },
      create: {
        engagementId: engagement.id,
        weekNumber: item.weekNumber,
        title: item.title,
        status: "published",
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