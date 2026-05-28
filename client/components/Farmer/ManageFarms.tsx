'use client';
import React, { useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFarms, useFarmMutations } from '@/components/hooks/useFarms';
import { ETHIOPIAN_REGIONS, WOREDAS_BY_REGION } from '@/lib/regon_n_woreda';
import { Farm } from '@/types/farm';
import { Plus, Pencil, Trash2, MapPin, Sprout, Loader2 } from 'lucide-react';

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
  const woredas = selectedRegion ? WOREDAS_BY_REGION[selectedRegion] || [] : [];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#2A5A2A]">Manage Your Farms</h2>
        <Button onClick={openAddDialog} className="bg-[#2A5A2A] hover:bg-[#1E431E] text-white">
          <Plus className="mr-1 h-4 w-4" /> Add Farm
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2A5A2A]" />
        </div>
      ) : farms.length === 0 ? (
        <div className="text-center py-8 text-black/60 border border-dashed rounded-xl">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No farms yet. Click &quot;Add Farm&quot; to register your land.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm) => (
            <Card key={farm.id} className="border border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base text-[#2A5A2A]">{farm.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(farm)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => setDeleteDialog(farm)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-black/70">
                {farm.soilType && (
                  <div className="flex items-center gap-2">
                    <Sprout className="h-3.5 w-3.5" />
                    <span className="capitalize">{farm.soilType}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {[farm.region, farm.woreda, farm.kebele].filter(Boolean).join(', ') || 'Location not set'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFarm ? 'Edit Farm' : 'Add Farm'}</DialogTitle>
            <DialogDescription>
              {editingFarm ? 'Update your farm details.' : 'Tell us about your farm land.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-black/70 mb-1 block">Farm Name *</label>
              <Input
                placeholder="e.g. North Field, Riverside Plot"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">Soil Type</label>
                <Select value={form.soilType} onValueChange={(v) => setForm({ ...form, soilType: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">Soil Color</label>
                <Select value={form.soilColor} onValueChange={(v) => setForm({ ...form, soilColor: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">Region</label>
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v, woreda: '' })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHIOPIAN_REGIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-black/70 mb-1 block">Woreda</label>
                <Select
                  value={form.woreda}
                  onValueChange={(v) => setForm({ ...form, woreda: v })}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedRegion ? 'Select woreda' : 'Select region first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {woredas.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-black/70 mb-1 block">Kebele (optional)</label>
              <Input
                placeholder="e.g. Kebele 01"
                value={form.kebele}
                onChange={(e) => setForm({ ...form, kebele: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || isPending}
              className="bg-[#2A5A2A] hover:bg-[#1E431E] text-white"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingFarm ? 'Update' : 'Save Farm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Farm</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageFarms;
