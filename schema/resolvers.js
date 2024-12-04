const connection = require('../db');
const Sentry = require("@sentry/node");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "jwt_secret";

const resolvers = {
    Query: {
        async users() {
            const [users] = await connection.query('SELECT * FROM users');
            console.log(users);
            return users;
        },
        async getAllProducts() {
            const [products] = await connection.query('SELECT * FROM products');
            return products;
        },
        async getAllOrders() {
            const [orders] = await connection.query('SELECT * FROM orders');
            return orders;
        },
        async getOrders(_, { userId }) {
            const [order] = await connection.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
            return order;
        },
        async usersWithOrders(_, __, { user }) {
            if (!user) {
                throw new Error("Unauthorized!");
            }

            try {
                const [users] = await connection.query("SELECT * FROM users");
                const [orders] = await connection.query("SELECT * FROM orders");

                const usersWithOrders = users.map((u) => {
                    u.orders = orders.filter((order) => order.user_id === u.id);
                    return u;
                });

                return usersWithOrders;
            } catch (error) {
                Sentry.captureException(error);
                throw new Error("Failed to fetch users with orders!");
            }
        },
    },
    Mutation: {
        async createUser(_, { input }) {
            const [result] = await connection.query('INSERT INTO users SET ?', input);
            const [user] = await connection.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            console.log(input)
            return user[0];
        },
        async login(_, { input }) {
            try {
                const [user] = await connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [input.email, input.password]);
                if (!user.length) {
                    throw new Error("New inside invalid credentials!");
                }
                const token = jwt.sign({ userId: user[0].id }, JWT_SECRET);
                return token;
            } catch (error) {
                if (error.message === "New inside invalid credentials!") {
                    Sentry.captureException(error);
                    throw new Error("New outside invalid credentials!");
                }
            }
        }
    }
}
module.exports = { resolvers };