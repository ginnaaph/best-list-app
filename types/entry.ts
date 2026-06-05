export type Entry = {
  id: string;
  categoryId: string;
  placeName: string;
  dishName: string;
  city: string;
  photoUrl?: string;
  notes?: string;
  dateCreated: Date;
  taste: number;
  value: number;
  portion: number;
  vibe: number;
};
