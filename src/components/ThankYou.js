import { Button, Card } from 'react-bootstrap';

function ThankYou({ reason, onRestart }) {
  const timeExpired = reason === 'time-expired';

  return (
    <Card className="survey-card thank-you-card shadow-sm">
      <Card.Body className="p-4 text-center">
        <div className={timeExpired ? 'status-icon expired' : 'status-icon completed'}>
          {timeExpired ? '!' : '✓'}
        </div>
        <Card.Title as="h2">{timeExpired ? 'Time is up!' : 'Thank You!'}</Card.Title>
        <Card.Text className="thank-you-message">
          {timeExpired
            ? 'Thank you for participating in the survey.'
            : 'Thank you for completing the survey.'}
        </Card.Text>
        <p className="text-muted">
          {timeExpired
            ? 'Survey ended because the time limit expired.'
            : 'Survey completed successfully.'}
        </p>
        <Button variant="primary" onClick={onRestart}>
          Start New Survey
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ThankYou;
