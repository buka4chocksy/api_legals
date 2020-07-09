const mongoose = require('mongoose');
const schema = mongoose.Schema;
const practice_area_schema = new schema({
    name: { type: String, required: true }
})
module.exports = mongoose.model('practiceArea', practice_area_schema)