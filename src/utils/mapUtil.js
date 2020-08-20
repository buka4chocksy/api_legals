const axios = require("axios");
const url = "https://jsonplaceholder.typicode.com/posts/1";
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY

exports.getLocation = (latitude, longitude) => {
    return new Promise(async(resolve, reject)=>{
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API_KEY}`);
            const data = response.data;
            // console.log("************************************************************************",data);
            resolve (data)
          } catch (error) {
            // console.log("************************************************************************",error);
            console.log("error check", error);
            reject (error)
          }
    })
};