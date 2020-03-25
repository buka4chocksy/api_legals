var mongoose = require('mongoose');
const uri = process.env.DB_LOCAL;


module.exports = function init() {
    if (uri) {
        mongoose.connect(
            uri, {
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