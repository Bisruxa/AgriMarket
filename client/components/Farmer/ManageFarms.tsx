'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFarms, useFarmMutations } from '@/components/hooks/useFarms';
import { useEthiopianGeoOptions } from '@/components/hooks/useEthiopianGeoOptions';
import { Farm } from '@/types/farm';
import { Plus, Loader2 } from 'lucide-react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

const SOIL_TYPES = [
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'loam', label: 'Loam' },
  { value: 'silt', label: 'Silt' },
  { value: 'peaty', label: 'Peaty' },
  { value: 'chalky', label: 'Chalky' },
  { value: 'laterite', label: 'Laterite' },
];

const SOIL_COLORS = [
  { value: 'black', label: 'Black' },
  { value: 'red', label: 'Red' },
  { value: 'brown', label: 'Brown' },
  { value: 'gray', label: 'Gray' },
  { value: 'yellowish', label: 'Yellowish' },
];

interface FarmFormData {
  name: string;
  soilType: string;
  soilColor: string;
  region: string;
  woreda: string;
  kebele: string;
}

const emptyForm: FarmFormData = {
  name: '', soilType: '', soilColor: 'brown', region: '', woreda: '', kebele: '',
};

const ManageFarms = () => {
  const t = useTranslations();
  const f = t.dashboard.farms;
  const { language } = useLanguage();
  const { regions, getWoredasForRegion, labelForRegion, labelForWoreda } = useEthiopianGeoOptions();
  const { data, isLoading } = useFarms();
  const { createMutation, updateMutation, deleteMutation } = useFarmMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Farm | null>(null);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [form, setForm] = useState<FarmFormData>(emptyForm);

  const farms = data?.farms || [];

  const openAddDialog = () => {
    setEditingFarm(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (farm: Farm) => {
    setEditingFarm(farm);
    setForm({
      name: farm.name,
      soilType: farm.soilType || '',
      soilColor: farm.soilColor || 'brown',
      region: farm.region || '',
      woreda: farm.woreda || '',
      kebele: farm.kebele || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      soilType: form.soilType || undefined,
      soilColor: form.soilColor || undefined,
      region: form.region || undefined,
      woreda: form.woreda || undefined,
      kebele: form.kebele || undefined,
    };
    if (editingFarm) {
      updateMutation.mutate({ id: editingFarm.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    deleteMutation.mutate(deleteDialog.id);
    setDeleteDialog(null);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const selectedRegion = form.region;
  const woredas = selectedRegion ? getWoredasForRegion(selectedRegion) : [];

  const soilTypeLabel = (value: string) =>
    f.soilTypes[value as keyof typeof f.soilTypes] || value;
  const soilColorLabel = (value: string) =>
    f.soilColors[value as keyof typeof f.soilColors] || value;

  const dash = f.listNotSet;
  const locale = language === 'am' ? 'am-ET' : 'en-US';

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const display = (value: string | null | undefined) =>
    value && String(value).trim() ? value : dash;

  return (
    <div className={`mt-6 ${language === 'am' ? 'amharic' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#2A5A2A]">{f.title}</h2>
        <Button onClick={openAddDialog} className="bg-[#2A5A2A] hover:bg-[#1E431E] text-white">
          <Plus className="mr-1 h-4 w-4" /> {f.addFarm}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2A5A2A]" />
        </div>
      ) : farms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-black/60">
          <p>{f.empty}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {farms.map((farm) => {
            const hasClimate =
              farm.ph != null ||
              farm.nitrogen != null ||
              farm.temperature != null ||
              farm.humidity != null ||
              farm.rainfall != null;

            return (
              <article
                key={farm.id}
                className="p-4 sm:p-5 transition-colors hover:bg-[#F5F9F5]/60"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2A5A2A]">{farm.name}</h3>
                      <p className="mt-0.5 text-xs text-black/45">
                        {f.listRegistered}: {formatDate(farm.createdAt)}
                      </p>
                    </div>

                    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/40">
                          {f.region}
                        </dt>
                        <dd className="mt-0.5 text-black/80">
                          {farm.region ? labelForRegion(farm.region) : dash}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/40">
                          {f.woreda}
                        </dt>
                        <dd className="mt-0.5 text-black/80">
                          {farm.woreda ? labelForWoreda(farm.woreda) : dash}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/40">
                          {f.listKebele}
                        </dt>
                        <dd className="mt-0.5 text-black/80">{display(farm.kebele)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/40">
                          {f.soilType}
                        </dt>
                        <dd className="mt-0.5 text-black/80">
                          {farm.soilType ? soilTypeLabel(farm.soilType) : dash}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/40">
                          {f.soilColor}
                        </dt>
                        <dd className="mt-0.5 text-black/80">
                          {farm.soilColor ? soilColorLabel(farm.soilColor) : dash}
                        </dd>
                      </div>
                      {farm.size && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-black/40">
                            {f.listSize}
                          </dt>
                          <dd className="mt-0.5 text-black/80">
                            {farm.size}
                            {farm.sizeUnit ? ` ${farm.sizeUnit}` : ''}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {hasClimate && (
                      <div className="rounded-lg border border-[#5B8C51]/15 bg-[#F5F9F5]/80 px-3 py-2.5">
                        <p className="mb-2 text-xs font-semibold text-[#2A5A2A]">{f.listClimate}</p>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-black/70 sm:grid-cols-3 lg:grid-cols-6">
                          {farm.ph != null && (
                            <div>
                              <dt className="text-black/45">{f.listPh}</dt>
                              <dd className="font-medium text-black/80">{farm.ph}</dd>
                            </div>
                          )}
                          {farm.nitrogen != null && (
                            <div>
                              <dt className="text-black/45">N</dt>
                              <dd className="font-medium text-black/80">{farm.nitrogen}</dd>
                            </div>
                          )}
                          {farm.phosphorus != null && (
                            <div>
                              <dt className="text-black/45">P</dt>
                              <dd className="font-medium text-black/80">{farm.phosphorus}</dd>
                            </div>
                          )}
                          {farm.potassium != null && (
                            <div>
                              <dt className="text-black/45">K</dt>
                              <dd className="font-medium text-black/80">{farm.potassium}</dd>
                            </div>
                          )}
                          {farm.temperature != null && (
                            <div>
                              <dt className="text-black/45">{f.listTemp}</dt>
                              <dd className="font-medium text-black/80">{farm.temperature}°C</dd>
                            </div>
                          )}
                          {farm.humidity != null && (
                            <div>
                              <dt className="text-black/45">{f.listHumidity}</dt>
                              <dd className="font-medium text-black/80">{farm.humidity}%</dd>
                            </div>
                          )}
                          {farm.rainfall != null && (
                            <div>
                              <dt className="text-black/45">{f.listRainfall}</dt>
                              <dd className="font-medium text-black/80">{farm.rainfall} mm</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:items-stretch">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#2A5A2A]/40 text-[#2A5A2A] hover:bg-[#2A5A2A]/5"
                      onClick={() => openEditDialog(farm)}
                    >
                      {f.update}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialog(farm)}
                    >
                      {f.delete}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFarm ? f.editFarm : f.addFarmDialog}</DialogTitle>
            <DialogDescription>
              {editingFarm ? f.editDescription : f.addDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-black/70 mb-1 block">{f.farmName}</label>
              <Input
                placeholder={f.farmNamePlaceholder}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">{f.soilType}</label>
                <Select value={form.soilType} onValueChange={(v) => setForm({ ...form, soilType: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={f.select} />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((st) => (
                      <SelectItem key={st.value} value={st.value}>{soilTypeLabel(st.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">{f.soilColor}</label>
                <Select value={form.soilColor} onValueChange={(v) => setForm({ ...form, soilColor: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={f.select} />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{soilColorLabel(c.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">{f.region}</label>
                <Select
                  value={form.region || undefined}
                  onValueChange={(v) => setForm({ ...form, region: v, woreda: '' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={f.selectRegion} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[140] max-h-60">
                    {regions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">{f.woreda}</label>
                <Select
                  key={`woreda-select-${selectedRegion}`}
                  value={form.woreda || undefined}
                  onValueChange={(v) => setForm({ ...form, woreda: v })}
                  disabled={!selectedRegion || woredas.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedRegion
                          ? f.selectRegionFirst
                          : woredas.length === 0
                            ? f.noWoredasForRegion
                            : f.selectWoreda
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[140] max-h-60">
                    {woredas.map((woreda) => (
                      <SelectItem key={woreda.value} value={woreda.value}>
                        {woreda.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-black/70 mb-1 block">{f.kebele}</label>
              <Input
                placeholder={f.kebelePlaceholder}
                value={form.kebele}
                onChange={(e) => setForm({ ...form, kebele: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.common.cancel}</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || isPending}
              className="bg-[#2A5A2A] hover:bg-[#1E431E] text-white"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingFarm ? f.update : f.saveFarm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{f.deleteTitle}</DialogTitle>
            <DialogDescription>
              {f.deleteDescription.replace('{name}', deleteDialog?.name ?? '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>{t.common.cancel}</Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {f.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageFarms;
