import yaml from 'js-yaml';

// Parse YAML in front matter to an object
export const parseFrontMatter = (yamlStr) => {
    try {
        // Parse YAML string into JavaScript object
        const parsedData = yaml.load(yamlStr);
        console.log(parsedData);

        // Handle object data transformation or validation as needed
        for (const key in parsedData) {
            if (parsedData[key] && typeof parsedData[key] === 'object') {
                // Check for any missing fields or conflicts (like the "title" conflict in mvp)
                if (parsedData[key].title && parsedData[key].updated === null) {
                    parsedData[key].updated = 'undefined';
                }
            }
        }

        return parsedData;
    } catch (e) {
        console.error("Error parsing YAML:", e);
    }
}

// Parse content as markdown to object with known properties
export const parseMarkdown = (mdContent, objContent) => {
    const sections = mdContent.split('###').filter(s => s.trim());
    sections.forEach(section => {
        const lines = section.trim().split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();

        // Find a matching property in the objContent based on the title
        const matchingKey = Object.keys(objContent).find(key => 
            objContent[key].title === title
        );

        // If a matching key is found, assign content to the text property
        if (matchingKey) {
            objContent[matchingKey].text = content; // Assign content to the text property
        }
    });
    
    return objContent;
};

// Convert Jira markup to markdown
export const formatJiraMarkup = (text) => {
    if (!text) return '';

    return text
        .replace(/h1\.(.*?)$/gm, '# $1')
        .replace(/h2\.(.*?)$/gm, '## $1')
        .replace(/h3\.(.*?)$/gm, '### $1')
        .replace(/\n/g, '<br>')
        .replace(/^(\d+)\.\s(.*)$/gm, '- $2');
};

// Helper function to extract description sections
export const extractDescriptionSections = (currentDescription) => {
    const sections = {
        description: '',
        acceptanceCriteria: [],
        userDefinedFields: {}
    };

    // Extract main description
    const mainDescMatch = currentDescription.match(/^([^]*?)(?=\n+##|$)/);
    sections.description = mainDescMatch ? mainDescMatch[1].trim() : '';

    // Extract user-defined fields and acceptance criteria
    const sectionMatches = currentDescription.match(/##\s*(.*?)\s*\n+([^]*?)(?=\n+##|$)/g) || [];
    sectionMatches.forEach(section => {
        const [title, content] = section.split(/\n+/).filter(Boolean);
        const fieldName = title.replace(/^##\s*/, '').trim(); // Remove the "## " prefix
        if (fieldName === 'Acceptance Criteria') {
            sections.acceptanceCriteria.push(content.trim());
        } else {
            sections.userDefinedFields[fieldName] = content.trim();
        }
    });

    return sections;
};

// Helper function to format the description
export const formatDescription = (sections, improvement) => {
    let formattedDescription = sections.description.trim();

    // Append user-defined fields to the formatted description
    Object.keys(sections.userDefinedFields).forEach(field => {
        formattedDescription += `\n\n## ${field}\n${sections.userDefinedFields[field]}`;
    });

    // If the improvement is for the description, update it
    if (improvement.updated) {
        formattedDescription = improvement.text;
    }

    return formattedDescription;
};
