const setRequestHeader = (response, resource, operation, location) => {
    response.setHeader("x-resource", resource);
    response.setHeader("x-operation", operation);
    response.setHeader("x-resouce-location", location)
}


module.exports =  {
    setRequestHeader
}