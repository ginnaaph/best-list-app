export type Profile = {
  id: string;
  username?: string;
  fullName?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};
