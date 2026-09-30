import { forwardRef, useCallback, useRef, useState } from 'react';
import { Alert, Card, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import UserInfoForm from './components/UserInfoForm';
import SurveyQuestion from './components/SurveyQuestion';
import SurveyTimer from './components/SurveyTimer';
import ThankYou from './components/ThankYou';
import questions from './data/questions';
import useSurveyState, { isQuestionAnswered } from './hooks/useSurveyState';
import './App.css';

const questionVariants = {
  enter: (slideDirection) => ({
    opacity: 0,
    x: slideDirection > 0 ? 18 : -18,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (slideDirection) => ({
    opacity: 0,
    x: slideDirection > 0 ? -12 : 12,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

const reducedMotionVariants = {
  enter: { opacity: 1, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: 0 } },
  exit: { opacity: 1, x: 0, transition: { duration: 0 } },
};

const questionLayoutTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
};

const AnimatedQuestionPanel = forwardRef(function AnimatedQuestionPanel(
  { children, direction, variants },
  ref
) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      ref={ref}
      aria-hidden={isPresent ? undefined : true}
      className="question-panel"
      custom={direction}
      inert={isPresent ? undefined : true}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
    >
      {children}
    </motion.div>
  );
});

function App() {
  const shouldReduceMotion = useReducedMotion();
  const {
    user,
    answers,
    currentQuestion,
    endTime,
    status: surveyStatus,
    setUser,
    startSurvey,
    setAnswer,
    goToPreviousQuestion,
    goToNextQuestion,
    submitSurvey,
    expireSurvey,
    resetSurvey,
  } = useSurveyState();
  const [validationError, setValidationError] = useState('');
  const [direction, setDirection] = useState(1);
  const finalLogSent = useRef(surveyStatus === 'submitted' || surveyStatus === 'time-expired');
  const surveyResult = useRef({ user, answers });
  surveyResult.current = { user, answers };

  const surveyStarted = surveyStatus === 'in-progress';
  const surveyCompleted = surveyStatus === 'submitted' || surveyStatus === 'time-expired';
  const activeQuestion = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  const logSurveyResult = useCallback(
    (completed, reason) => {
      if (finalLogSent.current) {
        return;
      }

      finalLogSent.current = true;
      console.log('Survey Result:', {
        ...surveyResult.current,
        completed,
        reason,
      });
    },
    []
  );

  const handleTimeExpired = useCallback(() => {
    logSurveyResult(false, 'time-expired');
    expireSurvey();
  }, [expireSurvey, logSurveyResult]);

  const handleStartSurvey = (userInfo) => {
    startSurvey(userInfo);
    setValidationError('');
    finalLogSent.current = false;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswer(questionId, value);
    setValidationError('');
  };

  const handlePrevious = () => {
    setValidationError('');
    setDirection(-1);
    goToPreviousQuestion();
  };

  const handleNext = () => {
    if (!isQuestionAnswered(activeQuestion, answers[activeQuestion.id])) {
      setValidationError('Please answer this question before continuing.');
      return;
    }

    setValidationError('');
    setDirection(1);
    goToNextQuestion();
  };

  const handleSubmit = () => {
    if (!isQuestionAnswered(activeQuestion, answers[activeQuestion.id])) {
      setValidationError('Please answer this question before submitting.');
      return;
    }

    logSurveyResult(true, 'submitted');
    submitSurvey();
  };

  const handleRestart = () => {
    resetSurvey();
    setValidationError('');
    setDirection(1);
    finalLogSent.current = false;
  };

  return (
    <main className="app-shell">
      <Container className="survey-container">
        <header className={`app-header ${surveyStarted ? 'is-compact' : ''}`}>
          <div className="brand-row">
            <div className="brand-lockup">
              <span className="brand-mark" aria-hidden="true">R</span>
              <div>
                <h1 className="brand-name">React Survey</h1>
                <p className="brand-meta">Two-minute questionnaire</p>
              </div>
            </div>
            <span className="privacy-note">
              <span className="privacy-dot" aria-hidden="true" />
              Saved locally
            </span>
          </div>

          {!surveyStarted && !surveyCompleted && (
            <div className="app-intro">
              <p className="app-eyebrow">A quick learner profile</p>
              <p className="app-title">Share how you learn React.</p>
              <p className="app-subtitle">
                Three focused questions to understand your learning style and experience.
              </p>
            </div>
          )}
        </header>

        {!surveyStarted && !surveyCompleted && (
          <UserInfoForm user={user} onUserChange={setUser} onStartSurvey={handleStartSurvey} />
        )}

        {surveyStarted && (
          <Card className="survey-card">
            <Card.Body className="survey-card-body">
              <Row className="survey-toolbar align-items-end g-3">
                <Col>
                  <div className="progress-heading">
                    <p className="question-count mb-0">
                      Question {currentQuestion + 1} of {questions.length}
                    </p>
                    <span className="progress-value" aria-hidden="true">
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar
                    now={progress}
                    aria-label={`Survey progress: ${progress}%`}
                  />
                </Col>
                <Col xs="12" sm="auto">
                  <SurveyTimer endTime={endTime} onTimeExpired={handleTimeExpired} />
                </Col>
              </Row>

              {validationError && (
                <Alert variant="warning" className="validation-alert" role="alert">
                  {validationError}
                </Alert>
              )}

              <motion.div
                className="question-stage"
                layout={shouldReduceMotion ? false : 'size'}
                transition={shouldReduceMotion ? { duration: 0 } : questionLayoutTransition}
              >
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                  <AnimatedQuestionPanel
                    key={activeQuestion.id}
                    direction={direction}
                    variants={shouldReduceMotion ? reducedMotionVariants : questionVariants}
                  >
                    <SurveyQuestion
                      answer={answers[activeQuestion.id]}
                      canContinue={isQuestionAnswered(
                        activeQuestion,
                        answers[activeQuestion.id]
                      )}
                      currentQuestion={currentQuestion}
                      question={activeQuestion}
                      totalQuestions={questions.length}
                      onAnswerChange={handleAnswerChange}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      onSubmit={handleSubmit}
                    />
                  </AnimatedQuestionPanel>
                </AnimatePresence>
              </motion.div>
            </Card.Body>
          </Card>
        )}

        {surveyCompleted && (
          <ThankYou reason={surveyStatus} answers={answers} user={user} onRestart={handleRestart} />
        )}
      </Container>
    </main>
  );
}

export default App;
