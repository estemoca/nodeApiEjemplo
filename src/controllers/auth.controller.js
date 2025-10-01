const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/db.config');
const UserService = require('../services/user.service');

const userService = new UserService();

class AuthController {
    constructor() {
        // Bind the methods to ensure 'this' context
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userService.findByEmail(email);

            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            const existingUser = await userService.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "El email ya está registrado" });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const user = await userService.create({
                name,
                email,
                password: hashedPassword
            });

            res.status(201).json({
                message: "Usuario registrado exitosamente",
                userId: user.id
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

// Export a single instance
module.exports = new AuthController();