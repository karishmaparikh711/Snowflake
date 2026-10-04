import React, { useState } from 'react';
import { REPOSITORY_FILES, CodeFile } from '../data/codeFiles';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Search, 
  Terminal, 
  FileText, 
  Layers, 
  Database, 
  ShieldCheck,
  Download
} from 'lucide-react';

export const RepoExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(REPOSITORY_FILES[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredFiles = REPOSITORY_FILES.filter(file => {
    const matchesCategory = categoryFilter === 'ALL' || file.category === categoryFilter;
    const matchesSearch = file.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Repository &amp; Production Codebase Explorer</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              14 Production Artifacts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse CoCo CLI configurations, Snowflake Dynamic Tables/Streams, Agent skills, and Phase 4 validation tests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search files or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-64 bg-slate-50"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="COCO_CONFIG">CoCo Configs</option>
            <option value="SKILLS">Agent Skills</option>
            <option value="SNOWFLAKE_SQL">Snowflake SQL</option>
            <option value="APP">Application Layer</option>
            <option value="TESTS">Test Suites</option>
          </select>
        </div>
      </div>

      {/* Main Split View: Left File List, Right Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
        {/* Left Column: File Tree / List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-blue-600" />
              Repository File Tree
            </span>
            <span className="text-[11px] text-slate-500">{filteredFiles.length} files</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-mono font-medium truncate ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                        {file.path}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                        {file.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {file.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
          {/* Code Viewer Title Bar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-slate-200 font-semibold">{selectedFile.path}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-slate-950 leading-relaxed text-slate-300">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>

          {/* Status Bar */}
          <div className="bg-slate-900 px-4 py-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Encoding: UTF-8</span>
            <span>Target Platform: Snowflake CoCo CLI &amp; Snowpark Python</span>
          </div>
        </div>
      </div>
    </div>
  );
};
