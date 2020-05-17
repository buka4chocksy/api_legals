var mongoose = require('mongoose');
const db = process.env.NODE_ENV === "production" ? process.env.lawDBURL : process.env.localDB;

module.exports = function init() {
    if (db) {
        mongoose.connect(
            db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        },
            (err) => {
                if (err) {
                    console.log("Database connection failed");
                }
                else {
                    console.log("Sucessfully connected to MongoDB");
                }
            }

        );
    } else {
        throw new Error("DB URI not found, please kindly check your connection strings to mongoose");
    }
}

/**
 * Seeding logic for database should go here
 */
function seedDatabase() {

}