/**
 * VALIDATION
 * Checks questions.js when the app starts. Anything wrong is listed on the
 * host panel in red, so you find a typo during setup and not mid-show.
 */

import { LETTERS, questionCount } from './gameEngine.js';
import { settings as defaultSettings } from '../data/settings.js';

/**
 * Returns { errors: string[], warnings: string[] }.
 * Errors are broken data. Warnings are "this looks unintended but will run".
 */
export function validateTeams(teams, settings = defaultSettings) {
  const errors = [];
  const warnings = [];
  const seenQuestionIds = new Set();
  const seenTeamIds = new Set();
  const expectedQuestions = questionCount(settings);

  if (!Array.isArray(teams) || teams.length === 0) {
    errors.push('No pairs found in src/data/questions.js.');
    return { errors, warnings };
  }

  if (teams.length !== settings.expectedTeamCount) {
    warnings.push(
      `questions.js has ${teams.length} pair(s) but settings.js expects ` +
        `${settings.expectedTeamCount}. The game will run with ${teams.length}.`
    );
  }

  teams.forEach((team, teamIndex) => {
    const label = team && team.name ? `"${team.name}"` : `pair ${teamIndex + 1}`;

    if (!team.id) {
      errors.push(`${label} has no id.`);
    } else if (seenTeamIds.has(team.id)) {
      errors.push(`Duplicate pair id "${team.id}".`);
    } else {
      seenTeamIds.add(team.id);
    }

    if (!Array.isArray(team.questions)) {
      errors.push(`${label} has no questions array.`);
      return;
    }

    if (team.questions.length !== expectedQuestions) {
      errors.push(
        `${label} has ${team.questions.length} questions — it needs exactly ${expectedQuestions}.`
      );
    }

    team.questions.forEach((question, qIndex) => {
      const where = `${label}, question ${qIndex + 1}`;

      if (!question.id) {
        errors.push(`${where}: missing id.`);
      } else if (seenQuestionIds.has(question.id)) {
        errors.push(`${where}: duplicate id "${question.id}".`);
      } else {
        seenQuestionIds.add(question.id);
      }

      if (!question.question || !String(question.question).trim()) {
        errors.push(`${where}: question text is empty.`);
      }

      const answers = question.answers || {};
      LETTERS.forEach((letter) => {
        if (!answers[letter] || !String(answers[letter]).trim()) {
          errors.push(`${where}: answer ${letter} is missing.`);
        }
      });

      if (!LETTERS.includes(question.correctAnswer)) {
        errors.push(
          `${where}: correctAnswer is "${question.correctAnswer}" — it must be A, B, C or D.`
        );
      }

      const expectedValue = settings.prizeLadder[qIndex];
      if (typeof question.value !== 'number') {
        errors.push(`${where}: value must be a number.`);
      } else if (question.value !== expectedValue) {
        errors.push(
          `${where}: value is ${question.value} but the prize ladder says ${expectedValue}.`
        );
      }
    });
  });

  return { errors, warnings };
}
