
export interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  avatar?: string;
  email?: string;
  username?: string;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
