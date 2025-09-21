import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  AutoAwesome,
  Add,
  Schedule,
  Flag,
  Category,
  CheckCircle
} from '@mui/icons-material';
import { generateProjectTasks, GeneratedTask, TaskGenerationRequest } from '../services/aiService';
import { createTask } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';

// Helper functions for AI analysis preview
const extractKeyTerms = (goal: string): string[] => {
  const text = goal.toLowerCase();
  const keyPhrases: string[] = [];
  
  // Universal project-specific terms (not just tech)
  const patterns = [
    // Tech/Digital
    /\b(app|application|website|platform|system|tool|dashboard|portal|interface)\b/g,
    /\b(mobile|web|desktop|cloud|api|database|frontend|backend)\b/g,
    /\b(react|angular|vue|node|python|java|ios|android)\b/g,
    
    // Academic/Educational
    /\b(presentation|document|research|study|analysis|essay|report|paper|thesis)\b/g,
    /\b(students?|class|course|assignment|homework|project|grade|exam)\b/g,
    /\b(history|culture|process|method|technique|theory|concept)\b/g,
    
    // Creative/Arts
    /\b(design|art|creative|visual|graphic|video|photo|music|writing|content)\b/g,
    /\b(portfolio|exhibition|performance|showcase|gallery|studio)\b/g,
    
    // Business/Professional
    /\b(business|marketing|sales|strategy|plan|proposal|budget|revenue)\b/g,
    /\b(clients?|customers?|users?|employees?|team|stakeholders?|audience)\b/g,
    
    // Research/Science
    /\b(experiment|hypothesis|data|analysis|methodology|findings|results)\b/g,
    /\b(survey|interview|observation|measurement|testing|evaluation)\b/g,
    
    // Cooking/Food
    /\b(recipe|cooking|food|ingredients|preparation|kitchen|meal|dish)\b/g,
    /\b(taste|flavor|nutrition|cooking|baking|grilling|preparation)\b/g,
    
    // General Project Terms
    /\b(deliverables?|objectives?|goals?|outcomes?|timeline|deadline|phases?)\b/g,
    /\b(planning|execution|implementation|completion|review|evaluation)\b/g
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      keyPhrases.push(...matches);
    }
  });
  
  return Array.from(new Set(keyPhrases));
};

const identifyDomain = (goal: string, projectType?: string): string => {
  const text = goal.toLowerCase();
  
  if (projectType && projectType !== 'General') return projectType;
  
  // Academic/Educational
  if (text.includes('presentation') || text.includes('research') || text.includes('study') || text.includes('assignment')) return 'Academic';
  if (text.includes('education') || text.includes('learning') || text.includes('course') || text.includes('student') || text.includes('class')) return 'Education';
  if (text.includes('document') || text.includes('paper') || text.includes('essay') || text.includes('report') || text.includes('thesis')) return 'Academic Writing';
  
  // Creative/Arts
  if (text.includes('design') || text.includes('art') || text.includes('creative') || text.includes('visual') || text.includes('graphic')) return 'Creative/Design';
  if (text.includes('video') || text.includes('film') || text.includes('movie') || text.includes('photography')) return 'Media Production';
  if (text.includes('music') || text.includes('song') || text.includes('audio') || text.includes('sound')) return 'Music/Audio';
  if (text.includes('writing') || text.includes('content') || text.includes('blog') || text.includes('article')) return 'Content Creation';
  
  // Food/Culinary
  if (text.includes('cooking') || text.includes('recipe') || text.includes('food') || text.includes('kitchen') || text.includes('meal')) return 'Culinary';
  if (text.includes('ramen') || text.includes('dish') || text.includes('cuisine') || text.includes('restaurant')) return 'Food & Culture';
  
  // Tech/Digital (keeping existing)
  if (text.includes('e-commerce') || text.includes('shop') || text.includes('store') || text.includes('buy') || text.includes('sell')) return 'E-commerce';
  if (text.includes('social') || text.includes('community') || text.includes('network') || text.includes('connect')) return 'Social Platform';
  if (text.includes('app') || text.includes('application') || text.includes('software') || text.includes('platform')) return 'Software Development';
  if (text.includes('website') || text.includes('web') || text.includes('online') || text.includes('digital')) return 'Web Development';
  
  // Business/Professional
  if (text.includes('business') || text.includes('marketing') || text.includes('sales') || text.includes('strategy')) return 'Business';
  if (text.includes('finance') || text.includes('bank') || text.includes('money') || text.includes('budget')) return 'Finance';
  
  // Research/Science
  if (text.includes('experiment') || text.includes('hypothesis') || text.includes('scientific') || text.includes('methodology')) return 'Research';
  if (text.includes('data') || text.includes('analytics') || text.includes('analysis') || text.includes('statistics')) return 'Data Analysis';
  
  // Health/Medical
  if (text.includes('health') || text.includes('medical') || text.includes('patient') || text.includes('fitness')) return 'Healthcare';
  
  // Entertainment/Gaming
  if (text.includes('game') || text.includes('gaming') || text.includes('play') || text.includes('entertainment')) return 'Gaming';
  
  // General Project Management
  if (text.includes('productivity') || text.includes('task') || text.includes('project') || text.includes('manage')) return 'Project Management';
  
  return 'General';
};

const detectTechRequirements = (goal: string): string[] => {
  const text = goal.toLowerCase();
  const requirements: string[] = [];
  
  // Academic/Educational Requirements
  if (text.includes('presentation') || text.includes('present')) requirements.push('Presentation Skills');
  if (text.includes('research') || text.includes('study') || text.includes('investigate')) requirements.push('Research & Analysis');
  if (text.includes('document') || text.includes('paper') || text.includes('writing')) requirements.push('Document Creation');
  if (text.includes('class') || text.includes('student') || text.includes('teaching')) requirements.push('Educational Delivery');
  
  // Creative/Arts Requirements
  if (text.includes('design') || text.includes('visual') || text.includes('graphic')) requirements.push('Design Skills');
  if (text.includes('video') || text.includes('film') || text.includes('photography')) requirements.push('Media Production');
  if (text.includes('art') || text.includes('creative') || text.includes('artistic')) requirements.push('Creative Skills');
  if (text.includes('portfolio') || text.includes('showcase') || text.includes('exhibition')) requirements.push('Portfolio Development');
  
  // Food/Culinary Requirements
  if (text.includes('cooking') || text.includes('recipe') || text.includes('kitchen')) requirements.push('Cooking Skills');
  if (text.includes('ingredients') || text.includes('preparation') || text.includes('meal')) requirements.push('Food Preparation');
  if (text.includes('taste') || text.includes('flavor') || text.includes('nutrition')) requirements.push('Culinary Knowledge');
  
  // Technical Requirements (keeping existing)
  if (text.includes('mobile') || text.includes('ios') || text.includes('android')) requirements.push('Mobile Development');
  if (text.includes('web') || text.includes('website') || text.includes('browser')) requirements.push('Web Development');
  if (text.includes('api') || text.includes('backend') || text.includes('server')) requirements.push('Backend API');
  if (text.includes('database') || text.includes('data storage') || text.includes('sql')) requirements.push('Database Design');
  if (text.includes('auth') || text.includes('login') || text.includes('user account')) requirements.push('Authentication');
  if (text.includes('payment') || text.includes('billing') || text.includes('subscription')) requirements.push('Payment Integration');
  
  // Business/Professional Requirements
  if (text.includes('marketing') || text.includes('promotion') || text.includes('advertising')) requirements.push('Marketing Strategy');
  if (text.includes('budget') || text.includes('financial') || text.includes('cost')) requirements.push('Financial Planning');
  if (text.includes('team') || text.includes('collaboration') || text.includes('management')) requirements.push('Team Coordination');
  
  // Research/Science Requirements
  if (text.includes('experiment') || text.includes('testing') || text.includes('methodology')) requirements.push('Experimental Design');
  if (text.includes('data') || text.includes('analysis') || text.includes('statistics')) requirements.push('Data Analysis');
  if (text.includes('survey') || text.includes('interview') || text.includes('observation')) requirements.push('Data Collection');
  
  // General Project Requirements
  if (text.includes('planning') || text.includes('timeline') || text.includes('schedule')) requirements.push('Project Planning');
  if (text.includes('deliverable') || text.includes('outcome') || text.includes('result')) requirements.push('Deliverable Management');
  
  return requirements;
};

interface AITaskGeneratorProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onTasksGenerated?: (taskCount: number) => void;
}

const AITaskGenerator: React.FC<AITaskGeneratorProps> = ({
  open,
  onClose,
  project,
  onTasksGenerated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projectType, setProjectType] = useState('General');
  const [teamSize, setTeamSize] = useState('Small team (2-5 people)');
  const [timeline, setTimeline] = useState('Flexible');

  const handleGenerateTasks = async () => {
    if (!user) {
      setError('You must be logged in to generate tasks');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedTasks([]);
    setSelectedTasks(new Set());

    try {
      // Calculate team size from project members
      const teamMemberCount = project.teamMembers ? Object.keys(project.teamMembers).length : 1;
      const calculatedTeamSize = teamMemberCount === 1 ? 'Solo (1 person)' :
                                teamMemberCount <= 5 ? 'Small team (2-5 people)' :
                                teamMemberCount <= 10 ? 'Medium team (6-10 people)' :
                                'Large team (10+ people)';

      // Calculate timeline from deadline
      const calculatedTimeline = project.deadline ? 
        getTimelineFromDeadline(project.deadline) : 
        timeline || 'Flexible';

      const request: TaskGenerationRequest = {
        projectName: project.projectName,
        goal: project.goal,
        projectType,
        teamSize: calculatedTeamSize,
        timeline: calculatedTimeline,
        projectDeadline: project.deadline
      };

      const tasks = await generateProjectTasks(request);
      setGeneratedTasks(tasks);
      
      // Auto-select all tasks by default
      setSelectedTasks(new Set(tasks.map((_, index) => index)));
      
    } catch (error) {
      console.error('Error generating tasks:', error);
      const errorMessage = error instanceof Error ? (error as Error).message : 'Failed to generate tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate timeline from deadline
  const getTimelineFromDeadline = (deadline: Date): string => {
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 7) return '1 week';
    if (daysDiff <= 14) return '2 weeks';
    if (daysDiff <= 30) return '1 month';
    if (daysDiff <= 90) return '2-3 months';
    return '6+ months';
  };

  const handleTaskToggle = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === generatedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(generatedTasks.map((_, index) => index)));
    }
  };

  const handleCreateTasks = async () => {
    if (!user || selectedTasks.size === 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tasksToCreate = Array.from(selectedTasks).map(index => generatedTasks[index]);
      let createdCount = 0;

      for (const task of tasksToCreate) {
        try {
          await createTask({
            projectId: project.id,
            title: task.title,
            description: task.description,
            status: 'To Do' as const,
            createdBy: user.uid,
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            category: task.category,
            dueDate: task.suggestedDueDate
          });
          createdCount++;
        } catch (error) {
          console.error('Error creating task:', error);
        }
      }

      setSuccess(`Successfully created ${createdCount} tasks!`);
      
      if (onTasksGenerated) {
        onTasksGenerated(createdCount);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error creating tasks:', error);
      setError('Failed to create some tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGeneratedTasks([]);
    setSelectedTasks(new Set());
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          <Typography variant="h6">AI Task Generator</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!generatedTasks.length && !loading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate intelligent, actionable tasks for your project using AI. 
              The AI will analyze your project details and create a comprehensive task breakdown.
            </Typography>

            {/* Project Information Display */}
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'info.50', 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'info.main',
              mb: 3 
            }}>
              <Typography variant="h6" gutterBottom color="info.main">
                Project Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project Name:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {project.projectName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Goal & Description:
                  </Typography>
                  <Typography variant="body1">
                    {project.goal}
                  </Typography>
                </Box>

                {project.deadline && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deadline:
                    </Typography>
                    <Typography variant="body1">
                      {project.deadline.toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {project.teamMembers && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Team Size:
                    </Typography>
                    <Typography variant="body1">
                      {Object.keys(project.teamMembers).length} member{Object.keys(project.teamMembers).length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* AI Analysis Preview */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'success.50', 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'success.main',
              mb: 2 
            }}>
              <Typography variant="subtitle1" gutterBottom color="success.main" sx={{ fontWeight: 'bold' }}>
                🤖 AI Analysis Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                The AI will analyze your project and extract these specific elements to create highly tailored tasks:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                    🎯 Domain:
                  </Typography>
                  <Chip label={identifyDomain(project.goal, projectType)} size="small" color="primary" />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                    🔑 Key Terms:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {extractKeyTerms(project.goal).slice(0, 8).map((term, index) => (
                      <Chip key={index} label={term} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                    ⚙️ Tech Stack:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {detectTechRequirements(project.goal).slice(0, 5).map((tech, index) => (
                      <Chip key={index} label={tech} size="small" color="secondary" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Optional Project Type Selection */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Project Type (Optional)</InputLabel>
                <Select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  label="Project Type (Optional)"
                >
                  <MenuItem value="General">General</MenuItem>
                  
                  {/* Academic/Educational */}
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Research">Research</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  
                  {/* Creative/Arts */}
                  <MenuItem value="Creative/Design">Creative/Design</MenuItem>
                  <MenuItem value="Writing">Writing</MenuItem>
                  <MenuItem value="Media Production">Media Production</MenuItem>
                  
                  {/* Food/Culinary */}
                  <MenuItem value="Culinary">Culinary</MenuItem>
                  <MenuItem value="Food & Culture">Food & Culture</MenuItem>
                  
                  {/* Tech/Digital */}
                  <MenuItem value="Web Development">Web Development</MenuItem>
                  <MenuItem value="Mobile App">Mobile App</MenuItem>
                  <MenuItem value="Software Development">Software Development</MenuItem>
                  
                  {/* Business/Professional */}
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  
                  {/* Other */}
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Gaming">Gaming</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing project and generating tasks...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              AI is breaking down "{project.projectName}" into actionable tasks
            </Typography>
          </Box>
        )}

        {generatedTasks.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Generated Tasks ({generatedTasks.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAll}
              >
                {selectedTasks.size === generatedTasks.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflow: 'auto' }}>
              {generatedTasks.map((task, index) => (
                <Card 
                  key={index} 
                  sx={{ 
                    border: selectedTasks.has(index) ? '2px solid' : '1px solid',
                    borderColor: selectedTasks.has(index) ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleTaskToggle(index)}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ flexGrow: 1, mr: 1 }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority) as any}
                          size="small"
                          icon={<Flag />}
                        />
                        {selectedTasks.has(index) && (
                          <CheckCircle color="primary" />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {task.category && (
                        <Chip
                          label={task.category}
                          size="small"
                          variant="outlined"
                          icon={<Category />}
                        />
                      )}
                      {task.estimatedHours && (
                        <Chip
                          label={`${task.estimatedHours}h`}
                          size="small"
                          variant="outlined"
                          icon={<Schedule />}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {!generatedTasks.length && !loading && (
          <Button
            onClick={handleGenerateTasks}
            variant="contained"
            startIcon={<AutoAwesome />}
            disabled={loading}
          >
            Generate Tasks
          </Button>
        )}
        {generatedTasks.length > 0 && (
          <Button
            onClick={handleCreateTasks}
            variant="contained"
            startIcon={<Add />}
            disabled={loading || selectedTasks.size === 0}
          >
            Create {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AITaskGenerator;
