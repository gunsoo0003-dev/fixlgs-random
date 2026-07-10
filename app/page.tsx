import type { Metadata } from 'next';
import RandomPickerClient from '@/components/RandomPickerClient';

export const metadata: Metadata = {
  title: '무료 랜덤추첨기 | FIXLGS Random',
  description:
    '참가자 명단을 입력하고 중복과 빈 줄을 정리한 뒤 당첨자를 무작위로 뽑는 무료 랜덤추첨 도구입니다.',
  keywords: [
    '랜덤추첨기',
    '무료 랜덤추첨기',
    '당첨자 추첨',
    '이벤트 추첨',
    '명단 추첨',
    '무작위 추첨',
    'FIXLGS',
  ],
  openGraph: {
    title: '무료 랜덤추첨기 | FIXLGS Random',
    description:
      '명단을 입력하고 당첨자를 무작위로 뽑을 수 있는 무료 추첨 도구입니다.',
    type: 'website',
    siteName: 'FIXLGS Random',
  },
};

export default function Home() {
  return <RandomPickerClient />;
}