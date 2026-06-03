'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

type SystemHealth = {
  status: string;
  healthScore: number;
  generatedAt: string;
  process: {
    uptimeSeconds: number;
    nodeVersion: string;
    memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number };
  };
  database: { connected: boolean; latencyMs: number | null };
  operational: {
    pendingTraders: number;
    activeUsers: number;
    activeProducts: number;
  };
};

type SystemSettings = {
  maintenanceMode: boolean;
  allowTraderSelfRegistration: boolean;
  emailNotificationsEnabled: boolean;
  aiForecastEnabled: boolean;
  maxProductsPerFarmer: number;
  defaultMarketRegion: string;
  updatedAt: string | null;
};

const defaultSettings: SystemSettings = {
  maintenanceMode: false,
  allowTraderSelfRegistration: true,
  emailNotificationsEnabled: true,
  aiForecastEnabled: true,
  maxProductsPerFarmer: 100,
  defaultMarketRegion: 'Oromia',
  updatedAt: null,
};

export default function AdminSystemPage() {
  const [form, setForm] = useState<SystemSettings>(defaultSettings);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const healthQuery = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const response = await api.get<SystemHealth>('/admin/system/health');
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load system health');
      }
      return response.data;
    },
    refetchInterval: 30000,
  });

  const settingsQuery = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: async () => {
      const response = await api.get<SystemSettings>('/admin/system/settings');
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load system settings');
      }
      return response.data;
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm({
        ...defaultSettings,
        ...settingsQuery.data,
      });
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put<SystemSettings>('/admin/system/settings', {
        maintenanceMode: form.maintenanceMode,
        allowTraderSelfRegistration: form.allowTraderSelfRegistration,
        emailNotificationsEnabled: form.emailNotificationsEnabled,
        aiForecastEnabled: form.aiForecastEnabled,
        maxProductsPerFarmer: Number(form.maxProductsPerFarmer),
        defaultMarketRegion: form.defaultMarketRegion,
      });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to save system settings');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setForm({ ...defaultSettings, ...data });
      setSaveMessage('Settings saved successfully.');
      settingsQuery.refetch();
    },
    onError: (error) => {
      setSaveMessage((error as Error).message);
    },
  });

  const health = healthQuery.data;

  return (
    <div className="w-full min-w-0 max-w-full py-4">
      <Header />
      <hr className="border-[#E2E8E2]" />
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E1A]">System Monitoring & Settings</h1>
          <p className="mt-1 text-sm text-[#6B7B6B]">
            Monitor service health and configure core platform behavior.
          </p>
        </div>

        <section className="rounded-xl border border-[#E2E8E2] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-[#1A2E1A]">System Health</h2>
          {healthQuery.isLoading && <p className="text-sm text-[#6B7B6B]">Loading health status...</p>}
          {healthQuery.error && (
            <p className="text-sm text-red-600">{(healthQuery.error as Error).message}</p>
          )}
          {health && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#E2E8E2] p-3">
                <p className="text-xs text-[#6B7B6B]">Overall status</p>
                <p className="font-semibold capitalize text-[#1A2E1A]">
                  {health.status} ({health.healthScore}%)
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8E2] p-3">
                <p className="text-xs text-[#6B7B6B]">Database</p>
                <p className="font-semibold text-[#1A2E1A]">
                  {health.database.connected ? 'Connected' : 'Unavailable'}
                </p>
                <p className="text-xs text-[#6B7B6B]">
                  Latency: {health.database.latencyMs ?? '—'} ms
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8E2] p-3">
                <p className="text-xs text-[#6B7B6B]">Memory usage</p>
                <p className="font-semibold text-[#1A2E1A]">
                  {health.process.memory.heapUsedMb} / {health.process.memory.heapTotalMb} MB
                </p>
                <p className="text-xs text-[#6B7B6B]">RSS: {health.process.memory.rssMb} MB</p>
              </div>
              <div className="rounded-lg border border-[#E2E8E2] p-3">
                <p className="text-xs text-[#6B7B6B]">Operations</p>
                <p className="font-semibold text-[#1A2E1A]">
                  Users: {health.operational.activeUsers}
                </p>
                <p className="text-xs text-[#6B7B6B]">
                  Pending traders: {health.operational.pendingTraders}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#E2E8E2] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-[#1A2E1A]">System Settings</h2>
          {settingsQuery.isLoading ? (
            <p className="text-sm text-[#6B7B6B]">Loading settings...</p>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-[#E2E8E2] p-3">
                <span className="text-sm text-[#1A2E1A]">Maintenance mode</span>
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-[#E2E8E2] p-3">
                <span className="text-sm text-[#1A2E1A]">Allow trader self-registration</span>
                <input
                  type="checkbox"
                  checked={form.allowTraderSelfRegistration}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      allowTraderSelfRegistration: e.target.checked,
                    }))
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-[#E2E8E2] p-3">
                <span className="text-sm text-[#1A2E1A]">Enable email notifications</span>
                <input
                  type="checkbox"
                  checked={form.emailNotificationsEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      emailNotificationsEnabled: e.target.checked,
                    }))
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-[#E2E8E2] p-3">
                <span className="text-sm text-[#1A2E1A]">Enable AI forecast tools</span>
                <input
                  type="checkbox"
                  checked={form.aiForecastEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, aiForecastEnabled: e.target.checked }))
                  }
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-[#6B7B6B]">Max products per farmer</p>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxProductsPerFarmer}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        maxProductsPerFarmer: Number(e.target.value || 1),
                      }))
                    }
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[#6B7B6B]">Default market region</p>
                  <Input
                    value={form.defaultMarketRegion}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, defaultMarketRegion: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => {
                    setSaveMessage('');
                    saveMutation.mutate();
                  }}
                  disabled={saveMutation.isPending}
                  className="bg-[#2A5A2A] hover:bg-[#1f4f1f]"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save settings'}
                </Button>
                {saveMessage && (
                  <span
                    className={`text-sm ${
                      saveMessage.toLowerCase().includes('success') ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    {saveMessage}
                  </span>
                )}
                {form.updatedAt && (
                  <span className="text-xs text-[#6B7B6B]">
                    Last updated: {new Date(form.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
