const pg = require('pg');

module.exports = (config) => {
  let pgClient = null;

  /**
   * creates a new PG Client (returns previous one if already created)
   *
   * @return {Object}
   */
  const client = () => {
    if (pgClient === null) {
      pgClient = new pg.Client(typeof config === 'object' ? `tcp://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}` : config);
      pgClient.connect();
      return pgClient;
    }

    return pgClient;
  };

  /**
   * executes passed query
   *
   * @param  {String} query
   * @param  {Array}  params
   * @return {Promise}
   */
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    client().query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });

  return {
    query,
  };
};
