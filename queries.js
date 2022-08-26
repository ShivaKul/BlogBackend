const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'bb',
  password: 'password',
  port: 5432,
})

const getUsers = (request, response) => {
  pool.query('SELECT email, name FROM Users ORDER BY email ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  })
}

const getUserByEmail = (request, response) => {
  const email = request.params.email;

  pool.query('SELECT email, name FROM Users WHERE email = $1', [email], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  })
}

const getExistingUser = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
        'SELECT * FROM Users WHERE email = $1', [email],
        (error, results) => {
          if (error) {
            reject(error);
          }
          resolve(results.rows[0]);
        }
      );
  }); 
}

const createUser =  (email, name, password, token) => {
  return new Promise((resolve, reject) => {
    pool.query(
        'INSERT INTO Users (email, name, password, token) VALUES ($1, $2, $3, $4)', [email, name, password, token],
        (error, results) => {
          if (error) {
            reject(error);
          }
          const user = {'email': email, 'name': name, 'token': token};
          resolve(user);
        }
      );
  });
}

const updateUserToken = (email, token) => {
  return new Promise((resolve, reject) => {
    pool.query(
    'UPDATE users SET token = $1 WHERE email = $2',
    [token, email],
    (error, results) => {
      if (error) {
        reject(error);
      }
      resolve ({"email": email, "token": token});
    }
    );
  });
}

const updateUserName = (request, response) => {
  const email = request.params.email;
  if(request.user.email !== email) {
    response.status(403).send('Forbidden');
    return;
  }
  const { name } = request.body;

  pool.query(
    'UPDATE users SET name = $1 WHERE email = $2',
    [name, email],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with email: ${email}`);
    }
  )
}

const deleteUser = (request, response) => {
  const email = request.params.email;
  if(request.user.email !== email) {
    response.status(403).send('Forbidden');
    return;
  }

  pool.query('DELETE FROM Users WHERE email = $1', [email], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with email: ${email}`);
  })
}

module.exports = {
  getUsers,
  getUserByEmail,
  getExistingUser,
  createUser,
  updateUserName,
  updateUserToken,
  deleteUser,
}