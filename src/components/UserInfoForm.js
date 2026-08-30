import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';

function UserInfoForm({ user, onUserChange, onStartSurvey }) {
  const [formData, setFormData] = useState(user);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const updatedUser = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedUser);
    onUserChange(updatedUser);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please enter your name and email before starting the survey.');
      return;
    }

    onStartSurvey(formData);
  };

  return (
    <Card className="survey-card shadow-sm">
      <Card.Body className="p-4">
        <Card.Title>User Information</Card.Title>
        <Card.Text className="text-muted">
          Enter your details before starting the two-minute survey.
        </Card.Text>

        {error && <Alert variant="warning">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="age">
            <Form.Label>Age</Form.Label>
            <Form.Control
              name="age"
              type="number"
              min="1"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" variant="primary" size="lg">
              Start Survey
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default UserInfoForm;
