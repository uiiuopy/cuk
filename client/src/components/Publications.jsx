import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Hash, ExternalLink } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackPublications from '../data/publications.json';

export default function Publications() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await fetchSheetData('Publications');
        // Normalize: split Tags string into an array, map field names
        const normalized = data.map((row, idx) => ({
          id: `pub_${idx}`,
          title: row.Title || '',
          authors: row.Authors || '',
          journal: row.Journal || '',
          year: parseInt(row.Year) || 0,
          abstract: row.Abstract || '',
          tags: (row.Tags || '').split(',').map(t => t.trim()).filter(Boolean),
          doi: row.DOI || ''
        }));
        setPapers(normalized && normalized.length > 0 ? normalized : fallbackPublications);
      } catch (err) {
        console.warn("Failed to fetch publications from Google Sheets, falling back to local data:", err);
        setPapers(fallbackPublications);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // Accumulate all tags
  const allTags = ['All', ...new Set(papers.flatMap((p) => p.tags))];

  // Filter papers based on search and tags
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All' || paper.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="publications-container">
      {/* Search & Tag Filter Header */}
      <div className="search-filter-header glass-panel">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search papers by title, author, abstract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="tags-horizontal-tray">
          <span className="tray-label"><Filter size={12} /> Topics:</span>
          <div className="tags-scroller">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`tag-btn-filter ${selectedTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Publications feed */}
      {loading ? (
        <div className="loading-spinner">Syncing academic repository...</div>
      ) : filteredPapers.length === 0 ? (
        <div className="empty-results glass-panel">
          <BookOpen size={36} className="empty-icon" />
          <h3>No Publications Found</h3>
          <p>Try modifying your search query or selecting a different topic tag.</p>
        </div>
      ) : (
        <div className="papers-feed flex-col">
          {filteredPapers.map((paper) => (
            <article key={paper.id} className="paper-card glass-panel flex-col">
              <div className="paper-metadata-header">
                <span className="paper-journal">{paper.journal} • {paper.year}</span>
                <a 
                  href={`https://doi.org/${paper.doi}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="doi-link"
                >
                  DOI: {paper.doi} <ExternalLink size={11} />
                </a>
              </div>

              <h3 className="paper-title glow-text-cyan">{paper.title}</h3>
              <span className="paper-authors">{paper.authors}</span>
              
              <div className="paper-abstract-box">
                <span className="abstract-label">Abstract</span>
                <p className="abstract-text">{paper.abstract}</p>
              </div>

              <div className="paper-tags-row">
                {paper.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`paper-tag ${selectedTag === tag ? 'active' : ''}`}
                  >
                    <Hash size={10} /> {tag}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <style>{`
        .publications-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .search-filter-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 16px;
          gap: 12px;
          width: 100%;
        }

        .search-icon {
          color: var(--accent-cyan);
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-family: var(--font-body);
          font-size: 0.95rem;
          width: 100%;
        }

        .tags-horizontal-tray {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .tray-label {
          font-family: var(--font-tech);
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .tags-scroller {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
          width: 100%;
        }

        .tag-btn-filter {
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.72rem;
          background: var(--bg-dark);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .tag-btn-filter:hover {
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }

        .tag-btn-filter.active {
          color: #ffffff;
          border-color: var(--accent-cyan);
          background: var(--accent-cyan);
        }

        .loading-spinner {
          text-align: center;
          padding: 60px;
          color: var(--text-muted);
          font-family: var(--font-tech);
          font-size: 0.9rem;
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px;
          text-align: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .empty-icon {
          color: var(--border-color);
          margin-bottom: 8px;
        }

        .empty-results h3 {
          font-size: 1.1rem;
          color: var(--text-main);
        }

        .papers-feed {
          gap: 20px;
        }

        .paper-card {
          gap: 12px;
        }

        .paper-metadata-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .doi-link {
          color: var(--text-muted);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }

        .doi-link:hover {
          color: var(--accent-cyan);
        }

        .paper-title {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.3;
        }

        .paper-authors {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .paper-abstract-box {
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          padding: 12px 14px;
          border-radius: 6px;
        }

        .abstract-label {
          font-family: var(--font-tech);
          font-size: 0.65rem;
          color: var(--accent-cyan);
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .abstract-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-main);
        }

        .paper-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .paper-tag {
          font-family: var(--font-body);
          font-size: 0.68rem;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .paper-tag:hover {
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }

        .paper-tag.active {
          color: #ffffff;
          border-color: var(--accent-cyan);
          background: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
}
