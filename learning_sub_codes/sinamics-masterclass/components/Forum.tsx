
import React, { useState } from 'react';
import { FORUM_POSTS } from '../constants';
import { MessageCircle, ThumbsUp, Eye, User, PlusCircle } from 'lucide-react';

const Forum: React.FC = () => {
  const [newPostTitle, setNewPostTitle] = useState('');

  const handlePost = () => {
     if(!newPostTitle) return;
     alert("Feature available in Full Version. This is a demo view.");
     setNewPostTitle('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Engineer Community</h1>
           <p className="text-slate-500">Ask questions, share projects, and get help from experts.</p>
        </div>
        <button className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-700 transition-colors shadow-sm">
           <PlusCircle size={20} /> New Topic
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2">
            <input 
               type="text" 
               placeholder="What's on your mind?" 
               value={newPostTitle}
               onChange={(e) => setNewPostTitle(e.target.value)}
               className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button onClick={handlePost} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Post</button>
         </div>
      </div>

      <div className="space-y-4">
         {FORUM_POSTS.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-cyan-200 transition-colors cursor-pointer group">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                     <User className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{post.title}</h3>
                        <span className="text-xs text-slate-400">{post.date}</span>
                     </div>
                     <div className="flex items-center gap-2 mt-2 mb-3">
                        {post.tags.map(tag => (
                           <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">#{tag}</span>
                        ))}
                     </div>
                     <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><MessageCircle size={16}/> {post.replies} Replies</span>
                        <span className="flex items-center gap-1.5"><Eye size={16}/> {post.views} Views</span>
                        <span className="text-cyan-600 font-medium">by {post.author}</span>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Forum;
