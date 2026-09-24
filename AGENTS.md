# AGENTS.md

## Purpose

This file defines the development instructions for AI coding agents
working on this repository.

The project is being developed for the **Google Cloud "Build with AI:
Code for Communities" hackathon**, whose central theme is **solving for
India**.

The goal is to produce a **working, demonstrable, deployable
prototype**, not a concept-only application.

------------------------------------------------------------------------

## 1. Source of Truth

Before changing code:

1.  Read `README.md`.
2.  Inspect the existing repository structure.
3.  Inspect package manifests and configuration files.
4.  Inspect the relevant implementation before modifying it.
5.  Reuse existing utilities, services, components, and data models
    where appropriate.

Do not invent files, APIs, endpoints, environment variables, database
tables, Google Cloud services, or integrations that are not present or
intentionally being added.

If repository evidence is insufficient, state the uncertainty and
inspect the code/configuration further before making a structural
change.

------------------------------------------------------------------------

## 2. Hackathon Constraints

Every implementation must remain compatible with these requirements:

-   The prototype must have a **working end-to-end user flow**.
-   **Google AI integration is mandatory.**
-   The project must use real or realistic data.
-   The solution must be designed with scalability across Indian cities,
    districts, states, and communities in mind.
-   Multilingual and/or voice support should be implemented when
    relevant to the selected track.
-   The project must be built during the hackathon period.
-   Third-party code and datasets must be properly licensed.
-   Do not present mocked functionality as production-ready
    functionality.

The evaluation criteria are:

-   Problem-Solution Fit --- 20%
-   AI / Technical Execution --- 25%
-   Depth & Reach Across India --- 20%
-   Impact Potential --- 15%
-   Deployability & Scalability --- 20%

Do not optimize for visual polish at the expense of functional
correctness.

------------------------------------------------------------------------

## 3. Coding-Agent Operating Rules

### Inspect before editing

Before making a change:

``` text
1. Locate the relevant files.
2. Read the surrounding implementation.
3. Identify dependencies and callers.
4. Make the smallest coherent change.
5. Run the relevant validation.
```

### Avoid hallucination

Never assume:

-   An API endpoint exists.
-   A Google AI SDK method exists.
-   A database schema exists.
-   An environment variable exists.
-   A public dataset has a particular field.
-   A service is deployed.
-   A model returns a particular JSON shape.
-   A package supports a feature merely because its name suggests it
    does.

Verify against installed package versions, source code, official
documentation, or the project's existing implementation.

### Preserve working functionality

Do not rewrite large portions of the application when a focused change
is sufficient.

Do not remove working functionality without a clear reason.

Do not replace the existing architecture merely because another stack
appears more convenient.

------------------------------------------------------------------------

## 4. Google AI Integration

Google AI must provide real functionality.

Acceptable examples include:

-   Gemini for reasoning, extraction, summarization, classification,
    recommendations, or multimodal analysis.
-   Vertex AI for model serving, predictive modelling, or managed AI
    workflows.
-   Gemini multimodal capabilities for image/document/environmental
    analysis.
-   Google Cloud Speech-to-Text and Text-to-Speech.
-   Google Cloud Translation.
-   Google Earth Engine for geospatial analysis.
-   Other Google AI/Cloud capabilities explicitly supported by the
    hackathon.

### Integration requirements

When adding an AI call:

1.  Keep credentials in environment variables or Google Cloud identity
    mechanisms.
2.  Do not hard-code API keys.
3.  Validate input before sending it to the model.
4.  Validate and sanitize model output.
5.  Handle timeouts and API errors.
6.  Avoid relying on unrestricted free-form model output when structured
    JSON is required.
7.  Record the model and API version/configuration where reproducibility
    matters.
8.  Keep prompts version-controlled when they are important to product
    behavior.

### AI should not be decorative

Bad:

``` text
User -> UI -> hard-coded answer
              +
              "Powered by Gemini" label
```

Good:

``` text
User input
   ↓
Validation
   ↓
Google AI / model
   ↓
Structured result
   ↓
Domain validation
   ↓
Application logic
   ↓
User-facing result
```

------------------------------------------------------------------------

## 5. Data and Evidence

Every important data source must be traceable.

For external data, document:

-   Source
-   URL/reference
-   Dataset/API name
-   Geographic coverage
-   Time coverage
-   Update frequency if known
-   License/terms
-   Important limitations

Potential sources include:

-   data.gov.in
-   Indian government open-data portals
-   FAO
-   WHO
-   ISRO/Bhuvan
-   IMD
-   Google Earth Engine datasets

Do not fabricate statistics.

Do not use synthetic data while describing it as real-world data.

If synthetic/sample data is required for the prototype, label it
clearly:

``` text
SOURCE_TYPE=synthetic_demo
```

or equivalent.

------------------------------------------------------------------------

## 6. Architecture

Prefer a clear separation of concerns:

``` text
Frontend
   ↓
API / Backend
   ↓
Domain Services
   ├── AI Services
   ├── Data Services
   ├── Prediction Services
   └── Geospatial Services
   ↓
Database / External Data
```

Keep business logic out of presentation components where practical.

Keep external-service calls behind service boundaries.

Avoid tight coupling between:

-   UI components and databases
-   UI components and Google AI SDKs
-   AI prompts and unrelated business logic

------------------------------------------------------------------------

## 7. Scalability for India

The system should not be hard-coded around a single city.

Prefer data structures such as:

``` text
country
state
district
city
block
village
pincode
latitude
longitude
```

where relevant to the selected problem.

Avoid:

``` text
if city == "Pune":
    ...
```

when the same behavior should work for any supported location.

Prefer configuration and data-driven logic.

Consider:

-   Multi-state deployment
-   Regional datasets
-   Localization
-   Indian languages
-   Time zones
-   Rate limits
-   Cost controls
-   Caching
-   Queue-based processing for expensive operations
-   Horizontal scaling
-   Observability

Do not over-engineer the hackathon prototype. Implement only what
supports the demonstrated use case.

------------------------------------------------------------------------

## 8. Multilingual and Voice Support

If the selected track benefits from citizen-facing interaction, design
for Indian language diversity.

Do not assume English-only input.

Potential flow:

``` text
Voice
  ↓
Speech-to-Text
  ↓
Language detection / normalization
  ↓
Google AI processing
  ↓
Structured domain action
  ↓
Translation
  ↓
Text-to-Speech / UI
```

Always preserve the original user input when it is needed for auditing
or correction, subject to privacy requirements.

------------------------------------------------------------------------

## 9. Security and Privacy

Never commit:

-   API keys
-   OAuth secrets
-   Service-account private keys
-   Database passwords
-   JWT secrets
-   `.env` files containing credentials

Use `.env.example` for documentation.

For citizen or health-related data:

-   Minimize personally identifiable information.
-   Do not expose sensitive fields in logs.
-   Validate authorization on protected endpoints.
-   Use least-privilege credentials.
-   Avoid sending unnecessary personal data to external AI services.
-   Define retention behavior where relevant.

------------------------------------------------------------------------

## 10. API Development

For every new endpoint:

1.  Define the input contract.
2.  Validate input.
3.  Define successful output.
4.  Define expected error responses.
5.  Add authentication/authorization where required.
6.  Add tests for important behavior.
7.  Update API documentation.

Do not silently change an existing API contract.

If a breaking change is necessary, identify all known callers and update
them together.

------------------------------------------------------------------------

## 11. Frontend Development

The UI must demonstrate the actual product.

Priorities:

1.  Functional user flow
2.  Clear information hierarchy
3.  Useful loading states
4.  Useful error states
5.  Accessibility
6.  Responsive layout
7.  Visual polish

Avoid fake buttons that do nothing.

Avoid dashboards containing metrics that are not backed by actual data.

If a feature is not implemented, label it as unavailable or planned
instead of pretending it works.

------------------------------------------------------------------------

## 12. Error Handling

Handle at least:

-   Invalid input
-   Empty results
-   Network failure
-   AI API failure
-   Data-source failure
-   Authentication failure
-   Authorization failure
-   Rate limiting
-   Timeout
-   Malformed AI output

Errors shown to users should be understandable.

Errors logged for developers should contain enough diagnostic
information without exposing secrets or unnecessary personal data.

------------------------------------------------------------------------

## 13. Testing

Before declaring a feature complete:

### Unit tests

Test:

-   Domain logic
-   Data transformations
-   Validation
-   Utility functions
-   AI-output parsing

### Integration tests

Test:

-   API + database
-   API + AI service
-   Authentication
-   Important external-data flows

### End-to-end testing

At minimum, verify the main demo path:

``` text
User starts
   ↓
Input provided
   ↓
Backend receives input
   ↓
AI/data processing occurs
   ↓
Result is generated
   ↓
User sees actionable output
```

The demo path must work from a clean start.

------------------------------------------------------------------------

## 14. Dependency Management

Before adding a package:

1.  Check whether the repository already has equivalent functionality.
2.  Check compatibility with the current runtime.
3.  Prefer maintained, well-supported packages.
4.  Avoid unnecessary dependencies.
5.  Update lockfiles.
6.  Run the project's validation commands.

Do not upgrade major dependencies unless required.

------------------------------------------------------------------------

## 15. Environment Configuration

All required configuration must be documented.

Example:

``` env
GOOGLE_API_KEY=
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=
DATABASE_URL=
```

Do not put real credentials in:

-   source code
-   README
-   screenshots
-   test fixtures
-   frontend bundles
-   Git history

------------------------------------------------------------------------

## 16. Git Discipline

Use focused commits.

Recommended style:

``` text
feat: add citizen request classification
fix: handle Gemini timeout
feat: add district-level dashboard
docs: document data sources
test: add request validation tests
refactor: isolate AI service
```

Do not commit generated secrets or local machine artifacts.

------------------------------------------------------------------------

## 17. Documentation

Whenever behavior changes, update the relevant documentation.

At minimum, keep these accurate:

-   `README.md`
-   `AGENTS.md`
-   `.env.example`
-   API documentation, if applicable
-   Data-source documentation

The README must allow another developer to understand:

1.  What the project does.
2.  Which hackathon problem it addresses.
3.  Why Google AI is used.
4.  Which data sources are used.
5.  How to run it.
6.  How to deploy it.
7.  What limitations remain.

------------------------------------------------------------------------

## 18. Demo Readiness

The final prototype must support a reliable 3--5 minute demonstration.

The preferred demo sequence is:

``` text
1. Introduce the problem
2. Show the target user
3. Start the application
4. Perform the primary workflow
5. Show the Google AI functionality
6. Show the resulting recommendation/prediction/action
7. Show supporting data
8. Show scalability architecture
9. Show deployment
```

Avoid demo flows that depend on unpredictable external conditions unless
a deterministic fallback is implemented.

------------------------------------------------------------------------

## 19. Submission Checklist

Before submission:

-   [ ] End-to-end workflow works.
-   [ ] Google AI integration works.
-   [ ] Data sources are documented.
-   [ ] No secrets are committed.
-   [ ] Production/deployment configuration is documented.
-   [ ] Public GitHub repository is accessible.
-   [ ] Live deployment works.
-   [ ] Demo video is 3--5 minutes.
-   [ ] Pitch deck is 10--12 slides.
-   [ ] README is complete.
-   [ ] Error handling is demonstrated.
-   [ ] Scalability beyond one city/state is explained.
-   [ ] Licensing is documented.
-   [ ] Main user journey has been tested from a clean environment.

------------------------------------------------------------------------

## 20. Agent Response Format

When completing development work, report:

### Changed

-   Files changed
-   Main behavior added/modified

### Verified

-   Commands/tests run
-   Results

### Not Verified

-   Anything that could not be tested
-   Missing credentials/services
-   External dependencies requiring manual verification

### Next Step

Only include the next step when there is a concrete remaining task.

Never claim a feature is working if it has not been tested or if its
external dependency has not been verified.
