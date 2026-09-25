import type { Lesson, CaseStudy } from '../../types';

const caseStudies: CaseStudy[] = [
    {
        "id": 1,
        "domain": "Process (Predictive)",
        "industry": "Construction",
        "title": "The Shard, London – Predictive Project Management",
        "summary": "Managing extreme complexity and risk in a large-scale construction project using a predictive approach.",
        "details": [
            "A detailed Work Breakdown Structure (WBS) was critical for scope definition.",
            "Critical Path Method (CPM) was used to manage a highly complex schedule.",
            "Rigorous risk management process with contingency planning for weather and supply chain issues.",
            "Formal change control was essential to manage scope creep and cost overruns."
        ],
        "image": "https://i.ibb.co/gZ7KqW8/the-shard.png"
    },
    {
        "id": 2,
        "domain": "People (Agile)",
        "industry": "Software/Music",
        "title": "Spotify – Agile at Scale",
        "summary": "Pioneering the 'Spotify Model' of autonomous squads, tribes, chapters, and guilds to foster innovation.",
        "details": [
            "Emphasized team autonomy and servant leadership over command-and-control.",
            "Used an adaptive, iterative approach to software development, allowing for rapid response to user feedback.",
            "Organizational structure designed to facilitate communication and knowledge sharing.",
            "Focus on team health and psychological safety as a key performance metric."
        ],
        "image": "https://i.ibb.co/s5JdvyN/spotify-agile.png"
    },
    {
        "id": 3,
        "domain": "Business Environment",
        "industry": "Healthcare",
        "title": "NHS Digital – Electronic Health Record System",
        "summary": "A case study in project failure due to a disconnect with the business environment and poor benefits realization.",
        "details": [
            "The project failed to adequately engage key stakeholders (doctors, nurses).",
            "The benefits management plan was weak, focusing on technology rollout rather than clinical outcomes.",
            "Massive organizational change was required but not managed effectively, leading to low adoption.",
            "Demonstrated that technical success does not guarantee project success if business value isn't delivered."
        ],
        "image": "https://i.ibb.co/2gCqCgK/nhs-digital.png"
    },
    {
      "id": 4,
      "domain": "Process (Risk Management)",
      "industry": "Energy",
      "title": "Deepwater Horizon – Catastrophic Risk Failure",
      "summary": "An analysis of the failures in risk identification, assessment, and response leading to the disaster.",
      "details": [
        "Risks were identified but their probabilities and impacts were consistently underestimated (Qualitative Analysis failure).",
        "The risk response plan prioritized schedule and cost over safety (Inappropriate Strategy).",
        "Contingency plans for a blowout were inadequate, showing a failure to plan for high-impact threats.",
        "A case study in how a weak risk management culture can lead to catastrophic project failure."
      ],
      "image": "https://i.ibb.co/r20CqgP/deepwater-horizon.png"
    }
];

export const caseStudiesModule: Lesson = {
    id: 'pmp-5',
    title: 'Interactive: Case Studies',
    prompt: '',
    moduleType: 'caseStudies',
    objectives: [
        "Analyze real-world projects through the lens of the PMP domains.",
        "Evaluate the application of predictive, agile, and hybrid methodologies.",
        "Connect project outcomes to successes or failures in stakeholder engagement, risk management, and benefits realization."
    ],
    cases: caseStudies,
};