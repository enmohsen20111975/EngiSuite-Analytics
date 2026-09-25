
import React, { useState, useMemo } from 'react';
import * as Icons from '../../icons';
import { ComponentType } from '../../../types';
import { cn } from '../../../lib/utils';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const allSymbols = [
    { type: ComponentType.HydraulicPump, name: 'Hydraulic Pump' },
    { type: ComponentType.Reservoir, name: 'Reservoir' },
    { type: ComponentType.PressureReliefValve, name: 'Pressure Relief Valve' },
    { type: ComponentType.DirectionalControlValve, name: '4/3 DCV' },
    { type: ComponentType.DoubleActingCylinder, name: 'Double-Acting Cylinder' },
    { type: ComponentType.PressureGauge, name: 'Pressure Gauge' },
    { type: ComponentType.RelayCoil, name: 'Relay Coil' },
    { type: ComponentType.ContactNO, name: 'Normally Open Contact' },
    { type: ComponentType.PushButton, name: 'Push Button' },
];

const ReadingSchematics: React.FC = () => {
    const [question, setQuestion] = useState(generateQuestion());
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    function generateQuestion() {
        const shuffled = [...allSymbols].sort(() => 0.5 - Math.random());
        const correctSymbol = shuffled[0];
        const wrongSymbols = shuffled.slice(1, 4).map(s => s.name);
        const options = [...wrongSymbols, correctSymbol.name].sort(() => 0.5 - Math.random());
        return {
            symbol: correctSymbol,
            options: options,
        };
    }

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return; // Prevent answering twice
        setSelectedAnswer(answer);
        setIsCorrect(answer === question.symbol.name);
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setQuestion(generateQuestion());
    };

    const SymbolIcon = Icons[question.symbol.type as keyof typeof Icons] || Icons.Fallback;

    return (
        <div>
            <h3 className="text-3xl font-bold mb-3">Interactive Schematics Quiz</h3>
            <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
                Reading circuit diagrams is a fundamental skill. A schematic uses standard symbols to represent different components. Test your knowledge by identifying the component shown below.
            </p>

            <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-8">
                <p className="text-center text-muted-foreground mb-4">What component does this symbol represent?</p>
                <div className="h-48 w-48 mx-auto bg-muted rounded-lg flex items-center justify-center p-4 mb-8">
                    <SymbolIcon className="h-40 w-40 text-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map(option => {
                        const isSelected = selectedAnswer === option;
                        const isTheCorrectAnswer = question.symbol.name === option;

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={!!selectedAnswer}
                                className={cn("text-left p-4 rounded-lg border-2 transition-all duration-200 text-lg font-semibold",
                                    !selectedAnswer && "bg-secondary hover:bg-accent hover:border-primary",
                                    selectedAnswer && !isSelected && "opacity-50",
                                    isSelected && isCorrect && "bg-green-500/20 border-green-500",
                                    isSelected && !isCorrect && "bg-red-500/20 border-red-500",
                                    selectedAnswer && !isSelected && isTheCorrectAnswer && "bg-green-500/20 border-green-500"
                                )}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                {selectedAnswer && (
                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-xl font-bold">
                            {isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                            <span>{isCorrect ? 'Correct!' : 'Incorrect!'}</span>
                        </div>
                        {!isCorrect && <p className="text-muted-foreground mt-1">The correct answer was: <span className="font-bold text-primary">{question.symbol.name}</span></p>}
                        
                        <button onClick={handleNext} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg flex items-center gap-2 mx-auto">
                            Next Question <RefreshCw size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingSchematics;
