import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { LOGIN } from '../graphql/queries';

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => console.log(error.graphQLErrors),
    onCompleted: () => {
      setPage('books');
      setUsername('');
      setPassword('');
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem('library-user', token);
    }
  }, [result.data]);

  const submit = (event) => {
    event.preventDefault();

    login({
      variables: {
        username,
        password,
      },
    });
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            value={username}
            id="username"
            type="text"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            value={password}
            id="password"
            type="password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
