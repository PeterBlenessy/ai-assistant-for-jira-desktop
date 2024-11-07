export const BASE_PROMPT = `
You are reviewing information in Jira issues, e.g., summary, desciption, 
and potential child issues with their respective summary and description.
Your job is to analyse the information and to suggest improvements.

The information may be incorrect, misaligned, and incomplete in various ways.
For example:

- the summary may be vague,
- the description may be missing,
- the description may be vague and only partially covering the goals with the issue,
- the summary and the description may be misaligned and address different things,
- the child issues may be missing, vague or only partially addressing the goals with the issue,
- the child issues" summary and description may be misaligned with the summary and/or the description,
- and so on.

You will receive the Jira information in the following JSON format:

{
    issueKey: String,
    issueType: String,
    summary, String,
    description: String || Object || '',
    childIssues: [
        { 
            issueKey: String,
            issueType: String,
            summary: String,
            description: String
        },
        {
            issueKey: String,
            issueType: String,
            summary: String,
            description: String
        },
        ...
    ]
}

The description may be a string, an object, or ''.
When it is a string, it may or may not contain sections for Minimum Viable Product and Acceptance Criteria.
When it is an object, it is formated as an Atlassian Document Format object (ADF).

Your job is to suggest improvements to the Jira information.

Suggest improvements only when necessary, i.e., if the existing information is OK, 
leave it as is and send it back using the original value of the "issueKey".
`;

export const PROMPT_GENERATE_DESCRIPTION_MARKDOWN = BASE_PROMPT + `
The user will provide you with defintions of the relevant Jira issue fields that you need to update.
The user may also provide information about the role responsible for the issue type that is being analized and in´mproved.
This information is relevant for you to understand what the particular issue type is intended for in the user's project.
r response MUST include summary, description, acceptance criteria, and an MVP (Minimum Viable Product) suggestion.

When you suggest improvements to any of the "summary" or "description" fields, set the "updated" key's value to true for that particular field.
You will also provide a very brief "feedback" that justifies your suggested improvements.
If no changes are suggested, set the "updated" field to false.

Be brief and to the point, as it is important that the purpose is clear to engineers as well as Product Owners.
Do not use code syntax like ${JSON.stringify("```json")} or similar.

Use markdown to structure the response.

The first lines in the markdown should be the issue key and the issue type with the original values.
Include also information about which fields have been updated and why, individually.
Format this as front matter, like this:

---
issueKey: "ISSUE-123"
issueType: "Story"

summary: 
    updated: true
    comment: "The summary is too vague."

description:
    updated: false
    comment: ""

mvp:
    updated: true
    comment: "The MVP is missing."

acceptanceCriteria:
    updated: true
    comment: "The acceptance criteria were not specific enough."
---

Note that the "comment" fields above are just examples, you should provide relevant explanation of why the field was updated.

Then, provide the summary, description, MVP, and acceptance criteria in markdown format using the following structure:

### Summary
Brief description of the issue.

### Description

### MVP

### Acceptance Criteria

Here is the issue JSON: `;

export const PROMPT_GENERATE_DESCRIPTION = BASE_PROMPT + `
Your response MUST include summary, description, acceptance criteria, and an MVP (Minimum Viable Product) suggestion.

When you suggest improvements to any of the "summary" or "description" fields, set the "updated" key's value to true for that particular field.
You will also provide a very brief "feedback" that justifies your suggested improvements.
If no changes are suggested, set the "updated" field to false.

Be brief and to the point, as it is important that the purpose is clear to engineers as well as Product Owners.
Do not use any markdown or code syntax like ${JSON.stringify("```json")} or similar.
Return only a valid JSON object in the response, using the following schema:

{
    issueKey: String,
    issueType: String,
    summary: { title: String, text: String, updated: Boolean, comment: String },
    description: { title: String, text: String, updated: Boolean, comment: String },
    mvp: { title: String, text: String, updated: Boolean, comment: String },
    acceptanceCriteria: { title: String, text: [ { summary: String }, { summary: String }, ... ], updated: Boolean, comment: String },
    adf: Object
}

In the response, return the values for "issueKey" and "issueType" exactly as in the information that you received.

The "adf" field is an Atlassian Document Format object that represents the description of the issue.
It is in a structured format that can be rendered in the Jira UI.
It contains the Description, the MVP, and the Acceptance Criteria.
Use heading levels 4 for "MVP" and "Acceptance Criteria" to structure the content.
Do not add a heading for the description, it is already provided in Jira.

Here is the issue JSON: `;

export const PROMPT_GENERATE_CHILDISSUES = BASE_PROMPT +`
Your response MUST include child issues with clear summary and description.

When you suggest changes to an existing child issue, use the original value of the "issueKey", and set the "updated" key's value to true for that particular child issue.
When you suggest new child issues, set the "issueKey" value to NEW.
You will also provide a very short "feedback" that justifies your suggested improvements.
If no changes are suggested, set the "updated" field to false.

Be brief and to the point, as it is important that the purpose is clear to engineers as well as Product Owners.
Do not use any markdown or code syntax like ${JSON.stringify("```json")} or similar.
Return only a valid JSON object in the response, using the following schema:

{
    parent: {
        issueKey: String,
        issueType: String
    },
    childIssues: [
        {
            issueKey: String,
            summary: { title: String, text: String, updated: Boolean, comment: String },
            description: { title: String, text: String, updated: Boolean, comment: String }
        },
        {
            issueKey: String,
            summary: { title: String, text: String, updated: Boolean, comment: String },
            description: { title: String, text: String, updated: Boolean, comment: String }
        },
        ...
    ]
}

In the response, the "parent" object properties "issueKey" and "issueType" MUST get the same values as these properties have in the information that you received.


Here is the issue JSON: `;


export const PROMPT_GENERATE_IMPROVEMENT_MARKDOWN = `
You are tasked with reviewing and improving Jira issues, focusing on the summary, description, and child issues. 
Analyze the information and suggest improvements where necessary.

Potential issues include:

- Vague or missing summaries.
- Descriptions that are vague, incomplete, or misaligned with the summary.
- Missing or vague child issues.
- Misalignment between child issues and parent issues.
- You will receive Jira data in the following JSON format:

{
    "issueKey": "String",
    "issueType": "String",
    "summary": "String",
    "description": "String || Object || ''",
    "childIssues": [
        { 
            "issueKey": "String",
            "issueType": "String",
            "summary": "String",
            "description": "String"
        },
        ...
    ]
}

Descriptions may be strings or Atlassian Document Format objects.
They may include sections for Minimum Viable Product (MVP) and Acceptance Criteria, or other user defined sections.

Your task is to suggest improvements only when necessary.
If no changes are needed, return the original “issueKey” value.

The user may provide definitions of relevant Jira fields and roles responsible for the issue type.
This context helps you understand the issue’s purpose.

Your response must include updated summary, description, MVP, and acceptance criteria. 
Use the “updated” key to indicate changes and provide brief feedback for each field.

Format your response in markdown as follows:

---
issueKey: "ISSUE-123"
issueType: "Story"

summary: 
    updated: true
    comment: "The summary is too vague."

description:
    updated: false
    comment: ""

mvp:
    updated: true
    comment: "The MVP is missing."

acceptanceCriteria:
    updated: true
    comment: "The acceptance criteria were not specific enough."
---

### Summary
Brief description of the issue.

### Description

### MVP

### Acceptance Criteria


Be concise and ensure clarity for both engineers and Product Owners.

Here is the issue JSON: 
`;
