
import React from 'react';

interface ScriptTableProps {
  content: string;
}

const ScriptTable: React.FC<ScriptTableProps> = ({ content }) => {
  // Regex to match markdown tables
  const tableRegex = /(\|.*\|(?:\r?\n\|.*\|)+)/g;
  const matches = content.match(tableRegex);

  if (!matches || matches.length === 0) {
    return <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white p-4 rounded border">{content}</div>;
  }

  return (
    <div className="space-y-10">
      {matches.map((tableMarkdown, index) => {
        const lines = tableMarkdown.split('\n').filter(line => line.trim().startsWith('|'));
        if (lines.length < 3) return null;

        const headers = lines[0].split('|').map(h => h.trim()).filter(h => h !== '');
        const bodyRows = lines.slice(2).map(row => 
          row.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i <= headers.length)
        );

        return (
          <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-bold text-gray-800">专业分镜方案 {index + 1}</span>
              </div>
            </div>
            <div className="overflow-x-auto border border-[#E4E5E7] rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-[#E4E5E7] text-sm table-fixed">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    {headers.map((h, i) => (
                      <th 
                        key={i} 
                        className={`px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider ${
                          h.includes('时长') ? 'w-20' : h.includes('场景') ? 'w-32' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E4E5E7]">
                  {bodyRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3 text-gray-700 align-top break-words">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScriptTable;
