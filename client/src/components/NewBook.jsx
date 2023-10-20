import { useMutation } from '@apollo/client';
import { useState } from 'react';
import {
  ADD_BOOK,
  ALL_BOOKS,
  ALL_GENRES,
  RECOMMENDED,
} from '../graphql/queries';
import updateCache from '../helpers/updateCache';

const NewBook = ({ show, setPage }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const [addBook] = useMutation(ADD_BOOK, {
    onCompleted: () => {
      setPage('books');
    },

    update: (cache, response) => {
      updateCache(
        cache,
        { query: ALL_BOOKS },
        'allBooks',
        response.data.addBook
      );

      updateCache(
        cache,
        { query: RECOMMENDED },
        'recommended',
        response.data.addBook
      );

      cache.updateQuery({ query: ALL_GENRES }, ({ allGenres }) => {
        return {
          allGenres: [
            ...new Set([...allGenres, ...response.data.addBook.genres]),
          ],
        };
      });
    },
  });

  if (!show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    addBook({
      variables: {
        title,
        author,
        genres,
        published: Number(published),
      },
    });

    setTitle('');
    setPublished('');
    setAuthor('');
    setGenres([]);
    setGenre('');
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('');
  };

  return (
    <div>
      <h2>Add book</h2>
      <form onSubmit={submit}>
        <div>
          Title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          Author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          Published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          Genre:
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            Add genre
          </button>
        </div>
        <div>Genres: {genres.join(' ')}</div>
        <button type="submit">Create Book</button>
      </form>
    </div>
  );
};

export default NewBook;
