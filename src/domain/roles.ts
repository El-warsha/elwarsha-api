export const membershipRoles = ["participant", "mentor", "maintainer", "admin"] as const;

export type MembershipRole = (typeof membershipRoles)[number];

export type Capability =
  | "portal.view"
  | "products.read"
  | "cohorts.read"
  | "assignments.read"
  | "submissions.read"
  | "reviews.read"
  | "weeks.read";

const roleCapabilities: Record<MembershipRole, Capability[]> = {
  participant: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
    "weeks.read",
  ],
  mentor: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
    "weeks.read",
  ],
  maintainer: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
    "weeks.read",
  ],
  admin: [
    "portal.view",
    "products.read",
    "cohorts.read",
    "assignments.read",
    "submissions.read",
    "reviews.read",
    "weeks.read",
  ],
};
// flat map --> Go through each role and identify what its permissions are
// set --> remove duplicate
export function capabilitiesForRoles(roles: MembershipRole[]): Capability[] {
  return [...new Set(roles.flatMap((role) => roleCapabilities[role]))];
}
// to ensure user has a specific required permission.
export function hasCapability(capabilities: Capability[], required: Capability): boolean {
  return capabilities.includes(required);
}
