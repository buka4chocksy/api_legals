const parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(err){
        return {};
    }
}


module.exports = {
    parseJsonToObject
}