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
      issuetype: { name: type },
      status: { name: STATUS_TYPES[Math.floor(Math.random() * STATUS_TYPES.length)] },
      priority: { name: PRIORITY_TYPES[Math.floor(Math.random() * PRIORITY_TYPES.length)] },
      assignee: { displayName: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)] },
      created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      project: { key: project.key, name: project.name }
    }
  };
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
    getProjects: () => PROJECTS
  };
})();
