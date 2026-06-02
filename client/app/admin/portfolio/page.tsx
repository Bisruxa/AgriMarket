'use client';

import Profile from '@/components/common/Profile';
import EditForm from '@/components/common/EditForm';
import Header from '@/components/common/Header';

const adminProfileFields = [
  { id: 'name', name: 'name', label: 'Full Name', type: 'text' },
  { id: 'email', name: 'email', label: 'Email', type: 'email' },
  { id: 'phonenumber', name: 'phone', label: 'Phone Number', type: 'tel' },
  { id: 'region', name: 'region', label: 'Region', type: 'text' },
  { id: 'woreda', name: 'woreda', label: 'Woreda', type: 'text' },
];

export default function AdminPortfolioPage() {
  return (
    <div className="w-full min-w-0 max-w-full py-4">
      <Header />
      <hr className="border-[#E2E8E2]" />
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E1A]">My Portfolio</h1>
          <p className="text-[#6B7B6B] mt-1 text-sm">View and update your admin profile</p>
        </div>

        <div className="w-full min-w-0 max-w-full overflow-hidden [&_.flex]:flex-col [&_.flex]:gap-6 [&_.flex]:lg:flex-row [&_.w-170]:w-full [&_.w-170]:max-w-full">
          <Profile />
        </div>

        <div className="w-full min-w-0 rounded-xl border border-[#E2E8E2] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#1A2E1A] mb-4">Profile details</h2>
          <EditForm Fields={adminProfileFields} endpoint="/profile/update" />
        </div>
      </div>
    </div>
  );
}
