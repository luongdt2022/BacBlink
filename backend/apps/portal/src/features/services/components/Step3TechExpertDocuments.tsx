import { Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';

interface Step3TechExpertDocumentsProps {
  data: {
    documents: File[];
    additionalInfo: string;
  };
  onChange: (data: Step3TechExpertDocumentsProps['data']) => void;
}

export function Step3TechExpertDocuments({ data, onChange }: Step3TechExpertDocumentsProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange({ ...data, documents: [...data.documents, ...newFiles] });
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = data.documents.filter((_, i) => i !== index);
    onChange({ ...data, documents: newFiles });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      onChange({ ...data, documents: [...data.documents, ...newFiles] });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Tài liệu & Thông tin bổ sung
        </h2>

        {/* Document Upload */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Tài liệu kỹ thuật
          </label>
          
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary'
                : 'border bg-white hover:border-primary'
            }`}
          >
            <input
              type="file"
              id="file-upload-tech"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
            <Upload className="mx-auto mb-4 size-12 text-[#9ca3af]" />
            <p className="mb-1 text-sm font-medium text-foreground">
              Kéo thả tài liệu vào đây hoặc{' '}
              <label htmlFor="file-upload-tech" className="cursor-pointer text-primary hover:underline">
                chọn tệp
              </label>
            </p>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX (tối đa 10MB mỗi tệp)
            </p>
          </div>

          {/* File List */}
          {data.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border bg-white p-3"
                >
                  <FileText className="size-5 flex-shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-[#f3f4f6] hover:text-[#dc2626]"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-2 text-sm text-muted-foreground">
            Tài liệu kỹ thuật, báo cáo nghiên cứu, hoặc thông tin liên quan (không bắt buộc)
          </p>
        </div>

        {/* Additional Info */}
        <div className="mb-6">
          <label htmlFor="additionalInfo" className="mb-2 block text-sm font-medium text-foreground">
            Thông tin bổ sung
          </label>
          <textarea
            id="additionalInfo"
            value={data.additionalInfo}
            onChange={(e) => onChange({ ...data, additionalInfo: e.target.value })}
            placeholder="Thông tin bổ sung, yêu cầu đặc biệt, hoặc câu hỏi cho chuyên gia..."
            rows={4}
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mọi thông tin bổ sung giúp chuyên gia hiểu rõ hơn về nhu cầu của bạn
          </p>
        </div>

        {/* Confirmation Notice */}
        <div className="rounded-lg border border bg-[#f9fafb] p-4">
          <div className="text-sm text-[#4b5563]">
            <p className="mb-2 font-medium text-foreground">Lưu ý:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Yêu cầu sẽ được gửi đến bộ phận phụ trách để xem xét</li>
              <li>Chúng tôi sẽ kết nối bạn với chuyên gia phù hợp trong vòng 3-5 ngày làm việc</li>
              <li>Bạn có thể theo dõi trạng thái yêu cầu tại trang "Chuyên gia công nghệ dẫn dắt"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
