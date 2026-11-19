export interface CollaborationRequestJobData {
  type: 'received' | 'accepted' | 'rejected';
  toEmail: string;
  toFirstName: string | null;
  requestId: string;
  requesterIntakeTitle: string;
  targetIntakeTitle: string;
}
