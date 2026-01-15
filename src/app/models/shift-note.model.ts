export interface ShiftNote {
  id: number;
  bedNumber: string;
  content: string;
  priority: 'low' | 'high';
  isCompleted: boolean;
  reminderTime?: Date;
}
