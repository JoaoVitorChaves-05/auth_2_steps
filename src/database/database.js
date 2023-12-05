import { Sequelize, DataTypes } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const { DATABASE_USER, DATABASE_PWD, DATABASE_NAME, DATABASE_HOST, DATABASE_PORT } = process.env

class Database {
    constructor() {
        this.models = {}
        console.log(DATABASE_NAME, DATABASE_USER, DATABASE_PWD)
        this.connection = new Sequelize(`mysql://${DATABASE_USER}:${DATABASE_PWD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`)
        this.createTables()
    }

    async createTables() {
        this.models.User = this.connection.define('User', {
            user_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: DataTypes.STRING,
                allowNull: false
            }
        })

        await this.models.User.sync()
    }
}

export default new Database()