import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../graphql/queries';
import { useEffect, useState } from 'react';
import BookTable from './BookTable';

const Books = (props) => {
  const [allBooks, setAllBooks] = useState(null);
  const result = useQuery(ALL_BOOKS);

  useEffect(() => {
    if (result.data) {
      setAllBooks(result.data.allBooks);
    }
  }, [result.data]);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const genres = result.data.allBooks.map((book) => book.genres);
  const genreArray = [...new Set(genres.reduce((a, b) => a.concat(b), []))];

  const filterBooks = (event) => {
    const category = event.target.value;
    const categoryBooks = result.data.allBooks.filter((book) => {
      return book.genres.includes(category);
    });

    setAllBooks(categoryBooks);
  };

  return (
    <div>
      <h2>Books</h2>
      <BookTable books={allBooks}/>
      <div>
        <button onClick={() => setAllBooks(result.data.allBooks)}>all</button>
        {genreArray.map((genre) => (
          <button key={genre} name="genre" value={genre} onClick={filterBooks}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
