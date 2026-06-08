export type Entry = {
  id: string;
  categoryId: string;
  placeName: string;
  dishName: string;
  city: string;
  notes?: string;
  photoUrl?: string;
  dateCreated?: Date;
  createdAt?: string;
  taste: number;
  value: number;
  portion: number;
  vibe: number;
  overallScore?: number;
};
