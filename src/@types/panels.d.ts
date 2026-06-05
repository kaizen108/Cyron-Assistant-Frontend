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
