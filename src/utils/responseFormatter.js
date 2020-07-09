/**
 * @param nextOperation : this should be the next valid operation that should be performed by the client  and the url location should be the url for that operation
 * @param location : this is the location for the next request that can be performed from the last request made to the server
 */


const setRequestHeader = (response, resource, operation, location, nextOperation) => {
    response.setHeader("x-resource", resource);
    response.setHeader("x-operation", operation);
    response.setHeader("x-resouce-location", location)
    response.setHeader("x-next-operation", nextOperation)
}


module.exports =  {
    setRequestHeader
}