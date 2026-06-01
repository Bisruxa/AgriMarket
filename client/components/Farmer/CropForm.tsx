"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/components/hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";
import { CROP_OPTION_VALUES, type CropOptionValue } from "@/lib/cropOptions";

/** Navy green palette for marketplace product form */
const NAVY = {
  primary: "#0B3D2E",
  primaryDark: "#082F24",
  accent: "#14532D",
};

export interface CropFormData {
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
  stock: string;
  location: string;
  harvestDate: string;
}

interface CropFormProps {
  initialData?: CropFormData;
  productId?: string;
  onSubmit?: (data: CropFormData) => void;
  onClose?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function CropForm({
  initialData,
  productId,
  onSubmit,
  onClose,
  isLoading = false,
  errorMessage = null,
}: CropFormProps) {
  const t = useTranslations();
  const pf = t.dashboard.market.productForm;
  const { language } = useLanguage();

  const [selectedCrop, setSelectedCrop] = React.useState<CropOptionValue | undefined>();
  const [otherCrop, setOtherCrop] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [harvestDate, setHarvestDate] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const cropLabel = (value: string) => pf.crops[value] ?? value;

  React.useEffect(() => {
    if (initialData) {
      const cropValue = initialData.name;
      if ((CROP_OPTION_VALUES as readonly string[]).includes(cropValue)) {
        setSelectedCrop(cropValue as CropOptionValue);
      } else {
        setSelectedCrop("OTHER");
        setOtherCrop(cropValue);
      }
      setDescription(initialData.description || "");
      setPrice(initialData.price);
      setStock(initialData.stock);
      setHarvestDate(initialData.harvestDate?.split("T")[0] || "");
    }
  }, [initialData]);

  const handleCropChange = (value: CropOptionValue) => {
    setSelectedCrop(value);
    if (value !== "OTHER") setOtherCrop("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let cropName = "";
    if (selectedCrop === "OTHER") {
      if (!otherCrop.trim()) {
        setFormError(pf.errors.specifyCrop);
        return;
      }
      cropName = otherCrop.trim();
    } else if (selectedCrop) {
      cropName = selectedCrop;
    } else {
      setFormError(pf.errors.selectCrop);
      return;
    }

    if (!description.trim()) {
      setFormError(pf.errors.description);
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setFormError(pf.errors.price);
      return;
    }

    if (!stock || parseInt(stock, 10) <= 0) {
      setFormError(pf.errors.stock);
      return;
    }

    if (!harvestDate) {
      setFormError(pf.errors.harvestDate);
      return;
    }

    onSubmit?.({
      name: cropName,
      description,
      price,
      unit: "KG",
      category: "VEGETABLES",
      stock,
      location: "",
      harvestDate,
    });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`relative ${language === "am" ? "amharic" : ""}`}
    >
      <div
        className="fixed inset-0 z-[110] bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      <div className="fixed top-1/2 left-1/2 z-[111] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div
            className="px-6 py-4"
            style={{
              background: `linear-gradient(to right, ${NAVY.primary}, ${NAVY.accent})`,
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {productId ? pf.editTitle : pf.addTitle}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl leading-none text-white/80 transition-colors hover:text-white"
                aria-label={pf.cancel}
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-sm text-white/85">
              {productId ? pf.editSubtitle : pf.addSubtitle}
            </p>
          </div>

          <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {(formError || errorMessage) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-700">{formError || errorMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {pf.cropType} *
                </Label>
                <Select
                  value={selectedCrop}
                  onValueChange={(v) => handleCropChange(v as CropOptionValue)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border-gray-200">
                    <SelectValue placeholder={pf.selectCrop} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[140] max-h-60">
                    {CROP_OPTION_VALUES.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {cropLabel(crop)}
                      </SelectItem>
                    ))}
                    <SelectItem value="OTHER">{cropLabel("OTHER")}</SelectItem>
                  </SelectContent>
                </Select>
                {selectedCrop === "OTHER" && (
                  <Input
                    type="text"
                    placeholder={pf.otherCropPlaceholder}
                    value={otherCrop}
                    onChange={(e) => setOtherCrop(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border-gray-200"
                    disabled={isLoading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {pf.description} *
                </Label>
                <Textarea
                  placeholder={pf.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full resize-none rounded-lg border-gray-200"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    {pf.price} *
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-11 w-full rounded-lg border-gray-200 pl-10"
                      disabled={isLoading}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      {pf.currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    {pf.stock} *
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="h-11 w-full rounded-lg border-gray-200"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    {pf.harvestDate} *
                  </Label>
                  <Input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="h-11 w-full rounded-lg border-gray-200"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-11 flex-1 rounded-lg border-2 border-gray-200"
                >
                  {pf.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 flex-1 rounded-lg bg-[#0B3D2E] text-white hover:bg-[#082F24] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {productId ? pf.updating : pf.submitting}
                    </span>
                  ) : productId ? (
                    pf.updateCrop
                  ) : (
                    pf.addCrop
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
