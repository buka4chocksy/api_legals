var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const uri = process.env.NODE_ENV === "production" ? process.env.lawDBURL : process.env.lawDBURL;
// if(process.env.NODE_ENV !== 'production') mongoose.set('debug', true);
module.exports = function init() {

    if (uri) {
        mongoose.connect(
            uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        },
            (err) => {
                if (err) {
                    console.log("Database connection failed", err);
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
