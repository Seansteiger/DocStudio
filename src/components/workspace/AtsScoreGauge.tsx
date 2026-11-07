import React from 'react';
import { SouthAfricanCvData } from '../../types/document';
import { auditCvAts, AtsAuditResult } from '../../services/ai/atsEngine';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Award, Zap } from 'lucide-react';

interface AtsScoreGaugeProps {
  cvData: SouthAfricanCvData;
  onApplyFix: (fixAction: string) => void;
}

export const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({ cvData, onApplyFix }) => {
  const audit = auditCvAts(cvData);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (score >= 80) return 'text-indigo-400 border-indigo-500/50 bg-indigo-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  return (
    <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Live ATS Resume Score</h3>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded">
          {audit.grade} Grade
        </span>
      </div>

      {/* Score Meter & Gauge */}
      <div className="flex items-center gap-4 bg-black/30 p-3.5 rounded-xl border border-white/5">
        <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono shrink-0 ${getScoreColor(audit.score)}`}>
          <span className="text-2xl font-black">{audit.score}</span>
          <span className="text-[8px] uppercase tracking-wider text-slate-400">/ 100</span>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">
              {audit.score >= 85 ? 'ATS Optimized & Ready' : audit.score >= 70 ? 'Moderate ATS Match' : 'Needs ATS Refinement'}
            </span>
            <span className="font-mono text-slate-400">{audit.score}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 65 ? 'bg-indigo-500' : 'bg-amber-500'
              }`}
              style={{ width: `${audit.score}%` }}
            />
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
            <span>{audit.actionVerbsCount} Action Verbs</span>
            <span>•</span>
            <span>{audit.metricsCount} Metrics</span>
            <span>•</span>
            <span>{audit.identifiedKeywords.length} Skills</span>
          </div>
        </div>
      </div>

      {/* Diagnostic Category Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(audit.breakdown).map(([key, item]) => (
          <div
            key={key}
            className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
              item.passed
                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate pr-1">
              <CheckCircle2 size={12} className={item.passed ? 'text-emerald-400 shrink-0' : 'text-slate-500 shrink-0'} />
              <span className="truncate">{item.label}</span>
            </div>
            <span className="font-mono font-bold shrink-0">{item.score}/{item.max}</span>
          </div>
        ))}
      </div>

      {/* Recommendations & 1-Click Fixes */}
      {audit.recommendations.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
            Recommendations ({audit.recommendations.length})
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
            {audit.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-2.5 bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    <span>{rec.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{rec.description}</p>
                </div>

                {rec.fixAction && (
                  <button
                    onClick={() => onApplyFix(rec.fixAction!)}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Zap size={10} />
                    <span>Auto-Fix</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
