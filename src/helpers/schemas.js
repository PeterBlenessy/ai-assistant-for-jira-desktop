export const issueSchema = {
    name: "issue_fields",
    schema: {
        type: "object",
        properties: {
            issueKey: { type: "string" },
            issueType: { type: "string" },
            summary: {
                type: "object",
                properties: {
                    title: { type: "string", const: "Summary" },
                    text: { type: "string" },
                    updated: { type: "boolean" },
                    comment: { type: "string" }
                },
                required: ["title", "text", "updated", "comment"]
            },
            description: {
                type: "object",
                properties: {
                    title: { type: "string", const: "Description" },
                    text: { type: "string" },
                    updated: { type: "boolean" },
                    comment: { type: "string" }
                },
                required: ["title", "text", "updated", "comment"]
            },
            mvp: {
                type: "object",
                properties: {
                    title: { type: "string", const: "Minimum Viable Product" },
                    text: { type: "string" },
                    updated: { type: "boolean" },
                    comment: { type: "string" }
                },
                required: ["title", "text", "updated", "comment"]
            },
            acceptanceCriteria: {
                type: "object",
                properties: {
                    title: { type: "string", const: "Acceptance Criteria" },
                    text: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                summary: { type: "string" }
                            },
                            required: ["summary"]
                        }
                    },
                    updated: { type: "boolean" },
                    comment: { type: "string" }
                },
                required: ["title", "text", "updated", "comment"]
            },
            adf: { type: "object" }
        },
        required: ["issueKey", "issueType", "summary", "description", "mvp", "acceptanceCriteria", "adf"]
    }
};

export const childIssuesSchema = {
    name: "child_issues",
    schema: {
        type: "object",
        properties: {
            parent: {
                type: "object",
                properties: {
                    issueKey: { type: "string" },
                    issueType: { type: "string" }
                },
                required: ["issueKey", "issueType"]
            },
            childIssues: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        issueKey: { type: "string" },
                        summary: {
                            type: "object",
                            properties: {
                                title: { type: "string", const: "Summary" },
                                text: { type: "string" },
                                updated: { type: "boolean" },
                                comment: { type: "string" }
                            },
                            required: ["title", "text", "updated", "comment"]
                        },
                        description: {
                            type: "object",
                            properties: {
                                title: { type: "string", const: "Description" },
                                text: { type: "string" },
                                updated: { type: "boolean" },
                                comment: { type: "string" }
                            },
                            required: ["title", "text", "updated", "comment"]
                        }
                    },
                    required: ["issueKey", "summary", "description"]
                }
            }
        },
        required: ["parent", "childIssues"],
        strict: true
    }
}; 
