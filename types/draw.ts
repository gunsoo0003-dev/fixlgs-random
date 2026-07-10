export type DrawMode = 'free' | 'lgs';

export type ParsedParticipants = {
  totalInput: number;
  participants: string[];
  duplicateCount: number;
  emptyLineRemoved: number;
};

export type DrawResult = {
  drawMode: DrawMode;
  drawCode: string;
  drawTime: string;
  totalInput: number;
  validCount: number;
  duplicateCount: number;
  emptyLineRemoved: number;
  winnerCount: number;
  allowDuplicate: boolean;
  participants: string[];
  winners: string[];

  // 나중에 LGS 포인트 추첨 연결용
  eventId?: string;
  userId?: string;
  entryCost?: number;
  totalLgsUsed?: number;
  savedResultId?: string;
};