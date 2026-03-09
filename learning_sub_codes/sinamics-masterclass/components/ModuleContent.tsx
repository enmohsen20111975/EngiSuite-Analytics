
import React from 'react';
import { CourseModule } from '../types';

interface ModuleContentProps {
  module: CourseModule;
}

const ModuleContent: React.FC<ModuleContentProps> = ({ module }) => {
  
  // Advanced parser for Engineering Content
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();

      // H3 Headers (### Title)
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-2xl font-bold text-slate-800 mt-10 mb-4 border-b pb-2 border-slate-200">{trimmed.replace('### ', '')}</h3>;
      }

      // H4 Headers (#### Title)
      if (trimmed.startsWith('#### ')) {
        return <h4 key={i} className="text-lg font-bold text-cyan-800 mt-6 mb-2">{trimmed.replace('#### ', '')}</h4>;
      }

      // Blockquotes / Tips (> Text)
      if (trimmed.startsWith('> ')) {
        return (
          <div key={i} className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-slate-700 italic">
            <span dangerouslySetInnerHTML={{ 
               __html: trimmed.replace('> ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-900 font-bold">$1</strong>') 
             }} />
          </div>
        );
      }

      // List items with bullet points
      if (trimmed.startsWith('- ')) {
        return (
          <li key={i} className="ml-6 list-disc pl-2 mb-2 text-slate-700 leading-relaxed">
             <span dangerouslySetInnerHTML={{ 
               __html: trimmed.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') 
             }} />
          </li>
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(trimmed)) {
         return (
          <li key={i} className="ml-6 list-decimal pl-2 mb-2 text-slate-700 leading-relaxed">
             <span dangerouslySetInnerHTML={{ 
               __html: trimmed.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') 
             }} />
          </li>
         );
      }
      
      // Empty lines
      if (!trimmed) return <div key={i} className="h-2"></div>;

      // Standard Paragraphs with bold support
      return (
        <p key={i} className="mb-4 text-slate-600 leading-7 text-base" 
           dangerouslySetInnerHTML={{ 
             __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') 
           }} 
        />
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">{module.title}</h1>
        <p className="text-xl text-slate-500 leading-relaxed font-light">{module.description}</p>
      </div>

      <div className="space-y-20">
        {module.lessons.map((lesson) => (
          <div key={lesson.id} className="scroll-mt-24">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-cyan-700 text-xl border border-slate-200 shadow-sm">
                   {lesson.id.split('-')[1]}
                </div>
                <h2 className="text-3xl font-bold text-slate-800">
                   {lesson.title}
                </h2>
             </div>
             
             {lesson.image && (
               <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-slate-200 group bg-slate-900">
                  <div className="relative overflow-hidden aspect-[21/9]">
                    <img 
                        src={lesson.image} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                    />
                    {/* Industrial Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-6 text-white">
                        <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Technical Diagram</div>
                        <div className="text-sm font-medium opacity-80">{lesson.title} overview</div>
                    </div>
                  </div>
               </div>
             )}

             <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm">
                <div className="prose prose-slate prose-lg max-w-none">
                    {renderText(lesson.content)}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleContent;
