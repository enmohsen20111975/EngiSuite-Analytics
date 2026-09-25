import type { Lesson, Flashcard } from '../../types';

const flashcards: Flashcard[] = [
    {
      "id": 1,
      "domain": "Business & Management",
      "q": "What does MTBF stand for?",
      "a": "Mean Time Between Failures"
    },
    {
      "id": 2,
      "domain": "Business & Management",
      "q": "OEE = ?",
      "a": "Availability × Performance × Quality"
    },
    {
      "id": 3,
      "domain": "Business & Management",
      "q": "What % is usually purchase cost vs O&M in LCC?",
      "a": "Purchase ~20%, O&M ~80%"
    },
    {
      "id": 4,
      "domain": "Manufacturing Process Reliability",
      "q": "What does RPN stand for?",
      "a": "Risk Priority Number (Severity × Occurrence × Detectability)"
    },
    {
      "id": 5,
      "domain": "Manufacturing Process Reliability",
      "q": "Which RCA tool is also called Ishikawa?",
      "a": "Fishbone Diagram"
    },
    {
      "id": 6,
      "domain": "Manufacturing Process Reliability",
      "q": "Which method aligns maintenance tasks with failure modes?",
      "a": "Reliability-Centered Maintenance (RCM)"
    },
    {
      "id": 7,
      "domain": "Equipment Reliability",
      "q": "Formula for Availability?",
      "a": "A = MTBF / (MTBF + MTTR)"
    },
    {
      "id": 8,
      "domain": "Equipment Reliability",
      "q": "Which curve shows infant, random, and wear-out failures?",
      "a": "Bathtub Curve"
    },
    {
      "id": 9,
      "domain": "Equipment Reliability",
      "q": "Failure rate λ = ?",
      "a": "λ = 1 ÷ MTBF"
    },
    {
      "id": 10,
      "domain": "Organization & Leadership",
      "q": "Which leadership style inspires with vision?",
      "a": "Transformational Leadership"
    },
    {
      "id": 11,
      "domain": "Organization & Leadership",
      "q": "Kotter’s 8 Steps are used for?",
      "a": "Change Management"
    },
    {
      "id": 12,
      "domain": "Organization & Leadership",
      "q": "What is a Skills Matrix used for?",
      "a": "Tracking workforce competence and training needs"
    },
    {
      "id": 13,
      "domain": "Work Management",
      "q": "Which system is backbone of work management?",
      "a": "CMMS (Computerized Maintenance Management System)"
    },
    {
      "id": 14,
      "domain": "Work Management",
      "q": "Schedule Compliance = ?",
      "a": "(Completed Planned Jobs ÷ Total Planned Jobs) × 100%"
    },
    {
      "id": 15,
      "domain": "Work Management",
      "q": "Wrench Time measures?",
      "a": "Percentage of technician time spent on actual hands-on work"
    },
    {
      "id": 16,
      "domain": "Work Management",
      "q": "What closes the Work Management loop?",
      "a": "Feedback"
    }
];

export const flashcardsModule: Lesson = {
    id: 'cmrp-9',
    title: 'Interactive: Flashcards',
    prompt: '',
    moduleType: 'flashcards',
    objectives: ["Memorize key terms, acronyms, and definitions.", "Quickly test your recall of essential CMRP concepts.", "Use an active recall method to improve long-term memory retention."],
    flashcards: flashcards,
};