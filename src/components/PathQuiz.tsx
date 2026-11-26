import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PixelIcon from '@/components/PixelIcon';
import { QUIZ, RESULTS, scoreQuiz, type QuizLink } from '@/data/pathQuiz';
import { unlockBadge } from '@/lib/badges';
import { playSfx } from '@/lib/sound';

/**
 * "Find your cloud path" on /learn: one question at a time in a pixel window,
 * then a suggested first AWS cert with next steps. Answers are buttons (not
 * radios, which would advance on every arrow key); picking one moves on. Focus follows
 * the new question or the result so keyboard and screen-reader users stay in
 * place.
 */

const QuizLinkItem = ({ link }: { link: QuizLink }) => {
  if (link.href.startsWith('#')) {
    return <a href={link.href} className="px-link">{link.label}</a>;
  }
  if (link.internal) {
    return <Link to={link.href} className="px-link">{link.label}</Link>;
  }
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className="px-link">
      {link.label}
      <PixelIcon name="external" size={12} />
    </a>
  );
};

const PathQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const promptRef = useRef<HTMLLegendElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const done = step >= QUIZ.length;
  const result = done ? RESULTS[scoreQuiz(answers)] : null;

  // After the step changes, focus whichever is showing: the next question or the result.
  const focusSoon = () => requestAnimationFrame(() => (promptRef.current ?? resultRef.current)?.focus());

  const answer = (questionId: string, optionId: string) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
    setStep((s) => s + 1);
    playSfx('blip');
    if (step === QUIZ.length - 1) unlockBadge('pathfinder');
    focusSoon();
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    focusSoon();
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    focusSoon();
  };

  const q = QUIZ[step];

  return (
    <section id="path-quiz" aria-labelledby="path-quiz-heading" className="px-panel px-window mb-14 scroll-mt-20">
      <div className="px-titlebar">
        <h2 id="path-quiz-heading">Find your cloud path</h2>
        <div className="px-winmarks" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <div className="px-window-body">
        {!done && q ? (
          <fieldset>
            <legend ref={promptRef} tabIndex={-1} className="outline-none mb-4">
              <span className="block text-sm text-muted-foreground mb-1">
                Question {step + 1} of {QUIZ.length}
              </span>
              <span className="block font-bold text-lg text-foreground">{q.prompt}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => answer(q.id, opt.id)}
                  aria-pressed={answers[q.id] === opt.id}
                  className={`px-option ${answers[q.id] === opt.id ? 'is-selected' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="px-quiz-steps mt-5" aria-hidden="true">
              {QUIZ.map((qq, i) => (
                <span key={qq.id} className={i < step ? 'is-on' : i === step ? 'is-now' : ''} />
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={back} className="px-link text-sm mt-3">
                <PixelIcon name="arrowLeft" size={14} />
                Back
              </button>
            )}
          </fieldset>
        ) : result ? (
          <div data-testid="quiz-result">
            <p className="text-sm text-muted-foreground mb-1">Your first cert</p>
            <h3 ref={resultRef} tabIndex={-1} className="font-pixel text-3xl text-foreground leading-tight outline-none">
              {result.name}
            </h3>
            <p className="px-chip mt-2">{result.level}</p>
            <p className="text-muted-foreground leading-relaxed mt-3 max-w-[55ch]">{result.why}</p>
            <ul className="flex flex-col items-start gap-1 mt-4">
              {result.links.map((link) => (
                <li key={link.label}><QuizLinkItem link={link} /></li>
              ))}
            </ul>
            <button type="button" onClick={restart} className="px-link text-sm mt-4">
              <PixelIcon name="refresh" size={14} />
              Retake the quiz
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default PathQuiz;
