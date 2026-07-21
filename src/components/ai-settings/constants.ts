export type GeneralRulesTab = "instructions" | "general_info" | "problems" | "knowledge";

export const GENERAL_RULES_TABS: {
  id: GeneralRulesTab;
  label: string;
  hint: string;
}[] = [
  {
    id: "instructions",
    label: "Instructions",
    hint: "How the AI behaves — tone, language, safety, escalation, and fixed rules.",
  },
  {
    id: "general_info",
    label: "General Info",
    hint: "Operational data always available to the AI (no retrieval needed).",
  },
  {
    id: "problems",
    label: "Problems",
    hint: "Situation → resolution pairs for common support scenarios.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    hint: "Documentation, pricing sources, and server rules the AI can reference.",
  },
];

export const INSTRUCTIONS_PLACEHOLDER = `# General Rules

These rules apply to ALL AI-enabled panels on this server.

## Tone & Style
- Be friendly, professional, and concise (2–4 sentences)
- Always reply in the user's language
- Never use robotic phrases like "I am an AI assistant"

## Safety Rules
- Never promise refunds, discounts, or compensation without explicit approval
- Never share internal staff information or private data
- Never make legal, medical, or financial claims

## Escalation
- If the user is frustrated, acknowledge their feelings and offer human help
- Escalate account-specific actions (password resets, billing changes)
- If unsure, say so honestly and offer to connect with staff`;

export const GENERAL_INFO_PLACEHOLDER = `## Company / Server Info
Company: Your Company Name
Support hours: Mon–Fri 9am–6pm UTC
Website: https://example.com
Contact: support@example.com

## Common Situations
- Order status: ask for order number before looking up
- Refunds: never promise — escalate to staff
- Account issues: verify identity before sharing account-specific info`;

export const SCAN_MESSAGES = [
  "Reading channels…",
  "Checking panels…",
  "Analyzing roles…",
  "Detecting server type…",
  "Preparing recommendations…",
];
