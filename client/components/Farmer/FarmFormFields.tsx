export interface FarmFormData {
  name: string;
  soilType: string;
  soilColor: string;
  region: string;
  woreda: string;
  kebele: string;
}

export const emptyFarmForm: FarmFormData = {
  name: '',
  soilType: '',
  soilColor: 'brown',
  region: '',
  woreda: '',
  kebele: '',
};

interface Props {
  form: FarmFormData;
  onChange: (form: FarmFormData) => void;
}

export function FarmFormFields({ form, onChange }: Props) {
  const set = (field: keyof FarmFormData, value: string) =>
    onChange({ ...form, [field]: value });

  return (
    <div className="grid gap-4 py-2">
      <div>
        <label className="text-sm font-medium text-black/70">Farm Name *</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2A5A2A]"
          placeholder="e.g. North Field"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-black/70">Soil Type</label>
          <select
            value={form.soilType}
            onChange={(e) => set('soilType', e.target.value)}
            className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2A5A2A]"
          >
            <option value="">Select...</option>
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
            <option value="loam">Loam</option>
            <option value="silt">Silt</option>
            <option value="peaty">Peaty</option>
            <option value="chalky">Chalky</option>
            <option value="laterite">Laterite</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-black/70">Soil Color</label>
          <select
            value={form.soilColor}
            onChange={(e) => set('soilColor', e.target.value)}
            className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2A5A2A]"
          >
            <option value="brown">Brown</option>
            <option value="black">Black</option>
            <option value="red">Red</option>
            <option value="gray">Gray</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-black/70">Region</label>
          <input
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2A5A2A]"
            placeholder="Region"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-black/70">Woreda</label>
          <input
            value={form.woreda}
            onChange={(e) => set('woreda', e.target.value)}
            className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2A5A2A]"
            placeholder="Woreda"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-black/70">Kebele</label>
          <input
            value={form.kebele}
            onChange={(e) => set('kebele', e.target.value)}
            className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2A5A2A]"
            placeholder="Kebele"
          />
        </div>
      </div>
    </div>
  );
}
