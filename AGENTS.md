# AI Dev System Project-Local Adapter

This project has a local AI Dev System installation in `.ai-dev-system`.

Mandatory baseline:
- because `.ai-dev-system` exists, work under AI Dev System for this project by default;
- do not bypass or ignore `.ai-dev-system`, its local policies, command mapping, host adapters, memory or Governor artifacts;
- before acting, determine whether `.ai-dev-system/governor/sessions/` already contains a Governor session for the work;
- if a Governor session exists, use that session as the governing frame and do not continue the project work outside the active Governor session artifacts;
- if several sessions could match and the active one is unclear, ask for clarification instead of bypassing Governor.

Maximum autonomy continuity:
- if the user explicitly asks for maximum autonomy, `until-done`, or says to chain every step/lot without stopping, do not stop at the end of a tranche;
- phrases like `je reprends ensuite`, `je passe au lot suivant`, `prochaine tranche` or `next action` are continuity markers, not end-of-mission signals;
- continue immediately on the next safe slice unless a hard stop is reached or the final objective is fully achieved.

When the user writes `/ads-*`, treat it as an AI Dev System conversation command and translate it to:

```powershell
python .ai-dev-system/scripts/ai.py <command>
```

This also applies to the Codex-safe forms `ads-*` and `ads ...`.
When the host is Codex, prefer those forms without the leading slash because Codex may intercept `/...` as a native slash command before the model can translate it.
Any `/ads-*` command can be rewritten as the same `ads-*` command, with the same arguments and ordering.

If the command targets this current project, use project-local mode and pass `.` as the project path unless the user explicitly provides another path.

If a Governor runtime/session artifact is already provided (`runtime-prompt.md`, `execution-handoff.md` or `execution-prompt.md`), treat that artifact as the active step contract.
In that case, do not reopen `.ai-dev-system/PROJECT-LOCAL-ADAPTER.md`, `.ai-dev-system/BOOTSTRAP-README.md` or `.ai-dev-system/docs/getting-started/commandes-conversationnelles.md` unless you need a missing command syntax or reference detail.

Otherwise, read first:
- `.ai-dev-system/PROJECT-LOCAL-ADAPTER.md`
- `.ai-dev-system/BOOTSTRAP-README.md`
- `.ai-dev-system/docs/getting-started/commandes-conversationnelles.md`

Do not overwrite project decisions, existing instructions, or user constraints. Propose skills, MCP, agents, sub-agents and host tools only when they improve the work. Verify that host capabilities exist before using them, and report resources considered, used or skipped.
