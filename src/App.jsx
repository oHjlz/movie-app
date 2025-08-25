import React, { useState, useEffect} from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { getTrendingMovies, supabase,updateSearchCount  } from "./supabaseClient.js"
import { useDebounce } from 'react-use'

//API - Application Programming Interface - a set of rules that allows one piece of software to interact with another.
const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // Using Vite's environment variable

const API_OPTIONS = {
  method: 'GET', // HTTP method to use for the request
  headers: { // Headers to include in the request
    accept: 'application/json', //API send back JSON data
    Authorization: `Bearer ${API_KEY}`, //authenticate the api
  }
}

const App = () => {
  //only mutate state using the setSearchTerm function
  const [searchTerm, setSearchTerm] = useState('');
  // As the user types in the search bar, the searchTerm will update 
  // with the value of the input field, it then passes the value to the 
  // Search component as a prop.
  const[errorMessage, setErrorMessage] = useState(''); // State to hold the list of movies
  const[movieList, setMovieList] = useState([]); // State to hold the list of movies
  const[isLoading, setIsLoading] = useState(false); // State to indicate loading status
  const[debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const[trendingMovies, setTrendingMovies] = useState([]); // State to hold trending movies

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from("metrics").select("*")
      if (error) {
        console.error("❌ Supabase error:", error.message)
      } else {
        console.log("✅ Supabase connected! Data:", data, error)
      }
    }
    testConnection()
  }, [])

  // Debounces the search term to avoid too many API calls
  // by waiting for 500 milliseconds after the user stops typing
  // rate-limityng the number of API calls made as the user types
  // This helps to improve performance and reduce unnecessary API requests.
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]) // Debounce the search term to avoid too many API calls

  const fetchMovies = async (query = '') => {
    setIsLoading(true); // Set loading state to true before fetching data
    setErrorMessage(''); // Clear any previous error messages
  
  

    try{ 
      const endpoint = query    //encodeURIComponent to ensure special characters in the query are handled correctly
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;// Construct the API endpoint 
      // If a query is provided, use the search endpoint; otherwise, use the discover endpoint
      // The discover endpoint fetches popular movies by default.


      const response = await fetch(endpoint, API_OPTIONS); //fetch is used to get data from API's, using http requests

      if(!response.ok){
        throw new Error('Failed to fetch movies'); // If the response is not ok, throw an error
      }

      const data = await response.json(); // Parse the JSON response

      if(data.Response =='False'){
        setErrorMessage(data.Error || 'Failed to fetch movies'); // If the response is false, set the error message
        setMovieList([]); // Clear the movie list
        return;
      }

      setMovieList(data.results || []); // Set the movie list with the results from the API

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]); // Update search count in Supabase for the first movie result
      }
    }catch(error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
      // Handle the error appropriately, e.g., show a message to the user
    } finally{
      setIsLoading(false); //No matter what happens, whether it loads successfully or fails, set loading to false.
    }
  }

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    }catch(error){
      console.error('Error fetching trending movies:', error);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]); 
  // if dependency array is empty, the effect runs only once when the component mounts.
  // if it contains variables, the effect runs whenever those variables change.
  // so whenever searchTerm changes, fetchMovies is called with the new searchTerm value.

  useEffect(() => {
    loadTrendingMovies();
  },[]); //empty dependency array, so it only loads trening movies once when the component mounts

  return (
    <main>
      <div className ="pattern" />
      
      <div className ="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className ="text-gradient">Movies</span> You'll Enjoy Without the Hassle </h1>
           <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> 
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie,index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[20px]"> ALL Movies</h2>

        {isLoading ? (
          <Spinner />
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <ul>
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} /> //passing movie object as a prop to MovieCard
              //provide a unique key for each movie, so react can predictively manage the list
            ))}
          </ul>
        )}
       </section>
      </div>  //^ 2 different Props - Inputs passed to a function
    </main>
  )
}

export default App

