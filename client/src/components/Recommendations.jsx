import { useQuery } from '@apollo/client';
import { RECOMMENDED, CURRENT_USER } from '../graphql/queries';
import BookTable from './BookTable';

const Recommended = (props) => {
  const result = useQuery(RECOMMENDED);
  const user = useQuery(CURRENT_USER);

  if (!props.show) {
    return null;
  }

  if (result.loading || user.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.recommended;

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        Books in you favorite genre{' '}
        <strong>{user.data.me.favoriteGenre}</strong>
      </p>
      <BookTable books={books} />
    </div>
  );
};

export default Recommended;
