import { createMockUser } from '../generator';

export const mockUsers = [
  createMockUser('ADMIN'),
  createMockUser('ORGANIZER'),
  ...Array.from({ length: 5 }, () => createMockUser('USER')),
];