import { useEffect, useState } from "react";
import StarRating from "./StarRating";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "9b242b09"; // api key

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("Inception");
  const [isLoading, SetIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // useEffect(() => {
  //   if (selectedId) return;
  //   document.title = "usePopcorn";
  // }, [selectedId]);

  function deleteFromWatchedList(ID) {
    const newList = watched.filter((movie) => {
      return !(movie.imdbID === ID);
    });
    setWatched(newList);
  }

  function addToWatchedList(movieData = {}) {
    const WatchedMovie = watched.filter((movie) => {
      return movie.imdbID === movieData.imdbID;
    });
    // console.log(isWatched);
    if (WatchedMovie.length > 0) {
      const movies = watched.map((movie) => {
        // stupid map returning [undefined, undefined] i shouldn't hv skiped the javascript part :/
        if (movie.imdbID === movieData.imdbID) {
          movie.userRating = movieData.userRating;
        }
      });
      // console.log(movies);
      setWatched([...watched]);
      return;
    }
    setWatched([...watched, movieData]);
  }

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
    // console.log(selectedId);
  }

  function handleCloseMovie() {
    setSelectedId(null);
    // console.log(`in ${selectedId}`);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function getMoviesList() {
      try {
        SetIsLoading(true);
        setError(null);
        const res = await fetch(
          `http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("something went wrong while fetching movies");
        }
        const data = await res.json();
        // console.log(data);

        if (data.Response === "False") {
          setMovies([]);
          throw new Error("Movies not Found!");
        }

        setMovies(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err.message);
          setError(err.message);
        }
      } finally {
        SetIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    getMoviesList();
    return function () {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar query={query} setQuery={setQuery}>
        <p className="num-results">
          Found <strong>{movies ? movies.length : 0}</strong> results
        </p>
      </NavBar>
      <Main
        element1={
          <MovieList
            movies={movies}
            setMovies={setMovies}
            handleSelectedMovie={handleSelectedMovie}
          />
        }
        element2={
          <>
            <Summary watched={watched} />
            <WatchedMoivesList
              watched={watched}
              deleteFromWatchedList={deleteFromWatchedList}
            />
          </>
        }
        isLoading={isLoading}
        error={error}
        selectedId={selectedId}
        handleCloseMovie={handleCloseMovie}
        addToWatchedList={addToWatchedList}
      />
    </>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function SearchBar({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function SelectedMovie({ selectedId, handleCloseMovie, addToWatchedList }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const {
    Title,
    Year,
    Poster,
    Runtime,
    imdbRating,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
  } = movie;
  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        handleCloseMovie();
        // console.log("closing");
      }
    }
    document.addEventListener("keydown", callback); // the event listners will accumulate over time as we this component will mount multiple times
    return function () {
      document.removeEventListener("keydown", callback); // so we hv to remove them each time component unmout for saving  memory
    };
  }, [handleCloseMovie]);
  function handleAddBtn() {
    addToWatchedList({
      Title: Title,
      imdbRating: Number(imdbRating),
      Runtime: Number(Runtime.split(" ").at(0)),
      Poster: Poster,
      userRating: rating,
      imdbID: selectedId,
    });
  }
  useEffect(() => {
    async function getSelectedMovieData(id) {
      setIsLoading(true);
      // console.log(id);
      const res = await fetch(`http://www.omdbapi.com/?&apikey=${KEY}&i=${id}`);
      const data = await res.json();
      // console.log(data);
      setMovie(data);
      setIsLoading(false);
    }
    getSelectedMovieData(selectedId);
  }, [selectedId]);
  useEffect(() => {
    // console.log(`in effect ${selectedId}`);
    document.title = `Movie | ${movie.Title}`;
    return () => {
      document.title = "usePopcorn";
    };
  }, [movie.Title]);
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              &larr;
            </button>
            <img src={Poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating
                maxRating={10}
                rating={rating}
                setRating={setRating}
              />
            </div>
            {
              <button className="btn-add" onClick={handleAddBtn}>
                Add To Watched List
              </button>
            }
            <p>
              <em>{Plot}</em>
            </p>
            <p>Starring {Actors}</p>
            <p>Directed by {Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Main({
  element1,
  element2,
  isLoading,
  error,
  selectedId,
  handleCloseMovie,
  addToWatchedList,
}) {
  return (
    <main className="main">
      <Box>
        {isLoading && <Loader />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && element1}
      </Box>
      <Box>
        {selectedId ? (
          <SelectedMovie
            selectedId={selectedId}
            handleCloseMovie={handleCloseMovie}
            addToWatchedList={addToWatchedList}
          />
        ) : (
          element2
        )}
      </Box>
    </main>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function WatchedMoivesList({ watched, deleteFromWatchedList }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovies
          movie={movie}
          key={movie.imdbID}
          deleteFromWatchedList={deleteFromWatchedList}
        />
      ))}
    </ul>
  );
}

function WatchedMovies({ movie, deleteFromWatchedList }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.Runtime} min</span>
        </p>
        <p>
          <button
            className="btn-delete"
            onClick={() => deleteFromWatchedList(movie.imdbID)}
          >
            &#x1F5D1;
          </button>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.Runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, setMovies, handleSelectedMovie }) {
  // const [loading, setLoading] = useState(movies ? false : true);
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function NavBar({ children, query, setQuery }) {
  return (
    <nav className="nav-bar">
      <Logo />
      <SearchBar query={query} setQuery={setQuery} />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
