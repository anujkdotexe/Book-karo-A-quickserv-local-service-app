import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceAPI } from '../../services/api';

const NavbarSearch = ({ isMobile = false, onSearchComplete }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load search history and trending queries
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 5));
    } catch {
      setSearchHistory([]);
    }

    const fetchTrending = async () => {
      try {
        const response = await serviceAPI.getTrendingSearches();
        if (response.data?.success && Array.isArray(response.data.data)) {
          setTrendingSearches(response.data.data);
        }
      } catch {
        setTrendingSearches(['Plumbing', 'Cleaning', 'Electrician', 'Painting']);
      }
    };

    fetchTrending();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updated = [trimmed, ...history.filter(h => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      setSearchHistory(updated);
    } catch (e) {
      console.warn('Unable to persist search history:', e);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await serviceAPI.autocomplete(query.trim());
      if (response.data?.success && Array.isArray(response.data.data)) {
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedSuggestionIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(searchHistory.length > 0 || trendingSearches.length > 0);
      setIsSearching(false);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(val);
      }, 300);
    }
  };

  const executeSearch = (targetQuery) => {
    const term = (targetQuery !== undefined ? targetQuery : searchQuery).trim();
    if (term.length < 2) return;

    saveToHistory(term);
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/services?keyword=${encodeURIComponent(term)}`);
    if (onSearchComplete) onSearchComplete();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch();
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (onSearchComplete) onSearchComplete();

    if (typeof item === 'object' && item.id) {
      navigate(`/services/${item.id}`);
    } else {
      const term = typeof item === 'object' ? item.name : item;
      executeSearch(term);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const displayItems = suggestions.length > 0
      ? suggestions
      : [...searchHistory.map(h => ({ name: h, isHistory: true })), ...trendingSearches.map(t => ({ name: t, isTrending: true }))];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev < displayItems.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(displayItems[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`navbar-search-wrapper ${isMobile ? 'mobile-search-wrapper' : ''}`} ref={searchContainerRef}>
      <form className="navbar-search" onSubmit={handleSubmit} role="search">
        <input
          type="text"
          className="search-input"
          placeholder="Search services or categories..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search services"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-button"
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <button type="submit" className="search-button" aria-label="Submit search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      {showSuggestions && (
        <div className="search-suggestions" role="listbox">
          {isSearching && (
            <div className="suggestion-status">Searching...</div>
          )}

          {suggestions.length > 0 ? (
            <div className="suggestions-group">
              <div className="suggestions-header">Matching Services</div>
              {suggestions.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`suggestion-item ${idx === selectedSuggestionIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(item)}
                  role="option"
                  aria-selected={idx === selectedSuggestionIndex}
                >
                  <span className="suggestion-name">{item.name || item.title}</span>
                  {item.category && <span className="suggestion-category">{item.category}</span>}
                </div>
              ))}
            </div>
          ) : (
            <>
              {searchHistory.length > 0 && (
                <div className="suggestions-group">
                  <div className="suggestions-header flex-between">
                    <span>Recent Searches</span>
                    <button type="button" className="text-btn" onClick={clearHistory}>Clear</button>
                  </div>
                  {searchHistory.map((term, idx) => (
                    <div
                      key={`hist-${idx}`}
                      className="suggestion-item history-item"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              )}

              {trendingSearches.length > 0 && (
                <div className="suggestions-group">
                  <div className="suggestions-header">Trending Searches</div>
                  {trendingSearches.map((term, idx) => (
                    <div
                      key={`trend-${idx}`}
                      className="suggestion-item trending-item"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                      <span>{typeof term === 'object' ? term.name : term}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
