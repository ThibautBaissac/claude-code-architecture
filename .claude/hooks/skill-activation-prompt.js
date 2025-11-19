#!/usr/bin/env node

/**
 * Skill Activation Prompt Hook
 *
 * This hook runs on UserPromptSubmit and analyzes the user's prompt and file context
 * to suggest relevant skills automatically.
 *
 * Hook Type: UserPromptSubmit
 */

const fs = require('fs');
const path = require('path');

// Read the skill rules configuration
function loadSkillRules() {
  const rulesPath = path.join(__dirname, '..', 'skills', 'skill-rules.json');

  if (!fs.existsSync(rulesPath)) {
    return { skills: [] };
  }

  try {
    const content = fs.readFileSync(rulesPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading skill-rules.json: ${error.message}`);
    return { skills: [] };
  }
}

// Check if a file path matches any of the file patterns
function matchesFilePattern(filePath, patterns) {
  if (!patterns || patterns.length === 0) return false;

  return patterns.some(pattern => {
    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  });
}

// Check if prompt contains any of the keywords
function containsKeywords(text, keywords) {
  if (!keywords || keywords.length === 0) return false;

  const lowerText = text.toLowerCase();
  return keywords.some(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    // Match whole words or common variations
    const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'i');
    return regex.test(lowerText);
  });
}

// Check if prompt matches any intent patterns
function matchesIntent(text, patterns) {
  if (!patterns || patterns.length === 0) return false;

  const lowerText = text.toLowerCase();
  return patterns.some(pattern => {
    const lowerPattern = pattern.toLowerCase();
    return lowerText.includes(lowerPattern);
  });
}

// Main hook logic
function analyzePrompt(prompt, contextFiles = []) {
  const rules = loadSkillRules();
  const suggestions = [];
  const blockingSkills = [];

  for (const skill of rules.skills || []) {
    let score = 0;
    let matchReasons = [];

    // Check keyword matches
    if (skill.triggers?.keywords) {
      if (containsKeywords(prompt, skill.triggers.keywords)) {
        score += 2;
        matchReasons.push('keyword match');
      }
    }

    // Check intent patterns
    if (skill.triggers?.intentPatterns) {
      if (matchesIntent(prompt, skill.triggers.intentPatterns)) {
        score += 3;
        matchReasons.push('intent match');
      }
    }

    // Check file context
    if (skill.triggers?.filePatterns && contextFiles.length > 0) {
      const matchingFiles = contextFiles.filter(file =>
        matchesFilePattern(file, skill.triggers.filePatterns)
      );

      if (matchingFiles.length > 0) {
        score += 2;
        matchReasons.push(`file context (${matchingFiles.length} files)`);

        // Check for exclusions
        if (skill.triggers.excludePatterns) {
          const excludedFiles = matchingFiles.filter(file =>
            matchesFilePattern(file, skill.triggers.excludePatterns)
          );

          if (excludedFiles.length === matchingFiles.length) {
            score = 0; // All matching files are excluded
            matchReasons = ['excluded by pattern'];
          }
        }
      }
    }

    // Add to suggestions if score is high enough
    if (score > 0) {
      const suggestion = {
        skillName: skill.name,
        description: skill.description,
        mode: skill.mode,
        priority: skill.priority,
        score,
        reasons: matchReasons
      };

      if (skill.mode === 'block') {
        blockingSkills.push(suggestion);
      } else {
        suggestions.push(suggestion);
      }
    }
  }

  // Sort by score (highest first)
  suggestions.sort((a, b) => b.score - a.score);

  return { suggestions, blockingSkills };
}

// Format the output message
function formatMessage(analysis) {
  const { suggestions, blockingSkills } = analysis;

  if (blockingSkills.length === 0 && suggestions.length === 0) {
    return null; // No suggestions
  }

  let message = '';

  // Handle blocking skills first
  if (blockingSkills.length > 0) {
    message += '⛔ **SKILL REQUIRED BEFORE PROCEEDING**\n\n';

    for (const skill of blockingSkills) {
      message += `**${skill.skillName}**\n`;
      message += `${skill.description}\n`;
      message += `Reason: ${skill.reasons.join(', ')}\n\n`;
      message += `Use: \`/skill ${skill.skillName}\` before making changes.\n\n`;
    }

    message += '---\n\n';
  }

  // Handle suggestions
  if (suggestions.length > 0 && suggestions.length <= 3) {
    message += '💡 **Suggested Skills** (based on your prompt and context):\n\n';

    const topSuggestions = suggestions.slice(0, 3);
    for (const skill of topSuggestions) {
      message += `• **${skill.skillName}** — ${skill.description}\n`;
      message += `  Match: ${skill.reasons.join(', ')}\n`;
      message += `  Use: \`/skill ${skill.skillName}\`\n\n`;
    }
  }

  return message.trim();
}

// Read JSON from stdin
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    });

    process.stdin.on('error', reject);
  });
}

// Main execution
async function main() {
  try {
    // Read input from stdin
    const input = await readStdin();

    // Extract prompt from input
    const userPrompt = input.prompt || '';

    // Extract context files if available (may be in input.files or similar)
    // For now, we'll default to empty array as the exact structure may vary
    const contextFiles = input.files || input.context_files || [];

    if (!userPrompt) {
      process.exit(0); // No prompt to analyze
    }

    const analysis = analyzePrompt(userPrompt, contextFiles);
    const message = formatMessage(analysis);

    if (message) {
      console.log(message);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Hook error: ${error.message}`);
    process.exit(0); // Don't fail the user's action
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzePrompt, formatMessage };
