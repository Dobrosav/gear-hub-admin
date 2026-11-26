export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
}
