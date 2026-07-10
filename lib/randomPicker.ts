import type { DrawResult, ParsedParticipants } from '@/types/draw';

export function parseParticipants(rawText: string): ParsedParticipants {
  const originalLines = rawText.split('\n');

  const cleanedLines = originalLines
    .map((name) => name.trim())
    .filter(Boolean);

  const participants = Array.from(new Set(cleanedLines));

  return {
    totalInput: cleanedLines.length,
    participants,
    duplicateCount: cleanedLines.length - participants.length,
    emptyLineRemoved: originalLines.length - cleanedLines.length,
  };
}

export function drawRandomWinners(params: {
  participants: string[];
  winnerCount: number;
  allowDuplicate: boolean;
}): string[] {
  const { participants, winnerCount, allowDuplicate } = params;

  if (participants.length === 0) {
    throw new Error('참가자 명단을 입력해주세요.');
  }

  if (!allowDuplicate && winnerCount > participants.length) {
    throw new Error(
      '중복 당첨을 허용하지 않을 경우 당첨자 수는 참가자 수보다 많을 수 없습니다.'
    );
  }

  if (allowDuplicate) {
    return Array.from({ length: winnerCount }, () => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      return participants[randomIndex];
    });
  }

  return shuffleArray(participants).slice(0, winnerCount);
}

export function createDrawResult(params: {
  participants: string[];
  totalInput: number;
  duplicateCount: number;
  emptyLineRemoved: number;
  winnerCount: number;
  allowDuplicate: boolean;
  winners: string[];
}): DrawResult {
  const now = new Date();

  return {
    drawMode: 'free',
    drawCode: createDrawCode(now),
    drawTime: formatDateTime(now),
    totalInput: params.totalInput,
    validCount: params.participants.length,
    duplicateCount: params.duplicateCount,
    emptyLineRemoved: params.emptyLineRemoved,
    winnerCount: params.winnerCount,
    allowDuplicate: params.allowDuplicate,
    participants: params.participants,
    winners: params.winners,
  };
}

export function createShareText(result: DrawResult): string {
  return `[랜덤추첨 결과]

총 입력 수: ${result.totalInput}명
중복 제거 후 참가자 수: ${result.validCount}명
중복 제거 수: ${result.duplicateCount}명
빈 줄 제거 수: ${result.emptyLineRemoved}개
당첨자 수: ${result.winnerCount}명
추첨 방식: ${result.allowDuplicate ? '중복 당첨 허용' : '중복 당첨 없음'}
추첨 일시: ${result.drawTime}
추첨 코드: ${result.drawCode}

당첨자
${result.winners.map((winner, index) => `${index + 1}. ${winner}`).join('\n')}

본 추첨은 FIXLGS 랜덤추첨기를 통해 진행되었습니다.`;
}

function shuffleArray<T>(array: T[]): T[] {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[randomIndex]] = [copied[randomIndex], copied[i]];
  }

  return copied;
}

function createDrawCode(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `FIX-${y}${m}${d}-${random}`;
}

function formatDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${y}년 ${m}월 ${d}일 ${h}:${min}`;
}