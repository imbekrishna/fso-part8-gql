import { useQuery } from '@apollo/client';
import { ALL_BOOKS, ALL_GENRES } from '../graphql/queries';
import BookTable from './BookTable';

const Books = (props) => {
  const { data, refetch, loading } = useQuery(ALL_BOOKS, {
    variables: {
      author: undefined,
      genre: undefined,
    },
  });

  const genres = useQuery(ALL_GENRES);

  if (!props.show) {
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  const filterBooks = (event) => {
    const genre = event.target.value;
    refetch({
      author: undefined,
      genre: genre,
    });
  };

  return (
    <div>
      <h2>Books</h2>
      <BookTable books={data.allBooks} />
      <div>
        <button
          onClick={() =>
            refetch({
              author: undefined,
              genre: undefined,
            })
          }
        >
          all
        </button>
        {genres.data.allGenres.map((genre) => (
          <button key={genre} name="genre" value={genre} onClick={filterBooks}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
