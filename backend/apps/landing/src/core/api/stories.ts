export type StoryType = 'success' | 'failure';
export type StorySource = 'user' | 'admin' | 'all';

/**
 * Đúng những gì đường công khai trả về, không hơn.
 *
 * Trước đây kiểu này khai thêm `role`, và trường đó nay không còn trong phản hồi công khai: `/public/stories`
 * đi qua một hàm ánh xạ riêng chỉ trả định danh, tên và tổ chức (B-19 — trước đó nó dùng chung hàm với đường
 * quản trị và đẩy cả `email` lẫn `phone` của mọi tác giả ra Internet). Một kiểu khai nhiều hơn thứ máy chủ gửi
 * là một lời hứa mà không ai giữ.
 */
export interface StoryAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  organization: string | null;
}

export interface Story {
  id: string;
  title: string;
  type: StoryType;
  content: string;
  lesson: string | null;
  status: 'draft' | 'published';
  isHidden: boolean;
  authorId: string;
  /**
   * B-22: **có thể là `null`**. Máy chủ trả `author: null` khi tra danh bạ người dùng trượt
   * (`V1Mappers.cs:114`), và kiểu này trước đây khai nó luôn có. Thẻ câu chuyện đọc thẳng `author.firstName`,
   * nên một câu chuyện có tác giả không tra được sẽ ném `TypeError` và làm **trắng cả trang công khai**, không
   * chỉ hỏng một thẻ. Nó phụ thuộc vào dữ liệu chứ không vào thao tác của người dùng.
   */
  author: StoryAuthor | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesResponse {
  data: Story[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchPublicStories(params?: {
  source?: StorySource;
  page?: number;
  limit?: number;
}): Promise<StoriesResponse> {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) throw new Error('VITE_API_URL is not set');

  const url = new URL(`${apiUrl}/public/stories`);
  if (params?.source && params.source !== 'all') {
    url.searchParams.set('source', params.source);
  }
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch stories: ${res.status}`);
  return res.json();
}
