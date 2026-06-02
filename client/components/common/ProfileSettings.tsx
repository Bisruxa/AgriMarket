"use client";

import React, { useEffect, useState } from "react";
import { Lock, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/context/UserContext";
import { userApi } from "@/lib/api";
import { User } from "@/types/auth-page";

type Tab = "profile" | "password";

interface ProfileSettingsProps {
  role?: "FARMER" | "TRADER";
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ role }) => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [woreda, setWoreda] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [crops, setCrops] = useState("");
  const [experience, setExperience] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const isFarmer = (role ?? user?.role)?.toUpperCase() === "FARMER";

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setPhone(user.phone || "");
    setRegion(user.region || "");
    setWoreda(user.woreda || "");
    setFarmSize(user.farmSize?.toString() || "");
    setCrops(Array.isArray(user.crops) ? user.crops.join(", ") : user.crops?.toString() || "");
    setExperience(user.experience || "");
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: "Name is required", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload: Record<string, string | number> = {
      name: name.trim(),
      phone: phone.trim(),
      region: region.trim(),
      woreda: woreda.trim(),
    };

    if (isFarmer) {
      if (farmSize.trim()) payload.farmSize = farmSize.trim();
      if (crops.trim()) payload.crops = crops.trim();
      if (experience.trim()) payload.experience = experience.trim();
    }

    const response = await userApi.updateProfile(payload);
    setLoading(false);

    if (response.success && response.data) {
      const updated = response.data as User;
      login({ ...user!, ...updated });
      setMessage({ text: "Profile updated successfully", type: "success" });
    } else {
      setMessage({ text: response.message || "Failed to update profile", type: "error" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setMessage({ text: "Current password is required", type: "error" });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setMessage({ text: "New password must be at least 6 characters", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await userApi.updatePassword({
      currentPassword,
      newPassword,
    });
    setLoading(false);

    if (response.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ text: "Password changed successfully", type: "success" });
    } else {
      setMessage({ text: response.message || "Failed to change password", type: "error" });
    }
  };

  if (!user) {
    return (
      <p className="text-sm text-gray-500 px-7 pt-6">Sign in to manage your profile.</p>
    );
  }

  return (
    <div className="pt-6 px-7 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-[#2A5A2A] rounded-full flex items-center justify-center">
          <UserRound size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#2A5A2A]/10 text-[#2A5A2A]">
            {user.role}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab("profile"); setMessage(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-[#2A5A2A] text-white"
              : "bg-black/5 text-gray-600 hover:bg-black/10"
          }`}
        >
          <UserRound size={14} className="inline mr-1.5 -mt-0.5" />
          Account
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("password"); setMessage(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "password"
              ? "bg-[#2A5A2A] text-white"
              : "bg-black/5 text-gray-600 hover:bg-black/10"
          }`}
        >
          <Lock size={14} className="inline mr-1.5 -mt-0.5" />
          Password
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === "profile" ? (
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-black/5 border-gray-300 text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="woreda">Woreda</Label>
            <Input
              id="woreda"
              value={woreda}
              onChange={(e) => setWoreda(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          {isFarmer && (
            <>
              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm size</Label>
                <Input
                  id="farmSize"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  disabled={loading}
                  className="bg-black/5 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crops">Crops</Label>
                <Input
                  id="crops"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  disabled={loading}
                  className="bg-black/5 border-gray-300"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="experience">Farming experience</Label>
                <Input
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  disabled={loading}
                  className="bg-black/5 border-gray-300"
                />
              </div>
            </>
          )}
          <div className="md:col-span-2 flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#2A5A2A] text-white hover:bg-[#1e421e] px-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="bg-black/5 border-gray-300"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#2A5A2A] text-white hover:bg-[#1e421e] px-6"
            >
              {loading ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
