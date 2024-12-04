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
        async getOrders(_, { userId }, { user }) {
            // check if the userId passed in matches with the userId in the token
            // user.userId -> from the context
            // userId -> from the query
            if (user.userId != userId) {
                // dont need to set it here as we are handling it already in the authMiddleware
                // Sentry.setUser({ id: user.userId, "testStaticField": "This is a statc field to check the user context" });
                // Sentry.captureException(new Error("You asked for someone else's orders!"), {
                //     extra: {
                //         requestedUserId: userId, // Log the requested userId to compare with the current user
                //     }
                // });
                // console.log(user.userId, userId);
                throw new Error("You asked for someone else's orders!"); //try when not handling this error later.
            }
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