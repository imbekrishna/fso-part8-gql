import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../graphql/queries';
import AuthorForm from './AuthorForm';

const Authors = ({ show }) => {
  const result = useQuery(ALL_AUTHORS);

  if (!show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;
  const nameList = authors.map((a) => a.name);

  return (
    <div>
      <div>
        <h2>Authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Born</th>
              <th>Books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AuthorForm authors={nameList} />
    </div>
  );
};

export default Authors;
