import { describe, expect, it } from "vitest";

import { capabilitiesForRoles, hasCapability } from "./roles.js";

describe("capabilitiesForRoles", () => {
  it("maps a participant role to portal read capabilities", () => {
    const capabilities = capabilitiesForRoles(["participant"]);
    expect(hasCapability(capabilities, "portal.view")).toBe(true);
    expect(hasCapability(capabilities, "assignments.read")).toBe(true);
  });
});
