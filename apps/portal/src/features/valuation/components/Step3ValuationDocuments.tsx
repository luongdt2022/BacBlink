import { Upload, File, X } from 'lucide-react';

interface Step3ValuationDocumentsProps {
  data: {
    documents: File[];
    notes: string;
  };
  onChange: (data: Step3ValuationDocumentsProps['data']) => void;
}

export function Step3ValuationDocuments({ data, onChange }: Step3ValuationDocumentsProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      onChange({ ...data, documents: [...data.documents, ...newFiles] });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = data.documents.filter((_, i) => i !== index);
    onChange({ ...data, documents: updated });
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
      {/* Upload Area */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Tài liệu hỗ trợ
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="valuation-document-upload"
          />
          <label
            htmlFor="valuation-document-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] px-6 py-12 transition-colors hover:border-primary hover:bg-[#f0f9ff]"
          >
            <Upload className="mb-3 size-10 text-[#9ca3af]" />
            <p className="mb-1 text-sm font-medium text-foreground">
              Kéo thả file hoặc click để chọn
            </p>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ: PDF, Excel, Word (Tối đa 10MB mỗi file)
            </p>
          </label>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Gợi ý: Bằng sáng chế, báo cáo nghiên cứu, tài liệu kỹ thuật, phân tích thị trường
        </p>
      </div>

      {/* File List */}
      {data.documents.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            File đã tải lên ({data.documents.length})
          </label>
          <div className="space-y-2">
            {data.documents.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <File className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[#fee2e2] hover:text-[#dc2626]"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ghi chú cho hội đồng định giá */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Ghi chú cho hội đồng định giá
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={6}
          placeholder="Vui lòng chia sẻ thêm thông tin về mục đích định giá, yêu cầu đặc biệt, hoặc bất kỳ chi tiết nào bạn muốn hội đồng định giá lưu ý..."
          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
