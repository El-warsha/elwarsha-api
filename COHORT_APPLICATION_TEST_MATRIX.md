\# Cohort Application Test Matrix

| Test case | Risk covered | Test level | Existing / proposed test | Decision | Reason |

|---|---|---|---|---|---|

| A valid application returns 201 and the expected response fields | Applicants may not be able to apply, or the API response contract may regress | E2E | `app.e2e-spec.ts` › “accepts a valid Cohort 2 application with 201 Created” | \*\*fix\*\* | `ApplicationsController.apply()` routes the request to `ApplicationsService.apply()`, and the test checks the HTTP response. Merge this success assertion into the duplicate test’s initial successful submission; see the explanation below. |

| Invalid fields produce a structured 422 response | Invalid input may be accepted, or clients may not receive the expected validation error | E2E | `app.e2e-spec.ts` › “rejects an invalid Cohort 2 application with 422 and structured invalidParams” | keep | Exercises DTO validation through the configured validation pipe and HTTP error response. |

| A repeated same-cohort application returns 409 with the expected error shape | Duplicate applications may be accepted, or the API may map conflicts incorrectly | E2E | `app.e2e-spec.ts` › “rejects a duplicate Cohort 2 application with 409 Conflict” | keep | Verifies the HTTP route and conflict response. The current payload repeats both identifiers, so it is not sufficient coverage for either key individually. |

| A newly stored record has lowercased, trimmed email and GitHub handle | Duplicate behavior or stored values may vary with casing or surrounding whitespace | Unit | `applications.service.spec.ts` › “stores a new application with normalized identifiers” | add | Directly verifies the transformations and record creation in `ApplicationsService.apply()`. |

| A same-cohort email duplicate is rejected despite different casing and a different GitHub handle | An applicant could bypass email matching by changing casing | Unit | `applications.service.spec.ts` › “rejects a case-insensitive email duplicate within the same cohort” | add | Isolates email matching in `ApplicationsService.apply()` from the other duplicate key. |

| A same-cohort GitHub duplicate is rejected despite different casing and a different email | An applicant could bypass GitHub matching by changing casing | Unit | `applications.service.spec.ts` › “rejects a case-insensitive GitHub handle duplicate within the same cohort” | add | Isolates GitHub matching in `ApplicationsService.apply()` from email matching. |

| The same email is allowed for a different cohort | Applicants may be incorrectly blocked across cohorts | Unit | `applications.service.spec.ts` › “allows the same email in a different cohort” | add | Verifies the cohort condition in `ApplicationsService.apply()` directly. |

| The same GitHub handle is allowed for a different cohort | Applicants may be incorrectly blocked across cohorts | Unit | `applications.service.spec.ts` › “allows the same GitHub handle in a different cohort” | add | Separately verifies cohort scoping for the second duplicate key in `ApplicationsService.apply()`. |

| `reset()` clears the in-memory records | State may remain when the service is reused or tests are not properly isolated | Unit | `applications.service.spec.ts` › “clears applications on reset” | add | Directly tests `ApplicationsService.reset()` and can verify the cleared state using `findByCohort()`. |

| `findByCohort()` returns only records for the requested cohort | Callers may receive missing or unrelated applications | Unit | `applications.service.spec.ts` › “returns only applications for the requested cohort” | add | Directly tests the filter in `ApplicationsService.findByCohort()`. |

| Add separate E2E cases for case-insensitive email and GitHub duplicates | Extra HTTP tests would add maintenance while repeating the same API-level conflict mapping | E2E | `app.e2e-spec.ts` › “rejects a case-insensitive email duplicate over HTTP”; “rejects a case-insensitive GitHub duplicate over HTTP” | rejected | `ApplicationsService.apply()` owns these key-specific rules, and the existing E2E duplicate test already covers HTTP 409 mapping. Unit tests should distinguish the two keys. |

| Test DTO validation directly in service unit tests | Validation behavior may be duplicated at the wrong layer | Unit | `applications.service.spec.ts` › “validates application DTO fields” | rejected | The DTO constraints are applied through the HTTP validation pipeline, which the existing E2E validation test exercises. `ApplicationsService.apply()` does not implement those DTO validators. |

| Test persistence across service instances or process restarts | Tests may assert durability the implementation does not provide | Integration | `applications.service.spec.ts` › “persists applications across service instances” | rejected | `ApplicationsService` stores records in an in-memory array; persistence across instances or restarts is not behavior implemented by that method. |
