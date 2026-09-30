import { Button, Form } from 'react-bootstrap';

function SurveyQuestion({
  answer,
  canContinue,
  currentQuestion,
  question,
  totalQuestions,
  onAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
}) {
  const selectedAnswers = Array.isArray(answer) ? answer : [];
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const questionTitleId = `${question.id}-title`;

  const handleMultipleChange = (option) => {
    const updatedAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter((selectedOption) => selectedOption !== option)
      : [...selectedAnswers, option];

    onAnswerChange(question.id, updatedAnswers);
  };

  return (
    <div className="question-content">
      <h2 className="question-title" id={questionTitleId}>{question.question}</h2>

      <fieldset className="question-options" aria-labelledby={questionTitleId}>
        {question.type === 'single' &&
          question.options.map((option, index) => (
            <label
              className={`answer-option ${answer === option ? 'is-selected' : ''}`}
              key={option}
              htmlFor={`${question.id}-${option}`}
            >
              <span className="option-key" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-label">{option}</span>
              <input
                className="form-check-input"
                id={`${question.id}-${option}`}
                type="radio"
                name={question.id}
                aria-label={option}
                checked={answer === option}
                onChange={() => onAnswerChange(question.id, option)}
              />
            </label>
          ))}

        {question.type === 'text' && (
          <Form.Group controlId={question.id}>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Type your answer here"
              value={answer}
              onChange={(event) => onAnswerChange(question.id, event.target.value)}
              aria-labelledby={questionTitleId}
            />
          </Form.Group>
        )}

        {question.type === 'multiple' &&
          question.options.map((option, index) => (
            <label
              className={`answer-option ${
                selectedAnswers.includes(option) ? 'is-selected' : ''
              }`}
              key={option}
              htmlFor={`${question.id}-${option}`}
            >
              <span className="option-key" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-label">{option}</span>
              <input
                className="form-check-input"
                id={`${question.id}-${option}`}
                type="checkbox"
                aria-label={option}
                checked={selectedAnswers.includes(option)}
                onChange={() => handleMultipleChange(option)}
              />
            </label>
          ))}
      </fieldset>

      {!canContinue && (
        <p className="answer-requirement" id="answer-requirement">
          {question.type === 'multiple'
            ? 'Select at least one answer to continue.'
            : 'Add an answer to continue.'}
        </p>
      )}

      <div className="survey-actions">
        <Button
          type="button"
          variant="outline-secondary"
          className="survey-button"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
        >
          <span aria-hidden="true">←</span>
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            type="button"
            variant="success"
            className="survey-button"
            onClick={onSubmit}
            disabled={!canContinue}
            aria-describedby={!canContinue ? 'answer-requirement' : undefined}
          >
            Submit Survey
            <span aria-hidden="true">✓</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="survey-button"
            onClick={onNext}
            disabled={!canContinue}
            aria-describedby={!canContinue ? 'answer-requirement' : undefined}
          >
            Next
            <span aria-hidden="true">→</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default SurveyQuestion;
