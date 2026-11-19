export interface AccountActivationJobData {
  userId: string;
  email: string;
  firstName: string | null;
  activationLink: string;
}
