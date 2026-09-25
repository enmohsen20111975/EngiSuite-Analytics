import type { Lesson, ExamQuestion } from '../../types';

const examQuestions: ExamQuestion[] = [
    {
      "id": 1,
      "domain": "Business & Management",
      "q": "Which KPI best measures equipment reliability?",
      "options": ["OEE", "MTBF", "MTTR", "Availability"],
      "answer": "MTBF",
      "explanation": "MTBF measures the average time between failures, a direct reliability metric."
    },
    {
      "id": 2,
      "domain": "Business & Management",
      "q": "What is the world-class benchmark for OEE?",
      "options": ["65%", "75%", "85%", "95%"],
      "answer": "85%",
      "explanation": "OEE ≥ 85% is considered world-class."
    },
    {
      "id": 3,
      "domain": "Business & Management",
      "q": "Life Cycle Costing (LCC) typically shows purchase costs as:",
      "options": ["10%", "20%", "50%", "80%"],
      "answer": "20%",
      "explanation": "Purchase ~20%, O&M ~80% over asset life."
    },
    {
      "id": 4,
      "domain": "Business & Management",
      "q": "Availability is approximated by:",
      "options": ["MTTR/(MTBF+MTTR)", "MTBF/(MTBF+MTTR)", "OEE × MTTR", "(MTBF-MTTR)/MTBF"],
      "answer": "MTBF/(MTBF+MTTR)",
      "explanation": "Availability ≈ MTBF/(MTBF+MTTR)."
    },
    {
      "id": 5,
      "domain": "Business & Management",
      "q": "Which factor is MOST important in aligning maintenance with corporate goals?",
      "options": ["ROI", "Spare parts", "Tools", "Cleaning"],
      "answer": "ROI",
      "explanation": "Corporate alignment is tied to return on investment and business value."
    },
    {
      "id": 6,
      "domain": "Business & Management",
      "q": "Which metric reflects maintainability?",
      "options": ["MTBF", "MTTR", "OEE", "Availability"],
      "answer": "MTTR",
      "explanation": "MTTR measures the ease and speed of restoring function."
    },
    {
      "id": 7,
      "domain": "Business & Management",
      "q": "What is the primary purpose of KPIs?",
      "options": ["Report only", "Identify bottlenecks & improve", "Replace planning", "Avoid audits"],
      "answer": "Identify bottlenecks & improve",
      "explanation": "KPIs highlight weaknesses to guide improvements."
    },
    {
      "id": 8,
      "domain": "Business & Management",
      "q": "Which of the following is a financial analysis method?",
      "options": ["RCM", "RCA", "LCC", "FMEA"],
      "answer": "LCC",
      "explanation": "Life Cycle Costing is a financial decision-making tool."
    },
    {
      "id": 9,
      "domain": "Business & Management",
      "q": "Which KPI links reliability and maintainability?",
      "options": ["Availability", "OEE", "MTBF", "MTTR"],
      "answer": "Availability",
      "explanation": "Availability depends on both MTBF (reliability) and MTTR (maintainability)."
    },
    {
      "id": 10,
      "domain": "Business & Management",
      "q": "Which is NOT part of OEE?",
      "options": ["Availability", "Performance", "Quality", "Safety"],
      "answer": "Safety",
      "explanation": "OEE = Availability × Performance × Quality."
    },
    {
      "id": 11,
      "domain": "Business & Management",
      "q": "Which company pioneered TPM?",
      "options": ["Toyota", "ExxonMobil", "GE", "IBM"],
      "answer": "Toyota",
      "explanation": "Toyota Production System integrated TPM to drive reliability."
    },
    {
      "id": 12,
      "domain": "Business & Management",
      "q": "Which tool is used to evaluate total cost of ownership?",
      "options": ["FMEA", "RCM", "LCC", "5 Whys"],
      "answer": "LCC",
      "explanation": "LCC evaluates total cost across asset lifecycle."
    },
    {
      "id": 13,
      "domain": "Business & Management",
      "q": "If repair > 60% of replacement cost, recommended decision?",
      "options": ["Repair", "Replace", "Ignore", "Delay"],
      "answer": "Replace",
      "explanation": "Rule-of-thumb: >60% repair cost justifies replacement."
    },
    {
      "id": 14,
      "domain": "Business & Management",
      "q": "Which equation represents Payback?",
      "options": [
        "Payback = Investment ÷ Annual Savings",
        "Payback = MTBF ÷ MTTR",
        "Payback = ROI × 100",
        "Payback = Cost × Time"
      ],
      "answer": "Payback = Investment ÷ Annual Savings",
      "explanation": "Payback shows time required to recover investment."
    },
    {
      "id": 15,
      "domain": "Business & Management",
      "q": "Which KPI reflects asset utilization?",
      "options": ["OEE", "ROI", "MTTR", "Risk"],
      "answer": "OEE",
      "explanation": "OEE quantifies effective utilization of equipment."
    },
    {
      "id": 16,
      "domain": "Business & Management",
      "q": "ISO 55000 relates to:",
      "options": ["Asset Management", "Quality", "Safety", "Risk"],
      "answer": "Asset Management",
      "explanation": "ISO 55000 provides framework for asset management systems."
    },
    {
      "id": 17,
      "domain": "Business & Management",
      "q": "Which metric shows effectiveness of PM compliance?",
      "options": ["Schedule Compliance", "Wrench Time", "MTBF", "NPV"],
      "answer": "Schedule Compliance",
      "explanation": "Schedule compliance indicates how well planned PM tasks are executed."
    },
    {
      "id": 18,
      "domain": "Business & Management",
      "q": "Which KPI is a lagging indicator?",
      "options": ["OEE", "MTBF", "Schedule Compliance", "PM Efficacy"],
      "answer": "OEE",
      "explanation": "OEE is a lagging metric reflecting past performance."
    },
    {
      "id": 19,
      "domain": "Business & Management",
      "q": "Which of the following is a leading indicator?",
      "options": ["PM Compliance", "MTBF", "Availability", "OEE"],
      "answer": "PM Compliance",
      "explanation": "Leading indicators drive future reliability."
    },
    {
      "id": 20,
      "domain": "Business & Management",
      "q": "Which metric reflects reliability growth?",
      "options": ["MTBF", "MTTR", "OEE", "LCC"],
      "answer": "MTBF",
      "explanation": "Higher MTBF indicates reliability improvement."
    },
    {
      "id": 21,
      "domain": "Manufacturing Process Reliability",
      "q": "Which method identifies functional failures and aligns tasks with risk?",
      "options": ["RCM", "FMEA", "RCA", "PdM"],
      "answer": "RCM",
      "explanation": "RCM ensures assets continue to meet user needs through structured analysis."
    },
    {
      "id": 22,
      "domain": "Manufacturing Process Reliability",
      "q": "RPN in FMEA is calculated as:",
      "options": ["S + O + D", "S × O × D", "S × O", "O × D"],
      "answer": "S × O × D",
      "explanation": "RPN = Severity × Occurrence × Detectability."
    },
    {
      "id": 23,
      "domain": "Manufacturing Process Reliability",
      "q": "Which RCA tool is also called Ishikawa?",
      "options": ["Fishbone Diagram", "5 Whys", "Fault Tree", "Pareto"],
      "answer": "Fishbone Diagram",
      "explanation": "Fishbone (Ishikawa) diagrams map cause-and-effect."
    },
    {
      "id": 24,
      "domain": "Manufacturing Process Reliability",
      "q": "Which RCA technique asks 'Why?' multiple times?",
      "options": ["FMEA", "RCM", "5 Whys", "Fault Tree"],
      "answer": "5 Whys",
      "explanation": "5 Whys is simple and effective for root cause analysis."
    },
    {
      "id": 25,
      "domain": "Manufacturing Process Reliability",
      "q": "PdM relies primarily on:",
      "options": ["Condition monitoring", "Run-to-failure", "Scheduled PM", "Inspections only"],
      "answer": "Condition monitoring",
      "explanation": "PdM uses sensors/data to predict failures."
    },
    {
      "id": 26,
      "domain": "Manufacturing Process Reliability",
      "q": "OEE =",
      "options": [
        "MTBF × MTTR",
        "Availability × Performance × Quality",
        "ROI × Risk",
        "MTBF ÷ MTTR"
      ],
      "answer": "Availability × Performance × Quality",
      "explanation": "OEE is the product of Availability, Performance, and Quality."
    },
    {
      "id": 27,
      "domain": "Manufacturing Process Reliability",
      "q": "Which analysis uses Fault Trees?",
      "options": ["RCA", "FMEA", "RCM", "PdM"],
      "answer": "RCA",
      "explanation": "Fault Tree is a structured RCA method."
    },
    {
      "id": 28,
      "domain": "Manufacturing Process Reliability",
      "q": "RCM first defines:",
      "options": ["Failure modes", "Asset functions", "Spare parts", "Costs"],
      "answer": "Asset functions",
      "explanation": "RCM begins with defining functions."
    },
    {
      "id": 29,
      "domain": "Manufacturing Process Reliability",
      "q": "Which method reduces warranty claims through failure analysis?",
      "options": ["FMEA", "PdM", "RCM", "LCC"],
      "answer": "FMEA",
      "explanation": "FMEA identifies potential design or process failures."
    },
    {
      "id": 30,
      "domain": "Manufacturing Process Reliability",
      "q": "Which KPI indicates process losses?",
      "options": ["OEE", "MTBF", "RPN", "ROI"],
      "answer": "OEE",
      "explanation": "OEE highlights Availability, Performance, and Quality losses."
    },
    {
      "id": 31,
      "domain": "Manufacturing Process Reliability",
      "q": "Which maintenance strategy waits until equipment fails before action?",
      "options": ["Corrective", "Preventive", "Predictive", "Proactive"],
      "answer": "Corrective",
      "explanation": "Corrective maintenance is performed after failure occurs."
    },
    {
      "id": 32,
      "domain": "Manufacturing Process Reliability",
      "q": "Weibull analysis is mainly used for:",
      "options": ["Spare part costs", "Failure distributions", "Planning manpower", "Financial ROI"],
      "answer": "Failure distributions",
      "explanation": "Weibull models time-to-failure data."
    },
    {
      "id": 33,
      "domain": "Manufacturing Process Reliability",
      "q": "Which indicator reflects process variability?",
      "options": ["Standard Deviation", "MTTR", "ROI", "NPV"],
      "answer": "Standard Deviation",
      "explanation": "Variability is measured statistically, often with σ."
    },
    {
      "id": 34,
      "domain": "Manufacturing Process Reliability",
      "q": "Which concept describes failures occurring early, random, or late life?",
      "options": ["Bathtub Curve", "Pareto Law", "RCM", "RCFA"],
      "answer": "Bathtub Curve",
      "explanation": "The bathtub curve explains infant, random, and wear-out failures."
    },
    {
      "id": 35,
      "domain": "Manufacturing Process Reliability",
      "q": "Which of the following is NOT a benefit of PdM?",
      "options": ["Reduced downtime", "Lower spares cost", "Elimination of all failures", "Improved reliability"],
      "answer": "Elimination of all failures",
      "explanation": "PdM reduces, but does not eliminate, failures."
    },
    {
      "id": 36,
      "domain": "Manufacturing Process Reliability",
      "q": "Which principle suggests 80% of problems come from 20% of causes?",
      "options": ["Weibull", "RCM", "Pareto", "5 Whys"],
      "answer": "Pareto",
      "explanation": "Pareto principle is widely used in reliability improvement."
    },
    {
      "id": 37,
      "domain": "Manufacturing Process Reliability",
      "q": "Which step in FMEA comes first?",
      "options": ["Calculate RPN", "List functions", "Identify effects", "Detectability rating"],
      "answer": "List functions",
      "explanation": "You must define functions before analyzing potential failures."
    },
    {
      "id": 38,
      "domain": "Manufacturing Process Reliability",
      "q": "Which analysis method asks 'what if' scenarios for failures?",
      "options": ["Fault Tree", "HAZOP", "5 Whys", "Pareto"],
      "answer": "HAZOP",
      "explanation": "HAZOP systematically explores deviations and their impacts."
    },
    {
      "id": 39,
      "domain": "Manufacturing Process Reliability",
      "q": "The main output of RCM analysis is:",
      "options": ["Work orders", "Risk register", "Maintenance tasks", "Audit reports"],
      "answer": "Maintenance tasks",
      "explanation": "RCM results in task selection for each failure mode."
    },
    {
      "id": 40,
      "domain": "Manufacturing Process Reliability",
      "q": "In FMEA, 'D' stands for:",
      "options": ["Downtime", "Detectability", "Durability", "Development"],
      "answer": "Detectability",
      "explanation": "RPN = Severity × Occurrence × Detectability."
    },
    {
      "id": 41,
      "domain": "Equipment Reliability",
      "q": "Which formula estimates Availability?",
      "options": ["A = MTBF/(MTBF+MTTR)", "A = MTTR/MTBF", "A = ROI × MTTR", "A = OEE × Q"],
      "answer": "A = MTBF/(MTBF+MTTR)",
      "explanation": "Availability is approximated by MTBF over total cycle time."
    },
    {
      "id": 42,
      "domain": "Equipment Reliability",
      "q": "Which failure pattern is most common in modern equipment?",
      "options": ["Random failures", "Infant mortality", "Wear-out", "Constant hazard"],
      "answer": "Random failures",
      "explanation": "Random failures dominate due to complexity and electronics."
    },
    {
      "id": 43,
      "domain": "Equipment Reliability",
      "q": "Which tool analyzes failure data to predict reliability?",
      "options": ["Weibull analysis", "RCM", "Pareto", "FMEA"],
      "answer": "Weibull analysis",
      "explanation": "Weibull analysis helps predict reliability and life expectancy."
    },
    {
      "id": 44,
      "domain": "Equipment Reliability",
      "q": "The bathtub curve phases are:",
      "options": ["Infant–Random–Wear-out", "Early–Middle–Late", "Low–Medium–High", "Risk–Reliability–Recovery"],
      "answer": "Infant–Random–Wear-out",
      "explanation": "The three phases define asset failure life cycle."
    },
    {
      "id": 45,
      "domain": "Equipment Reliability",
      "q": "MTTR is best interpreted as:",
      "options": ["Ease of repair", "Failure rate", "Performance loss", "OEE factor"],
      "answer": "Ease of repair",
      "explanation": "MTTR measures maintainability."
    },
    {
      "id": 46,
      "domain": "Equipment Reliability",
      "q": "Which metric is a direct measure of reliability?",
      "options": ["MTBF", "MTTR", "Availability", "OEE"],
      "answer": "MTBF",
      "explanation": "MTBF directly reflects mean time between failures."
    },
    {
      "id": 47,
      "domain": "Equipment Reliability",
      "q": "Which analysis is used to identify most critical assets?",
      "options": ["Criticality analysis", "5 Whys", "HAZOP", "RCFA"],
      "answer": "Criticality analysis",
      "explanation": "Criticality ranks assets by risk and importance."
    },
    {
      "id": 48,
      "domain": "Equipment Reliability",
      "q": "Predictive maintenance relies on:",
      "options": ["Condition monitoring", "Time-based PM", "Run-to-failure", "Luck"],
      "answer": "Condition monitoring",
      "explanation": "PdM predicts failures using data."
    },
    {
      "id": 49,
      "domain": "Equipment Reliability",
      "q": "Which metric is often used in reliability growth modeling?",
      "options": ["MTBF", "OEE", "NPV", "Payback"],
      "answer": "MTBF",
      "explanation": "MTBF indicates reliability improvement trends."
    },
    {
      "id": 50,
      "domain": "Equipment Reliability",
      "q": "Which KPI reflects downtime losses?",
      "options": ["Availability", "Quality", "OEE", "ROI"],
      "answer": "Availability",
      "explanation": "Availability drops when downtime increases."
    },
    {
      "id": 51,
      "domain": "Equipment Reliability",
      "q": "Which analysis determines economic replacement timing?",
      "options": ["LCC", "Payback", "NPV", "Criticality"],
      "answer": "LCC",
      "explanation": "Life Cycle Costing informs replacement decisions."
    },
    {
      "id": 52,
      "domain": "Equipment Reliability",
      "q": "Which model best describes electronic component failures?",
      "options": ["Exponential", "Normal", "Weibull", "Poisson"],
      "answer": "Exponential",
      "explanation": "Exponential model is common for constant failure rates."
    },
    {
      "id": 53,
      "domain": "Equipment Reliability",
      "q": "Which tool identifies hidden failures in protective devices?",
      "options": ["Failure Finding", "FMEA", "RCM", "HAZOP"],
      "answer": "Failure Finding",
      "explanation": "Failure finding tasks ensure protection systems work."
    },
    {
      "id": 54,
      "domain": "Equipment Reliability",
      "q": "The hazard rate is:",
      "options": ["Failure probability per unit time", "MTTR ratio", "OEE factor", "NPV factor"],
      "answer": "Failure probability per unit time",
      "explanation": "Hazard rate expresses instantaneous failure risk."
    },
    {
      "id": 55,
      "domain": "Equipment Reliability",
      "q": "What is the main benefit of Reliability Block Diagrams?",
      "options": ["Visualizing system reliability", "Spare parts tracking", "Wrench time analysis", "OEE reporting"],
      "answer": "Visualizing system reliability",
      "explanation": "RBDs show how component reliability affects system performance."
    },
    {
      "id": 56,
      "domain": "Equipment Reliability",
      "q": "Failure rate (λ) is typically the inverse of:",
      "options": ["MTBF", "MTTR", "OEE", "Availability"],
      "answer": "MTBF",
      "explanation": "λ = 1/MTBF for exponential distributions."
    },
    {
      "id": 57,
      "domain": "Equipment Reliability",
      "q": "Which reliability improvement method focuses on early design?",
      "options": ["Design for Reliability", "RCM", "RCFA", "PdM"],
      "answer": "Design for Reliability",
      "explanation": "DfR integrates reliability into design phase."
    },
    {
      "id": 58,
      "domain": "Equipment Reliability",
      "q": "RCFA stands for:",
      "options": ["Root Cause Failure Analysis", "Risk Cost Failure Assessment", "Random Component Failure Approach", "None"],
      "answer": "Root Cause Failure Analysis",
      "explanation": "RCFA investigates root causes of equipment failures."
    },
    {
      "id": 59,
      "domain": "Equipment Reliability",
      "q": "Which maintenance policy accepts failures and restores after?",
      "options": ["Run-to-failure", "Preventive", "Predictive", "RCM"],
      "answer": "Run-to-failure",
      "explanation": "Run-to-failure is valid for low-criticality assets."
    },
    {
      "id": 60,
      "domain": "Equipment Reliability",
      "q": "Which KPI shows proportion of planned vs unplanned work?",
      "options": ["Planned Work Ratio", "OEE", "MTBF", "NPV"],
      "answer": "Planned Work Ratio",
      "explanation": "Planned work ratio indicates proactive maintenance maturity."
    },
    {
      "id": 61,
      "domain": "Organization & Leadership",
      "q": "Which organizational structure combines central expertise with site accountability?",
      "options": ["Centralized", "Decentralized", "Matrix", "Flat"],
      "answer": "Matrix",
      "explanation": "Matrix balances expertise with local needs."
    },
    {
      "id": 62,
      "domain": "Organization & Leadership",
      "q": "Which leadership style emphasizes vision and inspiration?",
      "options": ["Transactional", "Transformational", "Servant", "Autocratic"],
      "answer": "Transformational",
      "explanation": "Transformational leaders motivate through vision."
    },
    {
      "id": 63,
      "domain": "Organization & Leadership",
      "q": "Kotter’s 8-step model is used for:",
      "options": ["FMEA", "Change Management", "Scheduling", "Budgeting"],
      "answer": "Change Management",
      "explanation": "Kotter’s model guides organizational change."
    },
    {
      "id": 64,
      "domain": "Organization & Leadership",
      "q": "Servant leadership prioritizes:",
      "options": ["Team growth and well-being", "Vision only", "Control", "Compliance"],
      "answer": "Team growth and well-being",
      "explanation": "Servant leaders empower their teams."
    },
    {
      "id": 65,
      "domain": "Organization & Leadership",
      "q": "Skills matrices are used to:",
      "options": ["Track competence", "Plan budgets", "Schedule downtime", "Measure ROI"],
      "answer": "Track competence",
      "explanation": "Skills matrices identify gaps and training needs."
    },
    {
      "id": 66,
      "domain": "Organization & Leadership",
      "q": "Which is NOT a leadership style?",
      "options": ["Transformational", "Transactional", "Predictive", "Servant"],
      "answer": "Predictive",
      "explanation": "Predictive is a maintenance strategy, not a leadership style."
    },
    {
      "id": 67,
      "domain": "Organization & Leadership",
      "q": "Centralized structures are best for:",
      "options": ["Standardization", "Local responsiveness", "Innovation", "None"],
      "answer": "Standardization",
      "explanation": "Centralization supports uniform practices."
    },
    {
      "id": 68,
      "domain": "Organization & Leadership",
      "q": "Decentralized structures are best for:",
      "options": ["Standardization", "Local responsiveness", "Cost savings", "Risk reduction"],
      "answer": "Local responsiveness",
      "explanation": "Decentralization aligns maintenance closely with production."
    },
    {
      "id": 69,
      "domain": "Organization & Leadership",
      "q": "Leadership affects reliability mainly through:",
      "options": ["Culture", "Spare parts", "Tools", "Budget only"],
      "answer": "Culture",
      "explanation": "Leadership sets the reliability culture."
    },
    {
      "id": 70,
      "domain": "Organization & Leadership",
      "q": "Which organization standard focuses on Asset Management?",
      "options": ["ISO 9001", "ISO 14001", "ISO 55000", "OSHA"],
      "answer": "ISO 55000",
      "explanation": "ISO 55000 is for Asset Management systems."
    },
    {
      "id": 71,
      "domain": "Organization & Leadership",
      "q": "Which is the best way to overcome resistance to change?",
      "options": ["Impose new rules", "Clear communication and involvement", "Ignore concerns", "Cut training"],
      "answer": "Clear communication and involvement",
      "explanation": "Change management requires stakeholder engagement and transparency."
    },
    {
      "id": 72,
      "domain": "Organization & Leadership",
      "q": "Which competency program improves multi-skilling?",
      "options": ["Skills matrix", "RCM", "5S", "Pareto"],
      "answer": "Skills matrix",
      "explanation": "Skills matrices identify gaps and support multi-skilling."
    },
    {
      "id": 73,
      "domain": "Organization & Leadership",
      "q": "A maintenance planner role should focus on:",
      "options": ["Emergency response", "Future work preparation", "Budget audits only", "Leadership appraisals"],
      "answer": "Future work preparation",
      "explanation": "Planners define resources and steps before execution."
    },
    {
      "id": 74,
      "domain": "Organization & Leadership",
      "q": "Which leadership style focuses on reward and punishment?",
      "options": ["Transformational", "Transactional", "Servant", "Autocratic"],
      "answer": "Transactional",
      "explanation": "Transactional leaders emphasize performance via reward/penalty."
    },
    {
      "id": 75,
      "domain": "Organization & Leadership",
      "q": "Which KPI is most linked to workforce capability?",
      "options": ["Skills Index", "OEE", "MTTR", "NPV"],
      "answer": "Skills Index",
      "explanation": "Skills indices quantify training and capability maturity."
    },
    {
      "id": 76,
      "domain": "Work Management",
      "q": "Which system is the backbone of work management?",
      "options": ["ERP", "CMMS", "MES", "PLC"],
      "answer": "CMMS",
      "explanation": "A CMMS manages work orders, assets, labor, and spares."
    },
    {
      "id": 77,
      "domain": "Work Management",
      "q": "Which step comes FIRST in work management?",
      "options": ["Execution", "Feedback", "Identification", "Scheduling"],
      "answer": "Identification",
      "explanation": "Work management starts with identifying work needs."
    },
    {
      "id": 78,
      "domain": "Work Management",
      "q": "Which role ensures work is planned with resources?",
      "options": ["Planner", "Scheduler", "Technician", "Manager"],
      "answer": "Planner",
      "explanation": "Planners define scope, parts, and labor."
    },
    {
      "id": 79,
      "domain": "Work Management",
      "q": "Which KPI measures execution discipline?",
      "options": ["Schedule Compliance", "Wrench Time", "OEE", "ROI"],
      "answer": "Schedule Compliance",
      "explanation": "Schedule compliance shows how well the plan is followed."
    },
    {
      "id": 80,
      "domain": "Work Management",
      "q": "Wrench Time measures:",
      "options": ["Tool use", "Hands-on work time", "Spare part cost", "Downtime hours"],
      "answer": "Hands-on work time",
      "explanation": "Wrench time is % of technician time on actual work."
    },
    {
      "id": 81,
      "domain": "Work Management",
      "q": "Which feedback is most useful after job completion?",
      "options": ["Failure cause", "Actual hours", "Parts used", "All of the above"],
      "answer": "All of the above",
      "explanation": "Feedback improves data accuracy for analysis."
    },
    {
      "id": 82,
      "domain": "Work Management",
      "q": "Which is NOT a benefit of planning?",
      "options": ["Reduced downtime", "Improved wrench time", "Elimination of all failures", "Better resource use"],
      "answer": "Elimination of all failures",
      "explanation": "Planning improves efficiency but does not eliminate failures."
    },
    {
      "id": 83,
      "domain": "Work Management",
      "q": "Which metric reflects backlog health?",
      "options": ["Backlog Size in weeks", "MTBF", "NPV", "ROI"],
      "answer": "Backlog Size in weeks",
      "explanation": "Backlog is measured in labor-weeks of work pending."
    },
    {
      "id": 84,
      "domain": "Work Management",
      "q": "Which meeting aligns daily priorities?",
      "options": ["Weekly planning", "Daily toolbox talk", "Annual review", "KPI dashboard"],
      "answer": "Daily toolbox talk",
      "explanation": "Daily meetings align operations and maintenance."
    },
    {
      "id": 85,
      "domain": "Work Management",
      "q": "Frozen weekly schedules are used to:",
      "options": ["Stabilize execution", "Increase flexibility only", "Reduce CMMS use", "Delay PM"],
      "answer": "Stabilize execution",
      "explanation": "Frozen schedules improve discipline and reduce changes."
    },
    {
      "id": 86,
      "domain": "Work Management",
      "q": "Which ratio shows planned vs unplanned jobs?",
      "options": ["Planned Work Ratio", "Schedule Compliance", "OEE", "ROI"],
      "answer": "Planned Work Ratio",
      "explanation": "It reflects the maturity of proactive maintenance."
    },
    {
      "id": 87,
      "domain": "Work Management",
      "q": "Which feedback loop drives continuous improvement?",
      "options": ["Plan–Do–Check–Act", "Buy–Use–Dispose", "Check–Audit–Report", "Fail–Fix–Forget"],
      "answer": "Plan–Do–Check–Act",
      "explanation": "PDCA ensures continuous improvement."
    },
    {
      "id": 88,
      "domain": "Work Management",
      "q": "Which KPI measures if PMs are done on time?",
      "options": ["PM Compliance", "OEE", "Availability", "ROI"],
      "answer": "PM Compliance",
      "explanation": "PM compliance tracks timely preventive maintenance completion."
    },
    {
      "id": 89,
      "domain": "Work Management",
      "q": "Which case study showed backlog reduction via weekly scheduling?",
      "options": ["Refinery", "Pharmaceutical", "Mining", "Power Plant"],
      "answer": "Pharmaceutical",
      "explanation": "Pharma achieved 30% backlog reduction with weekly scheduling."
    },
    {
      "id": 90,
      "domain": "Work Management",
      "q": "Which analysis ensures CMMS data accuracy?",
      "options": ["Work feedback", "KPI dashboard", "OEE charting", "FMEA"],
      "answer": "Work feedback",
      "explanation": "Accurate feedback improves CMMS data integrity."
    },
    {
      "id": 91,
      "domain": "Work Management",
      "q": "Which of the following is a work identification source?",
      "options": ["Operator inspection", "PdM alerts", "Safety audits", "All of the above"],
      "answer": "All of the above",
      "explanation": "Work requests arise from multiple sources."
    },
    {
      "id": 92,
      "domain": "Work Management",
      "q": "Which role balances labor vs downtime windows?",
      "options": ["Scheduler", "Planner", "Technician", "Operator"],
      "answer": "Scheduler",
      "explanation": "Schedulers match workload with available capacity."
    },
    {
      "id": 93,
      "domain": "Work Management",
      "q": "Which KPI reflects technician utilization?",
      "options": ["Wrench Time", "MTBF", "ROI", "LCC"],
      "answer": "Wrench Time",
      "explanation": "Wrench time is technician effectiveness."
    },
    {
      "id": 94,
      "domain": "Work Management",
      "q": "Which system integrates work management with enterprise processes?",
      "options": ["ERP", "PLC", "MES", "None"],
      "answer": "ERP",
      "explanation": "ERP connects CMMS with finance and supply chain."
    },
    {
      "id": 95,
      "domain": "Work Management",
      "q": "What does backlog > 4 weeks indicate?",
      "options": ["Healthy", "Overloaded", "Underutilized", "Irrelevant"],
      "answer": "Overloaded",
      "explanation": "Excessive backlog signals resource strain."
    },
    {
      "id": 96,
      "domain": "Work Management",
      "q": "Which KPI reflects percentage of planned jobs executed?",
      "options": ["Schedule Compliance", "Planned Work Ratio", "OEE", "ROI"],
      "answer": "Schedule Compliance",
      "explanation": "It measures how well planned work is completed."
    },
    {
      "id": 97,
      "domain": "Work Management",
      "q": "Which is the FIRST step in the PDCA cycle?",
      "options": ["Plan", "Do", "Check", "Act"],
      "answer": "Plan",
      "explanation": "PDCA starts with planning improvement actions."
    },
    {
      "id": 98,
      "domain": "Work Management",
      "q": "Which KPI measures preventive maintenance execution?",
      "options": ["PM Compliance", "MTTR", "MTBF", "ROI"],
      "answer": "PM Compliance",
      "explanation": "It tracks adherence to preventive schedules."
    },
    {
      "id": 99,
      "domain": "Work Management",
      "q": "What is the main benefit of backlog analysis?",
      "options": ["Prioritize resources", "Increase MTTR", "Cut ROI", "Ignore PM"],
      "answer": "Prioritize resources",
      "explanation": "Backlog analysis helps resource allocation."
    },
    {
      "id": 100,
      "domain": "Work Management",
      "q": "Which of the following completes the work management cycle?",
      "options": ["Feedback", "Execution", "Planning", "Scheduling"],
      "answer": "Feedback",
      "explanation": "Feedback closes the loop and informs continuous improvement."
    }
];

export const examBankModule: Lesson = {
    id: 'cmrp-8',
    title: 'Interactive: 100-Question Exam Bank',
    prompt: '',
    moduleType: 'examBank',
    objectives: ["Assess your knowledge across all five pillars of the CMRP Body of Knowledge.", "Simulate the exam experience to identify strengths and weaknesses.", "Review detailed explanations for each question to solidify your understanding."],
    questions: examQuestions,
};