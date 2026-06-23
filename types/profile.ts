export type Profile = {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
