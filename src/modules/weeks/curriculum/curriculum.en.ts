import type { CurriculumWeek } from "./curriculum.types.js";

export const curriculumEn: Record<number, CurriculumWeek> = {
  1: {
    weekNumber: 1,
    title: "Modularity & Codebase Understanding",
    tagline: "Find the boundaries before changing the system",
    concept: "Architecture and modularity",
    guidingQuestion:
      "How do we divide a large application so people and agents can change it safely?",
    bigIdea:
      "Before making changes to any system, engineers and AI tools must understand where boundaries lie. In this week, we trace a complete vertical slice through the codebase from React presentation components, down through entity models, into NestJS controllers and services, down to persistence, and enforce module boundaries so that teams and autonomous tools can build without breaking the system.",
    outcomes: [
      "Trace one user action from React through NestJS to PostgreSQL.",
      "Explain component, feature, entity, module, service, and repository responsibilities.",
      "Make a focused change without bypassing established boundaries.",
      "Decouple presentation code from wire transport contracts using provider-neutral entities.",
      "Use an AI agent to investigate code and verify its claims against source files.",
      "Give a peer review that is specific, technical, and respectful.",
    ],
    coreConcepts: [
      "Separation of concerns",
      "High cohesion and low coupling",
      "Dependency injection",
      "A module's public interface versus deep imports",
      "Anti-corruption layer (Provider-neutral Entity models vs. Wire DTOs)",
      "Repository navigation and code review",
    ],
    appliedThroughTheStack: [
      {
        layer: "React",
        details:
          "feature folders (`src/features`), entity models (`src/entities`), the component tree as a module boundary, hooks, and one-way data flow.",
      },
      {
        layer: "NestJS",
        details: "modules, controllers, providers, and dependency injection.",
      },
      {
        layer: "GitHub",
        details:
          "small branches, coherent commits, focused pull requests, and a first structured review.",
      },
    ],
    assignment: {
      title: "Navigate the codebase and open a focused PR",
      summary:
        "Map an existing feature end-to-end, then expose the starter's existing task labels through the UI and API as a vertical slice that respects frontend, backend, and persistence boundaries. The database labels table and Prisma model already exist; this week adds no database schema.",
      detailsMd: `### Frontend deliverable (core)

Implement task label presentation and entity boundaries in \`elwarsha-web\`:
- **Entity Model** (\`src/entities/assignment.ts\`): Define provider-neutral \`Assignment\` and \`Label\` domain models (utilizing the client contract without duplicating DTOs).
- **Label Chip** (\`LabelChip.tsx\`): Token-styled chip component inside \`src/features/tasks\`.
- **Label Picker** (\`LabelPicker.tsx\`): Accessible interactive filter component inside \`src/features/tasks\`.
- **Data Hook** (\`useTasks.ts\`): Wire assignments and labels through the hook. Features and components must **never** make direct \`fetch\` calls.
- **Entity Boundary Enforcement**: Features and UI must **not** import \`@elwarsha/api-client\` directly. They consume domain models from \`@entities\` and the client singleton from \`@core/api\`.

### Backend deliverable (core)

Build a **labels module** in \`elwarsha-api\`:
- **Repository** (\`labels.repository.ts\`): Encapsulates Prisma queries over \`Label\` and \`AssignmentLabel\`.
- **Service** (\`labels.service.ts\`): Exports the public interface for label operations.
- **Controller** (\`labels.controller.ts\`): Exposes \`GET /api/v1/labels\` protected by \`AuthGuard\` and capability checks.
- **Dependency Injection**: Inject \`LabelsService\` across the module boundary into \`TasksService\` (\`TasksModule\`). Do not import \`LabelsRepository\` into \`TasksModule\`.

---

### Verification bar

1. **Backend**: Extend the existing assignments e2e test in \`test/app.e2e-spec.ts\` to assert that \`GET /api/v1/assignments\` returns assignments with their labels, and that \`GET /api/v1/labels\` returns available labels.
2. **Frontend**: Extend \`src/features/tasks/TasksPage.test.tsx\` to assert that label chips render, the picker works, and all interactive controls have accessible names.
3. Do not introduce a new test harness.

### Accessibility bar

Every interactive control has an accessible name (\`aria-label\` or \`<label htmlFor="...">\`).

### Acceptance criteria (core)

- A short feature-flow diagram or written map is included tracing the request from React → NestJS → PostgreSQL.
- Business logic stays outside React components and NestJS controllers.
- No module imports another module's internal repository; only exported services cross module boundaries.
- No feature or UI component imports \`@elwarsha/api-client\` directly.
- The change includes no unrelated refactors.
- The PR explains module boundaries, the entity seam, and AI verification notes.

### Full scope (optional, raises the rubric ceiling)

- **Label filtering on the task list**: Implement active filtering inside \`useTasks\` so selecting a label in \`LabelPicker\` updates the displayed tasks, reusing the same module boundary.

### Advanced track (optional)

- **Automated boundary enforcement**:
  - Add an ESLint rule in \`elwarsha-web\` (\`no-restricted-imports\` in \`eslint.config.mjs\`) that blocks \`@elwarsha/api-client\` imports inside \`src/features/**\` and \`src/ui/**\`.
  - Add an architecture spec in \`elwarsha-api\` (\`src/modules/architecture.spec.ts\`) asserting that \`TasksModule\` never imports \`LabelsRepository\` directly, and non-infrastructure code never imports \`@prisma/client\`.
- **Complete Hexagonal Architecture (Ports & Adapters) with in-memory test doubles** (~3–4 hrs):
  - Refactor \`TasksService\` and \`LabelsService\` to depend on abstract repository ports (interfaces and NestJS injection tokens \`TASKS_REPOSITORY\` / \`LABELS_REPOSITORY\`) rather than concrete Prisma classes.
  - Implement \`PrismaTasksRepository\` / \`PrismaLabelsRepository\` under \`infra/\` and create fast \`InMemoryTasksRepository\` / \`InMemoryLabelsRepository\` test doubles backed by standard JavaScript \`Map\` structures.
  - Rewire module DI providers so services can run without a live database. Unit tests must pass completely with PostgreSQL stopped (\`docker stop\`).
- **Bidirectional URL SearchParams synchronization & history management** (~2–3 hrs):
  - Move the active filter state from ephemeral component memory into the URL query string (\`?label=<labelId>\`).
  - Implement a dedicated hook (\`useTaskFilters\` or router utility) ensuring pure presentational components do not leak router hooks.
  - Handle resilience: gracefully fall back to "All" without crashing if an unknown or malformed \`label\` query param is supplied.
  - Respect browser history: use history replacement (\`replaceState\`) when toggling filters to avoid cluttering the browser's Back/Forward stack. Extend \`@testing-library/react\` tests with \`MemoryRouter\` asserting query string synchronization.
- **Comprehensive architecture linting via \`dependency-cruiser\`** (~3–4 hrs):
  - Install and configure \`dependency-cruiser\` (\`.dependency-cruiser.cjs\`) across both workspaces to enforce full architectural hierarchy.
  - **Frontend rules**: \`features/*\` cannot import other \`features/*\`; \`ui/*\` cannot import \`features/*\` or \`entities/*\`; \`entities/*\` cannot import \`features/*\`.
  - **Backend rules**: cross-module imports must only target public service contracts; \`@prisma/client\` is forbidden outside infrastructure/repository files.
  - Add a workspace script (\`yarn arch:check\`) that runs in CI, plus a visual graph generator (\`yarn arch:graph\`) producing a Mermaid or SVG dependency map.`,
    },
    resources: {
      required: [
        {
          title: "Thinking in React",
          url: "https://react.dev/learn/thinking-in-react",
          layers: "Frontend",
          format: "Read",
          time: "25 min",
          why: "Builds the component hierarchy and data-flow mental model.",
        },
        {
          title: "NestJS Modules",
          url: "https://docs.nestjs.com/modules",
          layers: "Backend",
          format: "Read",
          time: "20 min",
          why: "Introduces the application boundary used throughout the backend.",
        },
        {
          title: "Google Engineering Practices: How to do a code review",
          url: "https://google.github.io/eng-practices/review/reviewer/",
          layers: "Concept, Delivery",
          format: "Read",
          time: "20 min, selected",
          why: "Read the introduction and 'What to look for'; the peer-review standard for the program.",
        },
        {
          title: "Best practices for coding with agents (Cursor) (pick one)",
          url: "https://cursor.com/blog/agent-best-practices",
          layers: "AI",
          format: "Read",
          time: "25 min",
          why: "How to scope work, provide context, and verify agent output.",
        },
        {
          title: "Claude Code overview (pick one)",
          url: "https://code.claude.com/docs/en/overview",
          layers: "AI",
          format: "Read",
          time: "20 min",
          why: "The same orientation for the terminal agent; read this or the Cursor guide.",
        },
      ],
      assignment: [
        {
          title: "NestJS Providers",
          url: "https://docs.nestjs.com/providers",
          layers: "Backend",
          format: "Read",
          time: "20 min",
          why: "Dependency injection details while you build the labels module.",
        },
        {
          title: "Feature-Sliced Design: Entities",
          url: "https://feature-sliced.design/docs/reference/layers#entities",
          layers: "Frontend",
          format: "Read",
          time: "15 min",
          why: "Why domain models live in entities rather than raw API clients.",
        },
        {
          title: "Understanding your UI as a tree",
          url: "https://react.dev/learn/understanding-your-ui-as-a-tree",
          layers: "Frontend",
          format: "Read",
          time: "15 min",
          why: "Render and module dependency trees, if the feature map is unclear.",
        },
      ],
      alternative: [
        {
          title: "Building a platform: NestJS from the ground up",
          url: "https://www.youtube.com/watch?v=f0qzBkAQ3mk",
          layers: "Backend",
          format: "Watch",
          time: "26 min",
          why: "Video alternative to the NestJS Modules reading, by the framework's creator.",
        },
        {
          title: "PodRocket: Modularizing the Monolith",
          url: "https://podrocket.logrocket.com/modularizing-monolith-jimmy-bogard",
          layers: "Concept",
          format: "Listen",
          time: "32 min",
          why: "Audio alternative to the NDC talk; same speaker, transcript available.",
        },
        {
          title: "Modularizing the Monolith — Jimmy Bogard, NDC Oslo",
          url: "https://www.youtube.com/watch?v=fc6_NtD9soI",
          layers: "Concept",
          format: "Watch",
          time: "56 min",
          why: "Finding and enforcing boundaries inside an existing large codebase.",
        },
      ],
    },
    reflectionQuestion: "Which boundary would you be most likely to break, and why?",
    prerequisites: ["Node 22", "Corepack/Yarn", "Docker Compose Postgres"],
  },
  2: {
    weekNumber: 2,
    title: "Connecting Frontend & Backend (HTTP & API Contracts)",
    tagline: "Agree on the contract before writing code",
    concept: "HTTP & API Contracts",
    guidingQuestion:
      "How do the frontend and backend talk to each other without breaking?",
    bigIdea:
      "In Week 1, you learned how to organize your code into clean modules. This week, we connect two completely separate worlds:\n\n1. **The Frontend (React):** The visual form running in the student's web browser.\n2. **The Backend (NestJS):** The server running on a computer that receives data, checks it, and saves it.\n\nBecause these two parts run in different places, they must agree on a **Contract**:\n\n- What data does the frontend send?\n- What checks must the backend perform?\n- How does the server reply if the user made a mistake (like typing an invalid email)?",
    outcomes: [
      "How HTTP works: How a browser sends data (POST) and how servers answer with status codes (201 Created, 422 Validation Error, 409 Already Exists).",
      "Input Validation: Checking user inputs on the server so bad or malicious data never enters the database.",
      "Friendly, Structured Errors: Sending clean JSON error messages so the frontend knows exactly which field had a problem.",
      "Form UX & States: Making forms feel great in React (disabling the button while submitting, showing error text under wrong fields, showing a celebration receipt on success).",
      "Accessibility (A11y): Connecting <label> to <input> so everyone, including people using screen readers, can use your form.",
    ],
    coreConcepts: [
      "HTTP request methods & semantics (POST vs GET)",
      "HTTP status codes (201 Created, 422 Unprocessable Entity, 409 Conflict)",
      "Server-side validation via class-validator & ValidationPipe",
      "Structured JSON Problem Details & invalidParams (RFC 7807)",
      "Form UX states & uncontrolled inputs (React Hook Form)",
      "Semantic HTML & accessible form notifications (aria-invalid, aria-describedby)",
    ],
    appliedThroughTheStack: [
      {
        layer: "React",
        details:
          "Accessible forms (<fieldset>, <legend>, <label>), React Hook Form integration, field-level error mapping, submit states, and success receipts.",
      },
      {
        layer: "NestJS",
        details:
          "DTOs with class-validator decorators, ValidationPipe exception mapping, ConflictException (409) handling, and clean controller endpoints.",
      },
      {
        layer: "HTTP/REST",
        details:
          "RFC 7807 structured Problem Details, 201 Created receipts, 422 Validation Errors, and 409 Conflict detection.",
      },
    ],
    assignment: {
      title: "Cohort 2 Application Form",
      summary:
        "Build the official application form for ElWarsha Cohort 2! When a prospective student fills out the form on the website, the React frontend sends it to the NestJS backend. The backend validates the inputs and responds accordingly.",
      detailsMd: `> **Starter Kit Note:** The routing (\`/:locale/apply\`), header CTA button ("قدّم للدفعة القادمة" / "Apply for next cohort"), pre-rendered page shell, and the shared API client binding (\`api.applyCohort\`) are already wired up for you in the starter codebase and mount your component. Your assignment is focused on building:
>
> 1. The **\`CohortApplicationForm\`** component with full input controls, validation feedback, and workshop styling.
> 2. The **NestJS backend validation & controller contract** with structured error responses and duplicate detection.

### 1. The Form Fields (The Contract)

The application collects 14 fields organized into 4 simple sections:

#### Section 1: Personal & Contact Information (البيانات الشخصية والتواصل)

| Field | Arabic Label | English Label | Type | Simple Rules |
| :--- | :--- | :--- | :--- | :--- |
| \`fullName\` | الاسم بالكامل | Full Name | Text | Required, at least 3 letters |
| \`email\` | البريد الإلكتروني | Email Address | Email | Required, must be a valid email (e.g. \`user@example.com\`) |
| \`whatsappNumber\` | رقم واتساب | WhatsApp Number | Tel | Required, 10 to 15 digits (supports \`+\` e.g. \`+201012345678\` or \`01012345678\`) |
| \`githubHandle\` | اسم الحساب على GitHub | GitHub Handle | Text | Required, username only (e.g. \`octocat\`, alphanumeric & hyphens, no URL/\`@\`) |
| \`discordHandle\` | اسم الحساب على Discord | Discord Handle | Text | Required, username only |

#### Section 2: Technical Background (الخلفية التقنية والتعليمية)

| Field | Arabic Label | English Label | Type | Simple Rules |
| :--- | :--- | :--- | :--- | :--- |
| \`currentStatus\` | وضعك الحالي | Current Status | Dropdown | Pick one: student, graduate, working in tech, switching career, other |
| \`collegeMajor\` | الكلية والتخصص | College & Major | Text | Required (e.g. حاسبات ومعلومات) |
| \`programmingExperience\` | من إمتى وانت بتتعلم برمجة؟ | Programming Experience | Text | Required (e.g. سنة، ٦ شهور) |
| \`technologies\` | اللغات والتقنيات اللي اشتغلت بيها فعليًا | Technologies Used | Textarea | Required, tech you actually wrote code with |
| \`gitExperience\` | استخدمت Git قبل كده؟ | Git Experience | Dropdown | Pick one: never, basics only, comfortable |

#### Section 3: Personal Page Task (مهمة الصفحة الشخصية)

| Field | Arabic Label | English Label | Type | Simple Rules |
| :--- | :--- | :--- | :--- | :--- |
| \`personalPageUrl\` | رابط الصفحة الشخصية المنشورة | Published Personal Page Link | URL | Required, must start with \`http://\` or \`https://\` |
| \`githubRepoUrl\` | لينك الريبو على GitHub | GitHub Repository Link | URL | Required, must be a GitHub repository URL (e.g. \`https://github.com/u/r\`) |
| \`aiUsage\` | استخدمت أدوات الذكاء الاصطناعي في عمل الصفحة؟ | AI Usage | Textarea | Required, tell us honestly how you used AI tools (or if you didn't) |

#### Section 4: Motivation (الدافع والالتزام)

| Field | Arabic Label | English Label | Type | Simple Rules |
| :--- | :--- | :--- | :--- | :--- |
| \`motivation\` | ليه عايز تدخل البرنامج ده تحديدًا؟ | Motivation | Textarea | Required, at least 50 characters (add a live character counter for a great UX feel) |

---

### 2. How the Backend Responds

The endpoint is: \`POST /api/v1/cohorts/cohort-2/applications\`

1. **If everything is valid (\`201 Created\`):**
\`\`\`json
{
  "id": "app_123456",
  "cohortSlug": "cohort-2",
  "email": "student@example.com",
  "status": "received",
  "createdAt": "2026-10-10T12:00:00.000Z"
}
\`\`\`
2. **If fields have mistakes (\`422 Unprocessable Entity\`):**
The backend sends a clear JSON response listing every invalid field:
\`\`\`json
{
  "type": "https://elwarsha.dev/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Some fields have invalid values",
  "instance": "/api/v1/cohorts/cohort-2/applications",
  "invalidParams": [
    { "name": "email", "reason": "Must be a valid email address" },
    { "name": "motivation", "reason": "Must be at least 50 characters" }
  ]
}
\`\`\`
3. **If the user already applied with this email or GitHub (\`409 Conflict\`):**
\`\`\`json
{
  "type": "https://elwarsha.dev/errors/duplicate-application",
  "title": "Application Already Submitted",
  "status": 409,
  "detail": "An application with this email or GitHub handle already exists for Cohort 2",
  "instance": "/api/v1/cohorts/cohort-2/applications"
}
\`\`\`

---

### Deliverables

#### Backend Deliverable (\`elwarsha-api\`)

1. **The DTO (\`src/modules/applications/dto/apply-cohort.dto.ts\`):** Validates all 14 fields using \`class-validator\` decorators according to the contract rules.
2. **The Service (\`src/modules/applications/applications.service.ts\`):** Stores applications in-memory (pre-database) and throws \`ConflictException\` (409) if the email or GitHub handle is already submitted for the cohort.
3. **The Controller (\`src/modules/applications/applications.controller.ts\`):** Handles \`POST /api/v1/cohorts/:slug/applications\`, invokes the service, and returns \`201 Created\` with receipt details.
4. **Validation Pipe & Exception Filter (\`src/common/\`):** Formats validation failures into standard HTTP 422 errors with \`invalidParams\` (\`[{ name, reason }]\`), and duplicate submissions into HTTP 409.
5. **OpenAPI Export:** Run \`yarn openapi:export\` to generate the updated \`openapi.json\`.

#### Frontend Deliverable (\`elwarsha-web\`)

1. **The Component (\`src/features/apply/CohortApplicationForm.tsx\` & \`.module.css\`):** Accessible form divided into 4 \`<fieldset>\` sections for the 14 contract fields, styled with ElWarsha tokens (\`tokens.css\`).
2. **Form UX States:** Handles idle, submitting (disabled button), inline field errors, duplicate conflict alert (409), and admission receipt card (201).
3. **API Integration (\`@core/api\`):** Submits form data via \`api.applyCohort(cohortSlug, formData)\`.
4. **Error Mapping & UX:** Maps backend 422 \`invalidParams\` directly under inputs, clears stale errors on change, and shows a live character counter on \`motivation\`.

---

### Verification Bar (How we test it)

- **Backend (\`test/app.e2e-spec.ts\`):** Write E2E tests verifying that valid submissions return \`201 Created\`, invalid inputs return \`422 Unprocessable Entity\` with structured \`invalidParams\`, and duplicate entries return \`409 Conflict\`.
- **Frontend (\`src/features/apply/CohortApplicationForm.test.tsx\`):** Write component tests verifying that all sections render, backend 422 errors display directly below invalid fields, 409 conflicts show an alert, and successful submissions display the admission receipt.

---

### Accessibility Bar (Don't skip this!)

- Every \`<input>\` must have a matching \`<label htmlFor="id">\`.
- When an input has an error:
  - Add \`aria-invalid="true"\` to the \`<input>\`.
  - Add \`id="[field]-error"\` to the error message text.
  - Add \`aria-describedby="[field]-error"\` to the \`<input>\`.

---

### Advanced track (optional)

- **Form Draft Auto-Save & Crash Recovery via \`localStorage\`** (~1.5–2 hrs):
  - Build a custom hook (\`useFormDraft\` in \`src/features/apply/useFormDraft.ts\`) that debounces form state to \`localStorage\` (\`elwarsha:cohort-2:draft\`) on input change.
  - Hydrate form fields on initial mount if a valid draft exists, displaying a subtle dismissible banner informing the user that their draft was restored.
  - Automatically purge the draft from \`localStorage\` once the server responds with \`201 Created\`.
  - Handle edge cases gracefully: ignore corrupted JSON, catch storage quota errors in private browsing modes, and provide a "Clear draft" button to reset the form.
  - Extend Vitest unit tests in \`CohortApplicationForm.test.tsx\` using a mocked \`localStorage\` to assert saving, hydration, and cleanup.
- **Abuse Prevention & 429 Error Contract via \`@nestjs/throttler\`** (~1.5–2 hrs):
  - Install and configure \`@nestjs/throttler\` in \`elwarsha-api\` (\`src/app.module.ts\` and \`applications.controller.ts\`) to limit public application submissions (e.g. max 5 requests per 60 seconds per IP).
  - Intercept throttler exceptions in \`src/common/http-exception.filter.ts\` to format rate-limit errors into the project's standard JSON error response (\`429 Too Many Requests\`), including the standard \`Retry-After\` header.
  - On the frontend form, catch HTTP 429 responses and display a tactile alert showing the retry cooldown before allowing the user to submit again.
  - Extend \`test/app.e2e-spec.ts\` with a test that sends 6 rapid requests and asserts that the 6th response returns HTTP 429 with the structured error body.`,
    },
    resources: {
      required: [
        {
          title: "MDN: An overview of HTTP",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
          layers: "Concept",
          format: "Read",
          time: "15 min",
          why: "Mental model for client-server communication, request/response cycles, and headers.",
        },
        {
          title: "MDN: HTTP request methods",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods",
          layers: "Concept",
          format: "Read",
          time: "10 min",
          why: "Understanding semantics of `POST` for submission vs `GET` for retrieval.",
        },
        {
          title: "W3C WAI: Form Validation Tutorial",
          url: "https://www.w3.org/WAI/tutorials/forms/notifications/",
          layers: "Frontend, Accessibility",
          format: "Read",
          time: "15 min",
          why: "Accessibility standards: how to announce errors with `aria-invalid` and `aria-describedby`.",
        },
        {
          title: "NestJS: Validation Techniques",
          url: "https://docs.nestjs.com/techniques/validation",
          layers: "Backend",
          format: "Read",
          time: "20 min",
          why: "Setting up `ValidationPipe`, class-validator decorators, and custom exception factories.",
        },
        {
          title: "React Hook Form: Get Started",
          url: "https://react-hook-form.com/get-started",
          layers: "Frontend",
          format: "Read",
          time: "25 min",
          why: "Core mental model of uncontrolled inputs with `register`, `handleSubmit`, and `formState.errors`.",
        },
        {
          title: "Cursor Plan Mode (pick one)",
          url: "https://cursor.com/docs/agent/plan-mode",
          layers: "AI",
          format: "Read",
          time: "15 min",
          why: "Plan-first agent collaboration; read this or the Claude Code workflows.",
        },
        {
          title: "Claude Code common workflows (pick one)",
          url: "https://code.claude.com/docs/en/common-workflows",
          layers: "AI",
          format: "Read",
          time: "20 min, selected",
          why: "Exploration, planning, and pull-request workflows; read this or Cursor Plan Mode.",
        },
      ],
      assignment: [
        {
          title: "React Hook Form: setError API Reference",
          url: "https://react-hook-form.com/docs/useform/seterror",
          layers: "Frontend",
          format: "Read",
          time: "10 min",
          why: "How to programmatically map backend 422 `invalidParams` into form fields and trigger focus.",
        },
        {
          title: "class-validator Documentation",
          url: "https://github.com/typestack/class-validator",
          layers: "Backend",
          format: "Read",
          time: "15 min",
          why: "Detailed lookup for validation decorators (`@IsEmail`, `@IsUrl`, `@MinLength`, `@IsEnum`, etc.).",
        },
        {
          title: "MDN: HTML forms guide",
          url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form",
          layers: "Frontend",
          format: "Read",
          time: "15 min",
          why: "Reference for `<form>`, `<fieldset>`, `<legend>`, `<label>`, and semantic form controls.",
        },
      ],
      alternative: [
        {
          title: "ByteGrad: React Hook Form (+ Zod) — Complete Tutorial",
          url: "https://www.youtube.com/watch?v=k5jG58q025E",
          layers: "Frontend",
          format: "Watch",
          time: "35 min",
          why: "Video alternative to the React Hook Form reading, covering `useForm`, input registration, and handling server errors.",
        },
        {
          title: "Dave Gray: NestJS DTO Schemas, Validation & Pipes",
          url: "https://www.youtube.com/watch?v=Fh3K009K524",
          layers: "Backend",
          format: "Watch",
          time: "20 min",
          why: "Video alternative to the NestJS Validation reading, covering DTO schemas, `class-validator`, and `ValidationPipe`.",
        },
        {
          title: "NestJS Throttler Documentation",
          url: "https://docs.nestjs.com/security/rate-limiting",
          layers: "Backend",
          format: "Read",
          time: "15 min",
          why: "Setting up rate limiting guards and `@Throttle` decorators for the abuse prevention track.",
        },
        {
          title: "MDN: Window.localStorage",
          url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
          layers: "Frontend",
          format: "Read",
          time: "10 min",
          why: "Safe usage patterns, quota limits, and serialization for the draft auto-save track.",
        },
      ],
    },
    reflectionQuestion:
      "What leaks when a controller imports a database or entity model directly instead of receiving a validated DTO?",
    prerequisites: [
      "Week 1: Modularity & codebase understanding",
      "Basic familiarity with TypeScript & React",
    ],
  },
  3: {
    weekNumber: 3,
    title: "Database Migrations, Runtime Contracts & Server State",
    tagline: "How schema changes flow safely through contracts to reactive UI components",
    concept: "Database Migrations & Server State",
    guidingQuestion:
      "How do database schema changes flow safely through runtime contracts to reactive UI components?",
    bigIdea:
      "In Week 2, you built an accessible application form and connected client-server HTTP contracts. This week, we connect the complete end-to-end vertical slice across all architectural layers:\n\n1. **PostgreSQL & Prisma:** Adding and applying database migrations safely with backwards-compatible defaults.\n2. **NestJS Service & API:** Reading cohort progression from the database and driving dynamic week locking rules.\n3. **Zod Runtime Contracts:** Validating API payloads at the frontend boundary to guarantee type safety and prevent runtime errors.\n4. **TanStack React Query:** Caching, synchronizing, and handling async server state with custom hooks.\n5. **Modular React Architecture:** Rendering single-responsibility components following the one-component-per-file pattern.",
    outcomes: [
      "Create and apply PostgreSQL schema migrations safely using Prisma CLI with default values for backwards compatibility.",
      "Enforce dynamic business and locking rules in NestJS services driven directly by database state.",
      "Validate API response payloads at the system boundary using Zod runtime schemas.",
      "Manage asynchronous server state, caching, loading, and error states using TanStack React Query hooks.",
      "Organize user interface features into clean, modular single-responsibility components adhering strictly to one component per file.",
    ],
    coreConcepts: [
      "Database migrations & schema evolution (Prisma migrate)",
      "Backwards-compatible defaults in relational databases",
      "Runtime contract validation (Zod)",
      "Server state management & caching (TanStack Query v5)",
      "Single Responsibility Principle & Component Modularity (1 component per file)",
      "Accessible data presentation & responsive grid layouts",
    ],
    appliedThroughTheStack: [
      {
        layer: "PostgreSQL",
        details: "Prisma schema migration adding currentWeekNumber with @default(1).",
      },
      {
        layer: "NestJS",
        details: "WeeksService dynamic locking rules driven by cohort.currentWeekNumber.",
      },
      {
        layer: "Zod",
        details: "Runtime parsing and type assertion for cohort and week card payloads.",
      },
      {
        layer: "React",
        details:
          "TanStack Query integration (useCohortWeeks), modular cards (CohortHeaderBar, WeekCard, LockedWeekCard), and WeeksPage layout.",
      },
    ],
    assignment: {
      title: "Database Migrations, Zod Contracts & Weeks Summary Page",
      summary:
        "Migrate the database to track cohort progress, validate API data with Zod, and build the Weeks Summary Page using TanStack React Query.",
      detailsMd: `### Week 3 Assignment: Database Migrations, Runtime Contracts & Server State

#### 1. Database Migration & Backend (\`elwarsha-api\`)
- In \`prisma/schema.prisma\`, add \`currentWeekNumber Int @default(1)\` to \`model Cohort\`.
- Run \`npx prisma migrate dev --name add_cohort_current_week\`.
- Update \`prisma/seed.ts\` setting \`currentWeekNumber: 3\` on \`cohort-01\`.
- In \`src/modules/weeks/weeks.service.ts\`, read \`cohort.currentWeekNumber\`:
  - Weeks \`<= currentWeekNumber\` are unlocked.
  - Week \`=== currentWeekNumber\` is active (\`isCurrent: true\`, \`status: "active"\`).
  - Weeks \`> currentWeekNumber\` are locked (\`isLocked: true\`, \`status: "upcoming"\`).
  - Expose \`currentWeekNumber\` in \`cohortRef\`.

#### 2. Frontend Contract & UI (\`elwarsha-web\`)
- In \`src/features/weeks/weeks.schema.ts\`, update \`cohortRefSchema\` to parse and validate \`currentWeekNumber\`.
- In \`src/features/weeks/useCohortWeeks.ts\`, implement the hook with TanStack Query (\`useQuery\`), validating the response with Zod.
- Create modular components in \`src/features/weeks/components/\` (strictly 1 component per file):
  - \`CohortHeaderBar.tsx\`: Cohort name, date range, and current week badge.
  - \`WeekCard.tsx\`: Unlocked card with status badge, concept, and link to detail page.
  - \`LockedWeekCard.tsx\`: Dimmed locked card with padlock icon and disabled link.
- In \`src/features/weeks/WeeksPage.tsx\`, consume \`useCohortWeeks\`, render loading and error states, and map over weeks.

#### 3. Verification Bar
- Run \`yarn test\` and \`yarn test:e2e\` in \`elwarsha-api\`.
- Run \`yarn test\` and \`yarn build\` in \`elwarsha-web\`.`,
    },
    resources: {
      required: [
        {
          title: "TanStack Query Render Optimizations (select)",
          url: "https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations",
          layers: "Frontend",
          format: "Read",
          time: "15 min",
          why: "How to derive view models from query cache without unnecessary component re-renders.",
        },
        {
          title: "TanStack Query Full Course 2026 — PedroTech",
          url: "https://youtu.be/mqV5OvbyXcM?si=d5VlfO4v_QXdfTTk",
          layers: "Frontend",
          format: "Watch",
          time: "45 min",
          why: "Complete video walkthrough of query keys, loading/error states, and data fetching hooks.",
        },
        {
          title: "Zod Validation in React (Complete Tutorial) — Cosden Solutions",
          url: "https://www.youtube.com/watch?v=U9PYyMhDc_k",
          layers: "Frontend, Concept",
          format: "Watch",
          time: "25 min",
          why: "Understanding runtime schema parsing, type inference, and defensive boundary validation.",
        },
        {
          title: "Prisma Migrations: A Step-by-Step Guide — Prisma",
          url: "https://www.youtube.com/watch?v=ZaCFsFES5yQ",
          layers: "Backend, Database",
          format: "Watch",
          time: "20 min",
          why: "How Prisma creates, tracks, and applies incremental SQL migration files.",
        },
        {
          title: "Prisma 6 Migrate Getting Started",
          url: "https://www.prisma.io/docs/orm/v6/prisma-migrate/getting-started",
          layers: "Backend, Database",
          format: "Read",
          time: "15 min",
          why: "Official reference for prisma migrate dev, migration history, and default column values.",
        },
        {
          title: "React Router: Declarative Routing Guide",
          url: "https://reactrouter.com/start/declarative/routing",
          layers: "Frontend",
          format: "Read",
          time: "15 min",
          why: "URL params, route matching, and linking between summary and detail views.",
        },
      ],
      assignment: [
        {
          title: "NestJS Prisma Recipe",
          url: "https://docs.nestjs.com/recipes/prisma",
          layers: "Backend",
          format: "Read",
          time: "15 min",
          why: "Setting up and injecting PrismaService across NestJS modules.",
        },
        {
          title: "NestJS Modules Documentation",
          url: "https://docs.nestjs.com/modules",
          layers: "Backend",
          format: "Read",
          time: "15 min",
          why: "Structuring feature modules, controllers, and service providers cleanly.",
        },
        {
          title: "Zod Documentation & Schema Parsing",
          url: "https://zod.dev",
          layers: "Contract",
          format: "Read",
          time: "15 min",
          why: "API reference for z.object, z.array, z.number, and safeParse.",
        },
      ],
      alternative: [
        {
          title: "TanStack Query: 1 Intro (Arabic) — kimz codes",
          url: "https://youtu.be/KIS-MJfuPDY?si=NEFlBFNJ5VPn7Xzt",
          layers: "Frontend",
          format: "Watch",
          time: "20 min",
          why: "Arabic video introduction to TanStack Query mental models and hooks.",
        },
        {
          title: "Form & Data Validation with Zod (Arabic) — Youssef Turkey",
          url: "https://youtu.be/4j5SZBTIXLc?si=LRh3UaiP1ODDDbDs",
          layers: "Frontend, Contract",
          format: "Watch",
          time: "25 min",
          why: "Arabic video tutorial on building schemas and validating runtime contracts with Zod.",
        },
        {
          title: "كورس Prisma الشامل مع PostgreSQL & Express (Arabic) — Ali Sleem",
          url: "https://www.youtube.com/watch?v=KoFgG7Rjhbc&t=775s",
          layers: "Backend, Database",
          format: "Watch",
          time: "30 min",
          why: "Arabic video tutorial covering Prisma schemas, migrations, and PostgreSQL relations.",
        },
        {
          title: "تعلم كل شيء عن Prisma (ORM) مع TypeScript (Arabic) — Simple Arab Code",
          url: "https://www.youtube.com/watch?v=uRPLhqR_d5I&t=92s",
          layers: "Backend, Database",
          format: "Watch",
          time: "25 min",
          why: "Arabic video overview of Prisma Client generation and queries.",
        },
        {
          title: "كورس Nest JS في ٣ ساعات (Arabic) — أكاديمية ترميز",
          url: "https://www.youtube.com/watch?v=RwOxUg2rsjY&t=4794s",
          layers: "Backend",
          format: "Watch",
          time: "40 min",
          why: "Arabic crash course covering controllers, services, and dependency injection in NestJS.",
        },
      ],
    },
    reflectionQuestion:
      "Why is runtime validation with Zod necessary on the frontend even when TypeScript types already compile without errors?",
    prerequisites: [
      "Week 2: Connecting Frontend & Backend (HTTP & API Contracts)",
      "Docker Compose PostgreSQL running locally",
      "Node 22, Yarn & Vitest",
    ],
  },
  4: {
    weekNumber: 4,
    title: "Identity, Authentication & Route Protection",
    tagline:
      "Authenticate identity at the edge; protect every sensitive route through the stack",
    concept: "Authentication, session management & protected routes",
    guidingQuestion:
      "How do we prove user identity and ensure portal routes are strictly gated?",
    bigIdea:
      "In Week 3, you built the Cohort Weeks portal view. This week, we make **login fully working** and **protect sensitive routes** across both frontend and backend:\n\n1. **Authentication (Login):** Prove user identity through secure HttpOnly cookie sessions. Unauthenticated requests return **401 Unauthorized**.\n2. **Object-Level Authorization (BOLA Defense):** Proving identity (401) is only the first layer. A participant must not access another cohort's weekly materials. We implement a NestJS `CohortMembershipGuard` checking database membership for `:cohortSlug` and returning **403 Forbidden** for non-members.\n3. **Protected Routes (Frontend):** Build a `ProtectedRoute` wrapper for portal routes that handles loading, signed-out, and denied states without ever reading or storing session tokens in JavaScript storage.\n4. **Session Lifecycle:** Display the user identity and a Sign-out button in the UI that cleanly revokes the session on the backend.\n5. **Browser Security:** Enforce HttpOnly and SameSite cookie policies, along with strict CORS allowlists for the frontend origin with credentials.",
    outcomes: [
      "Require a valid session cookie on protected API routes and return 401 when missing or expired.",
      "Implement object-level cohort authorization with CohortMembershipGuard to prevent Broken Object Level Authorization (BOLA), returning 403 when an authenticated user attempts to access a cohort they are not enrolled in.",
      "Implement a ProtectedRoute component in React that gates portal routes based on authentication status.",
      "Render dedicated, accessible Signed-Out and Access-Denied screens in Arabic and English.",
      "Connect the complete login and logout flow end-to-end between frontend and backend.",
      "Enforce cookie security (HttpOnly, Secure, SameSite) and CORS allowlisting with credentials.",
    ],
    coreConcepts: [
      "Authentication vs authorization",
      "Object-level authorization & BOLA prevention (OWASP API1:2023)",
      "Session cookies (HttpOnly, Secure, SameSite)",
      "Protected routes and auth context in React",
      "Route gating with NestJS Guards",
      "Accessible request states and focus management",
      "Disclosure policy: 401 vs 403 vs 404",
    ],
    appliedThroughTheStack: [
      {
        layer: "NestJS",
        details:
          "AuthGuard, RequireCapability('weeks.read'), and CohortMembershipGuard applied to WeeksController endpoints, returning 401 when unauthenticated and 403 when accessing an unauthorized cohort.",
      },
      {
        layer: "HTTP",
        details:
          "HttpOnly + Secure + explicit SameSite session cookie and a CORS allowlist with credentials.",
      },
      {
        layer: "React",
        details:
          "ProtectedRoute wrapper for portal routes, auth state via useSession, signed-out and denied screens, and sign-out header action.",
      },
    ],
    assignment: {
      title: "Full-Stack Login & Protected Routes",
      summary:
        "Connect the login flow end-to-end, protect portal routes with React guards and signed-out screens, and gate backend week endpoints with AuthGuard.",
      detailsMd: `### Week 4 Assignment: Full-Stack Login & Protected Routes

#### Shared access policy

Frontend and backend follow the **same policy**.

| Situation | API response | UI screen |
| --- | --- | --- |
| Not signed in | **401** Unauthorized | Signed-out screen with Sign In button |
| Signed in, missing required capability or membership | **403** Forbidden | Denied / not found screen |
| Signed in with valid session & permissions | 200 OK | Protected portal page |

#### 1. Frontend (\`elwarsha-web\`)

**Required tools:** React Context, React Router, TanStack Query v5, Vitest + Testing Library.

Send every request **with credentials** (cookies). The frontend **never reads or stores the session token** — no \`localStorage\`, no \`sessionStorage\`, no token in state. Hiding a button is UX, not security.

- **Login Flow & Session Integration:**
  - Consume \`useSession\` from \`@core/session\` to expose reactive authentication state: loading, authenticated, unauthenticated.
  - Show the signed-in user's name and a **Sign out** button in the header. Sign out calls \`api.logout()\`, clears the session cache, and returns the user to the landing page.
  - When unauthenticated, provide a **Sign in** button that initiates login via \`/api/v1/auth/login\`.
- **Protected Route Guards (\`ProtectedRoute\`):**
  - Implement a \`ProtectedRoute\` wrapper component for \`portalRoutes\` in \`src/app/routes/\`.
  - While loading session state, display an accessible loading indicator.
  - When unauthenticated, render a dedicated **Signed-out screen** with a prominent "Sign in" action.
  - When authenticated but unauthorized, render a **Denied screen** (403).
- **Accessibility & Internationalization:**
  - Build every screen in Arabic (RTL) and English (LTR).
  - Request states are announced through a **live region** (\`role="status"\` / \`role="alert"\`), and **focus moves to the error** when a request fails.
- **Verification Tests:**
  - One test proving the **signed-out screen** renders when an unauthenticated user visits a protected portal route.
  - One test proving the **protected content** renders when authenticated.

#### 2. Backend (\`elwarsha-api\`)

**Required tools:** NestJS Guards, cookie-parser, NestJS CORS, Vitest + supertest.

The starter already has \`AuthGuard\`, session cookies, and \`/api/v1/auth/me\` in \`src/modules/identity\`. Build on them; do not create a second auth system.

1. **Authentication** — gate \`WeeksController\` endpoints (\`/api/v1/cohorts/:cohortSlug/weeks\`, \`/api/v1/weeks\`) with \`@UseGuards(AuthGuard)\`. No session → **401**.
2. **Capability check** — enforce \`@RequireCapability("weeks.read")\` for role-based authorization.
3. **Object-level authorization (\`CohortMembershipGuard\`)** — protect \`:cohortSlug\` endpoints against Broken Object Level Authorization (BOLA). Verify via \`PrismaService\` that the authenticated user is enrolled in the requested cohort.
   - Enrolled members → **200 OK**.
   - Authenticated non-members → **403 Forbidden** (or 404).
   - Admins & maintainers → bypass cohort-specific check.
4. **Session cookie** — ensure session cookies use \`HttpOnly\`, \`SameSite: "lax"\`, and \`Secure\` in production.
5. **CORS** — allow only the frontend origin, with credentials enabled (\`credentials: true\`). No wildcard (\`*\`).
6. **Endpoints in scope:**

| Method | Path | Purpose | Expected Status / Errors |
| --- | --- | --- | --- |
| GET | \`/api/v1/auth/login\` | Initiate provider sign-in | 302 Redirect |
| GET | \`/api/v1/auth/callback\` | Validate callback & issue session cookie | 302 Redirect |
| GET | \`/api/v1/auth/me\` | Current authenticated user & capabilities | 401 signed out |
| POST | \`/api/v1/auth/logout\` | Revoke session & clear cookie | 200 OK |
| GET | \`/api/v1/cohorts/:cohortSlug/weeks\` | List cohort weeks (protected) | 401 unauthenticated · 403 not enrolled |
| GET | \`/api/v1/cohorts/:cohortSlug/weeks/:weekNumber\` | Week detail (protected) | 401 unauthenticated · 403 not enrolled / 404 |

- **Verification Tests:**
  - One test proving that calling protected weeks endpoints without an active session returns **401**.
  - One test proving that an authenticated user who is NOT enrolled in the requested cohort returns **403 Forbidden**.
  - One test proving that an authenticated enrolled member returns **200 OK**.

#### 3. Verification Bar
- Run \`yarn test\` and \`yarn build\` in \`elwarsha-web\`.
- Run \`yarn validate\` and \`yarn test\` in \`elwarsha-api\` (needs local Postgres: \`docker compose up -d\`).

#### Done when
- [ ] Unauthenticated requests to protected API routes return **401**.
- [ ] Authenticated requests to cohorts the user is not enrolled in return **403 Forbidden** (BOLA defense).
- [ ] Enrolled users can view their cohort weeks with **200 OK**.
- [ ] Portal routes on the frontend are guarded by authentication state.
- [ ] Unauthenticated users visiting portal routes see a clear Signed-Out screen with a Sign In button.
- [ ] The full login and logout cycle works end-to-end with HttpOnly cookies.
- [ ] User identity is reflected in the header with a working logout action.
- [ ] The frontend never reads or stores the session token in client storage.
- [ ] Request states use a live region and focus moves to the error notice on failure.

#### Stretch Challenge (Optional): Real Auth0 Integration

Once your core PR is green and verified using the built-in fake provider, test your architecture against a real OpenID Connect identity provider without changing backend or frontend business logic:

1. **Create an Auth0 Application:**
   - Sign up for a free tenant at [auth0.com](https://auth0.com).
   - In the Auth0 Dashboard, navigate to **Applications > Create Application**, name it (e.g. \`ElWarsha Local\`), and select **Regular Web Applications**.
2. **Configure Allowed URIs:**
   - **Allowed Callback URLs:** \`http://localhost:3001/api/v1/auth/callback\` *(Notice this is the API port where code exchange occurs)*
   - **Allowed Logout URLs:** \`http://localhost:5173\`
   - **Allowed Web Origins:** \`http://localhost:5173\`
3. **Configure Environment in \`elwarsha-api/.env\`:**
   \`\`\`bash
   IDENTITY_PROVIDER=auth0
   AUTH0_DOMAIN=your-tenant.us.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   \`\`\`
4. **Verify Live Social Sign-in:**
   - Restart the API server (\`yarn dev\`).
   - Click "Sign in" on the web app. You will be redirected to the real Auth0 login page (supports Google, Email magic links, or username/password).
   - Upon successful sign-in, Auth0 redirects back to your local callback, your NestJS backend issues the secure HttpOnly cookie, and you land authenticated in the portal!
   - *Note: Keep your \`.env\` secrets safe and never commit them to git. Submit your PR with \`IDENTITY_PROVIDER=fake\` so peer reviewers and CI checks pass cleanly.*`,
    },
    resources: {
      required: [
        {
          title:
            "JWT simply: Authentication vs Authorization & sessions (Arabic) — Bak Tech",
          url: "https://www.youtube.com/watch?v=wDwA7ihoOlc",
          layers: "Concept",
          format: "Watch",
          time: "—",
          why: "Step 1: the difference between authentication, authorization, sessions, and JWT.",
        },
        {
          title: "Cookies vs Sessions (Arabic) — أكاديمية ترميز",
          url: "https://www.youtube.com/watch?v=hUQPu-RWJ_U",
          layers: "Concept",
          format: "Watch",
          time: "—",
          why: "Step 2: how cookies and server sessions work together.",
        },
        {
          title: "React Protected Routes, videos 91–93 (Arabic) — Nageeb Darwish",
          url: "https://www.youtube.com/watch?v=cjTE0IayYPg&list=PLpr1Lg_f0v3ojNKR4WzZ_SEXhiKBHDQmB&index=91",
          layers: "Frontend",
          format: "Watch",
          time: "—",
          why: "Step 3: guarding routes in React Router and redirecting after sign-in.",
        },
        {
          title:
            "Authentication in React with JWTs, Access & Refresh Tokens — Cosden Solutions",
          url: "https://www.youtube.com/watch?v=AcYF18oGn6Y",
          layers: "Frontend",
          format: "Watch",
          time: "—",
          why: "Step 4: building an auth context in React. (Note: In El-Warsha we store sessions in HttpOnly cookies, never in localStorage or client state).",
        },
        {
          title:
            "NestJS API Authentication using JWT Tokens (HttpOnly cookies) — Scalable Scripts",
          url: "https://www.youtube.com/watch?v=5rlsUfQTRzs&list=PLlameCF3cMEu8KAN-02n3CtToO5iYELTV",
          layers: "Backend",
          format: "Watch",
          time: "—",
          why: "Step 5: authenticating NestJS routes with HttpOnly cookies and guards. (Note: El-Warsha uses opaque database session tokens rather than JWTs).",
        },
        {
          title: "React Router: Protected Routes Guide — Robin Wieruch",
          url: "https://www.robinwieruch.de/react-router-private-routes/",
          layers: "Frontend",
          format: "Read",
          time: "15 min",
          why: "Clean architectural pattern for gating routes with <Navigate /> and <Outlet /> in modern React Router.",
        },
        {
          title: "React: Passing data deeply with context",
          url: "https://react.dev/learn/passing-data-deeply-with-context",
          layers: "Frontend",
          format: "Read",
          time: "—",
          why: "Official guide for sharing the current user through React Context.",
        },
        {
          title: "MDN: Using HTTP cookies",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies",
          layers: "Concept",
          format: "Read",
          time: "—",
          why: "Reference for HttpOnly, Secure, and SameSite cookie attributes.",
        },
      ],
      assignment: [
        {
          title: "NestJS Guards Documentation",
          url: "https://docs.nestjs.com/guards",
          layers: "Backend",
          format: "Read",
          time: "15 min",
          why: "Canonical reference for CanActivate, ExecutionContext, and how guards protect endpoints.",
        },
        {
          title: "OWASP API1:2023 — Broken Object Level Authorization",
          url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/",
          layers: "Concept, Backend",
          format: "Read",
          time: "15 min",
          why: "Understanding BOLA flaws and why verifying cohort membership per object is essential.",
        },
        {
          title: "NestJS Authentication",
          url: "https://docs.nestjs.com/security/authentication",
          layers: "Backend",
          format: "Read",
          time: "—",
          why: "Official reference for authentication guards in NestJS.",
        },
        {
          title: "NestJS Authorization",
          url: "https://docs.nestjs.com/security/authorization",
          layers: "Backend",
          format: "Read",
          time: "—",
          why: "Official reference for role, claims, and policy-based authorization.",
        },
        {
          title: "NestJS CORS",
          url: "https://docs.nestjs.com/security/cors",
          layers: "Backend",
          format: "Read",
          time: "—",
          why: "Allowlisting the frontend origin with credentials.",
        },
        {
          title: "MDN: ARIA live regions",
          url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions",
          layers: "Frontend, Accessibility",
          format: "Read",
          time: "10 min",
          why: "Accessible announcements for sign-in errors and auth state changes using role='status' and role='alert'.",
        },
        {
          title: "OWASP Session Management Cheat Sheet",
          url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
          layers: "Concept",
          format: "Read",
          time: "—",
          why: "Secure session cookie attributes and lifecycle.",
        },
        {
          title: "OWASP Authentication Cheat Sheet",
          url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
          layers: "Concept",
          format: "Read",
          time: "—",
          why: "Generic sign-in error messages and authentication best practices.",
        },
        {
          title: "OWASP Authorization Cheat Sheet",
          url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
          layers: "Concept",
          format: "Read",
          time: "—",
          why: "Deny by default and check authorization on every request.",
        },
        {
          title: "Claude Code permissions",
          url: "https://code.claude.com/docs/en/permissions",
          layers: "AI agent security",
          format: "Read",
          time: "—",
          why: "Limiting what a coding agent is allowed to run and read.",
        },
        {
          title: "Cursor agent security",
          url: "https://cursor.com/docs/agent/security",
          layers: "AI agent security",
          format: "Read",
          time: "—",
          why: "Security model of the Cursor agent.",
        },
      ],
      alternative: [
        {
          title: "NestJS Authorization: RBAC, ABAC, and claims-based guards",
          url: "https://www.youtube.com/watch?v=wdsp7BNmJRc",
          layers: "Backend",
          format: "Watch",
          time: "—",
          why: "Video walkthrough of authorization guard patterns in NestJS.",
        },
        {
          title: "Auth0: Authorization Code Flow Guide",
          url: "https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow",
          layers: "Backend, Identity",
          format: "Read",
          time: "15 min",
          why: "Official overview of OpenID Connect authorization code exchange for the Auth0 stretch challenge.",
        },
        {
          title: "Building Smarter Authorization Systems (Oso)",
          url: "https://www.lastweekinaws.com/podcast/screaming-in-the-cloud/building-smarter-authorization-systems-with-sam-scott/",
          layers: "Concept",
          format: "Listen",
          time: "—",
          why: "Podcast on designing authorization systems.",
        },
      ],
    },
    reflectionQuestion:
      "Why must the backend enforce authentication and capability checks even when the frontend already hides views or links the user cannot access?",
    prerequisites: [
      "Week 3: Cohort Weeks summary page (database migration, runtime contracts, TanStack Query)",
      "Docker Compose PostgreSQL running locally",
      "Node 22, Yarn & Vitest",
    ],
  },
  5: {
    weekNumber: 5,
    title: "Safe Schema Migrations & Zero-Downtime Data Evolution",
    tagline: "Evolving production schemas requires disciplined expand-and-contract steps",
    concept: "Database migrations",
    guidingQuestion:
      "How do we migrate a busy production table without taking the service down?",
    bigIdea:
      "In production environments, columns cannot simply be dropped or renamed in a single step without breaking active clients. We implement the Expand-and-Contract migration pattern in Prisma and PostgreSQL to evolve relational schemas seamlessly.",
    outcomes: [
      "Write backward-compatible database migrations in Prisma.",
      "Decouple dual-write and dual-read phases during entity schema evolutions.",
    ],
    coreConcepts: ["Expand and Contract pattern", "Zero-downtime database migrations"],
    appliedThroughTheStack: [
      {
        layer: "Prisma",
        details: "Careful schema migrations without destructive column drops.",
      },
      { layer: "PostgreSQL", details: "Safe indexing and non-blocking constraints." },
    ],
    assignment: {
      title: "Expand and Contract Schema Migration",
      summary:
        "Migrate database schema with non-breaking expand, dual-write, and contract phases.",
      detailsMd: `### Deliverables
- **Expand Migration**: Add nullable column to Prisma schema.
- **Dual-write**: Service writes to both old and new columns.`,
    },
    resources: {
      required: [
        {
          title: "Zero-downtime database migrations guide",
          url: "https://www.prisma.io/dataguide/types/relational/zero-downtime-migrations",
          layers: "Database",
          format: "Read",
          time: "20 min",
          why: "Safe evolutionary database design principles.",
        },
      ],
      assignment: [],
      alternative: [],
    },
    reflectionQuestion:
      "Why must you not delete a database column in the same PR that stops using it?",
    prerequisites: ["Week 4"],
  },
  6: {
    weekNumber: 6,
    title: "Background Workers, Concurrency & Lease Locks",
    tagline: "Controlled concurrency guarantees reliable job processing at scale",
    concept: "Concurrency and workers",
    guidingQuestion:
      "How do we prevent multiple workers from executing the same job at the same time?",
    bigIdea:
      "When running multiple worker replicas, race conditions can cause duplicate executions and data corruption. We implement lease locks with heartbeats, exponential backoff retries, and dead-letter handling in PostgreSQL.",
    outcomes: [
      "Implement lease locks with timeouts and heartbeat renewal.",
      "Reclaim abandoned job leases safely without crashing other active workers.",
    ],
    coreConcepts: ["Lease locks", "Exponential backoff", "Idempotent job execution"],
    appliedThroughTheStack: [
      { layer: "PostgreSQL", details: "lockedAt, lockedBy, and attempt counters." },
      { layer: "Worker", details: "Safe polling loops and graceful shutdown hooks." },
    ],
    assignment: {
      title: "Job Lease Management & Crash Recovery",
      summary: "Implement lease heartbeats and safe recovery of crashed worker jobs.",
      detailsMd: `### Deliverables
- **Lease Renewal**: Periodically renew job lease during long operations.
- **Reaper**: Automatically reclaim expired leases and retry failed attempts.`,
    },
    resources: {
      required: [
        {
          title: "Patterns of Distributed Systems",
          url: "https://martinfowler.com/articles/patterns-of-distributed-systems/",
          layers: "Concept",
          format: "Read",
          time: "25 min",
          why: "Concurrency control and lease semantics in distributed architectures.",
        },
      ],
      assignment: [],
      alternative: [],
    },
    reflectionQuestion:
      "What happens if a worker process crashes mid-job while holding a lease?",
    prerequisites: ["Week 5"],
  },
  7: {
    weekNumber: 7,
    title: "Production Observability, Health Checks & Telemetry",
    tagline:
      "If you cannot measure your service in real time, you cannot run it reliably",
    concept: "Observability and health checks",
    guidingQuestion:
      "How do we distinguish between a liveness failure (healthz) and an unready dependency (readyz)?",
    bigIdea:
      "Production systems need clear signals regarding their operational state. We construct rigorous /healthz and /readyz probes, structured JSON logging, and error tracing to monitor application health under real workloads.",
    outcomes: [
      "Implement distinct /healthz and /readyz endpoints with meaningful dependency checks.",
      "Structure all application logs into machine-readable JSON for indexing.",
    ],
    coreConcepts: [
      "Liveness vs Readiness probes",
      "Structured logging",
      "Error telemetry",
    ],
    appliedThroughTheStack: [
      {
        layer: "NestJS",
        details: "Health indicators checking database, redis, and external APIs.",
      },
    ],
    assignment: {
      title: "Health Probes & Structured Telemetry",
      summary:
        "Build liveness and readiness endpoints with JSON structured logging across the application.",
      detailsMd: `### Deliverables
- **/healthz & /readyz**: Probes checking process liveness and dependency readiness.
- **Structured Logger**: Format all stdout logs in JSON with correlation IDs.`,
    },
    resources: {
      required: [
        {
          title: "Kubernetes Liveness and Readiness Probes Guide",
          url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
          layers: "DevOps, Concept",
          format: "Read",
          time: "20 min",
          why: "Industry standards for health checking and zero-downtime routing.",
        },
      ],
      assignment: [],
      alternative: [],
    },
    reflectionQuestion:
      "When should readyz return 503 even if the Node process is running fine?",
    prerequisites: ["Week 6"],
  },
  8: {
    weekNumber: 8,
    title: "Capstone Release, Public Demo & Architecture Review",
    tagline: "The culmination: a production-grade software product shipped to real users",
    concept: "Product release",
    guidingQuestion:
      "How do we verify a complete multi-tier system is ready for real users and public traffic?",
    bigIdea:
      "In this final week, participants tie together every layer built over the past seven weeks, conducting end-to-end performance verification, accessibility audits, public code reviews, and launching the live product.",
    outcomes: [
      "Open and merge the final qualifying pull request.",
      "Participate in public architecture reviews and demo the live system.",
    ],
    coreConcepts: [
      "Production readiness",
      "Release management",
      "Public architecture review",
    ],
    appliedThroughTheStack: [
      {
        layer: "Full Stack",
        details: "Frontend, backend, database, and repository integration.",
      },
    ],
    assignment: {
      title: "Final Qualifying PR & Production Launch",
      summary:
        "Audit full-stack performance, accessibility, and ship the release pull request.",
      detailsMd: `### Deliverables
- **Final Pull Request**: Merge qualifying feature with zero lint errors and 100% test coverage.
- **Public Demo**: Present architecture and live request flow in public review.`,
    },
    resources: {
      required: [
        {
          title: "Production Release Checklist",
          url: "https://github.com",
          layers: "Full Stack",
          format: "Read",
          time: "15 min",
          why: "Comprehensive verification before final release.",
        },
      ],
      assignment: [],
      alternative: [],
    },
    reflectionQuestion:
      "What is the single most valuable architectural principle you applied in this project?",
    prerequisites: ["All previous weeks"],
  },
};
