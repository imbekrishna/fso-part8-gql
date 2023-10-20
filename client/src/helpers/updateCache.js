export const updateCache = (cache, query, collection, object) => {
  // helper that is used to eliminate saving same person twice
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.title;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, (data) => {
    const collections = data[collection];
    return {
      [collection]: uniqByName(collections.concat(object)),
    };
  });
};

export default updateCache;
