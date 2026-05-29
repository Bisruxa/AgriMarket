'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useFarms, useFarmMutations } from '@/components/hooks/useFarms';
import { Farm } from '@/types/farm';
import { Plus, Pencil, Trash2, MapPin, Sprout, Loader2 } from 'lucide-react';
import {
  FarmFormFields,
  emptyFarmForm,
  FarmFormData,
} from '@/components/Farmer/FarmFormFields';

const ManageFarms = () => {
  const { data, isLoading } = useFarms();
  const { updateMutation, deleteMutation } = useFarmMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Farm | null>(null);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [form, setForm] = useState<FarmFormData>(emptyFarmForm);

  const farms = data?.farms || [];

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
      setDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    deleteMutation.mutate(deleteDialog.id);
    setDeleteDialog(null);
  };

  const isPending = updateMutation.isPending;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#2A5A2A]">Manage Your Farms</h2>
        <Button asChild className="bg-[#2A5A2A] hover:bg-[#1E431E] text-white">
          <Link href="/farmer/farms/add">
            <Plus className="mr-1 h-4 w-4" /> Add Farm
          </Link>
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
            <DialogTitle>Edit Farm</DialogTitle>
            <DialogDescription>Update your farm details.</DialogDescription>
          </DialogHeader>

          <FarmFormFields form={form} onChange={setForm} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || isPending}
              className="bg-[#2A5A2A] hover:bg-[#1E431E] text-white"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Update
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
