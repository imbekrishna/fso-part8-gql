import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../graphql/queries';
import { useEffect, useState } from 'react';

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

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
