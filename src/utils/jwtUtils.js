const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET

//generate token
function generateToken(data = {}) {
    return new Promise((resolve, reject) => {
        jwt.sign({ ...data }, secret, { expiresIn:"24hrs" }, function (err, token) {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

const generateTokenSync = (data) => {
    return jwt.sign(data, secret, {expiresIn : 20*60});
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

function decodeToken(token) {
    return new Promise((resolve, reject) => {
        var decoded = jwt.decode(token, { complete: true });

        decoded ? resolve(decoded) : reject()
    });
}



module.exports = {
    verifyToken, generateToken, generateTokenSync, verifyTokenSync, decodeToken
}