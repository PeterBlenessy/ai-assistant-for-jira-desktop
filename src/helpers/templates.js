export const defaultTemplate = [
    {
        issueType: "initiative",
        name: "Initiative",
        definition: `
            An initiative is a high-level description of desired outcomes that provides a context for
            the development team by defining why it is needed, who it is for, when it is needed,
            and what the desired outcomes are.
            Initiatives are written by the Product Owner and broken down into epics by the development teams.
        `,
        persona: {
            name: "Product Owner",
            definition: `
                As the Product Owner, you are responsible for maximizing the value of the product 
                by managing the product backlog, prioritizing tasks, and ensuring that the development 
                team is aligned with the product vision and goals.
                You achieve this by making sure that the initiatives are well-defined, 
                have clear outcomes, and are aligned with the strategic goals and objectives.
                
            `
        },
        fields: [
            {
                name: "summary",
                title: "Summary",
                definition: `
                    A brief description of the initiative that captures the essence of the desired outcomes.
                    The summary should be concise, clear, and compelling to engage the stakeholders and development team.
                `,
            },
            {
                name: "description",
                title: "Description",
                definition: `
                    A detailed description of the initiative that provides context, background, and rationale for the desired outcomes.
                    The description should answer the questions: why is this initiative needed? who is it for? what are the desired outcomes?
                `,
            },
            {
                name: "mvp",
                title: "Minimum Viable Product",
                definition: `
                    A description of the minimum set of features and functionality that the initiative must deliver to achieve the desired outcomes.
                    The MVP should be defined in terms of user stories, acceptance criteria, and key performance indicators.
                `,
            },
            {
                name: "acceptanceCriteria",
                title: "Acceptance Criteria",
                definition: `
                    A list of criteria that must be met for the initiative to be considered complete and successful.
                    The acceptance criteria should be specific, measurable, achievable, relevant, and time-bound.
                `,
            },
            {
                name: "outcomes",
                title: "Outcomes",
                definition: `
                    A list of desired outcomes that the initiative aims to achieve to create value for the stakeholders and organization.
                `,
            },
            {
                name: "milestones",
                title: "Milestones",
                definition: `
                    A list of key validation points and deliverables that mark the progress of the initiative towards achieving the desired outcomes.
                    A milestone is a brief description of a significant event or achievement that signals progress and success.
                `,
            }
        ],
    },
    {
        issueType: "epic",
        name: "Epic",
        definition: `
            An epic describes how the initiative will be achieved through a series of deliverables.
            It will be broken down into smaller tasks or stories by the development team.
            Epics are used to organize and manage complex projects by defining the scope, objectives, and deliverables.
            The epic provides a high-level view of the project and serves as a roadmap for the development team.
        `,
        persona: {
            name: "Scrum Master",
            definition: `
                As the Scrum Master, you are responsible for facilitating the Scrum process, 
                coaching the development team, and removing impediments to progress.
                You achieve this by ensuring that the epics are well-defined, have clear objectives, 
                and are broken down into manageable tasks and stories.
            `
        },
        fields: [
            {
                name: "summary",
                title: "Summary",
                definition: `
                    A brief description of the epic that captures the essence of the scope, objectives, and deliverables.
                    The summary should be concise, clear, and compelling to engage the stakeholders and development team.
                `,
            },
            {
                name: "description",
                title: "Description",
                definition: `
                    A detailed description of the epic that provides context, background, and rationale for the scope, objectives, and deliverables.
                    The description should answer the questions: what is the scope of the epic? what are the objectives? what are the deliverables?
                `,
            },
            {
                name: "acceptanceCriteria",
                title: "Acceptance Criteria",
                definition: `
                    A list of criteria that must be met for the epic to be considered complete and successful.
                    The acceptance criteria should be specific, measurable, achievable, relevant, and time-bound.
                `,
            },
        ],
    },
    {
        issueType: "story",
        name: "Story",
        definition: `
            A user story describes a feature or functionality from the perspective of an end-user.
            It captures the user's needs, goals, and expectations to guide the development team in building the right solution.
            User stories are used to define the requirements, acceptance criteria, and tasks for a feature or functionality.
            Stories are written by the development team and validated by the Product Owner.
        `,
        persona: {
            name: "Development Team",
            definition: `
                As a member of the development team, you are responsible for implementing the user stories, 
                testing the functionality, and delivering the features to the end-users.
                You achieve this by breaking down the stories into tasks, estimating the effort, 
                and collaborating with the Product Owner to ensure that the requirements are met.
            `
        },
        fields: [
            {
                name: "summary",
                title: "Summary",
                definition: `
                    A brief description of the user story that captures the essence of the feature or functionality.
                    The summary should be concise, clear, and compelling to engage the stakeholders and development team.
                `,
            },
            {
                name: "description",
                title: "Description",
                definition: `
                    A detailed description of the user story that provides context, background, and rationale for the feature or functionality.
                    The description should answer the questions: what is the user's need? what is the goal? what are the expectations?
                `,
            },
            {
                name: "acceptanceCriteria",
                title: "Acceptance Criteria",
                definition: `
                    A list of criteria that must be met for the user story to be considered complete and successful.
                    The acceptance criteria should be specific, measurable, achievable, relevant, and time-bound.
                `,
            },
        ],
    },
    {
        issueType: "subTask",
        name: "Subtask",
        definition: `
            A sub-task describes a specific action or activity that needs to be completed to achieve a user story.
            It captures the effort, time, and resources required to implement the feature or functionality.
            Sub-tasks are used to break down the user stories into manageable units of work and assign them to team members.
            Sub-tasks are written by the development team and tracked in the sprint backlog.
        `,
    },
    {
        issueType: "task",
        name: "Task",
        definition: `
            A task is an internal activity or action that needs to be completed to support the development process.
            It is often related to CI/CD pipelines, code reviews, testing, documentation, or other non-functional requirements.
            Tasks are used to track the progress, effort, and dependencies of the development team.
        `,
    }
];