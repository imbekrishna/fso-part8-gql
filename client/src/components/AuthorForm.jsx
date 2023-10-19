import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../graphql/queries';

const AuthorForm = ({ authors }) => {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onCompleted: () => {
      setName('');
      setBorn('');
    },
  });

  const submit = (event) => {
    event.preventDefault();
    updateAuthor({ variables: { name, setBornTo: Number(born) } });
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="name">name:</label>
          <select
            name="name"
            id="id"
            value={name}
            onChange={({ target }) => setName(target.value)}
          >
            <option defaultValue="" selected>
              -----
            </option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="born">born:</label>
          <input
            type="number"
            id="born"
            name="born"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default AuthorForm;
