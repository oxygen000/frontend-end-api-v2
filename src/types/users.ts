export interface User {
  id: number;
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  dateJoined?: string;
  lastLogin?: string;
  profileImageUrl?: string;
  isActive?: boolean;
}

export const users: User[] = [
  {
    id: 1,
    username: 'user1',
    password: 'user123',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phoneNumber: '+1 234 567 8901',
    address: '123 Main Street, New York, NY',
    role: 'admin',
    dateJoined: '2023-01-15T08:30:00Z',
    lastLogin: '2023-10-25T14:20:00Z',
    profileImageUrl: 'login/profile.png',
    isActive: true,
  },
  {
    id: 2,
    username: 'user2',
    password: 'user123',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phoneNumber: '+1 345 678 9012',
    address: '456 Oak Avenue, Chicago, IL',
    role: 'user',
    dateJoined: '2023-02-20T10:15:00Z',
    lastLogin: '2023-10-24T09:45:00Z',
    profileImageUrl: 'login/profile.png',
    isActive: true,
  },
  {
    id: 3,
    username: 'user3',
    password: 'user123',
    fullName: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    phoneNumber: '+20 111 234 5678',
    address: '789 Nile Street, Cairo',
    role: 'user',
    dateJoined: '2023-03-10T15:45:00Z',
    lastLogin: '2023-10-23T16:30:00Z',
    profileImageUrl: 'login/profile.png',
    isActive: true,
  },
];
