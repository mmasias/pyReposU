import React from "react";
import ReactJson from "react-json-view";

interface AIAnalysisPanelProps {
  loading: boolean;
  result: any;
  onQuickAnalysis: () => void;
  onDeepAnalysis: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  loading,
  result,
  onQuickAnalysis,
  onDeepAnalysis,
}) => {
  return (
    <div className="mt-10 text-center">
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">Análisis con IA</h3>

      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onQuickAnalysis}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
        >
          Análisis rápido
        </button>
        <button
          onClick={onDeepAnalysis}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
        >
          Análisis profundo
        </button>
      </div>

      {loading && (
        <p className="mt-4 text-blue-500">
          Analizando, esto puede tardar unos minutos...
        </p>
      )}

      {result && (
        <div className="mt-6 bg-white p-4 rounded shadow border text-left max-w-4xl mx-auto">
          <ReactJson src={result} collapsed={false} enableClipboard={false} />
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
