const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET

//generate token
function generateToken(data = {}) {
    return new Promise((resolve, reject) => {
        jwt.sign({ ...data }, secret, { expiresIn: 60*60 }, function (err, token) {
            if (err) {
                console.log("error ", err);
                reject(err);
            } else {
                console.log("success", token);
                resolve(token);
            }
        });
    });
}

const generateTokenSync = (data) => {
    return jwt.sign(data, secret, {expiresIn : 60*60});
}

//verify user token
function verifyToken(token = "") {
    return new Promise((resolve, reject) => {
        jwt.verify(token.replace("Bearer", ""), secret, function (
            err,
            decodedToken
        ) {
            if (err) {
                reject({ message: 'Token has expired', status: 400 });
            } else {
                resolve(decodedToken);
            }
        });
    });
}

const verifyTokenSync = (token= "") => {
    try{
        let result = jwt.verify(token, secret);
        return result;
    }catch(err){
        return new Error("jwt malformed")
    }
}



module.exports = {
    verifyToken, generateToken, generateTokenSync, verifyTokenSync
}