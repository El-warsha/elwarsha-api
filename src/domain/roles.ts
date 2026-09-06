export const membershipRoles = ["participant", "mentor", "maintainer", "admin"] as const;

export type MembershipRole = (typeof membershipRoles)[number];

export type Capability =
  | "portal.view"
  | "products.read"
  | "cohorts.read"
  | "assignments.read"
  | "submissions.read"
  | "reviews.read";

const roleCapabilities: Record<MembershipRole, Capability[]> = {
  participant: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
  ],
  mentor: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
  ],
  maintainer: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
  ],
  admin: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
  ],
};

export function capabilitiesForRoles(roles: MembershipRole[]): Capability[] {
  return [...new Set(roles.flatMap((role) => roleCapabilities[role]))];
}

export function hasCapability(capabilities: Capability[], required: Capability): boolean {
  return capabilities.includes(required);
}
