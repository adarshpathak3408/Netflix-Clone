import React, { useState, useEffect } from 'react';
import { useHistory } from '../../contexts/HistoryContext';
import { IoClose } from "react-icons/io5";
import './Player.css';
import { useParams, useNavigate } from 'react-router-dom';
import backArrowIcon from '../../assets/back_arrow_icon.png'

const Player = () => {
  const { id } = useParams(); // Get movie ID from the URL
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailer, setTrailer] = useState(null); // State to store trailer information
  const [isModalOpen, setIsModalOpen] = useState(false); // To control modal visibility
  const [isFavorite, setIsFavorite] = useState(false); // State to handle favorites
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to control popup visibility
  const [movieToRemove, setMovieToRemove] = useState(null); // Store movie to be removed

  const { addToHistory, removeFromHistory } = useHistory(); // Access the functions from context
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Fetch movie details
  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMjAwNmU2OTFkNzA5MDNjMGIzOTkxZDc5YzIwYjdlZSIsIm5iZiI6MTczMjUxOTc2Ni4zMjMsInN1YiI6IjY3NDQyNzU2NGQ1MGNjZDdkYTQ4YzhlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.FA-LhIExgEPmRcMiMV8JgJ7RnhS4Y3ek_wmFJ6smwcA'
      }
    };

    // Fetch movie details
    fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options)
      .then(res => res.json())
      .then(data => setMovieDetails(data))
      .catch(err => console.error(err));

    // Fetch trailer details
    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
      .then(res => res.json())
      .then(data => {
        const trailerData = data.results.find(video => video.type === "Trailer");
        setTrailer(trailerData || null); // Set trailer if found
      })
      .catch(err => console.error(err));
  }, [id]);

  // Loading state
  if (!movieDetails) return <div>Loading...</div>;

  // Extract data
  const { backdrop_path, poster_path, original_title, release_date, vote_average, vote_count, overview } = movieDetails;

  // Handle modal toggle
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      // Add the current movie to history when trailer is watched
      addToHistory({
        id: movieDetails.id,
        title: movieDetails.original_title,
        poster: movieDetails.poster_path
      });
    }
  };

  // Handle Add to Favorites functionality
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Handle back navigation
  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Handle remove movie from history
  const handleRemoveClick = (movie) => {
    setMovieToRemove(movie); // Store the movie to be removed
    setIsPopupOpen(true); // Show confirmation popup
  };

  // Handle confirmation in popup
  const handleConfirmRemove = () => {
    if (movieToRemove) {
      removeFromHistory(movieToRemove.id); // Remove the movie from history
    }
    setIsPopupOpen(false); // Close the popup
  };

  const handleCancelRemove = () => {
    setIsPopupOpen(false); // Close the popup without removing the movie
  };

  return (
    <div className="player">
      {/* Back button */}
      <img
        src={backArrowIcon}
        alt="Back"
        className={`back-arrow ${isModalOpen ? 'hidden' : ''}`} // Conditionally hide the back arrow
        onClick={handleBackClick} // Trigger navigation when clicked
      />

      <div className="movie-details">
        <img
          src={`https://image.tmdb.org/t/p/w500${backdrop_path || poster_path}`}
          alt={original_title}
          className="movie-thumbnail"
        />
        <h1 className="movie-title">{original_title}</h1>
        <p className="movie-release-year">Release Year: {new Date(release_date).getFullYear()}</p>
        <p className="movie-rating">
          Rating: {vote_average} / 10 ({vote_count} votes)
        </p>
        <p className="movie-description">{overview}</p>
        <button className="watch-trailer" onClick={toggleModal}>
          Watch Trailer
        </button>
        <div className="movie-options">
          <button onClick={toggleFavorite}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          <button>Share</button>
          <button>Rate Movie</button>
        </div>
      </div>

      {/* Modal for playing trailer */}
      {isModalOpen && trailer && (
        <div className="modal">
          <div className="modal-content">
            <IoClose className="close-btn" onClick={toggleModal} />
            <h2 className="modal-title">{original_title} - Trailer</h2>
            <iframe
              width="100%"
              height="450px"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title={`${original_title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="modal-actions">
              <button className="like-button">
                ❤️ Like
              </button>
              <button className="watch-later-button">
                ⏰ Watch Later
              </button>
              <button className="group-watch-button">
                👥 Group Watch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Are you sure you want to remove this movie from History?</h3>
            <div className="popup-actions">
              <button className="popup-button" onClick={handleConfirmRemove}>Yes</button>
              <button className="popup-button" onClick={handleCancelRemove}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
