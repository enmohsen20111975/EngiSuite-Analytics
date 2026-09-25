import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, RefreshCw, Trophy } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === questions[currentQuestionIdx].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
          <Trophy size={40} className="text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8">You scored <span className="font-bold text-slate-900 text-xl">{score}</span> out of {questions.length}</p>
        
        <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden">
          <div 
            className="bg-cyan-600 h-full rounded-full transition-all duration-1000" 
            style={{ width: `${(score / questions.length) * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          <RefreshCw size={18} /> Retake Quiz
        </button>
      </div>
    );
  }

  const question = questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Module Assessment</h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Question {currentQuestionIdx + 1} of {questions.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-medium text-slate-800 leading-relaxed">{question.question}</h3>
        </div>
        
        <div className="p-6 space-y-3 bg-slate-50/50">
          {question.options.map((option, idx) => {
            let itemClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium flex items-center justify-between group ";
            
            if (isAnswered) {
              if (idx === question.correctIndex) {
                itemClass += "border-green-500 bg-green-50 text-green-700";
              } else if (idx === selectedOption) {
                itemClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                itemClass += "border-slate-200 bg-white text-slate-400 opacity-60";
              }
            } else {
              itemClass += "border-white bg-white shadow-sm hover:border-cyan-200 hover:shadow-md text-slate-600";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={itemClass}
              >
                <span>{option}</span>
                {isAnswered && idx === question.correctIndex && <CheckCircle className="text-green-600" size={20}/>}
                {isAnswered && idx === selectedOption && idx !== question.correctIndex && <XCircle className="text-red-600" size={20}/>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-6 border-t border-slate-200 bg-white flex justify-end animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium shadow-sm shadow-cyan-200"
            >
              {currentQuestionIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
