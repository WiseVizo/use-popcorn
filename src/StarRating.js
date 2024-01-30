import React, { useState } from "react";
import "./StarRating.css";

const StarRating = ({ maxRating = 5 }) => {
  const [rating, setRating] = useState(0);
  const [clickedRating, setClickedRating] = useState(0);

  const handleHover = (hoverRating) => {
    setRating(hoverRating);
  };

  const handleClick = (clickedRating) => {
    setRating(clickedRating);
    setClickedRating(clickedRating);
  };

  function handleMoseLeave() {
    setRating(0);
    setRating(clickedRating);
  }

  return (
    <div className="star-rating-container">
      {[...Array(maxRating).keys()].map((star) => (
        <span
          key={star}
          className={star + 1 <= rating ? "star-filled" : "star"}
          onMouseEnter={() => handleHover(star + 1)}
          onMouseLeave={() => handleMoseLeave()}
          onClick={() => handleClick(star + 1)}
        >
          &#9733; {/* Unicode character for a star */}
        </span>
      ))}
      <p className="rating-text">Rating: {rating}</p>
    </div>
  );
};

export default StarRating;
