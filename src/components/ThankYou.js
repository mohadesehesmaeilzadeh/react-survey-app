import { useEffect, useRef } from 'react';
import { Button, Card } from 'react-bootstrap';
import questions from '../data/questions';
import { isQuestionAnswered } from '../hooks/useSurveyState';

function ThankYou({ reason, answers, user, onRestart }) {
  const timeExpired = reason === 'time-expired';
  const headingRef = useRef(null);
  const participantName = typeof user?.name === 'string' ? user.name.trim() : '';
  const answeredCount = questions.filter((question) =>
    isQuestionAnswered(question, answers?.[question.id])
  ).length;
  const hasSummary = Boolean(participantName || answeredCount);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Card className="survey-card thank-you-card">
      <Card.Body className="survey-card-body completion-body text-center">
        <div
          aria-hidden="true"
          className={timeExpired ? 'status-icon expired' : 'status-icon completed'}
        >
          {timeExpired ? (
            <svg viewBox="0 0 24 24">
              <path d="M12 7v6m0 4h.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="m7 12 3 3 7-7" />
            </svg>
          )}
        </div>
        <p className="completion-kicker mb-2">
          {timeExpired ? 'Survey closed' : 'Survey complete'}
        </p>
        <h2 className="completion-title" ref={headingRef} tabIndex="-1">
          {timeExpired
            ? 'Time is up!'
            : `Thank you${participantName ? `, ${participantName}` : ''}!`}
        </h2>
        <Card.Text className="thank-you-message">
          {timeExpired
            ? 'The two-minute time limit has ended.'
            : 'Your responses are saved on this device.'}
        </Card.Text>

        {hasSummary && (
          <section className="completion-summary text-start" aria-labelledby="summary-title">
            <h3 className="completion-summary-title" id="summary-title">
              Survey summary
            </h3>
            <dl className="completion-details mb-0">
              {participantName && (
                <div className="completion-detail">
                  <dt>Participant</dt>
                  <dd>{participantName}</dd>
                </div>
              )}
              <div className="completion-detail">
                <dt>Questions answered</dt>
                <dd>
                  {answeredCount} of {questions.length}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <p className="completion-note text-muted">
          {timeExpired
            ? 'Any answers entered before time expired remain saved.'
            : 'You can safely start a new survey when you are ready.'}
        </p>
        <Button
          type="button"
          className="completion-action survey-button"
          size="lg"
          variant="primary"
          onClick={onRestart}
        >
          Start New Survey
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ThankYou;
