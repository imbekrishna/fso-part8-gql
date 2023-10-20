import { useEffect, useState } from 'react';
import './App.css';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import Recommendations from './components/Recommendations';
import { useSubscription } from '@apollo/client';
import { ALL_BOOKS, BOOK_ADDED } from './graphql/queries';
import updateCache from './helpers/updateCache';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('library-user');
    setToken(token);
  }, []);

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      updateCache(
        client.cache,
        { query: ALL_BOOKS },
        'allBooks',
        data.data.bookAdded
      );
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.removeItem('library-user');
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>Add book</button>
            <button onClick={() => setPage('recommended')}>Recommended</button>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>Login</button>
        )}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} setPage={setPage} />

      <Recommendations show={page === 'recommended'} />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />
    </div>
  );
};

export default App;
