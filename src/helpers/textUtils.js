import { nextTick } from 'vue'

/**
 * Cleans text by trimming whitespace and replacing multiple spaces with a single space
 * @param {string} text - The text to clean
 * @returns {string} - The cleaned text
 */
export function cleanText(text) {
    return text
        .trim()
        .replace(/^\s+/gm, '')      // Remove leading whitespace from each line
        .replace(/\n\s*\n\s*/g, '\n\n')  // Replace multiple blank lines with a single one
        .replace(/\s+/g, ' ');      // Replace multiple spaces with a single space
}


/**
 * Capitalizes the first letter of a string
 * @param {string} string 
 * @returns {string} 
 */
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Converts a string to camel case
 * @param {string} str 
 * @returns {string} 
 */
export function toCamelCase(str) {
    return str
        .trim()
        .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase()) // Replace spaces, hyphens, or underscores with uppercase
        .replace(/^(.)/, c => c.toLowerCase()) // Make the first letter lowercase
        .replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
}



/**
 * Handles paste events in input fields with text cleaning
 * @param {Event} event - The paste event
 * @param {Function} updateValue - Callback function to update the input value
 */
export function handleInputPaste(event, updateValue) {
    const input = event.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    // Get the pasted text and clean it
    const pastedText = event.clipboardData.getData('text');
    const cleanedText = cleanText(pastedText);
    
    // Get the current value and insert cleaned text at cursor position
    const currentValue = input.value;
    const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
    
    // Update the value
    updateValue(newValue);
    
    // Prevent default paste
    event.preventDefault();
    
    // Set cursor position after paste
    nextTick(() => {
        input.setSelectionRange(start + cleanedText.length, start + cleanedText.length);
    });
}
