import { Routes, Route } from 'react-router-dom';
import { AuthCallback } from './routes/AuthCallback';
import { Dashboard } from './routes/dashboard';
import { Settings } from './routes/settings';
import { Panels } from './routes/panels';
import { Contexts } from './routes/contexts';
import { TicketManagement } from './routes/tickets';
import { CloseSettings } from './routes/close-settings';
import { Premium } from './routes/premium';
import { Payment } from './routes/payment';
import { NotFound } from './routes/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './routes/home';

export default function App() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guilds/:guildId" element={<Settings />} />
          <Route path="/guilds/:guildId/settings" element={<Settings />} />
          <Route path="/guilds/:guildId/embed-customization" element={<Settings />} />
          <Route path="/guilds/:guildId/usage-analytics" element={<Settings />} />
          <Route path="/guilds/:guildId/knowledge" element={<Settings />} />
          <Route path="/guilds/:guildId/panels" element={<Panels />} />
          <Route path="/guilds/:guildId/contexts" element={<Contexts />} />
          <Route path="/guilds/:guildId/tickets" element={<TicketManagement />} />
          <Route path="/guilds/:guildId/close-settings" element={<CloseSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

