import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ComplianceNotice } from '../../components/ComplianceNotice';
import { generateAvatarReply } from '../../mock/ai';
import { createMessage, saveConversationDraft, useDemoState } from '../../store/demoStore';
import type { ConversationMessage } from '../../types';

const quickQuestions = ['日常工作是什么？', '团队氛围怎么样？', '面试流程是什么？', '成长机会有哪些？', '工作压力大吗？', '薪资范围真实吗？'];

export function Chat() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const avatar = state.avatars.find((item) => item.jobId === jobId);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>(() =>
    avatar ? [createMessage('avatar', avatar.openingScript)] : [],
  );

  const candidateMessageCount = useMemo(() => messages.filter((message) => message.role === 'candidate').length, [messages]);

  if (!job || !avatar) {
    return <main className="mobile-page"><section className="mobile-card">岗位数字人暂不可用。</section></main>;
  }

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const candidateMessage = createMessage('candidate', trimmed);
    const avatarMessage = createMessage('avatar', generateAvatarReply(trimmed, job, avatar));
    setMessages((current) => [...current, candidateMessage, avatarMessage]);
    setInput('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  const continueProfile = () => {
    const draft = saveConversationDraft(job.id, messages);
    navigate(`/candidate/profile/${job.id}?draftId=${draft.id}`);
  };

  return (
    <main className="chat-page">
      <section className="chat-header">
        <Link to={`/candidate/job/${job.id}`}>返回岗位</Link>
        <div>
          <strong>{avatar.name}</strong>
          <span>{job.title}</span>
        </div>
        <Link to={`/candidate/profile/${job.id}?direct=1`}>直接投递</Link>
      </section>

      <ComplianceNotice compact />

      <section className="chat-window">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <span>{message.role === 'avatar' ? avatar.name : '我'}</span>
            <p>{message.text}</p>
          </div>
        ))}
      </section>

      <section className="quick-bar">
        {quickQuestions.map((question) => (
          <button key={question} onClick={() => send(question)}>
            {question}
          </button>
        ))}
      </section>

      <form className="chat-input" onSubmit={submit}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入你想了解的问题..." />
        <button className="primary-button" type="submit">发送</button>
      </form>

      <div className="mobile-actions">
        <button className="primary-button full" onClick={continueProfile} disabled={candidateMessageCount < 1}>
          继续补充资料并生成故事卡
        </button>
      </div>
    </main>
  );
}
