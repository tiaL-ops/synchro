// AI Service for Google AI API integration
const GOOGLE_AI_API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const generateTeamCharter = async (projectData) => {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  const prompt = `
    Generate a comprehensive team charter for the following project:
    
    Project Name: ${projectData.name}
    Project Description: ${projectData.description}
    Project Goals: ${projectData.goals}
    Team Members: ${projectData.memberEmails?.join(', ') || 'No members specified'}
    Team Roles: ${projectData.roles?.join(', ') || 'No roles specified'}
    Timeline: ${projectData.timeline || 'No timeline specified'}
    
    Please create a detailed team charter that includes:
    1. Project Overview and Objectives
    2. Team Structure and Roles
    3. Communication Guidelines
    4. Meeting Schedule and Expectations
    5. Decision-Making Process
    6. Conflict Resolution Procedures
    7. Success Metrics and Deliverables
    8. Timeline and Milestones
    9. Risk Management
    10. Code of Conduct
    
    Make it professional, comprehensive, and actionable for a student group project.
  `;

  try {
    const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from AI API');
    }
  } catch (error) {
    console.error('Error generating team charter:', error);
    throw error;
  }
};

export const generateProjectBreakdown = async (projectData) => {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  const prompt = `
    Break down the following project into manageable tasks and suggest a timeline:
    
    Project Name: ${projectData.name}
    Project Description: ${projectData.description}
    Project Goals: ${projectData.goals}
    Team Size: ${projectData.memberEmails?.length || 1} members
    Timeline: ${projectData.timeline || 'No specific timeline'}
    
    Please provide:
    1. A list of main tasks/milestones
    2. Suggested timeline for each task
    3. Recommended team member assignments
    4. Dependencies between tasks
    5. Potential risks and mitigation strategies
    
    Format the response in a clear, actionable structure.
  `;

  try {
    const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from AI API');
    }
  } catch (error) {
    console.error('Error generating project breakdown:', error);
    throw error;
  }
};

