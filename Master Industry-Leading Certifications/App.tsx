

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LoadingSpinner, MoonIcon, SunIcon, BookOpenIcon, SparklesIcon, ClipboardCheckIcon, CreditCardIcon, CalculatorIcon } from './components/icons';
import * as Visuals from './components/visuals';
import { courses } from './data/courses';
import type { Course, Lesson, ContentBlock, QuizContent, VisualComponentType, CaseStudy, Cheatsheet, ExamQuestion, Flashcard, Formula } from './data/types';


// --- Reusable Header Component with Theme Toggle ---
const Header: React.FC<{ theme: 'dark' | 'light'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Maintenance Mastery Academy</h1>
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center h-8 w-14 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle dark mode"
      >
        <span
          className={`${
            theme === 'light' ? 'translate-x-1' : 'translate-x-7'
          } inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 flex items-center justify-center`}
        >
          {theme === 'light' ? <SunIcon /> : <MoonIcon />}
        </span>
      </button>
    </header>
  );
};


// --- Reusable Quiz Block Component ---
const QuizBlock: React.FC<{ block: QuizContent }> = ({ block }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }

  const getOptionClass = (index: number) => {
    if (!isSubmitted) {
      return `border-slate-300 dark:border-slate-600 ${selectedAnswer === index ? 'bg-blue-500 dark:bg-blue-800 ring-2 ring-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`;
    }
    if (index === block.correctAnswerIndex) {
      return 'border-green-500 bg-green-100 dark:bg-green-900/50 ring-2 ring-green-500 text-green-800 dark:text-green-300';
    }
    if (index === selectedAnswer) {
      return 'border-red-500 bg-red-100 dark:bg-red-900/50 ring-2 ring-red-500 text-red-800 dark:text-red-300';
    }
    return 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 opacity-60';
  };

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 my-6">
      <h4 className="font-bold text-lg mb-4 text-slate-800 dark:text-gray-200">{block.question}</h4>
      <div className="space-y-3">
        {block.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !isSubmitted && setSelectedAnswer(index)}
            disabled={isSubmitted}
            className={`w-full text-left p-3 border rounded-md transition-all duration-200 ${getOptionClass(index)}`}
          >
            {option}
          </button>
        ))}
      </div>
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-md"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-4 animate-pop-in">
          <div className={`p-4 rounded-md ${selectedAnswer === block.correctAnswerIndex ? 'bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'}`}>
            <p className="font-bold text-lg mb-2">{selectedAnswer === block.correctAnswerIndex ? 'Correct!' : 'Incorrect'}</p>
            <p className="text-slate-700 dark:text-gray-300">{block.explanation}</p>
          </div>
           <button onClick={handleReset} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">Try Again</button>
        </div>
      )}
    </div>
  );
};

// --- NEW INTERACTIVE MODULE COMPONENTS ---

const FlashcardsViewer: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        // Use a short timeout to allow the flip back animation to start before changing content
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % flashcards.length), 100);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length), 100);
    };
    
    const card = flashcards[currentIndex];

    return (
        <div className="flex flex-col items-center p-4">
            <div className="w-full max-w-lg h-64 [perspective:1000px]">
                <button
                    type="button"
                    aria-label={`Flip card. Showing ${isFlipped ? 'answer' : 'question'}.`}
                    className="relative w-full h-full p-0 bg-transparent border-none [transform-style:preserve-3d] transition-transform duration-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-blue-500"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center p-6 text-center">
                        <p className="text-xl font-semibold text-slate-800 dark:text-gray-200">{card.q}</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-center p-6 text-center">
                        <p className="text-lg text-slate-700 dark:text-gray-300">{card.a}</p>
                    </div>
                </button>
            </div>
            <div className="mt-6 flex items-center justify-between w-full max-w-lg">
                <button onClick={handlePrev} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-md">&larr; Prev</button>
                <span className="text-sm text-slate-500 dark:text-gray-400">{currentIndex + 1} / {flashcards.length}</span>
                <button onClick={handleNext} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-md">Next &rarr;</button>
            </div>
        </div>
    );
};

const ExamBankViewer: React.FC<{ questions: ExamQuestion[] }> = ({ questions }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questions[currentIndex];
    const selectedOption = answers[currentQuestion.id] ?? null;

    const handleSelectOption = (optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };
    
    const handleRestart = () => {
        setCurrentIndex(0);
        setAnswers({});
        setIsFinished(false);
    }
    
    const score = useMemo(() => {
        if (!isFinished) return 0;
        return questions.reduce((correct, q) => {
            const userAnswer = answers[q.id];
            const correctAnswerIndex = q.options.indexOf(q.answer);
            return userAnswer === correctAnswerIndex ? correct + 1 : correct;
        }, 0);
    }, [isFinished, answers, questions]);

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="p-4 text-center">
                <h3 className="text-2xl font-bold mb-4">Exam Complete!</h3>
                <p className="text-4xl font-bold mb-2">{percentage}%</p>
                <p className="text-lg text-slate-600 dark:text-gray-300 mb-6">You answered {score} out of {questions.length} questions correctly.</p>
                <button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Try Again</button>
                <div className="mt-8 text-left space-y-4">
                    {questions.map(q => {
                        const userAnswerIndex = answers[q.id] ?? -1;
                        const correctAnswerIndex = q.options.indexOf(q.answer);
                        const isCorrect = userAnswerIndex === correctAnswerIndex;
                        return (
                           <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'}`}>
                                <p className="font-semibold text-slate-800 dark:text-gray-200">{q.id}. {q.q}</p>
                                <p className={`mt-2 text-sm ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                    Your answer: {userAnswerIndex > -1 ? q.options[userAnswerIndex] : 'Not answered'} {isCorrect ? ' (Correct)' : `(Incorrect)`}
                                </p>
                                {!isCorrect && <p className="text-sm text-slate-600 dark:text-gray-400">Correct answer: {q.answer}</p>}
                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">{q.explanation}</p>
                           </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4 text-sm text-slate-500 dark:text-gray-400 flex justify-between">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="font-semibold">{currentQuestion.domain}</span>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-lg mb-4 text-slate-800 dark:text-gray-200">{currentQuestion.q}</h4>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectOption(index)}
                            className={`w-full text-left p-3 border rounded-md transition-all duration-200 ${selectedOption === index ? 'bg-blue-500 dark:bg-blue-800 ring-2 ring-blue-500 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className="mt-6 float-right bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-md"
            >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'}
            </button>
        </div>
    );
};

const FilterableGrid: React.FC<{ items: Array<{ domain: string, title: string }>, children: (filteredItems: any[]) => React.ReactNode }> = ({ items, children }) => {
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    const domains = useMemo(() => ['All', ...Array.from(new Set(items.map(item => item.domain)))], [items]);
    
    const filteredItems = useMemo(() => {
        if (!selectedDomain || selectedDomain === 'All') return items;
        return items.filter(item => item.domain === selectedDomain);
    }, [items, selectedDomain]);

    return (
        <div>
            <div className="mb-6 flex flex-wrap gap-2">
                {domains.map(domain => (
                    <button
                        key={domain}
                        onClick={() => setSelectedDomain(domain === 'All' ? null : domain)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedDomain === domain || (domain === 'All' && !selectedDomain) ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                    >
                        {domain}
                    </button>
                ))}
            </div>
            {children(filteredItems)}
        </div>
    );
}

const CaseStudiesViewer: React.FC<{ cases: CaseStudy[] }> = ({ cases }) => (
    <FilterableGrid items={cases}>
        {(filteredCases) => (
            <div className="space-y-6">
                {filteredCases.map(c => (
                    <div key={c.id} className="grid md:grid-cols-3 gap-6 items-start bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="md:col-span-1">
                            <img src={c.image} alt={c.title} className="rounded-lg aspect-video object-cover w-full" />
                            <h4 className="font-bold text-lg mt-3 text-slate-800 dark:text-gray-200">{c.title}</h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">{c.industry}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-slate-600 dark:text-gray-400 mb-3">{c.summary}</p>
                            <ul className="space-y-2 list-disc list-inside text-sm text-slate-700 dark:text-gray-300">
                                {c.details.map((detail, i) => <li key={i}>{detail}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </FilterableGrid>
);

const CheatsheetsViewer: React.FC<{ cheatsheets: Cheatsheet[] }> = ({ cheatsheets }) => (
    <FilterableGrid items={cheatsheets}>
        {(filteredCheatsheets) => (
            <div className="grid md:grid-cols-2 gap-6">
                {filteredCheatsheets.map(c => (
                     <div key={c.id} className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <img src={c.image} alt={c.title} className="rounded-lg aspect-video object-contain w-full bg-white dark:bg-slate-800 p-2" />
                        <h4 className="font-bold text-lg mt-3 text-slate-800 dark:text-gray-200">{c.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">{c.summary}</p>
                        <ul className="space-y-1 text-sm text-slate-700 dark:text-gray-300">
                            {c.highlights.map((h, i) => <li key={i} className="flex items-start"><span className="text-blue-500 mr-2">&bull;</span><span>{h}</span></li>)}
                        </ul>
                    </div>
                ))}
            </div>
        )}
    </FilterableGrid>
);

const FormulasViewer: React.FC<{ formulas: Formula[] }> = ({ formulas }) => (
    <FilterableGrid items={formulas}>
        {(filteredFormulas) => (
            <div className="space-y-6">
                 {filteredFormulas.map(f => (
                    <div key={f.id} className="grid md:grid-cols-3 gap-6 items-start bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="md:col-span-1">
                             <img src={f.image} alt={f.title} className="rounded-lg aspect-video object-contain w-full bg-white dark:bg-slate-800 p-2" />
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="font-bold text-lg text-slate-800 dark:text-gray-200">{f.title}</h4>
                            <p className="font-mono text-blue-600 dark:text-blue-400 my-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-md text-center">{f.formula}</p>
                            <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">{f.description}</p>
                            <p className="text-sm text-slate-700 dark:text-gray-300 p-2 bg-slate-100 dark:bg-slate-900/50 rounded"><span className="font-semibold">Example:</span> {f.example}</p>
                        </div>
                    </div>
                 ))}
            </div>
        )}
    </FilterableGrid>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default theme
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const [view, setView] = useState<'landing' | 'courses' | 'lessons' | 'content'>('landing');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string>('');

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setView('lessons');
  };

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    if (lesson.isComingSoon) return;
    setView('content');
    setSelectedLesson(lesson);
    window.scrollTo(0, 0);
  }, []);

  const handleBack = (targetView: 'courses' | 'lessons') => {
    setError('');
    setSelectedLesson(null);
    if (targetView === 'courses') {
      setSelectedCourse(null);
    }
    setView(targetView);
  };
  
  const renderBreadcrumbs = () => (
    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      <button type="button" className="hover:text-blue-600 dark:hover:text-blue-300" onClick={() => handleBack('courses')}>Courses</button>
      {selectedCourse && (
        <>
          <span className="mx-2">&gt;</span>
          <button type="button" className={`${view !== 'content' ? 'text-slate-900 dark:text-white font-semibold' : 'hover:text-blue-600 dark:hover:text-blue-300'}`} onClick={() => view === 'content' && handleBack('lessons')}>
            {selectedCourse.title}
          </button>
        </>
      )}
      {selectedLesson && view === 'content' && (
        <>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-900 dark:text-white font-semibold">{selectedLesson.title}</span>
        </>
      )}
    </div>
  );

  const renderLandingPage = () => (
    <div className="animate-fade-in text-center flex flex-col items-center justify-center w-full">
      <header className="py-8">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 leading-tight">
            Unlock Your Potential in Maintenance & Reliability
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto mt-4">
            Training for CMRP, CAMA, CRE, & PMP certifications. Master complex topics with interactive lessons.
          </p>
          <button onClick={() => setView('courses')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
            Explore Courses
          </button>
      </header>
      
      <div className="my-16 w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white">The Smarter Way to Study</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-slate-100/40 dark:bg-slate-800/40 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
             <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">Pre-Built Expert Content</h3>
             <p className="text-slate-600 dark:text-gray-400">Get instant access to detailed lessons, curated by experts and designed for certification success.</p>
          </div>
          <div className="bg-slate-100/40 dark:bg-slate-800/40 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
             <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">Interactive Study Tools</h3>
             <p className="text-slate-600 dark:text-gray-400">Test your knowledge with exam banks, flashcards, case studies, and quizzes to reinforce learning.</p>
          </div>
          <div className="bg-slate-100/40 dark:bg-slate-800/40 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
             <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">Comprehensive Coverage</h3>
             <p className="text-slate-600 dark:text-gray-400">From CMRP's 5 pillars to PMP's process domains, get the in-depth knowledge you need to excel.</p>
          </div>
        </div>
      </div>

      <div className="my-16 w-full">
         <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white">Master Industry-Leading Certifications</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <button type="button" key={course.id} onClick={() => handleSelectCourse(course)} className="w-full text-left bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 transition-all duration-300 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-2xl dark:hover:shadow-blue-900/40 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">{course.title}</h3>
                <p className="text-slate-600 dark:text-gray-400">{course.description}</p>
              </button>
            ))}
          </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Available Courses</h2>
        <button onClick={() => setView('landing')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Home</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <button type="button" key={course.id} onClick={() => handleSelectCourse(course)} className="w-full text-left bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 transition-all duration-300 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-2xl dark:hover:shadow-blue-900/40 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">{course.title}</h3>
            <p className="text-slate-600 dark:text-gray-400">{course.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
  
  const moduleIcons: Record<string, React.FC> = {
    caseStudies: BookOpenIcon,
    cheatsheets: SparklesIcon,
    examBank: ClipboardCheckIcon,
    flashcards: CreditCardIcon,
    formulas: CalculatorIcon,
  };

  const renderLessons = () => (
    <div className="animate-fade-in">
      {renderBreadcrumbs()}
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">{selectedCourse?.title}</h2>
      <div className="space-y-4">
        {selectedCourse?.lessons.map((lesson) => {
          const Icon = lesson.moduleType ? moduleIcons[lesson.moduleType] : BookOpenIcon; // Default to BookOpenIcon for standard lessons
          const isComingSoon = lesson.isComingSoon ?? false;

          if (isComingSoon) {
            return (
              <div key={lesson.id} className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-not-allowed flex justify-between items-center opacity-60">
                <div className="flex items-center">
                   {Icon && <span className="mr-4 text-gray-400 dark:text-gray-500"><Icon /></span>}
                   <span className="text-lg text-gray-400 dark:text-gray-500">{lesson.title}</span>
                </div>
                <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">Coming Soon</span>
              </div>
            );
          }

          return (
            <button type="button" key={lesson.id} onClick={() => handleSelectLesson(lesson)} className="w-full text-left bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-all duration-300 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center transform hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="flex items-center">
                {Icon && <span className="mr-4 text-blue-500 dark:text-blue-400"><Icon /></span>}
                <span className="text-lg text-slate-700 dark:text-gray-200">{lesson.title}</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400">&rarr;</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const visualComponentsMap: Record<VisualComponentType, React.FC<any>> = Visuals;

  const renderContentBlock = (block: ContentBlock, index: number) => {
    // Use a custom animation class defined in index.html
    const animationClass = 'animate-fade-in-up';
    const animationStyle = { animationDelay: `${index * 100}ms`, opacity: 0 };
  
    switch (block.type) {
      case 'text':
        return <div key={index} className={animationClass} style={animationStyle}><div className="my-4 text-slate-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: block.body }}></div></div>;
      case 'quiz':
        return <div key={index} className={animationClass} style={animationStyle}><QuizBlock block={block} /></div>;
      case 'visual': {
          const VisualComponent = visualComponentsMap[block.component];
          return VisualComponent ? (
              <div key={index} className={`${animationClass} my-6 flex justify-center items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700`} style={animationStyle}>
                  <VisualComponent />
              </div>
          ) : null;
        }
      default:
        return null;
    }
  };

  const renderStandardLesson = (lesson: Lesson) => (
    <>
      <div>
        {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="my-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-6 animate-fade-in-up">
                <h3 className="font-bold text-xl text-slate-800 dark:text-gray-100 mb-3">Learning Objectives</h3>
                <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-gray-300">
                    {lesson.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
            </div>
        )}
        {lesson.content?.map(renderContentBlock)}
      </div>
      {lesson.sources && lesson.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in-up">
            <h3 className="font-bold text-xl text-slate-800 dark:text-gray-100 mb-3">Sources</h3>
            <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-gray-400">
                {lesson.sources.map((source, index) => (
                    <li key={index}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {source.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </>
  );

  const renderInteractiveModule = (lesson: Lesson) => {
      const moduleView = () => {
        switch(lesson.moduleType) {
            case 'caseStudies': return <CaseStudiesViewer cases={lesson.cases!} />;
            case 'cheatsheets': return <CheatsheetsViewer cheatsheets={lesson.cheatsheets!} />;
            case 'examBank': return <ExamBankViewer questions={lesson.questions!} />;
            case 'flashcards': return <FlashcardsViewer flashcards={lesson.flashcards!} />;
            case 'formulas': return <FormulasViewer formulas={lesson.formulas!} />;
            default: return <p>Module not found.</p>;
        }
      };
      
      return (
        <div>
           {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="mb-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-gray-100 mb-3">Learning Objectives</h3>
                    <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-gray-300">
                        {lesson.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                </div>
            )}
            {moduleView()}
        </div>
      )
  };


  const renderContent = () => {
    const currentLessonIndex = selectedCourse?.lessons.findIndex((l) => l.id === selectedLesson?.id) ?? -1;
    const prevLesson = currentLessonIndex > 0 ? selectedCourse!.lessons.slice(0, currentLessonIndex).reverse().find(l => !l.isComingSoon) : null;
    const nextLesson = currentLessonIndex < selectedCourse!.lessons.length - 1 ? selectedCourse!.lessons.slice(currentLessonIndex + 1).find(l => !l.isComingSoon) : null;

    return (
      <div className="animate-fade-in w-full">
        {renderBreadcrumbs()}
        <h2 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-300">{selectedLesson?.title}</h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-lg" role="alert"><p className="font-bold">Error:</p><p>{error}</p></div>
        )}
        
        {selectedLesson && (
           <>
            {selectedLesson.moduleType === 'standard' || !selectedLesson.moduleType
                ? renderStandardLesson(selectedLesson)
                : renderInteractiveModule(selectedLesson)
            }
           </>
        )}
        
        {selectedLesson && (
           <div className="mt-8 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-6">
            <button onClick={() => prevLesson && handleSelectLesson(prevLesson)} disabled={!prevLesson} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
              &larr; Previous
            </button>
            <button onClick={() => nextLesson && handleSelectLesson(nextLesson)} disabled={!nextLesson} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const getCurrentView = () => {
    switch (view) {
      case 'landing': return renderLandingPage();
      case 'lessons': return renderLessons();
      case 'content': return renderContent();
      default: return renderCourses();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-gradient-to-b dark:from-blue-950 dark:via-slate-900 dark:to-slate-900 text-slate-800 dark:text-white p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <section className="flex-grow w-full bg-white dark:bg-slate-800/20 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-blue-950/20 p-6 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          {getCurrentView()}
        </section>
        <footer className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm mt-8">
            <p>&copy; 2024 Maintenance Mastery Academy. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;