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
    update: {},
    create: {
      displayName: "Mariam Participant",
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

  const assignment = await prisma.assignment.upsert({
    where: {
      engagementId_weekNumber: {
        engagementId: engagement.id,
        weekNumber: 1,
      },
    },
    update: {},
    create: {
      engagementId: engagement.id,
      weekNumber: 1,
      title: "Navigate the codebase and open a focused PR",
      status: "published",
    },
  });

  for (const name of ["frontend", "backend", "review"]) {
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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
