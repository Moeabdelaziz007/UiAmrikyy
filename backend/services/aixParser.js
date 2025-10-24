// backend/services/aixParser.js

/**
 * Parses the content of an .aix file into a structured object.
 * @param {string} fileContent The raw string content of the .aix file.
 * @returns {{PROMPT: string, DATA: string, RULES: string, PYTHON: string}} An object with the content of each section.
 */
function parseAixFile(fileContent) {
  const sections = {
    PROMPT: '',
    DATA: '',
    RULES: '',
    PYTHON: '',
  };
  let currentSection = null;
  const lines = fileContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      const sectionName = trimmedLine.substring(1, trimmedLine.length - 1).toUpperCase();
      if (Object.prototype.hasOwnProperty.call(sections, sectionName)) {
        currentSection = sectionName;
      } else {
        currentSection = null; // Ignore unknown sections
      }
    } else if (currentSection) {
      sections[currentSection] += line + '\n';
    }
  }

  // Trim trailing newlines from each section
  for (const key in sections) {
    if (Object.prototype.hasOwnProperty.call(sections, key)) {
      sections[key] = sections[key].trim();
    }
  }

  return sections;
}

module.exports = { parseAixFile };
