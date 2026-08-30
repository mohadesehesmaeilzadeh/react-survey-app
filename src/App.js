import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Badge, Card, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import UserInfoForm from './components/UserInfoForm';
import SurveyQuestion from './components/SurveyQuestion';
import SurveyTimer from './components/SurveyTimer';
import ThankYou from './components/ThankYou';
import questions from './data/questions';
import './App.css';

const SURVEY_DURATION = 2 * 60 * 1000;

const storageKeys = {
  user: 'surveyUser',
  answers: 'surveyAnswers',
  currentQuestion: 'surveyCurrentQuestion',
  endTime: 'surveyEndTime',
  status: 'surveyStatus',
};

const emptyUser = {
  name: '',
  email: '',
  age: '',
};

const emptyAnswers = {
  question1: '',
  question2: '',
  question3: [],
};

function readStorageValue(key, fallbackValue) {
  const savedValue = localStorage.getItem(key);

  if (savedValue === null) {
    return fallbackValue;
  }

  try {
    return JSON.parse(savedValue);
  } catch {
    return fallbackValue;
  }
}

function App() {
  const [user, setUser] = useState(() => readStorageValue(storageKeys.user, emptyUser));
  const [answers, setAnswers] = useState(() => readStorageValue(storageKeys.answers, emptyAnswers));
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    readStorageValue(storageKeys.currentQuestion, 0)
  );
  const [endTime, setEndTime] = useState(() => readStorageValue(storageKeys.endTime, null));
  const [surveyStatus, setSurveyStatus] = useState(() =>
    readStorageValue(storageKeys.status, 'not-started')
  );
  const [validationError, setValidationError] = useState('');
  const [direction, setDirection] = useState(1);
  const finalLogSent = useRef(surveyStatus === 'submitted' || surveyStatus === 'time-expired');

  const surveyStarted = surveyStatus === 'in-progress';
  const surveyCompleted = surveyStatus === 'submitted' || surveyStatus === 'time-expired';
  const activeQuestion = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  useEffect(() => {
    localStorage.setItem(storageKeys.user, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(storageKeys.answers, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem(storageKeys.currentQuestion, JSON.stringify(currentQuestion));
  }, [currentQuestion]);

  useEffect(() => {
    localStorage.setItem(storageKeys.endTime, JSON.stringify(endTime));
  }, [endTime]);

  useEffect(() => {
    localStorage.setItem(storageKeys.status, JSON.stringify(surveyStatus));
  }, [surveyStatus]);

  const logSurveyResult = useCallback(
    (completed, reason) => {
      if (finalLogSent.current) {
        return;
      }

      finalLogSent.current = true;
      console.log('Survey Result:', {
        user,
        answers,
        completed,
        reason,
      });
    },
    [answers, user]
  );

  const handleTimeExpired = useCallback(() => {
    logSurveyResult(false, 'time-expired');
    setSurveyStatus('time-expired');
  }, [logSurveyResult]);

  useEffect(() => {
    if (surveyStarted && endTime && Date.now() >= endTime) {
      handleTimeExpired();
    }
  }, [endTime, handleTimeExpired, surveyStarted]);

  const handleStartSurvey = (userInfo) => {
    setUser(userInfo);
    setCurrentQuestion(0);
    setSurveyStatus('in-progress');
    setEndTime(Date.now() + SURVEY_DURATION);
    setValidationError('');
    finalLogSent.current = false;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
    setValidationError('');
  };

  const isQuestionAnswered = () => {
    const answer = answers[activeQuestion.id];

    if (activeQuestion.type === 'single') {
      return Boolean(answer);
    }

    if (activeQuestion.type === 'text') {
      return Boolean(answer.trim());
    }

    if (activeQuestion.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }

    return false;
  };

  const handlePrevious = () => {
    setValidationError('');
    setDirection(-1);
    setCurrentQuestion((questionIndex) => Math.max(questionIndex - 1, 0));
  };

  const handleNext = () => {
    if (!isQuestionAnswered()) {
      setValidationError('Please answer this question before continuing.');
      return;
    }

    setValidationError('');
    setDirection(1);
    setCurrentQuestion((questionIndex) => Math.min(questionIndex + 1, questions.length - 1));
  };

  const handleSubmit = () => {
    if (!isQuestionAnswered()) {
      setValidationError('Please answer this question before submitting.');
      return;
    }

    logSurveyResult(true, 'submitted');
    setSurveyStatus('submitted');
  };

  const handleRestart = () => {
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
    setUser(emptyUser);
    setAnswers(emptyAnswers);
    setCurrentQuestion(0);
    setEndTime(null);
    setSurveyStatus('not-started');
    setValidationError('');
    setDirection(1);
    finalLogSent.current = false;
  };

  const questionVariants = {
    enter: (slideDirection) => ({
      opacity: 0,
      x: slideDirection > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (slideDirection) => ({
      opacity: 0,
      x: slideDirection > 0 ? -30 : 30,
    }),
  };

  return (
    <div className="app-shell">
      <Container className="survey-container py-4 py-md-5">
        <div className="text-center mb-4">
          <Badge bg="primary" className="mb-2">
            React Practice Project
          </Badge>
          <h1 className="app-title">Survey App</h1>
        </div>

        {!surveyStarted && !surveyCompleted && (
          <UserInfoForm user={user} onUserChange={setUser} onStartSurvey={handleStartSurvey} />
        )}

        {surveyStarted && (
          <Card className="survey-card shadow-sm">
            <Card.Body className="p-4">
              <Row className="align-items-center g-3 mb-3">
                <Col>
                  <p className="question-count mb-1">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                  <ProgressBar now={progress} label={`${progress}%`} />
                </Col>
                <Col xs="12" sm="auto">
                  <SurveyTimer
                    endTime={endTime}
                    isActive={surveyStarted}
                    onTimeExpired={handleTimeExpired}
                  />
                </Col>
              </Row>

              {validationError && (
                <Alert variant="warning" className="mb-3">
                  {validationError}
                </Alert>
              )}

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeQuestion.id}
                  custom={direction}
                  variants={questionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SurveyQuestion
                    answer={answers[activeQuestion.id]}
                    currentQuestion={currentQuestion}
                    question={activeQuestion}
                    totalQuestions={questions.length}
                    onAnswerChange={handleAnswerChange}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSubmit={handleSubmit}
                  />
                </motion.div>
              </AnimatePresence>
            </Card.Body>
          </Card>
        )}

        {surveyCompleted && (
          <ThankYou reason={surveyStatus} answers={answers} user={user} onRestart={handleRestart} />
        )}
      </Container>
    </div>
  );
}

export default App;
