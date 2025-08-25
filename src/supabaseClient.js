import { createClient } from '@supabase/supabase-js'

// Get these values from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// supabase client contains api key for authentication and the endpoint/url of the database for requests.

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. Check if the search term exists
    const { data: existingRows, error: selectError } = await supabase
      .from('metrics')          // your table name
      .select('*')
      .eq('searchTerm', searchTerm)
      .limit(1);

    if (selectError) throw selectError;

    // 2. If it exists, increment the count
    if (existingRows.length > 0) {
      const row = existingRows[0];

      // DEBUG: Log the found row and what we're trying to update
      /*console.log('🔍 Found existing row:', row);
      console.log('🎬 Movie object passed in:', movie);
      console.log('🔑 row.movie_id:', row.movie_id, 'Type:', typeof row.movie_id);
      console.log('🔑 movie.id:', movie.id, 'Type:', typeof movie.id);*/
      
      // Try the update with detailed response
      const { data: updateData, error: updateError, count } = await supabase
        .from('metrics')
        .update({ count: row.count + 1 })
        .eq('movie_id', row.movie_id)
        .select(); // Returns updated rows
      
      // DEBUG: Check what happened
      /*console.log('📊 Update result:');
      console.log('  - Error:', updateError);
      console.log('  - Updated data:', updateData);
      console.log('  - Rows affected:', count);
      console.log('  - Expected new count:', row.count + 1);*/

      if (updateError) throw updateError;

    // 3. If it doesn't exist, insert a new row
    } else {
      const { error: insertError } = await supabase
        .from('metrics')
        .insert([{
          searchTerm: searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }]);

      if (insertError) throw insertError;
    }

  } catch (error) {
    console.error(error);
  }
};

export const getTrendingMovies = async () => {
     try {
    // Fetch top 5 movies sorted by count descending
    const { data, error } = await supabase
      .from('metrics')         // your table name
      .select('*')             // select all columns
      .order('count', { ascending: false }) // sort by count descending
      .limit(5);               // limit to top 5

    if (error) throw error;

    return data; 
    }catch(error){
      console.error(`Error fetching trending movies: ${error}`);
    }
}