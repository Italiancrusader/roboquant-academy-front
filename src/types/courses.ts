
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string | null;
  is_published: boolean | null;
  cover_image: string | null;
  duration_minutes: number | null;
}
