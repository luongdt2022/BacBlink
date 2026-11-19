import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Hiện thay cho phần bị hỏng. Mặc định là không hiện gì — phần đó biến mất, trang vẫn còn. */
  fallback?: ReactNode;
  /** Nhãn ngắn để đọc log biết phần nào hỏng. */
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * B-22: một thẻ hỏng không được kéo cả trang.
 *
 * Trang giới thiệu là bề mặt **công khai** của một cổng thuộc cơ quan nhà nước, và nội dung của nó do dữ liệu
 * quyết định chứ không do thao tác người dùng — một câu chuyện có tác giả không tra được là đủ để React gỡ bỏ
 * toàn bộ cây và để lại một trang trắng. Ranh giới lỗi đổi hậu quả đó từ "mất cả trang" thành "thiếu một thẻ".
 *
 * Đây là lớp phòng thủ thứ hai, không phải lớp thứ nhất: nguyên nhân đã biết được sửa tại chỗ đọc dữ liệu.
 * Lớp này để dành cho những nguyên nhân chưa biết, và trên một trang công khai thì luôn còn nguyên nhân chưa biết.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ''}]`, error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
