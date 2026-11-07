import React, { useState } from 'react';
import { toolCatalog } from '../../data/skillCatalog';
import { ToolDefinition } from '../../types/document';
import { GlassCard } from '../common/GlassCard';
import { Search, Filter, Layers, Briefcase, DollarSign, Shield, Award } from 'lucide-react';

interface ToolGridProps {
  onSelectTool: (tool: ToolDefinition) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Tools (10)', icon: Layers },
    { id: 'career', label: 'Career & CV', icon: Briefcase },
    { id: 'finance', label: 'Finance & Invoices', icon: DollarSign },
    { id: 'legal', label: 'Legal & Contracts', icon: Shield },
    { id: 'credentials', label: 'Credentials', icon: Award }
  ];

  const filteredTools = toolCatalog.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      {/* Category Tabs & Search Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0E1118] border border-white/10 rounded-2xl overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter document tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1118] border border-white/10 focus:border-indigo-500/50 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <GlassCard key={tool.id} tool={tool} onClick={onSelectTool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-slate-400 text-sm">No tools found matching "{searchQuery}" in this category.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-3 text-xs text-indigo-400 hover:underline font-semibold"
          >
            Clear filters & show all
          </button>
        </div>
      )}
    </section>
  );
};
