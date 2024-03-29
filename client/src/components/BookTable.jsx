const BookTable = ({ books }) => {
  return (
    <table>
      <tbody>
        <tr>
          <th></th>
          <th>Author</th>
          <th>Published</th>
        </tr>
        {books.map((a) => (
          <tr key={a.title}>
            <td>{a.title}</td>
            <td>{a.author.name}</td>
            <td>{a.published}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BookTable;
