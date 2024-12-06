// Mock data for testing Jira issue relationships and comments
export const mockJiraData = {
  parentIssue: {
    id: "PROJ-1",
    key: "PROJ-1",
    fields: {
      summary: "Implement new feature dashboard",
      description: "Create a new dashboard with analytics features",
      status: { name: "In Progress" },
      priority: { name: "High" },
      assignee: { displayName: "John Doe" },
      created: "2024-02-09T10:00:00.000Z",
      updated: "2024-02-10T15:30:00.000Z"
    }
  },
  
  childIssues: [
    {
      id: "PROJ-2",
      key: "PROJ-2",
      fields: {
        summary: "Design dashboard wireframes",
        description: "Create initial wireframes for the dashboard layout",
        status: { name: "Done" },
        priority: { name: "Medium" },
        assignee: { displayName: "Jane Smith" },
        created: "2024-02-09T11:00:00.000Z",
        updated: "2024-02-09T16:00:00.000Z"
      }
    },
    {
      id: "PROJ-3",
      key: "PROJ-3",
      fields: {
        summary: "Implement dashboard backend API",
        description: "Create REST endpoints for dashboard data",
        status: { name: "In Progress" },
        priority: { name: "High" },
        assignee: { displayName: "Mike Johnson" },
        created: "2024-02-09T12:00:00.000Z",
        updated: "2024-02-10T14:00:00.000Z"
      }
    }
  ],

  linkedIssues: [
    {
      id: "PROJ-4",
      key: "PROJ-4",
      fields: {
        summary: "Update documentation for dashboard",
        description: "Create user and technical documentation",
        status: { name: "To Do" },
        priority: { name: "Low" },
        assignee: { displayName: "Sarah Wilson" },
        created: "2024-02-10T09:00:00.000Z",
        updated: "2024-02-10T09:00:00.000Z"
      },
      linkType: "relates to"
    },
    {
      id: "PROJ-5",
      key: "PROJ-5",
      fields: {
        summary: "Security review for dashboard",
        description: "Perform security assessment of new features",
        status: { name: "To Do" },
        priority: { name: "High" },
        assignee: { displayName: "Bob Security" },
        created: "2024-02-10T10:00:00.000Z",
        updated: "2024-02-10T10:00:00.000Z"
      },
      linkType: "blocks"
    }
  ],

  comments: [
    {
      id: "10001",
      author: { displayName: "John Doe" },
      created: "2024-02-09T13:00:00.000Z",
      updated: "2024-02-09T13:00:00.000Z",
      body: "Initial requirements have been reviewed and approved by stakeholders."
    },
    {
      id: "10002",
      author: { displayName: "Jane Smith" },
      created: "2024-02-09T16:30:00.000Z",
      updated: "2024-02-09T16:30:00.000Z",
      body: "Wireframes have been completed and uploaded to Figma for review."
    },
    {
      id: "10003",
      author: { displayName: "Mike Johnson" },
      created: "2024-02-10T11:00:00.000Z",
      updated: "2024-02-10T11:00:00.000Z",
      body: "Backend API development is 50% complete. Expecting to finish by EOD tomorrow."
    }
  ]
};
