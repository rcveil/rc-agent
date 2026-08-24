#!/usr/bin/env python3
"""Study Schedule Planner Agent — powered by Claude Opus 5."""

import sys
from datetime import date
from pathlib import Path

import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

SYSTEM_PROMPT = """\
You are a study schedule planning expert. Help students create effective, realistic study \
schedules tailored to their goals and constraints.

When given study needs:
1. Use get_current_date first to know today's date for accurate scheduling
2. Ask clarifying questions if subjects, deadlines, or daily availability are unclear
3. Estimate time per subject based on scope and complexity
4. Apply spaced repetition — spread sessions across days rather than cramming
5. Build in short breaks (5–10 min per hour) and at least one rest day per week
6. Prioritize by deadline proximity and topic difficulty
7. Produce a clear schedule: daily breakdown + weekly overview + subject-specific study tips

When presenting the final schedule, offer to save it with save_schedule.\
"""


@beta_tool
def get_current_date() -> str:
    """Return today's date in ISO 8601 format for anchoring the schedule."""
    return date.today().isoformat()


@beta_tool
def save_schedule(content: str, filename: str = "study_schedule.txt") -> str:
    """Save the study schedule to a local text file.

    Args:
        content: The complete schedule text to write.
        filename: Output filename (default: study_schedule.txt).
    """
    path = Path(filename)
    path.write_text(content, encoding="utf-8")
    return f"Schedule saved to {path.resolve()}"


def _run_agent(messages: list[dict]) -> tuple[list[dict], str]:
    """Run the tool-runner loop. Returns updated message history and final response text."""
    runner = client.beta.messages.tool_runner(
        model="claude-opus-5",
        max_tokens=16000,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        tools=[get_current_date, save_schedule],
        messages=messages,
    )

    last_message = None
    for message in runner:
        last_message = message
        for block in message.content:
            if block.type == "tool_use":
                args_preview = ", ".join(
                    f"{k}={repr(v)[:50]}" for k, v in (block.input or {}).items()
                )
                print(f"  [tool: {block.name}({args_preview})]")

    if last_message is None:
        return messages, "(no response)"

    final_text = next((b.text for b in last_message.content if b.type == "text"), "")
    messages.append({"role": "assistant", "content": final_text})
    return messages, final_text


def interactive_mode() -> None:
    print("╔══════════════════════════════════╗")
    print("║   Study Schedule Planner Agent   ║")
    print("╚══════════════════════════════════╝")
    print("Describe your study needs — subjects, exam/deadline dates, and how many")
    print("hours per day you can study. I'll build you a personalized schedule.\n")
    print("Type 'quit' to exit.\n")

    messages: list[dict] = []

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "q"):
            print("Good luck with your studies!")
            break

        messages.append({"role": "user", "content": user_input})

        print()
        try:
            messages, response = _run_agent(messages)
        except anthropic.APIError as e:
            print(f"[API Error: {e}]")
            messages.pop()
            continue

        print(f"Planner:\n{response}\n")


def single_shot(request: str) -> None:
    """Non-interactive: plan from a single request string passed as CLI arguments."""
    print("Study Schedule Planner — generating your schedule...\n")
    messages = [{"role": "user", "content": request}]
    _, response = _run_agent(messages)
    print(response)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        single_shot(" ".join(sys.argv[1:]))
    else:
        interactive_mode()
