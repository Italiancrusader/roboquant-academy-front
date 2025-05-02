
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

export interface Module {
  id: string;
  title: string;
  sort_order: number;
  course_id: string;
}

export interface Lesson {
  id?: string;
  title: string;
  description?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  is_published?: boolean | null;
  module_id?: string | null;
  sort_order?: number;
  course_id: string;
}
