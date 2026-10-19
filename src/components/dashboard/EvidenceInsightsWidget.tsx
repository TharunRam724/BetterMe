import React from 'react';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useBetterMe } from '../../services/serviceContext';

interface EvidenceInsightsWidgetProps {
  onNavigateToInsights: () => void;
}

export const EvidenceInsightsWidget: React.FC<EvidenceInsightsWidgetProps> = ({
  onNavigateToInsights,
}) => {
  const { insights } = useBetterMe();
  const primaryInsight = insights[0];

  if (!primaryInsight) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-[#F9F7F4] to-[#F5F8F6] border-[#E2DDD3]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] border border-[#D5E3D8] flex items-center justify-center text-[#406149]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2D2A26]">Evidence-Based Observation</h3>
              <Badge tone="sage" size="sm">
                Validated Pattern
              </Badge>
            </div>
            <p className="text-[11px] text-[#787167]">{primaryInsight.weekLabel}</p>
          </div>
        </div>

        <button
          onClick={onNavigateToInsights}
          className="text-xs text-[#3E5E47] hover:text-[#253B2C] font-semibold flex items-center gap-1 transition-colors"
        >
          <span>All Insights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 mt-3">
        <h4 className="text-xs font-bold text-[#2E2923]">
          {primaryInsight.title}
        </h4>
        <p className="text-xs text-[#5D554C] leading-relaxed">
          {primaryInsight.summary}
        </p>

        <div className="p-3 rounded-xl bg-white/70 border border-[#E6E1D7] text-xs text-[#62594F] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#5B8266] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#302B26]">Gentle Recommendation: </span>
            <span>{primaryInsight.actionableTakeaway}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
