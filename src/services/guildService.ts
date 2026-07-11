import { api } from "../lib/api";

export const guildService = {
  async fetchGuild(guildId: string): Promise<Guild> {
    const res = await api.get<Guild>(`/guilds/${guildId}`);
    return res.data;
  },

  async fetchUsage(guildId: string): Promise<UsageStats> {
    const res = await api.get<UsageStats>(`/guilds/${guildId}/usage`);
    return res.data;
  },

  async fetchUsageHistory(
    guildId: string,
    days: number,
  ): Promise<{ date: string; tokens_used: number }[]> {
    const res = await api.get<{ date: string; tokens_used: number }[]>(
      `/guilds/${guildId}/usage/history`,
      { params: { days } },
    );
    return res.data;
  },

  async fetchUsageLogs(
    guildId: string,
    limit: number,
  ): Promise<
    { timestamp: string; tokens_used: number; low_confidence: boolean }[]
  > {
    const res = await api.get<
      { timestamp: string; tokens_used: number; low_confidence: boolean }[]
    >(`/guilds/${guildId}/usage/logs`, { params: { limit } });
    return res.data;
  },

  async fetchKnowledge(guildId: string): Promise<KnowledgeEntry[]> {
    const res = await api.get<KnowledgeEntry[] | null>(
      `/guilds/${guildId}/knowledge`,
    );
    // Defend against transient/null payloads so the UI never renders a blank state.
    return Array.isArray(res.data) ? res.data : [];
  },

  async updateGuild(
    guildId: string,
    payload: { system_prompt?: string; embed_color?: string },
  ) {
    return api.patch(`/guilds/${guildId}`, payload);
  },

  async formatKnowledge(
    guildId: string,
    payload: { raw_text: string; template_type: string; title_hint?: string },
  ) {
    const res = await api.post<KnowledgeFormatResult>(
      `/guilds/${guildId}/knowledge/format`,
      payload,
    );
    return res.data;
  },

  async createKnowledge(
    guildId: string,
    payload: {
      title: string;
      content?: string;
      main_content?: string;
      additional_context?: string;
      behavior_notes?: string;
      template_type?: string;
      template_payload?: Record<string, unknown> | null;
      source?: string | null;
      persist_mode?: "pipeline" | "structured";
      ai_context_id?: string;
      section?: string;
    },
  ) {
    return api.post(`/guilds/${guildId}/knowledge`, payload);
  },

  async updateKnowledge(
    guildId: string,
    payload: {
      id: string;
      title?: string;
      content?: string;
      main_content?: string;
      additional_context?: string;
      behavior_notes?: string;
      template_type?: string;
      template_payload?: Record<string, unknown> | null;
      source?: string | null;
      persist_mode?: "pipeline" | "structured";
    },
  ) {
    const { id, ...body } = payload;
    return api.put(`/guilds/${guildId}/knowledge/${id}`, {
      ...body,
    });
  },

  async fetchCloseSettings(guildId: string) {
    const res = await api.get(`/guilds/${guildId}/close-settings`);
    return res.data;
  },

  async updateCloseSettings(guildId: string, payload: Record<string, unknown>) {
    const res = await api.patch(`/guilds/${guildId}/close-settings`, payload);
    return res.data;
  },

  async fetchTickets(guildId: string, params: { status?: string; page?: number; limit?: number; search?: string }) {
    const res = await api.get(`/guilds/${guildId}/tickets`, { params });
    return res.data;
  },

  async fetchTicketDetail(guildId: string, ticketId: string) {
    const res = await api.get(`/guilds/${guildId}/tickets/${ticketId}`);
    return res.data;
  },

  async deleteKnowledge(guildId: string, id: string) {
    return api.delete(`/guilds/${guildId}/knowledge/${id}`);
  },

  async fetchChannels(guildId: string): Promise<{id: string; name: string}[]> {
    const res = await api.get(`/guilds/${guildId}/channels`);
    return res.data;
  },

  async sendPanelToChannel(guildId: string, panelId: string, channelId: string): Promise<void> {
    await api.post(`/guilds/${guildId}/panels/${panelId}/send`, { channel_id: parseInt(channelId) });
  },

  // Panels
  async fetchPanels(guildId: string) {
    const res = await api.get<Panel[]>(`/guilds/${guildId}/panels`);
    return res.data;
  },
  async createPanel(guildId: string, payload: Omit<Panel, "id" | "guild_id">) {
    const res = await api.post<Panel>(`/guilds/${guildId}/panels`, payload);
    return res.data;
  },
  async updatePanel(
    guildId: string,
    panelId: string,
    payload: Omit<Panel, "id" | "guild_id">,
  ) {
    const res = await api.put<Panel>(
      `/guilds/${guildId}/panels/${panelId}`,
      payload,
    );
    return res.data;
  },
  async deletePanel(guildId: string, panelId: string) {
    return api.delete(`/guilds/${guildId}/panels/${panelId}`);
  },

  // AI Contexts
  async fetchContexts(guildId: string) {
    const res = await api.get<AIContext[]>(`/guilds/${guildId}/contexts`);
    return res.data;
  },
  async createContext(
    guildId: string,
    payload: { name: string; instructions?: string; general_info?: string },
  ) {
    const res = await api.post<AIContext>(
      `/guilds/${guildId}/contexts`,
      payload,
    );
    return res.data;
  },
  async updateContext(
    guildId: string,
    contextId: string,
    payload: { name: string; instructions?: string; general_info?: string },
  ) {
    const res = await api.put<AIContext>(
      `/guilds/${guildId}/contexts/${contextId}`,
      payload,
    );
    return res.data;
  },
  async deleteContext(guildId: string, contextId: string) {
    return api.delete(`/guilds/${guildId}/contexts/${contextId}`);
  },

  // General Rules (global AI context)
  async fetchGeneralRules(guildId: string): Promise<GeneralRules> {
    const res = await api.get<GeneralRules>(`/guilds/${guildId}/contexts/general`);
    return res.data;
  },
  async updateGeneralRules(
    guildId: string,
    payload: { instructions?: string; general_info?: string; enabled?: boolean },
  ): Promise<GeneralRules> {
    const res = await api.put<GeneralRules>(`/guilds/${guildId}/contexts/general`, payload);
    return res.data;
  },
};
