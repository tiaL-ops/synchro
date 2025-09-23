import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  HelpOutline,
  CheckCircle,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import {
  ClarificationQuestion,
  ClarificationAnswer,
  analyzeGoalSpecificity,
  generateClarificationQuestions
} from '../services/aiService';

interface ClarificationQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: ClarificationAnswer[]) => void;
  projectName: string;
  goal: string;
  projectType?: string;
}

const ClarificationQuestionsDialog: React.FC<ClarificationQuestionsDialogProps> = ({
  open,
  onClose,
  onComplete,
  projectName,
  goal,
  projectType
}) => {
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    needsClarification: boolean;
    specificityScore: number;
    missingElements: string[];
  } | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // Analyze the goal
      const goalAnalysis = analyzeGoalSpecificity(goal, projectName);
      setAnalysis(goalAnalysis);
      
      // Generate questions if needed
      if (goalAnalysis.needsClarification) {
        const generatedQuestions = generateClarificationQuestions(goal, projectName, projectType);
        setQuestions(generatedQuestions);
      } else {
        setQuestions([]);
      }
      
      setCurrentQuestionIndex(0);
      setAnswers(new Map());
      setLoading(false);
    }
  }, [open, goal, projectName, projectType]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = () => {
    const clarificationAnswers: ClarificationAnswer[] = Array.from(answers.entries()).map(
      ([questionId, answer]) => ({
        questionId,
        answer
      })
    );
    onComplete(clarificationAnswers);
  };

  const handleSkip = () => {
    onComplete([]);
  };

  const getCurrentAnswer = (): string | string[] => {
    const currentQuestion = questions[currentQuestionIndex];
    return answers.get(currentQuestion.id) || (currentQuestion.type === 'multiselect' ? [] : '');
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = getCurrentAnswer();
    
    if (currentQuestion.required) {
      if (currentQuestion.type === 'multiselect') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return typeof answer === 'string' && answer.trim().length > 0;
    }
    return true; // Optional questions are always "answered"
  };

  const renderQuestionInput = (question: ClarificationQuestion) => {
    const value = getCurrentAnswer();

    switch (question.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            variant="outlined"
          />
        );

      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>Select an option</InputLabel>
            <Select
              value={value as string}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              label="Select an option"
            >
              {question.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth>
            <FormGroup>
              {question.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(value as string[]).includes(option)}
                      onChange={(e) => {
                        const currentValues = value as string[];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option);
                        handleAnswerChange(question.id, newValues);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      default:
        return null;
    }
  };

  const getSpecificityColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getSpecificityLabel = (score: number) => {
    if (score >= 70) return 'Very Specific';
    if (score >= 50) return 'Moderately Specific';
    return 'Needs Clarification';
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <LinearProgress sx={{ width: '100%', mb: 2 }} />
            <Typography variant="h6">Analyzing your project goal...</Typography>
            <Typography variant="body2" color="text.secondary">
              Determining if we need more details to create better tasks
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // If no clarification is needed
  if (!analysis?.needsClarification || questions.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" />
            <Typography variant="h6">Goal Analysis Complete</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Great! Your project goal is specific enough to generate high-quality tasks.
            </Typography>
            
            <Card sx={{ backgroundColor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" color="success.main">
                    Specificity Score: {analysis?.specificityScore || 0}%
                  </Typography>
                  <Chip 
                    label={getSpecificityLabel(analysis?.specificityScore || 0)} 
                    color={getSpecificityColor(analysis?.specificityScore || 0) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Your goal contains sufficient detail about deliverables, requirements, and context 
                  to create actionable, specific tasks.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSkip} variant="contained">
            Generate Tasks
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Show clarification questions
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpOutline color="primary" />
          <Typography variant="h6">Project Clarification</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mt: 1 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Why we're asking:</strong> Your project goal has a specificity score of {analysis?.specificityScore}%. 
              To create the most actionable tasks, we need a bit more detail about:
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {analysis?.missingElements.map((element, index) => (
                <Chip key={index} label={element} size="small" variant="outlined" />
              ))}
            </Box>
          </Alert>

          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentQuestion.question}
          </Typography>

          {renderQuestionInput(currentQuestion)}

          {currentQuestion.required && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              * This question is required
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentQuestionIndex > 0 && (
            <Button
              onClick={handlePrevious}
              startIcon={<ArrowBack />}
              variant="outlined"
            >
              Previous
            </Button>
          )}
          
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              endIcon={<ArrowForward />}
              variant="contained"
              disabled={!isCurrentQuestionAnswered()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              endIcon={<CheckCircle />}
              variant="contained"
              disabled={!isCurrentQuestionAnswered()}
            >
              Complete & Generate Tasks
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ClarificationQuestionsDialog;
