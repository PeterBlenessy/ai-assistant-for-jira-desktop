// Mock data for testing Jira issue relationships and comments
const generateComments = (count, issueType) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `comment-${Math.random().toString(36).substr(2, 9)}`,
    author: {
      displayName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Bob Security'][Math.floor(Math.random() * 5)]
    },
    created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
    body: `${issueType} update ${i + 1}: ${[
      'Making good progress on this item.',
      'Blocked by dependency, need help.',
      'Requirements clarified with stakeholders.',
      'Implementation completed, ready for review.',
      'Testing in progress, found some edge cases.',
      'Documentation updated with latest changes.',
      'Performance optimization completed.',
      'Security review passed.',
      'UX improvements implemented.',
      'Technical debt addressed.'
    ][i % 10]}`
  }));
};

const PROJECTS = [
  { key: 'MOBILE', name: 'Mobile App' },
  { key: 'WEB', name: 'Web Platform' },
  { key: 'API', name: 'API Services' },
  { key: 'INFRA', name: 'Infrastructure' },
  { key: 'DATA', name: 'Data Platform' }
];

const STATUS_TYPES = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITY_TYPES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const ASSIGNEES = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Wilson',
  'Bob Security',
  'Alice Developer',
  'Charlie DevOps',
  'Diana PM',
  'Erik Designer',
  'Frank Architect'
];

const getIconUrl = (name) => {
  return new URL(`../assets/issue-icons/${name}.png`, import.meta.url).href;
};

const ISSUE_TYPE_ICONS = {
  Initiative: getIconUrl('initiative'),
  Epic: getIconUrl('epic'),
  Story: getIconUrl('story'),
  Task: getIconUrl('task'),
  'Sub-task': getIconUrl('subtask')
};

const generateIssue = (project, type, index, parent = null) => {
  const key = `${project.key}-${index}`;
  const typePrefix = {
    Initiative: 'Strategic',
    Epic: 'Epic for',
    Story: 'User Story:',
    Task: 'Technical Task:',
    'Sub-task': 'Subtask for'
  }[type];
  
  return {
    id: key,
    key,
    fields: {
      summary: `${typePrefix} ${parent ? `${parent.fields.summary} -` : ''} ${project.name} ${type} ${index}`,
      description: `Detailed description for ${type} ${key} in project ${project.name}`,
      issuetype: { 
        name: type,
        iconUrl: ISSUE_TYPE_ICONS[type]
      },
      status: { name: STATUS_TYPES[Math.floor(Math.random() * STATUS_TYPES.length)] },
      priority: { name: PRIORITY_TYPES[Math.floor(Math.random() * PRIORITY_TYPES.length)] },
      assignee: { displayName: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)] },
      created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      project: { key: project.key, name: project.name }
    }
  };
};

const MOCK_IMPROVEMENTS = {
  'Initiative': {
    summary: {
      text: "Strategic Initiative: Enhance Mobile Platform Capabilities",
      comment: "Made the summary more specific and action-oriented",
      updated: true,
      label: "Summary"
    },
    description: {
      text: "This strategic initiative aims to significantly enhance our mobile platform capabilities to meet evolving market demands and user expectations.\n\n**Key Objectives:**\n1. Improve app performance metrics by 50%\n2. Implement next-gen security features\n3. Enhance user experience through modern UI/UX\n4. Enable offline capabilities\n5. Integrate advanced analytics",
      comment: "Added clear objectives and structured the description better",
      updated: true,
      label: "Description"
    }
  },
  'Epic': {
    summary: {
      text: "Epic: Implement Comprehensive User Authentication System",
      comment: "Added clarity about the epic's scope",
      updated: true,
      label: "Summary"
    },
    description: {
      text: "Implement a robust authentication system that provides secure access while maintaining excellent user experience.\n\n**Key Deliverables:**\n1. Multi-factor authentication\n2. Social login integration\n3. Biometric authentication\n4. Password recovery workflow\n5. Session management",
      comment: "Added specific deliverables and improved structure",
      updated: true,
      label: "Description"
    }
  },
  'Story': {
    summary: {
      text: "User Story: Enable Social Media Login Integration",
      comment: "Made the story title more specific",
      updated: true,
      label: "Summary"
    },
    description: {
      text: "**As a** mobile app user\n**I want to** log in using my social media accounts\n**So that** I can quickly access the app without creating new credentials\n\n**Acceptance Criteria:**\n1. Support login with Facebook\n2. Support login with Google\n3. Support login with Apple ID\n4. Implement proper error handling\n5. Ensure data privacy compliance",
      comment: "Added user story format and clear acceptance criteria",
      updated: true,
      label: "Description"
    }
  },
  'Task': {
    summary: {
      text: "Technical Task: Implement OAuth2.0 Authentication Flow",
      comment: "Added technical specificity to the task title",
      updated: true,
      label: "Summary"
    },
    description: {
      text: "**Technical Requirements:**\n1. Implement OAuth2.0 authorization code flow\n2. Set up secure token storage\n3. Handle token refresh mechanism\n4. Implement logout functionality\n5. Add proper error handling\n\n**Technical Notes:**\n- Use latest OAuth2.0 libraries\n- Follow security best practices\n- Add comprehensive logging",
      comment: "Added technical details and implementation notes",
      updated: true,
      label: "Description"
    }
  },
  'Sub-task': {
    summary: {
      text: "Implement Token Refresh Mechanism",
      comment: "Made the subtask more specific",
      updated: true,
      label: "Summary"
    },
    description: {
      text: "**Implementation Steps:**\n1. Create token refresh service\n2. Add token expiration check\n3. Implement automatic refresh logic\n4. Add retry mechanism\n5. Implement error handling\n\n**Testing Requirements:**\n- Unit tests for refresh logic\n- Integration tests for token flow\n- Error scenario testing",
      comment: "Added clear implementation steps and testing requirements",
      updated: true,
      label: "Description"
    }
  }
};

export const mockJiraData = (() => {
  const allIssues = {};
  let currentIndex = 1;

  // Generate 10 initiatives per project
  PROJECTS.forEach(project => {
    for (let i = 0; i < 10; i++) {
      const initiative = generateIssue(project, 'Initiative', currentIndex++);
      initiative.childIssues = [];
      initiative.comments = generateComments(7, 'Initiative');
      allIssues[initiative.key] = initiative;

      // Generate 5 epics per initiative
      for (let j = 0; j < 5; j++) {
        const epic = generateIssue(project, 'Epic', currentIndex++, initiative);
        epic.childIssues = [];
        epic.comments = generateComments(6, 'Epic');
        initiative.childIssues.push(epic);
        allIssues[epic.key] = epic;

        // Generate 5 stories per epic
        for (let k = 0; k < 5; k++) {
          const story = generateIssue(project, 'Story', currentIndex++, epic);
          story.childIssues = [];
          story.comments = generateComments(5, 'Story');
          epic.childIssues.push(story);
          allIssues[story.key] = story;

          // Generate 5 subtasks per story
          for (let l = 0; l < 5; l++) {
            const subtask = generateIssue(project, 'Sub-task', currentIndex++, story);
            subtask.comments = generateComments(5, 'Sub-task');
            story.childIssues.push(subtask);
            allIssues[subtask.key] = subtask;
          }
        }

        // Generate 3 tasks per epic
        for (let k = 0; k < 3; k++) {
          const task = generateIssue(project, 'Task', currentIndex++, epic);
          task.childIssues = [];
          task.comments = generateComments(5, 'Task');
          epic.childIssues.push(task);
          allIssues[task.key] = task;

          // Generate 5 subtasks per task
          for (let l = 0; l < 5; l++) {
            const subtask = generateIssue(project, 'Sub-task', currentIndex++, task);
            subtask.comments = generateComments(5, 'Sub-task');
            task.childIssues.push(subtask);
            allIssues[subtask.key] = subtask;
          }
        }
      }
    }
  });

  // Return a function that can look up any issue by key
  return {
    getIssue: (key) => allIssues[key],
    getChildIssues: (key) => allIssues[key]?.childIssues || [],
    getComments: (key) => allIssues[key]?.comments || [],
    getAllIssues: () => Object.values(allIssues),
    getProjects: () => PROJECTS,
    getMockImprovement: (issueType) => {
      return MOCK_IMPROVEMENTS[issueType] || MOCK_IMPROVEMENTS['Task'];
    }
  };
})();

export function getMockSearchResults(jql) {
  // You can implement basic JQL parsing here if needed
  // For now, just return all mock issues
  return mockIssues;
}

export const mockIssues = [
  // ... your existing mock issues ...
];
