# Data Model: Success & Failure Stories

## Entity: Story

### Fields

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | string (UUID) | PK, auto-generated | |
| `title` | string | required, max 255 chars | |
| `type` | enum | required | `'success'` \| `'failure'` |
| `content` | string | required, non-empty | Rich text (markdown/HTML) |
| `lesson` | string \| null | required when type=`failure` | "Bài học rút ra", rich text |
| `status` | enum | required, default `'draft'` | `'draft'` \| `'published'` |
| `isHidden` | boolean | default `false`, admin-only write | `true` = ẩn khỏi view public |
| `authorId` | string (UUID) | FK → User, required | Set from auth token on create |
| `createdAt` | datetime | auto | |
| `updatedAt` | datetime | auto | |

### Validation Rules

- `title`: bắt buộc, không rỗng, tối đa 255 ký tự
- `content`: bắt buộc, không rỗng sau khi strip HTML/whitespace
- `lesson`: bắt buộc và không rỗng khi `type === 'failure'`; null/ignored khi `type === 'success'`
- `type`: phải là một trong hai giá trị enum — không chấp nhận giá trị khác
- `status`: phải là `'draft'` hoặc `'published'`; user không thể set `isHidden`

### State Transitions

```
draft ──(publish)──► published
published ──(unpublish)──► draft

visible ──(admin hide)──► hidden
hidden ──(admin show)──► visible
```

Câu chuyện hiển thị với người dùng khác khi: `status === 'published' AND isHidden === false`

---

## TypeScript Interfaces (Frontend)

```typescript
export type StoryType = 'success' | 'failure';
export type StoryStatus = 'draft' | 'published';

export interface Story {
  id: string;
  title: string;
  type: StoryType;
  content: string;
  lesson: string | null;
  status: StoryStatus;
  isHidden: boolean;
  authorId: string;
  author?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface StoryListItem {
  id: string;
  title: string;
  type: StoryType;
  status: StoryStatus;
  isHidden: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryListResponse {
  data: StoryListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateStoryRequest {
  title: string;
  type: StoryType;
  content: string;
  lesson?: string | null;
  status: StoryStatus;
}

export type UpdateStoryRequest = Partial<CreateStoryRequest>;

export interface StoryListParams {
  page?: number;
  limit?: number;
  type?: StoryType;
  status?: StoryStatus;
  search?: string;
}
```

---

## Backend Entity (NestJS/TypeORM reference)

```typescript
// story.entity.ts
@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'enum', enum: ['success', 'failure'] })
  type: 'success' | 'failure';

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  lesson: string | null;

  @Column({ type: 'enum', enum: ['draft', 'published'], default: 'draft' })
  status: 'draft' | 'published';

  @Column({ default: false })
  isHidden: boolean;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```
