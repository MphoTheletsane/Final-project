import React, { useState, useEffect } from 'react';
import './PodcastDashboard.css';

const SHOWS_API = 'https://podcast-api.netlify.app/shows';
const SHOW_DETAILS_API = 'https://podcast-api.netlify.app/id/';

const genres = {
  1: 'Personal Growth',
  2: 'True Crime and Investigative Journalism',
  3: 'History',
  4: 'Comedy',
  5: 'Entertainment',
  6: 'Business',
  7: 'Fiction',
  8: 'News',
  9: 'Kids and Family'
};

const PodcastDashboard = () => {
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    filterAndSortShows();
  }, [shows, searchTerm, sortBy]);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const response = await fetch(SHOWS_API);
      const data = await response.json();
      setShows(data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${SHOW_DETAILS_API}${id}`);
      const data = await response.json();
      setSelectedShow(data);
    } catch (error) {
      console.error('Error fetching show details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayEpisode = (episode) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(episode.file);
    newAudio.play();
    setAudio(newAudio);
    setCurrentEpisode(episode);
  };

  const filterAndSortShows = () => {
    let filtered = shows.filter((show) =>
      show.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.updated) - new Date(b.updated));
    } else if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    }

    setFilteredShows(filtered);
  };

  const toggleFavorite = (show) => {
    if (favorites.includes(show.id)) {
      setFavorites(favorites.filter((id) => id !== show.id));
    } else {
      setFavorites([...favorites, show.id]);
    }
  };

  const renderShowList = () => (
    <div>
      <div className="carousel-container">
        {filteredShows.length > 0 && (
          <div className="carousel">
            {filteredShows.slice(0, 5).map((show) => (
              <div key={show.id} className="carousel-item">
                <img src={show.image} alt={show.title} />
                <p>{show.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="controls">
        <input
          type="text"
          placeholder="Search shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="">Sort By</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="date-asc">Date (Ascending)</option>
          <option value="date-desc">Date (Descending)</option>
        </select>
      </div>
      <div className="show-list">
        {filteredShows.map((show) => (
          <div key={show.id} className="show-card">
            <img src={show.image} alt={show.title} className="show-image" />
            <h3>{show.title}</h3>
            <p>{new Date(show.updated).toLocaleDateString()}</p>
            <p>{show.genres.map((genreId) => genres[genreId]).join(', ')}</p>
            <button className="view-details-button" onClick={() => fetchShowDetails(show.id)}>
              View Details
            </button>
            <button
              className="favorite-button"
              onClick={() => toggleFavorite(show)}
              style={{ backgroundColor: favorites.includes(show.id) ? '#ff6347' : '#ff4500' }}
            >
              {favorites.includes(show.id) ? 'Remove Favorite' : 'Add to Favorites'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShowDetails = () => (
    <div className="show-details">
      <button className="back-button" onClick={() => setSelectedShow(null)}>Back</button>
      <h2>{selectedShow.title}</h2>
      <img src={selectedShow.image} alt={selectedShow.title} className="show-detail-image" />
      {selectedShow.seasons.map((season) => (
        <div key={season.id} className="season-card">
          <h3>{season.title}</h3>
          <ul>
            {season.episodes.map((episode) => (
              <li key={episode.id} onClick={() => handlePlayEpisode(episode)}>
                {episode.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderAudioPlayer = () => (
    currentEpisode && (
      <div className="audio-player">
        <h4>Now Playing: {currentEpisode.title}</h4>
        <p>{currentEpisode.description}</p>
      </div>
    )
  );

  return (
    <div className="podcast-dashboard">
      <h1>The Audio Horizon</h1>
      {loading && <p>Loading...</p>}
      {!loading && (
        <>
          {selectedShow ? renderShowDetails() : renderShowList()}
          {renderAudioPlayer()}
        </>
      )}
    </div>
  );
};

export default PodcastDashboard;




