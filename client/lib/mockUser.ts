import { User } from "@/types/auth-page";
export const MOCK_USERS : User[]= [
  {
    id: '1',
    name: 'Bisrat Alemayheu',
    email: 'bisrat@example.com',
    phone: '+251 912 345 678',
    role: 'FARMER',
    farmSize: '5 hectares',
    crops: ['Corn', 'Wheat'],
    status: 'active'
  },
  {
    id: '2',
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    phone: '+251 923 456 789',
    role: 'TRADER',
    company: 'Abebe Trading',
    status: 'active'
  },
  {
    id: '3',
    name: 'Tigist Haile',
    email: 'tigist@example.com',
    phone: '+251 934 567 890',
    role: 'FARMER',
    farmSize: '3 hectares',
    crops: ['Coffee', 'Teff'],
    status: 'active'
  },
  {
    id: '4',
    name: 'Meron Tekle',
    email: 'meron@example.com',
    phone: '+251 945 678 901',
    role: 'TRADER',
    company: 'Meron Exports',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    phone: '+251 923 456 789',
    role: 'TRADER',
    company: 'Abebe Trading',
    status: 'active'
  },
];

export const  MOCK_PENDING_TRADERS = [
  {
    id: '1',
    businessName: 'Green Fields Produce',
    ownerName: 'John Doe',
    email: 'john@greenfields.com',
    phone: '+1234567890',
    registrationDate: '2024-03-15',
    status: 'pending',
    businessType: 'Wholesale',
    documents: ['business_license.pdf', 'tax_cert.pdf'],
    address: '123 Farm Road, Rural Area',
    description: 'Family-owned business specializing in organic vegetables'
  },
  {
    id: '2',
    businessName: 'Fresh Harvest Ltd',
    ownerName: 'Jane Smith',
    email: 'jane@freshharvest.com',
    phone: '+1987654321',
    registrationDate: '2024-03-14',
    status: 'pending',
    businessType: 'Retail',
    documents: ['license.pdf', 'id_proof.pdf'],
    address: '456 Market Street, City Center',
    description: 'Local produce distributor'
  },
  {
    id: '3',
    businessName: 'AgroConnect Solutions',
    ownerName: 'Mike Johnson',
    email: 'mike@agroconnect.com',
    phone: '+1122334455',
    registrationDate: '2024-03-13',
    status: 'pending',
    businessType: 'Export',
    documents: ['business_reg.pdf', 'export_license.pdf'],
    address: '789 Trade Avenue, Industrial Area',
    description: 'International agricultural trading company'
  },
  // Add more mock data as needed
];
export const MOCK_TRADER = {
    id: '1',
    businessName: 'Green Fields Produce',
    ownerName: 'John Doe',
    email: 'john@greenfields.com',
    phone: '+1234567890',
    alternatePhone: '+1987654321',
    registrationDate: '2024-03-15',
    status: 'pending',
    businessType: 'Wholesale',
    documents: [
      { name: 'Business License', file: 'business_license.pdf', size: '2.4 MB' },
      { name: 'Tax Certificate', file: 'tax_cert.pdf', size: '1.1 MB' },
      { name: 'ID Proof', file: 'id_proof.pdf', size: '0.8 MB' }
    ],
    address: '123 Farm Road, Rural Area, State, ZIP 12345',
    description: 'Family-owned business specializing in organic vegetables and sustainable farming practices. Operating for over 10 years with a strong commitment to quality.',
    businessRegNumber: 'REG2024001',
    taxId: 'TAX987654321',
    website: 'www.greenfields.com',
    socialMedia: {
      facebook: '@greenfields',
      instagram: '@greenfields_farm'
    },
    bankDetails: {
      bankName: 'First National Bank',
      accountName: 'Green Fields Produce',
      accountNumber: '****1234',
      routingNumber: '****5678'
    },
    notes: 'Previous supplier with good track record. References available upon request.'
  };