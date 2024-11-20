export function parseYAML(yamlStr) {
    // Remove delimiters
    const content = yamlStr.trim().replace(/^---\n?/, '').replace(/\n?---$/, '');

    const lines = content.split('\n');

    let result = {};
    let currentKey = null;
    let currentObject = null;
    let currentArray = null;
    let isMultiLine = false;
    let multiLineValue = '';

    lines.forEach((rawLine, index) => {
        // Check for indentation before trimming
        const isIndented = rawLine.startsWith(' ');
        const line = rawLine.trim();

        if (isMultiLine) {
            if ((isIndented || line === '') && !line.includes(':')) {
                // Continue collecting lines for the multi-line string
                multiLineValue += (multiLineValue ? '\n' : '') + rawLine.trim();
                return;
            } else {
                // End of multi-line string
                currentObject[currentKey] = multiLineValue;
                isMultiLine = false;
                multiLineValue = '';
            }
        }

        if (line.includes(':') && !isIndented) {
            // Handle top-level key-value pairs
            const [key, ...rest] = line.split(':');
            currentKey = key.trim();
            let value = rest.join(':').trim();

            if (value === '|') {
                // Start of a multi-line string
                isMultiLine = true;
                multiLineValue = '';
            } else if (value) {
                result[currentKey] = value.replace(/"/g, ''); // Remove quotes from value
                currentObject = null; // Reset current object
                currentArray = null; // Reset current array
            } else {
                // Initialize an object for nested fields
                currentObject = {};
                result[currentKey] = currentObject; // Link the object to result
                currentArray = null; // Reset current array
            }
        } else if (currentObject && isIndented) {
            // Handle nested key-value pairs (indented lines)
            if (line.startsWith('-')) {
                // Handle list items
                const value = line.slice(1).trim().replace(/"/g, '') || null;
                if (!currentArray) {
                    currentArray = [];
                    currentObject[currentKey] = currentArray;
                }
                currentArray.push(value);
            } else {
                const [key, ...rest] = line.split(':');
                const fieldKey = key.trim();
                let value = rest.join(':').trim() || null;

                if (value === '|') {
                    // Start of a multi-line string
                    isMultiLine = true;
                    multiLineValue = '';
                    currentKey = fieldKey;
                } else {
                    if (value) {
                        value = value.replace(/"/g, ''); // Remove quotes from value
                    }

                    currentObject[fieldKey] = value;
                    currentArray = null; // Reset current array

                    // Set currentKey to fieldKey for potential list items
                    currentKey = fieldKey;
                }
            }
        }
    });

    // Handle any remaining multi-line value at the end of the document
    if (isMultiLine) {
        currentObject[currentKey] = multiLineValue;
    }

    return result;
}
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
