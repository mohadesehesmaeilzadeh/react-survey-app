import { Button, Form } from 'react-bootstrap';

function SurveyQuestion({
  answer,
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

  const handleMultipleChange = (option) => {
    const updatedAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter((selectedOption) => selectedOption !== option)
      : [...selectedAnswers, option];

    onAnswerChange(question.id, updatedAnswers);
  };

  return (
    <div>
      <h2 className="question-title">{question.question}</h2>

      <Form className="mt-4">
        {question.type === 'single' &&
          question.options.map((option) => (
            <Form.Check
              className="answer-option"
              key={option}
              id={`${question.id}-${option}`}
              type="radio"
              name={question.id}
              label={option}
              checked={answer === option}
              onChange={() => onAnswerChange(question.id, option)}
            />
          ))}

        {question.type === 'text' && (
          <Form.Group controlId={question.id}>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Type your answer here"
              value={answer}
              onChange={(event) => onAnswerChange(question.id, event.target.value)}
            />
          </Form.Group>
        )}

        {question.type === 'multiple' &&
          question.options.map((option) => (
            <Form.Check
              className="answer-option"
              key={option}
              id={`${question.id}-${option}`}
              type="checkbox"
              label={option}
              checked={selectedAnswers.includes(option)}
              onChange={() => handleMultipleChange(option)}
            />
          ))}
      </Form>

      <div className="survey-actions">
        <Button variant="outline-secondary" onClick={onPrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>

        {isLastQuestion ? (
          <Button variant="success" onClick={onSubmit}>
            Submit Survey
          </Button>
        ) : (
          <Button variant="primary" onClick={onNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export default SurveyQuestion;
