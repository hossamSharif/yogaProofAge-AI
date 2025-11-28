<!--
SYNC IMPACT REPORT

Version Change: 1.0.0 → 1.1.0 (MINOR: New principle added)
Ratification Date: 2025-11-26
Last Amended: 2025-11-26

Modified Principles:
  - None (all existing principles unchanged)

Added Sections:
  - Principle VI: Git Commit Discipline

Removed Sections:
  - None

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section verified (no changes needed)
  ✅ .specify/templates/spec-template.md - Requirements alignment verified (no changes needed)
  ✅ .specify/templates/tasks-template.md - Task categorization verified (no changes needed)
  ✅ .claude/commands/speckit.implement.md - Updated with explicit git commit requirements at step 9
  ✅ CLAUDE.md - MCP tool reference table remains consistent (no changes needed)

Follow-up TODOs: None

Notes:
  - Added new mandatory principle for git commit discipline after /implement completion
  - This principle enforces version control hygiene and prevents uncommitted work
  - Agents must commit with descriptive messages and halt on commit failures
  - Updated speckit.implement.md command to include commit step after task completion
-->

# YogaAgeProof AI Constitution

## Core Principles

### I. MCP Tooling Mandatory

**MCP tooling is mandatory and enforced for all relevant tasks.** Only use the prescribed MCP tools and their documented commands for each related operation. Custom implementations, unofficial libraries, or bypasses are not permitted anywhere in the codebase or planning.

**Rationale**: MCP tools provide unified, secure, and maintained interfaces to critical services. Custom implementations create security risks, maintenance burden, and inconsistency across the codebase. This principle ensures all agents and developers follow identical integration patterns.

### II. Documentation & Context via Ref MCP

**For any tasks involving reading, searching, or summarizing documentation** (project code, SDKs, APIs, frameworks, or libraries), use the `ref MCP tools`:

- Always use `mcp__Ref__ref_search_documentation` first with target language (TypeScript/React Native), framework, and library names to locate the most relevant sources (public and private).
- Use `mcp__Ref__ref_read_url` to retrieve full details from specific URLs or results discovered in the search.
- Never use arbitrary web search or access private docs outside of MCP mediation.

**Rationale**: The ref MCP provides curated, version-specific documentation access. Direct web searches may return outdated or irrelevant content. This principle ensures all learning and reference operations use canonical sources.

### III. Database & Backend via Supabase MCP

**For all database operations**—schema listing, migrations, codegen, executions, branching, extensions, logs, and API URL discovery—agents MUST use the suite of `Supabase MCP tools`:

- For DB schema, migrations, and table info, use: `mcp__supabase__list_tables`, `mcp__supabase__apply_migration`, `mcp__supabase__list_migrations`, and other task-appropriate tools only.
- For running or generating TypeScript types, always use `mcp__supabase__generate_typescript_types`.
- For logs, auth, storage, and advisor access, use only their respective Supabase MCP commands.
- For any branching or edge function deployment, use the supplied set of Supabase MCP branch/edge function tools.
- All raw SQL and database structure changes MUST use MCP.

**Rationale**: Supabase MCP enforces safe migrations, tracks schema changes, and prevents direct database access that could bypass version control or introduce security vulnerabilities.

### IV. Payments via Stripe MCP

**For all payment, subscription, and billing operations** (including Stripe setup, invoice retrieval, and customer management) always use the Stripe MCP suite. Consult the project-attached tool manifest and Supabase MCP for payment integrations wherever applicable.

**Rationale**: Payment operations require PCI compliance and secure credential handling. Stripe MCP abstracts these requirements and prevents hardcoded secrets or insecure API calls.

### V. Expo/EAS via Expo MCP

**For all local server management, builds, EAS integration, and expo-specific development operations**, always use the Expo MCP server and its assistant features for automation, local emulator use, and build/publish workflows.

**Rationale**: Expo MCP provides the official, tested interface to Expo development services. Manual CLI invocations may bypass configuration validation or introduce build inconsistencies.

### VI. Git Commit Discipline

**All implementation agents MUST commit all code and asset changes to the active git branch immediately after successfully completing each `/speckit-implement` command.**

- Every commit MUST include a clear, descriptive commit message summarizing the implemented feature or change.
- No code, configuration, or asset changes should remain uncommitted after a completed implementation task.
- Work MUST be organized in project feature branches according to the plan/task structure.
- If a commit cannot be made (e.g., due to merge conflicts or lack of git context), the agent MUST halt and raise an exception for human attention.

**Rationale**: Immediate commits after task completion ensure version control hygiene, enable atomic rollbacks, provide clear audit trails, and prevent loss of work. Feature branch organization maintains clean history and enables parallel development. Halting on commit failures prevents silent failures that could lead to lost work or inconsistent repository state.

## Security and Configuration

**Never hard-code keys, secrets, or sensitive environment values.** Require or document all such values as environment variables and ensure setup scripts or manifests clearly indicate what envs are required.

**Rationale**: Hardcoded secrets create security vulnerabilities and prevent environment-specific configurations (dev, staging, production). Environment variable patterns enable secure credential injection and audit trails.

## Enforcement

**Deviation from these conventions is never permitted** unless explicitly updated in this constitution by the project owner. If an operation cannot be fulfilled using the MCP tools, halt and request an update to the MCP or project instructions.

**Rationale**: Consistent enforcement prevents technical debt, security gaps, and fragmentation. Halting on unsupported operations forces explicit architecture decisions rather than ad-hoc workarounds.

## Governance

**This constitution supersedes all other practices.** Amendments require:

1. Documentation of rationale and impact
2. Project owner approval
3. Migration plan for existing code (if applicable)
4. Version bump following semantic versioning rules

**All PRs and reviews MUST verify compliance** with these principles. Any complexity added beyond MCP tool usage must be explicitly justified with:

- Why the MCP approach is insufficient
- What simpler alternative was rejected and why
- Security and maintenance implications documented

**Reference**: Always refer to the full attached MCP tool manifest (`AllmcptoolsInfo.md` and `CLAUDE.md`) to ensure agents select the precise tool for every operation.

**Version**: 1.1.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-11-26
