import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedHours?: number;
  category?: string;
}

export interface TaskGenerationRequest {
  projectName: string;
  goal: string;
  projectType?: string;
  teamSize?: string;
  timeline?: string;
}

/**
 * Extract key phrases and entities from project description
 */
const extractKeyPhrases = (goal: string): string[] => {
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
  
  return Array.from(new Set(keyPhrases)); // Remove duplicates
};

/**
 * Identify project domain/industry from description
 */
const identifyProjectDomain = (goal: string, projectType?: string): string => {
  const text = goal.toLowerCase();
  
  if (projectType && projectType !== 'General') return projectType;
  
  // Universal domain detection patterns
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

/**
 * Detect project requirements from description (not just technical)
 */
const detectTechnicalRequirements = (goal: string): string[] => {
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

/**
 * Generate tasks for a project using Gemini AI
 */
export const generateProjectTasks = async (request: TaskGenerationRequest): Promise<GeneratedTask[]> => {
  try {
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY in your environment variables.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Enhanced context extraction
    const projectContext = {
      name: request.projectName,
      goal: request.goal,
      type: request.projectType || 'General',
      team: request.teamSize || 'Small team (2-5 people)',
      timeline: request.timeline || 'Flexible',
      // Extract key phrases and entities from the goal description
      keyPhrases: extractKeyPhrases(request.goal),
      // Identify project domain/industry
      domain: identifyProjectDomain(request.goal, request.projectType),
      // Detect technical requirements
      techRequirements: detectTechnicalRequirements(request.goal)
    };

    const prompt = `
You are a UNIVERSAL project breakdown expert who can analyze ANY type of project - academic, creative, business, technical, culinary, research, or any other domain. Your job is to DEEPLY ANALYZE the specific project details and create a hyper-customized task breakdown.

PROJECT TO ANALYZE:
====================
Project Name: "${projectContext.name}"
Project Goal/Description: "${projectContext.goal}"
Project Domain: ${projectContext.domain}
Team Size: ${projectContext.team}
Timeline: ${projectContext.timeline}

EXTRACTED PROJECT CONTEXT:
==========================
Key Phrases Identified: ${projectContext.keyPhrases.join(', ')}
Detected Domain: ${projectContext.domain}
Project Requirements: ${projectContext.techRequirements.join(', ')}

UNIVERSAL PROJECT ANALYSIS REQUIREMENTS:
=======================================
1. READ EVERY WORD of the project goal/description above
2. IDENTIFY the specific deliverables, outcomes, or end products mentioned
3. EXTRACT key requirements whether they are: academic (research, presentations), creative (design, art), culinary (cooking, recipes), technical (coding, systems), business (marketing, sales), research (experiments, data), or any other domain
4. UNDERSTAND the specific context and domain from the description
5. RECOGNIZE the specific methods, tools, skills, or approaches needed
6. ANALYZE what makes THIS project unique and what specific steps are needed

UNIVERSAL TASK GENERATION RULES:
===============================
❌ DO NOT create generic tasks like "Plan the project" or "Do research"
✅ DO create tasks that reference SPECIFIC elements from the project description
❌ DO NOT use placeholder text or generic examples
✅ DO reference actual project name, specific deliverables, or requirements in task titles
❌ DO NOT create broad tasks like "Create content"
✅ DO create specific tasks like "Research the history of ramen in post-WWII Japan for the presentation"

DOMAIN-SPECIFIC EXAMPLES:
========================
For ACADEMIC projects (like presentations, research papers):
✅ "Research the historical origins of [specific topic] from [specific time period]"
✅ "Create 4-minute presentation outline covering [specific topics mentioned]"
✅ "Draft the [specific section] of the 10-page document with [specific requirements]"

For CULINARY projects (like cooking, food culture):
✅ "Research traditional [specific dish] preparation methods in [specific region]"
✅ "Practice making [specific dish] following [specific technique mentioned]"
✅ "Prepare ingredients for [specific dish] including [specific components]"

For CREATIVE projects (like design, art, media):
✅ "Design [specific visual element] for [specific purpose] in [specific style]"
✅ "Create [specific number] of [specific deliverable] featuring [specific theme]"
✅ "Develop [specific creative component] that showcases [specific concept]"

For BUSINESS projects (like marketing, strategy):
✅ "Analyze [specific market/audience] for [specific product/service]"
✅ "Develop [specific strategy] targeting [specific demographic]"
✅ "Create [specific deliverable] for [specific business goal]"

MANDATORY SPECIFICITY FOR THIS PROJECT:
======================================
- EVERY task title must include specific terminology from the project description
- Use the EXACT key phrases identified: ${projectContext.keyPhrases.join(', ')}
- Reference the specific domain context: ${projectContext.domain}
- Include project requirements where relevant: ${projectContext.techRequirements.join(', ')}
- Quote specific deliverables, outcomes, or components mentioned in the project goal
- Make tasks so specific that they could ONLY apply to this exact project
- Break down the project into logical phases or categories based on the domain

TASK BREAKDOWN REQUIREMENTS:
============================
- Generate 12-20 MICRO-TASKS that are extremely specific to this project
- Each task should be completable in 1-8 hours maximum
- Tasks must directly quote or reference elements from the project description
- Include specific domain-appropriate implementation details
- Break down complex deliverables into 3-5 sub-tasks each
- Reference actual project components, deliverables, or requirements by name
- Organize tasks logically (e.g., research → creation → refinement → delivery)
- Make tasks so specific that someone could execute them without additional context

FORMAT REQUIREMENTS:
===================
Return a JSON array with this exact structure:
[
  {
    "title": "[Specific task that references actual project elements and deliverables]",
    "description": "[Detailed description that explains WHY this task is needed for THIS specific project and HOW it connects to achieving the stated goal and deliverables]",
    "priority": "High|Medium|Low",
    "estimatedHours": [realistic number 1-8],
    "category": "[Specific category relevant to this project domain - e.g., Research, Content Creation, Preparation, Presentation, etc.]"
  }
]

CRITICAL SUCCESS CRITERIA:
=========================
Before generating tasks, ensure EVERY task:
✓ References specific elements from the project name or description
✓ Could ONLY apply to this exact project (not reusable for other projects)
✓ Includes concrete deliverables or outcomes mentioned in the project goal
✓ Connects directly to achieving the stated project objectives
✓ Uses domain-specific terminology appropriate to the project type
✓ Breaks down the work into actionable, time-bound steps
✓ Addresses the specific requirements and deliverables mentioned

GENERATE TASKS NOW - MAKE THEM HYPER-SPECIFIC TO THIS PROJECT:
Return only the JSON array, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text (remove markdown formatting if present)
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const tasks: GeneratedTask[] = JSON.parse(cleanText);

    // Validate the response structure
    if (!Array.isArray(tasks)) {
      throw new Error('AI response is not a valid array of tasks');
    }

    // Validate each task has required fields
    const validatedTasks = tasks.map((task, index) => {
      if (!task.title || !task.description || !task.priority) {
        throw new Error(`Task at index ${index} is missing required fields`);
      }
      
      // Ensure priority is valid
      if (!['High', 'Medium', 'Low'].includes(task.priority)) {
        task.priority = 'Medium';
      }

      return {
        title: task.title.trim(),
        description: task.description.trim(),
        priority: task.priority as 'High' | 'Medium' | 'Low',
        estimatedHours: task.estimatedHours || undefined,
        category: task.category || 'General'
      };
    });

    console.log('Generated tasks:', validatedTasks);
    return validatedTasks;

  } catch (error) {
    console.error('Error generating tasks with AI:', error);
    
    // Return fallback tasks if AI fails
    return getFallbackTasks(request);
  }
};

/**
 * Fallback tasks if AI generation fails - now project-specific!
 */
const getFallbackTasks = (request: TaskGenerationRequest): GeneratedTask[] => {
  const projectContext = {
    name: request.projectName,
    goal: request.goal,
    keyPhrases: extractKeyPhrases(request.goal),
    domain: identifyProjectDomain(request.goal, request.projectType),
    requirements: detectTechnicalRequirements(request.goal)
  };

  // Generate project-specific fallback tasks based on domain
  if (projectContext.domain === 'Food & Culture' || projectContext.domain === 'Culinary') {
    return [
      {
        title: `Research the historical origins and cultural significance of ${projectContext.keyPhrases.find(p => p.includes('ramen') || p.includes('food') || p.includes('dish')) || 'the topic'} for ${request.projectName}`,
        description: `Investigate the background, cultural context, and historical development of the main subject for this ${projectContext.domain.toLowerCase()} project`,
        priority: 'High',
        estimatedHours: 4,
        category: 'Research'
      },
      {
        title: `Create detailed outline for ${projectContext.keyPhrases.includes('document') ? 'document' : 'written component'} covering all required sections`,
        description: `Structure the written deliverable to meet the specific requirements mentioned in the project goal`,
        priority: 'High',
        estimatedHours: 2,
        category: 'Planning'
      },
      {
        title: `Draft content sections covering ${projectContext.keyPhrases.filter(p => p.includes('history') || p.includes('process') || p.includes('culture')).join(', ')}`,
        description: `Write the main content sections as specified in the project requirements`,
        priority: 'High',
        estimatedHours: 6,
        category: 'Content Creation'
      },
      {
        title: `Plan and practice ${projectContext.keyPhrases.includes('presentation') ? 'presentation' : 'demonstration'} delivery`,
        description: `Prepare for the presentation component including timing, visual aids, and delivery practice`,
        priority: 'Medium',
        estimatedHours: 3,
        category: 'Presentation'
      },
      {
        title: `Prepare practical ${projectContext.keyPhrases.includes('cooking') ? 'cooking' : 'hands-on'} component`,
        description: `Plan and practice the hands-on demonstration or practical element of the project`,
        priority: 'Medium',
        estimatedHours: 4,
        category: 'Preparation'
      }
    ];
  }

  if (projectContext.domain === 'Academic' || projectContext.domain === 'Academic Writing') {
    return [
      {
        title: `Research ${projectContext.keyPhrases.filter(p => !['project', 'document', 'presentation'].includes(p)).slice(0, 3).join(' and ')} for ${request.projectName}`,
        description: `Conduct thorough research on the main topics identified in the project description`,
        priority: 'High',
        estimatedHours: 5,
        category: 'Research'
      },
      {
        title: `Create detailed outline for ${projectContext.keyPhrases.includes('presentation') ? 'presentation and document' : 'academic deliverable'}`,
        description: `Structure both written and presentation components according to academic requirements`,
        priority: 'High',
        estimatedHours: 2,
        category: 'Planning'
      },
      {
        title: `Draft main content sections covering ${projectContext.keyPhrases.filter(p => p.includes('history') || p.includes('analysis') || p.includes('process')).join(', ')}`,
        description: `Write the core academic content addressing all required topics and analysis`,
        priority: 'High',
        estimatedHours: 8,
        category: 'Academic Writing'
      },
      {
        title: `Prepare ${projectContext.keyPhrases.includes('presentation') ? 'academic presentation' : 'final presentation'} with visual aids`,
        description: `Create and practice the presentation component with appropriate academic formatting and delivery`,
        priority: 'Medium',
        estimatedHours: 4,
        category: 'Presentation'
      }
    ];
  }

  // Generic fallback for other domains
  return [
    {
      title: `Define specific requirements and deliverables for ${request.projectName}`,
      description: `Break down the project goal into specific, measurable requirements and expected outcomes`,
      priority: 'High',
      estimatedHours: 3,
      category: 'Planning'
    },
    {
      title: `Research and gather information relevant to ${projectContext.domain.toLowerCase()} project`,
      description: `Collect all necessary information, resources, and materials needed for the project`,
      priority: 'High',
      estimatedHours: 4,
      category: 'Research'
    },
    {
      title: `Create project timeline and milestones for ${request.projectName}`,
      description: `Develop a realistic schedule with specific milestones and deadlines`,
      priority: 'Medium',
      estimatedHours: 2,
      category: 'Planning'
    },
    {
      title: `Develop main deliverables addressing ${projectContext.keyPhrases.slice(0, 3).join(', ')}`,
      description: `Create the core components and outputs specified in the project requirements`,
      priority: 'High',
      estimatedHours: 6,
      category: 'Development'
    },
    {
      title: `Review, test, and refine all project components`,
      description: `Ensure all deliverables meet the specified requirements and quality standards`,
      priority: 'Medium',
      estimatedHours: 3,
      category: 'Quality Assurance'
    }
  ];
};

/**
 * Generate a project summary using AI
 */
export const generateProjectSummary = async (projectName: string, goal: string): Promise<string> => {
  try {
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      return `Project: ${projectName}\nGoal: ${goal}`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate a brief, professional project summary for:
- Project Name: ${projectName}
- Goal: ${goal}

The summary should be 2-3 sentences that clearly explain what the project is about and what it aims to achieve. Make it engaging and professional.

Return only the summary text, no additional formatting.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error generating project summary:', error);
    return `Project: ${projectName}\nGoal: ${goal}`;
  }
};
