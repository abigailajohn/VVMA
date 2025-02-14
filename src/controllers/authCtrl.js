const db = require('../db/mysqldb');

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role = 'user', bio = null } = req.body;
        const query = `INSERT INTO users (username, email, password, role, bio) 
                       VALUES ('${username}', '${email}', '${password}', '${role}', '${bio}')`;

        const [results] = await db.execute(query);

        res.status(201).json({ id: results.insertId, username, email, password, role, bio });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser };