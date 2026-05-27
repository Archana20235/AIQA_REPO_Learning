# AI Agent Instructions for AIQA Tester Blueprint

## Purpose
This repository is a prompt-driven QA test case generation workspace. The primary content consists of prompt templates and test-case generation guidance rather than application source code.

## Key files and directories
- `Anti_Hallucinations_Rules.md` — mandatory anti-hallucination rules. Always follow this document when generating output.
- `Project1_TC_RICEPOT_API_Gen/RICE-POT-TestCase-Prompt.md` — the main prompt template for generating functional/non-functional test cases using the RICE-POT framework.
- `Project1_TC_RICEPOT_API_Gen/RICE_POT_FRAMEWORK/RICE_POT.md` — documentation describing the RICE-POT methodology and prompt structure.
- `templates/` — additional prompt templates for test generation scenarios.

## Agent behavior
- Treat the repository as a QA prompt/template repository, not a software project with a build system.
- When generating test cases, follow the RICE-POT structure and the exact CSV output format described in the prompt template.
- Always use only explicitly provided information from PRD, API docs, screenshots, or user input.
- If information is missing, respond with: `Insufficient information to determine.`
- Do not invent features, APIs, error codes, UI elements, behavior, or acceptance criteria.
- Ensure outputs are deterministic, traceable, and repeatable.

## What to do first
1. Review `Anti_Hallucinations_Rules.md` before any generation task.
2. Review the relevant prompt template in `Project1_TC_RICEPOT_API_Gen/RICE-POT-TestCase-Prompt.md`.
3. Use the repository files only as guidance; do not assume external project structure or dependencies.

## When improving prompts or agent behavior
- Keep instructions short and actionable.
- Do not duplicate documentation already present in repository files.
- Prefer linking to the existing prompt template or anti-hallucination rules rather than copying them verbatim.
