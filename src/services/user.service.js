const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config/db.config');

class UserService {
    constructor() {
        this.connection = mysql.createPool(config.db);
    }

    async findByEmail(email) {
        const [rows] = await this.connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }
    async create(userData) {
        const { name, email, password } = userData;
        const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const [result] = await this.connection.execute(
            'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)',
            [name, email, password, created_at]
        );
        
        return {
            id: result.insertId,
            name,
            email,
            created_at
        };
    }

    async getProfile(userId) {
        const [rows] = await this.connection.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [userId]
        );
        return rows[0];
    }

    async getPublicProfile(userId) {
        const [rows] = await this.connection.execute(
            'SELECT id, name FROM users WHERE id = ?',
            [userId]
        );
        return rows[0];
    }

    async update(userId, userData) {
        const { name, email } = userData;
        await this.connection.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, userId]
        );
        return this.getProfile(userId);
    }

    async delete(userId) {
        await this.connection.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
        return true;
    }

    async changePassword(userId, oldPassword, newPassword) {
        const [user] = await this.connection.execute(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (!user[0] || !bcrypt.compareSync(oldPassword, user[0].password)) {
            throw new Error('Contraseña actual incorrecta');
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await this.connection.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
        return true;
    }

    async getDashboard(userId) {
        // Aquí puedes agregar lógica específica del dashboard
        const [userInfo] = await this.connection.execute(
            'SELECT name, email, created_at FROM users WHERE id = ?',
            [userId]
        );
        return {
            user: userInfo[0],
            // Agrega más datos según necesites
        };
    }
}

module.exports = UserService;