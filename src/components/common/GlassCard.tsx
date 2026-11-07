import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Receipt, 
  FileSignature, 
  Layers, 
  ShieldCheck, 
  LogOut, 
  Briefcase, 
  AlertTriangle, 
  Award, 
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ToolDefinition } from '../../types/document';

interface GlassCardProps {
  tool: ToolDefinition;
  onClick: (tool: ToolDefinition) => void;
}

const getIcon = (iconName: string, color: string) => {
  const props = { size: 24, style: { color } };
  switch (iconName) {
    case 'FileText': return <FileText {...props} />;
    case 'Receipt': return <Receipt {...props} />;
    case 'FileSignature': return <FileSignature {...props} />;
    case 'Layers': return <Layers {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'LogOut': return <LogOut {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'AlertTriangle': return <AlertTriangle {...props} />;
    case 'Award': return <Award {...props} />;
    case 'CreditCard': return <CreditCard {...props} />;
    default: return <FileText {...props} />;
  }
};

export const GlassCard: React.FC<GlassCardProps> = ({ tool, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick(tool)}
      className="relative cursor-pointer group rounded-2xl overflow-hidden"
    >
      {/* Dynamic Glow Gradient Backdrop */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 blur-xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${tool.color}35, transparent 70%)` }}
      />

      {/* Surface Card Container */}
      <div className="bg-[#0E1118]/80 hover:bg-[#141824]/90 backdrop-blur-xl border border-white/10 group-hover:border-white/25 rounded-2xl p-5 h-full flex flex-col justify-between transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        
        {/* Top Icon & Badge Row */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner"
            style={{ 
              backgroundColor: `${tool.color}15`, 
              border: `1px solid ${tool.color}35`,
              boxShadow: `0 0 15px ${tool.color}20` 
            }}
          >
            {getIcon(tool.icon, tool.color)}
          </div>

          {tool.badge ? (
            <span 
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ 
                backgroundColor: `${tool.color}20`, 
                color: tool.color,
                border: `1px solid ${tool.color}40` 
              }}
            >
              {tool.badge}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {tool.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors mb-1">
            {tool.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-slate-400">
            {tool.templatesCount} {tool.templatesCount === 1 ? 'Template' : 'Templates'}
          </span>
          <div 
            className="flex items-center gap-1 font-semibold text-xs transition-transform group-hover:translate-x-1"
            style={{ color: tool.color }}
          >
            <span>Open Studio</span>
            <ArrowRight size={13} />
          </div>
        </div>

      </div>
    </motion.div>
  );
};
