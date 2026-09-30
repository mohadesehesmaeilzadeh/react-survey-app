import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';

function UserInfoForm({ user, onUserChange, onStartSurvey }) {
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    const updatedUser = {
      ...user,
      [name]: value,
    };

    onUserChange(updatedUser);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user.name.trim() || !user.email.trim()) {
      setError('Please enter your name and email before starting the survey.');
      return;
    }

    onStartSurvey(user);
  };

  return (
    <Card className="survey-card">
      <Card.Body className="survey-card-body">
        <p className="form-kicker">Before you begin</p>
        <Card.Title as="h2" className="form-title">User information</Card.Title>
        <Card.Text className="form-intro">
          Enter your details before starting the two-minute survey.
        </Card.Text>

        {error && (
          <Alert variant="warning" className="validation-alert" role="alert">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-field" controlId="name">
            <Form.Label>
              Name <span className="required-marker" aria-hidden="true">*</span>
            </Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Enter your name"
              value={user.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </Form.Group>

          <Form.Group className="form-field" controlId="email">
            <Form.Label>
              Email <span className="required-marker" aria-hidden="true">*</span>
            </Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </Form.Group>

          <Form.Group className="form-field" controlId="age">
            <Form.Label>
              Age <span className="optional-label">Optional</span>
            </Form.Label>
            <Form.Control
              name="age"
              type="number"
              min="1"
              placeholder="Enter your age"
              value={user.age}
              onChange={handleChange}
              inputMode="numeric"
            />
          </Form.Group>

          <div className="d-grid form-submit">
            <Button type="submit" variant="primary" size="lg" className="survey-button">
              Start Survey
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default UserInfoForm;
