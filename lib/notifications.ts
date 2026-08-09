export type JobNotification = {
  id: string;
  message: string;
  serviceName?: string;
  locationName?: string;
  createdAt: number; // epoch ms
};

export type NewJobNotification = Omit<JobNotification, "id" | "createdAt">;
