interface Panel {
  id: string;
  guild_id: number;
  name: string;
  bot_id: number | null;
  ticket_category_name: string;
  button_text: string;
  button_emoji: string | null;
  welcome_message: string | null;
  ai_context_id: string | null;
  // General
  is_enabled: boolean;
  ai_auto_reply: boolean;
  support_role_ids: number[] | null;
  overflow_category_ids: number[] | null;
  threading_mode: boolean;
  save_transcripts: boolean;
  channel_name_format: string;
  roles_required: number[] | null;
  roles_blocked: number[] | null;
  limit_bypass_roles: number[] | null;
  max_open_tickets_per_user: number;
  creation_cooldown_seconds: number;
  users_can_close: boolean;
  claiming_enabled: boolean;
  claiming_visibility: string;
  footer_text: string | null;
  // Embed
  panel_embed_author: string | null;
  panel_embed_title: string | null;
  panel_embed_description: string | null;
  panel_embed_footer: string | null;
  panel_embed_color: string | null;
  button_type: string;
  button_color: string;
  // Messages
  welcome_ping_ticket_creator: boolean;
  welcome_ping_support_roles: boolean;
  welcome_ping_admin_role: boolean;
  welcome_embed_author: string | null;
  welcome_embed_title: string | null;
  welcome_embed_description: string | null;
  welcome_embed_footer: string | null;
  auto_pin_welcome: boolean;
  close_button_emoji: string | null;
  close_button_label: string | null;
  close_button_color: string;
  claim_button_emoji: string | null;
  claim_button_label: string | null;
  unclaim_button_label: string | null;
  claim_button_color: string;
  // Forms
  forms_enabled: boolean;
  form_questions: FormQuestion[] | null;
  // Availability
  support_hours_enabled: boolean;
  support_hours_timezone: string;
  support_hours_schedule: Record<string, { enabled: boolean; open: string | null; close: string | null }> | null;
  closed_state_logic: string;
  msg_closed: { title: string; description: string; footer?: string } | null;
  // Logging
  log_channel_id: number | null;
  send_logs_in_ticket: boolean;
  // Advanced
  sync_category_permissions: boolean;
  autoclose_hours: number | null;
  autoclose_warning_hours: number | null;
  published_channel_id: number | null;
  published_message_id: number | null;
}

interface FormQuestion {
  id: string;
  label: string;
  description?: string;
  answer_type: 'text' | 'multiline' | 'select';
  required: boolean;
  placeholder?: string;
  min_length?: number;
  max_length?: number;
  order: number;
}

interface AIContext {
  id: string;
  guild_id: number;
  name: string;
  context_version: number;
  instructions: string | null;
  general_info: string | null;
}

interface GeneralRules {
  id: string;
  name: string;
  context_version: number;
  instructions: string | null;
  general_info: string | null;
  enabled: boolean;
}

interface AiDiscoveryScanResult {
  proposed_category: string | null;
  confidence: number;
  confidence_tier: 'high' | 'medium' | 'low';
  method: string;
  summary: string | null;
  rationale: string[];
  signals: string[];
  category_scores: {
    selling: number;
    saas: number;
    community: number;
    other: number;
  };
  classified_channels: {
    knowledge: ClassifiedChannel[];
    announcements: ClassifiedChannel[];
    transcript: ClassifiedChannel[];
    ticket_history: ClassifiedChannel[];
    partnership: ClassifiedChannel[];
    selling: ClassifiedChannel[];
  };
  role_candidates: RoleCandidate[];
  panels_found: PanelSummary[];
  description_draft: string | null;
  partnership_detected: boolean;
  is_community_server: boolean;
  voice_text_ratio: { text: number; voice: number; ratio_voice_heavy: boolean };
  channel_count: number;
  panel_count: number;
}

interface ClassifiedChannel {
  id: string;
  name: string;
  category_name: string | null;
  tags: string[];
  reason: string | null;
}

interface RoleCandidate {
  id: string;
  name: string;
  score: number;
  reason: string | null;
}

interface PanelSummary {
  id: string;
  name: string;
  button_text: string | null;
  button_emoji: string | null;
  support_hours_enabled: boolean;
  category_hint: string | null;
}

interface CompileInput {
  category?: string;
  server_description?: string;
  tone?: string;
  emojis_allowed?: boolean;
  language_mode?: string;
  fixed_language?: string;
  fallback_language?: string;
  never_rules?: string[];
  escalation_rules?: string[];
  escalation_roles?: string[];
  problem_solutions?: { problem: string; solution: string }[];
  general_info_extra?: string;
  payment_info?: string;
  knowledge_sources?: string[];
  activate?: boolean;
}

interface CompileOutput {
  instructions: string;
  general_info: string;
  problems: { problem: string; solution: string }[];
  knowledge: { title: string; content: string; section: string }[];
  enabled: boolean;
  context_id: string | null;
}

interface ExtractInput {
  channel_ids?: string[];
  ticket_channel_ids?: string[];
  html_contents?: string[];
  max_problems?: number;
}

interface ExtractedProblem {
  problem: string;
  solution: string;
  frequency: number;
}

interface ExtractOutput {
  problems: ExtractedProblem[];
  sources_processed: number;
  message: string | null;
}
