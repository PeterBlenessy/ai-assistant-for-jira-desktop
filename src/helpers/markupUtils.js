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

// Helper function to normalize field names for comparison
const normalizeFieldName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '');
};

// Helper function to extract description sections
export const extractDescriptionSections = (currentDescription) => {
    if (!currentDescription) return { description: '' };

    const sections = {};
    
    // Split by both h2. and ## headings, but keep the heading marker
    const parts = currentDescription.split(/(?=\n+(?:h2\.|##)\s*)/);
    
    // Process each part
    parts.forEach(part => {
        const trimmedPart = part.trim();
        if (!trimmedPart) return;  // Skip empty parts
        
        // Check if part starts with a heading
        const headingMatch = trimmedPart.match(/^(?:h2\.|##)\s*([^\n]+)/);
        
        if (headingMatch) {
            // This part starts with a heading
            const heading = headingMatch[1].trim();
            const content = trimmedPart.substring(headingMatch[0].length).trim();
            
            // If heading is "Description" (case insensitive), use special key
            if (heading.toLowerCase() === 'description') {
                sections.description = content;
            } else {
                sections[heading] = content;
            }
        } else {
            // No heading - this is the main description
            // Only set if description hasn't been set by a "Description" heading
            if (!sections.description) {
                sections.description = trimmedPart;
            }
        }
    });
    
    // Ensure description key exists
    if (!sections.description) {
        sections.description = '';
    }

    return sections;
};

// Helper function to format the description
export const formatDescription = (sections) => {
    let formattedDescription = '';
    
    // Add main description if it exists
    if (sections.description) {
        formattedDescription = sections.description;
    }

    // Add all other sections
    Object.entries(sections).forEach(([heading, content]) => {
        if (heading !== 'description' && content) {
            // Add double newline before each section
            if (formattedDescription) {
                formattedDescription += '\n\n';
            }
            formattedDescription += `h2. ${heading}\n${content}`;
        }
    });

    return formattedDescription;
};
