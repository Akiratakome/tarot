import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuraBackdrop } from '../components/AuraBackdrop';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { createReadingSession, saveReadingSession } from './storage';
import type { ReadingBackground, ReadingSession } from './types';

const DRAFT_KEY = 'auratarot.question.draft.v1';
const PENDING_KEY = 'auratarot.question.pending.v1';
const PENDING_LIFETIME_MS = 30 * 60 * 1000;
interface PendingQuestion {
  question: string;
  background: ReadingBackground;
  email: string;
  createdAt: number;
}

function readPending(): PendingQuestion | null {
  try {
    const value = JSON.parse(localStorage.getItem(PENDING_KEY) ?? 'null') as PendingQuestion | null;
    if (!value || Date.now() - value.createdAt > PENDING_LIFETIME_MS) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return value;
  } catch { return null; }
}

function clearPending() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* Storage may be unavailable. */ }
}

const suggestions = [
  '我能收到梦校的 offer 吗？',
  '我今年能顺利毕业并取得理想学位吗？',
  '我能拿到心仪的 intern 或 graduate offer 吗？',
  '我适合在今年申请 PhD 吗？',
  '目前阻碍我通过考试的关键因素是？'
];
const emptyBackground: ReadingBackground = { stage: '', region: '', timeframe: '', concern: '', context: '' };

function getDraft() {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') as { question?: string; background?: ReadingBackground }; }
  catch { return {}; }
}

export function QuestionPage({ onStart, onDirectDraw }: {
  onStart: (reading: ReadingSession) => void;
  onDirectDraw: () => void;
}) {
  const [draft] = useState(getDraft);
  const [question, setQuestion] = useState(draft.question ?? '');
  const [background, setBackground] = useState<ReadingBackground>({ ...emptyBackground, ...draft.background });
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ question, background })); }
    catch { /* Draft persistence is optional. */ }
  }, [question, background]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    void getSupabaseClient().then(async (client) => {
      if (!client || !mounted) { if (mounted) setAuthChecked(true); return; }
      const { data } = await client.auth.getUser();
      if (mounted) { setUser(data.user); setAuthChecked(true); }
      const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    });
    return () => { mounted = false; unsubscribe?.(); };
  }, []);

  useEffect(() => {
    if (!authChecked || !user) return;
    const pending = readPending();
    if (!pending || pending.email !== user.email?.trim().toLowerCase()) return;
    clearPending();
    const reading = createReadingSession(pending.question, pending.background, user.id);
    saveReadingSession(reading);
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* Ignore. */ }
    onStart(reading);
  }, [authChecked, user, onStart]);

  function updateBackground(key: keyof ReadingBackground, value: string) {
    setBackground((current) => ({ ...current, [key]: value }));
  }

  function start(event: FormEvent) {
    event.preventDefault();
    const clean = question.trim();
    if (clean.length < 8 || clean.length > 300) { setMessage('请用 8–300 个字描述一个明确的问题。'); return; }
    if (!authChecked) { setMessage('正在确认登录状态，请稍候。'); return; }
    if (!user) { setShowLogin(true); setMessage('自定义问题需要先登录。完成邮箱验证后会自动进入推荐牌阵。'); return; }
    const reading = createReadingSession(clean, background, user.id);
    saveReadingSession(reading);
    clearPending();
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* Ignore. */ }
    onStart(reading);
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    const client = await getSupabaseClient();
    if (!client) { setMessage('登录暂不可用：请先配置 Supabase。你仍可直接抽牌。'); return; }
    setSending(true);
    const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: {
      emailRedirectTo: new URL('/', window.location.origin).toString()
    } });
    setSending(false);
    if (error) { setMessage(`邮件发送失败：${error.message}`); return; }
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ question: question.trim(), background,
        email: email.trim().toLowerCase(), createdAt: Date.now() } satisfies PendingQuestion));
      setMessage('验证邮件已发送。请在同一浏览器打开邮件链接；验证完成后会自动进入推荐牌阵。');
    } catch {
      setMessage('验证邮件已发送。浏览器未能保存问题，请验证后返回此页面，再点击“开始连接”。');
    }
  }

  return <main className="question-page">
    <AuraBackdrop />
    <header className="question-header"><span className="question-brand">∞ <span>AURATAROT</span></span><span>留学问途 · 提问</span></header>
    <section className="question-panel" aria-labelledby="question-title">
      <p className="eyebrow">A QUESTION FOR THE CARDS</p>
      <h1 id="question-title">此刻，你心中的迷雾是什么？</h1>
      <p className="question-intro">从一个真实的困惑开始。我们会为它推荐牌阵，陪你看见更多可能。</p>
      <form onSubmit={start}>
        <label className="question-label" htmlFor="reading-question">你的问题</label>
        <textarea id="reading-question" value={question} onChange={(event) => { setQuestion(event.target.value); setMessage(''); }}
          minLength={8} maxLength={300} rows={4} required
          placeholder="请在心中默念你的问题，并写下它（如：我今年能顺利毕业吗？）" />
        <div className="question-meta"><span>一次聚焦一个问题，给自己一个明确的时间范围</span><span>{question.length}/300</span></div>
        <div className="question-suggestions"><p>从这些问题开始</p><div>
          {suggestions.map((item) => <button type="button" key={item} onClick={() => setQuestion(item)}>{item}</button>)}
        </div></div>
        <section className="question-spreads" aria-label="三种牌阵介绍">
          <p>你的问题会连接到合适的牌阵</p>
          <div className="question-spreads__grid">
            <article><span>01 · 5 张</span><h2>未来十字</h2><p>适合一个明确目标。梳理现状、阻碍与近期趋势，预见事情的“最终走向”并提供“下一步建议”。</p></article>
            <article><span>02 · 7 张</span><h2>六芒星</h2><p>适合复杂选择或多方因素。看见过去、现在、未来，洞察环境与潜意识的影响，为你理清局势并寻找“破局点”。</p></article>
            <article><span>03 · 9 张</span><h2>月度运势</h2><p>适合关注“未来一个月”。从学业与事业、人际与感情、自我状态三个维度展开。</p></article>
          </div>
        </section>
        <details className="question-background"><summary>告诉我们更多，让塔罗更了解你，解读更贴近你 <span>选填 · 只保存在此浏览器</span></summary>
          <div className="question-fields">
            <label>当前阶段<select value={background.stage} onChange={(event) => updateBackground('stage', event.target.value)}>
              <option value="">暂不提供</option><option>预科</option><option>本科</option><option>硕士</option><option>PhD</option><option>求职</option>
            </select></label>
            <label>所在地区<input value={background.region} maxLength={60} onChange={(event) => updateBackground('region', event.target.value)} placeholder="例如：英国（可跳过）" /></label>
            <label>关注时间<input value={background.timeframe} maxLength={60} onChange={(event) => updateBackground('timeframe', event.target.value)} placeholder="例如：今年、下个月" /></label>
            <label>主要顾虑<input value={background.concern} maxLength={160} onChange={(event) => updateBackground('concern', event.target.value)} placeholder="例如：论文成绩或面试" /></label>
            <label className="question-fields__wide">补充背景<textarea value={background.context} maxLength={400} rows={2} onChange={(event) => updateBackground('context', event.target.value)} placeholder="只写你愿意提供的信息，无需提供姓名或成绩单" /></label>
          </div>
        </details>
        <button className="question-primary" type="submit">开始连接 <span aria-hidden="true">✦</span></button>
      </form>
      {showLogin && !user ? <form className="question-login" onSubmit={sendCode}>
        <p>登录后即可保存你的自定义问题。请输入邮箱，获取验证链接。</p>
        <div><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="你的邮箱地址" />
          <button type="submit" disabled={sending || !isSupabaseConfigured()}>{sending ? '发送中…' : '发送验证链接'}</button></div>
      </form> : null}
      {message ? <p className="question-message" role="status">{message}</p> : null}
      <div className="question-direct"><span>还没有想好问题？</span><button type="button" onClick={() => { clearPending(); onDirectDraw(); }}>直接抽牌，无需登录 →</button></div>
    </section>
    <p className="question-footer">目前可体验提问与智能选阵；AI 解读仍在开发中。塔罗不保证录取、学位或 offer。</p>
  </main>;
}
