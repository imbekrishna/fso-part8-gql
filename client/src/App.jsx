import { useState } from 'react';
import './App.css';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('library-user');
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        <button onClick={() => setPage('add')}>Add book</button>
        {token ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <button onClick={() => setPage('login')}>Login</button>
        )}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />
    </div>
  );
};

export default App;
