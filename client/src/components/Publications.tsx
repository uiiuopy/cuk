import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Hash, ExternalLink } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackPublications from '../data/publications.json';

interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  tags: string[];
  doi: string;
}

export default function Publications() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await fetchSheetData('Publications');
        if (data && data.length > 0) {
          const normalized = data.map((row, idx) => ({
            id: `pub_${idx}`,
            title: row.Title || '',
            authors: row.Authors || '',
            journal: row.Journal || '',
            year: parseInt(row.Year) || 0,
            abstract: row.Abstract || '',
            tags: (row.Tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
            doi: row.DOI || ''
          }));
          setPapers(normalized);
        } else {
          setPapers(fallbackPublications as Paper[]);
        }
      } catch (err) {
        console.warn("Failed to fetch publications from Google Sheets, falling back to local data:", err);
        setPapers(fallbackPublications as Paper[]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const allTags = ['All', ...new Set(papers.flatMap((p) => p.tags))];

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All' || paper.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Academic Publications</h2>
        </div>
        <p className="text-sm text-slate-600">
          Research papers and conference proceedings published by members of the BCNL.
        </p>
      </div>

      {/* Search & Tag Filter Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search papers by title, author, abstract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Tag filter tray */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1 scrollbar-none">
          <span className="flex items-center gap-1 text-slate-400 uppercase font-bold shrink-0">
            <Filter className="h-3 w-3" /> Topics:
          </span>
          <div className="flex gap-1.5 overflow-x-auto">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors shrink-0 ${
                  selectedTag === tag
                    ? 'bg-blue-950 border-blue-950 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-950'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Publications feed */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Syncing academic repository...
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800">No Publications Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try modifying your search query or selecting a different topic tag.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPapers.map((paper) => (
            <article 
              key={paper.id} 
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {paper.journal} <span className="text-slate-300 mx-1">•</span> {paper.year}
                </span>
                
                {paper.doi && (
                  <a 
                    href={`https://doi.org/${paper.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 hover:underline"
                  >
                    DOI Profile <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-blue-950 tracking-tight leading-snug mb-2">
                {paper.title}
              </h3>
              
              <div className="text-xs font-semibold text-slate-600 mb-4 font-sans">
                {paper.authors}
              </div>

              {paper.abstract && (
                <div className="mb-5 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Abstract</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {paper.abstract}
                  </p>
                </div>
              )}

              {paper.tags && paper.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {paper.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50/50 border border-blue-100 text-[10px] font-bold text-blue-950"
                    >
                      <Hash className="h-2.5 w-2.5 text-blue-900" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
