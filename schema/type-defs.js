const { gql } = require("apollo-server")

const typeDefs = gql`
type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order]
}
type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    created_at: String
    updated_at: String
}
type Order {
    id: ID!
    user_id: Int!
    product_id: Int!
    quantity: Int!
    total_price: Float!
    created_at: String
}
type Query {
    users: [User!]!
    getAllProducts: [Product!]!
    getAllOrders: [Order]!
    getOrders(userId: ID!): [Order]!
    usersWithOrders: [User!]!
}
input CreateUserInput {
    name: String!
    email: String!
    password: String!
}
input LoginInput {
    email: String!
    password: String!
}
type Mutation {
    createUser(input: CreateUserInput!): User # Returns the created user
    login(input: LoginInput): String # Returns a JWT token
}
`;

module.exports = { typeDefs };