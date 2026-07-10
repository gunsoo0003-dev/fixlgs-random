'use client';

import { useMemo, useRef, useState } from 'react';
import type { DrawResult } from '@/types/draw';
import {
  createDrawResult,
  createShareText,
  drawRandomWinners,
  parseParticipants,
} from '@/lib/randomPicker';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RandomPickerClient() {
  const [rawNames, setRawNames] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [drawStepText, setDrawStepText] = useState('추첨 대기 중');

  const rollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const parsed = useMemo(() => parseParticipants(rawNames), [rawNames]);

  const shareText = useMemo(() => {
    if (!result) return '';
    return createShareText(result);
  }, [result]);

  const handleDraw = async () => {
    if (isDrawing) return;

    setCopied(false);
    setResult(null);

    try {
      const winners = drawRandomWinners({
        participants: parsed.participants,
        winnerCount,
        allowDuplicate,
      });

      setIsDrawing(true);
      setCountdown(null);
      setDrawStepText('참가자 명단을 섞는 중입니다');

      rollingTimerRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * parsed.participants.length);
        setRollingName(parsed.participants[randomIndex] || '');
      }, 70);

      await wait(1200);
      setDrawStepText('당첨자를 추첨하는 중입니다');

      await wait(900);

      for (const number of [3, 2, 1]) {
        setCountdown(number);
        setDrawStepText('잠시 후 결과가 공개됩니다');
        await wait(650);
      }

      if (rollingTimerRef.current) {
        clearInterval(rollingTimerRef.current);
        rollingTimerRef.current = null;
      }

      setCountdown(null);
      setDrawStepText('당첨자 공개');

      const drawResult = createDrawResult({
        participants: parsed.participants,
        totalInput: parsed.totalInput,
        duplicateCount: parsed.duplicateCount,
        emptyLineRemoved: parsed.emptyLineRemoved,
        winnerCount,
        allowDuplicate,
        winners,
      });

      setResult(drawResult);
      setRollingName('');
      await wait(300);
      setIsDrawing(false);
    } catch (error) {
      if (rollingTimerRef.current) {
        clearInterval(rollingTimerRef.current);
        rollingTimerRef.current = null;
      }

      setIsDrawing(false);
      setCountdown(null);
      setRollingName('');
      setDrawStepText('추첨 대기 중');

      alert(error instanceof Error ? error.message : '추첨 중 문제가 발생했습니다.');
    }
  };

  const handleCopy = async () => {
    if (!shareText) return;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      alert('복사에 실패했습니다. 결과 내용을 직접 선택해서 복사해주세요.');
    }
  };

  const handleReset = () => {
    if (rollingTimerRef.current) {
      clearInterval(rollingTimerRef.current);
      rollingTimerRef.current = null;
    }

    setRawNames('');
    setWinnerCount(1);
    setAllowDuplicate(false);
    setResult(null);
    setCopied(false);
    setIsDrawing(false);
    setRollingName('');
    setCountdown(null);
    setDrawStepText('추첨 대기 중');
  };

  return (
    <div className="min-h-screen bg-[#f3f7f4] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="text-lg font-black tracking-tight text-slate-950">
            FIXLGS Random
          </a>

          <nav className="flex items-center gap-5 text-sm font-bold text-slate-600">
            <a href="/" className="text-emerald-600">
              기본 추첨기
            </a>
            <a href="https://data.fixlgs.com" className="hover:text-emerald-600">
              데이터 도구
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <div className="absolute right-[-90px] top-[-90px] h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute bottom-[-100px] left-[-100px] h-72 w-72 rounded-full bg-lime-100 blur-3xl" />
          <div className="absolute bottom-10 right-10 hidden h-24 w-24 rounded-full border border-emerald-200 md:block" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-black tracking-[0.2em] text-emerald-600">
                FIXLGS RANDOM PICKER
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                무료 랜덤추첨기
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                참가자 명단을 입력하면 빈 줄과 중복을 정리하고, 설정한 인원만큼
                당첨자를 무작위로 뽑을 수 있는 무료 추첨 도구입니다.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <HeroTag text="명단 정리" />
                <HeroTag text="중복 제거" />
                <HeroTag text="추첨 연출" />
                <HeroTag text="결과 복사" />
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl">
              <p className="text-sm font-bold text-emerald-300">현재 상태</p>
              <p className="mt-3 text-4xl font-black">
                {parsed.participants.length}
                <span className="ml-1 text-lg text-slate-300">명 준비됨</span>
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(parsed.participants.length * 8, 100)}%`,
                  }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                명단은 브라우저에서만 처리되며 서버에 저장하지 않습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.16em] text-emerald-600">
                  PARTICIPANTS
                </p>
                <h2 className="mt-2 text-2xl font-black">참가자 명단</h2>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                한 줄에 한 명
              </div>
            </div>

            <textarea
              value={rawNames}
              disabled={isDrawing}
              onChange={(event) => {
                setRawNames(event.target.value);
                setResult(null);
                setCopied(false);
              }}
              placeholder={`홍길동
김철수
이영희
박민수
홍길동`}
              className="min-h-[380px] w-full resize-none rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-base leading-7 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <StatCard label="총 입력" value={`${parsed.totalInput}명`} />
              <StatCard label="참가자" value={`${parsed.participants.length}명`} />
              <StatCard label="중복 제거" value={`${parsed.duplicateCount}명`} />
              <StatCard label="빈 줄 제거" value={`${parsed.emptyLineRemoved}개`} />
            </div>
          </div>

          <aside className="grid gap-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black tracking-[0.16em] text-emerald-600">
                DRAW SETTING
              </p>
              <h2 className="mt-2 text-2xl font-black">추첨 설정</h2>

              <div className="mt-7">
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  당첨자 수
                </label>
                <input
                  type="number"
                  min={1}
                  disabled={isDrawing}
                  value={winnerCount}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setWinnerCount(Number.isNaN(value) || value < 1 ? 1 : value);
                    setResult(null);
                    setCopied(false);
                  }}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-lg font-black outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black">중복 당첨 허용</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      같은 참가자가 여러 번 당첨될 수 있게 합니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isDrawing}
                    onClick={() => {
                      setAllowDuplicate((prev) => !prev);
                      setResult(null);
                      setCopied(false);
                    }}
                    className={`relative h-8 w-14 rounded-full transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      allowDuplicate ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    aria-label="중복 당첨 허용"
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                        allowDuplicate ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={handleDraw}
                  disabled={isDrawing}
                  className="h-16 rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isDrawing ? '추첨 진행 중...' : '추첨 시작'}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isDrawing}
                  className="rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  전체 초기화
                </button>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />

              <div className="relative">
                <p className="text-sm font-black tracking-[0.16em] text-emerald-300">
                  DRAW LIVE
                </p>
                <h2 className="mt-2 text-2xl font-black">추첨 진행</h2>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm font-bold text-slate-300">{drawStepText}</p>

                  {isDrawing ? (
                    <>
                      <div className="mt-5 flex min-h-[92px] items-center justify-center">
                        {countdown ? (
                          <span className="animate-pulse text-7xl font-black text-emerald-300">
                            {countdown}
                          </span>
                        ) : (
                          <span className="max-w-full truncate text-4xl font-black text-white md:text-5xl">
                            {rollingName || '추첨 준비'}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex justify-center gap-2">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300 [animation-delay:240ms]" />
                      </div>
                    </>
                  ) : result ? (
                    <div className="mt-5">
                      <p className="text-4xl font-black text-emerald-300">
                        추첨 완료
                      </p>
                      <p className="mt-3 text-sm text-slate-300">
                        {result.drawCode}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <p className="text-4xl font-black text-slate-400">
                        READY
                      </p>
                      <p className="mt-3 text-sm text-slate-400">
                        명단 입력 후 추첨을 시작하세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-emerald-600">
                RESULT
              </p>
              <h2 className="mt-2 text-2xl font-black">추첨 결과</h2>
            </div>

            {result && !isDrawing && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  {copied ? '복사 완료' : '결과 복사'}
                </button>
                <button
                  type="button"
                  onClick={handleDraw}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  다시 추첨
                </button>
              </div>
            )}
          </div>

          {!result ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-black text-slate-500">
                아직 추첨 결과가 없습니다.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                참가자 명단과 당첨자 수를 입력한 뒤 추첨을 시작해주세요.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-emerald-700">
                    당첨자 명단
                  </p>
                  <p className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">
                    {result.drawCode}
                  </p>
                </div>

                <ol className="mt-4 space-y-3">
                  {result.winners.map((winner, index) => (
                    <li
                      key={`${winner}-${index}`}
                      className="flex animate-[fadeInUp_0.45s_ease-out_both] items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {winner}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-700">
                  공유용 결과 문구
                </p>
                <pre className="mt-4 max-h-[380px] overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-5 text-sm leading-7 text-slate-700">
                  {shareText}
                </pre>
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            title="서버 저장 없음"
            desc="입력한 참가자 명단과 추첨 결과는 서버에 저장하지 않습니다."
          />
          <InfoCard
            title="무료 사용"
            desc="현재 버전은 로그인 없이 누구나 무료로 사용할 수 있습니다."
          />
          <InfoCard
            title="LGS 확장 예정"
            desc="추후 이벤트 응모와 LGS 포인트 추첨 기능을 연결할 예정입니다."
          />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-slate-500">
        <div className="border-t border-slate-200 pt-6">
          © FIXLGS Random. Simple tools for useful data.
        </div>
      </footer>
    </div>
  );
}

function HeroTag({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
      {text}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}