var socket = require('socket.io');
var panicService = require('../services/panicService');
var uuidv4 = require('uuid').v4;
var { getNearbyClients, getNearbyLawyers, sortNearbyDistance, calculateDistance} = require('../utils/calculatorUtil')
// const Logger = require('../../bin/config/logger');

var allSockets = {}
allSockets.lawyers = {}
allSockets.clients = {}

allSockets.addSocket = function(details, user_type) {
    //console.log("THE DETAILSSSS", details)
    if(user_type === "lawyer"){ 
        this.lawyers[details.lawyer_id] = { ...details } 
        console.log("ADDED NEW LAWYER", allSockets.lawyers)
    }
    
    if(user_type === "client" || user_type === "student"){ 
        this.clients[details.client_id] = { ...details }
        console.log("ADDED NEW CLIENT", allSockets.clients)
    }  
}

allSockets.updateSocket = function(details, user_type) {
    // console.log(user_type, this.clients[details.client_id])

    if((user_type === "lawyer" && this.lawyers[details.lawyer_id])){ 
        var lawyerDetails = this.lawyers[details.lawyer_id]
        this.lawyers[details.lawyer_id] = {...lawyerDetails, ...details };

        console.log("UPDATED NEW LWAYER", allSockets.lawyers)
    }
    
    if(user_type === "client" && this.clients[details.client_id]){ 
        //console.log("I got here oooooooo")
        var userDetails = this.clients[details.client_id]
        this.clients[details.client_id] = {...userDetails, ...details };
        console.log("UPDATED NEW CLIENT", allSockets.clients)
    } 


}

function panicSocket(server) {
    io = socket(server)
    this.panicAlert = () => {
        io.of("/panic").on('connection', (socket) => {
            socket.on('online', (data) => {
                data["socket_address"] = socket.id

                if (allSockets.lawyers[data.lawyer_id] || allSockets.clients[data.client_id]) {
                    //console.log("DID YOU REACH HERE?", data)
                    allSockets.updateSocket(data, data.user_type);
                } else {
                    allSockets.addSocket(data, data.user_type);
                }
            })

            socket.on('panic_alert', (data) => {
                panicService.getUser(data.client_id).then((result)=>{
                    data.alert_id = uuidv4()
                    data.status = "sent"
                    data.resolved = false
                    data.client_img_url = result.image_url, 
                    data.client_name = result.first_name + " " + result.last_name, 
                    data.client_phonenumber = result.phone_number, 
                    data.client_email = result.email_address, 
                    data.client_state = result.client_state, 
                    data.client_country = result.client_country
                    //data.client_id = data.lawyer_id
                    console.log("BEFORE REDIS STORE", data)
                    panicService.storeAlertDetails(data)

                    panicService.createPanicAlert(data).then((result)=>{
                        var sortedDistanceArray = [],
                        distanceArray = []

                        Object.entries(allSockets.lawyers).forEach(([key, value]) => {
                            var distance = calculateDistance(data.panic_initiation_latitude, data.panic_initiation_longitude, value.lawyer_latitude, value.lawyer_longitude)
                            distanceArray = getNearbyLawyers(distance, value.lawyer_id);
                        });

                        sortedDistanceArray = sortNearbyDistance(distanceArray);
                        console.log(sortedDistanceArray)

                        for (i = 0; i < sortedDistanceArray.length; i++) {
                            //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                            allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address &&
                                io.of('/panic').to(`${allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", data });
                        }

                        panicService.getNextOfKin(data.client_id).then((nextOfKins)=>{
                            for (i = 0; i < nextOfKins.length; i++) {
                                //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                                allSockets.clients[nextOfKins[i].client_id].socket_address &&
                                    io.of('/panic').to(`${allSockets.clients[nextOfKins[i].client_id].socket_address}`).emit('alert_kinsmen', { message: "Help! Help!! Help!!!", data });
                            }
                        }).catch((error)=>{console.log(error)})
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
                //create_unique_id for the alert
                //store on redis and on mongo
                //emit to NettOfKin and all nearby lawyers
            })

            socket.on('accept_alert', (data) => {
                panicService.getUser(data.lawyer_id).then((result)=>{
                    //console.log("ALERT ID",data)
                    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    //console.log("IMMEDIATE FETCH", alertDetails)
                        if(alertDetails.status === "sent"){
                            data.lawyer_img_url = result.lawyer_img_url, 
                            data.lawyer_name = result.lawyer_name, 
                            data.lawyer_phonenumber = result.lawyer_phonenumber, 
                            data.lawyer_email = result.lawyer_email
                            data.status = "accepted"
                            data.client_img_url = alertDetails.client_img_url, 
                            data.alert_id = alertDetails.alert_id, 
                            data.client_name = alertDetails.client_name, 
                            data.client_phonenumber = alertDetails.client_phonenumber, 
                            data.client_email = alertDetails.client_email, 
                            data.client_id = alertDetails.client_id, 
                            data.panic_initiation_location = alertDetails.panic_initiation_location, 
                            data.destination = alertDetails.destination, 
                            data.resolved = false, 
                            data.alert_type = alertDetails.alert_type, 
                            data.panic_initiation_latitude = alertDetails.panic_initiation_latitude, 
                            data.panic_initiation_longitude = alertDetails.panic_initiation_longitude, 
                            data.client_state = alertDetails.client_state, 
                            data.client_country = alertDetails.client_country

                            panicService.updateAlertOnRedis(data)

                            panicService.updateAlertOnMongo(data).then((updated)=>{
                                
                                    console.log("ALERT DETAILS FETCHED FROM DB", alertDetails.client_id)

                                    allSockets.clients[alertDetails.client_id] &&
                                        io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('alert_accepted', { message: "A lawyer is coming to your aid", data: updated });
                            }).catch((error)=>{console.log(error)})
                            //UPDATE THE HMSET HERE and set a new field accepted to true OR staus=accepted
                        }else{

                        }
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
                //tick alert as accepted, and emit to client
            })

            socket.on('send_message', (data) => {
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    console.log("FETCHED TO SEND MESSAGFE", data.client_id, data.lawyer_id)
                    if(data.client_id){
                        console.log(alertDetails.lawyer_id)
                        allSockets.lawyers[alertDetails.lawyer_id] &&
                            io.of('/panic').to(`${allSockets.lawyers[alertDetails.lawyer_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
                    }
                    
                    if(data.lawyer_id){
                        console.log(alertDetails.client_id)
                        allSockets.clients[alertDetails.client_id] &&
                            io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
                    }
                }).catch((error)=>{console.log(error)})
                //send messages between client and lawyers
                //like Canyou talk? Where are you? or any other custom messages
            })

            socket.on('close_alert', (data) => {
                //check if the lawyer ticked a)assisted b)not able to assist c)hoax
                if(data.lawyer_response === "assisted"){
                    panicService.closeAlert(data).then((result)=>{
                        allSockets.lawyers[data.lawyer_id] &&
                        io.of('/panic').to(`${allSockets.clients[data.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: null });
                    }).catch((error)=>{console.log(error)})
                }else if (data.lawyer_response === "unassisted"){
                    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                        var sortedDistanceArray = [],
                        distanceArray = []

                        //create object to put all clients details from Redis and then send to the new Lawyers

                        Object.entries(allSockets.lawyers).forEach(([key, value]) => {
                            if (value.available === true) {
                                var distance = calculateDistance(alertDetails.panic_initiation_latitude, alertDetails.panic_initiation_longitude, value.lawyer_latitude, value.lawyer_longitude)
                                distanceArray = getNearbyLawyers(distance, value.lawyer_id);
                            }
                        });

                        sortedDistanceArray = sortNearbyDistance(distanceArray);

                        for (i = 0; i < sortedDistanceArray.length; i++) {
                            //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                            allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address &&
                                io.of('/panic').to(`${allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", alertDetails });
                        }
                    }).catch((error)=>{console.log(error)})
                }else{
                    panicService.declareHoax(data).then((result)=>{
                        allSockets.clients[result.client_id] &&
                        io.of('/panic').to(`${allSockets.clients[result.client_id].socket_address}`).emit('alert_closed', { message: "Your alert was declared a hoax, do you want to appeal against this?", data: null });
                    }).catch((error)=>{console.log(error)})
                }
                //if assited, tick the alert as completed
                //if not assited, find other nearby lawyers and emit the alert to them
                /*if hoax, store in hoax model, increment the client numbers of hoax alert, if its up to 2, block him for one week, the emit to the 
                    cilent so that he/she can appeal and only th admin can revert the number of hoax and unblock
                */
               //clear lawyer position from redis
            })

            socket.on('update_position', (data)=>{
                //store update clients position on redis with the public_id
                //fetch all ongoing alerts of the person(possibly from redis) and emit position to the clients or lawyers 
                //data will contai lawyerid, lawyerlongitude, lawyerlatitude
                panicService.fetchAllUnresolved(data)
                .then((result) => {
                    //console.log(result)
                    panicService.storeLawyerPosition(data)


                    for(i=0; i<result.data.length; i++){
                        console.log(allSockets.clients[result.data[i].client_id].socket_address)

                        allSockets.clients[result.data[i].client_id] &&
                            io.of('/panic').to(`${allSockets.clients[result.data[i].client_id].socket_address}`).emit('lawyer_position', {message:"Rider position", data});
                    }
                })
                .catch((error) => {
                    console.error(error)
                    // allSockets.riders[data.riderid] &&
                    // io.of('/rider').to(`${allSockets.riders[data.riderid].ridersocketid}`).emit('error_message', { message: 'Failed to stored rider position' });
                });
            });

            socket.on('get_position', (data)=>{
                 //fetch position of a lawer/client with the public_id
                //data will contai dispatchid, userid
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    console.log("ONTO POSITION DETAILS", alertDetails)
                    panicService.getStoredLawyerPosition(alertDetails.lawyer_id).then((lawyerDetails)=>{
                        console.log("LAWYER TO GET HIS POSITION", lawyerDetails)

                        allSockets.clients[alertDetails.client_id] &&
                            io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('lawyer_position', { message: "Lawyers Position", data: lawyerDetails });
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
            });

            socket.on('find_panics', (data)=>{
                panicService.getUser(data.lawyer_id).then((result)=>{
                //fetch available panics and emit to lawyer
                var sortedDistanceArray = [],
                    distanceArray = [],
                    distances = [];

                panicService.fetchExistingAlerts().then((oldDispatchArray) => {
                        //console.log("OLDDISPATCHARRAY",oldDispatchArray)
                        if(oldDispatchArray.length > 0){
                            oldDispatchArray.map((oldDispatchObject) => {
                                if (oldDispatchObject.hasOwnProperty("panic_initiation_longitude") && oldDispatchObject.status !== "accepted") {
                                    var distance = calculateDistance(data.lawyer_latitude, data.lawyer_longitude, oldDispatchObject.panic_initiation_latitude, oldDispatchObject.panic_initiation_longitude);
                                    distanceArray = getNearbyClients(distance, oldDispatchObject);
                                }
                            });
                            console.log("EXISTING ALERT DISTANCES", distanceArray)

                            if (distanceArray.length > 0) {
                                var clientAlerts = [];
                                    sortedDistanceArray = sortNearbyDistance(distanceArray);

                                    //console.log("SORTED EXISTING ALERTS", sortedDistanceArray)

                                for (i = 0; i < sortedDistanceArray.length; i++) {
                                    //get full user details and then push
                                    clientAlerts.push(sortedDistanceArray[i]);
                                }

                                allSockets.lawyers[data.lawyer_id] &&
                                        io.of('/panic').to(`${allSockets.lawyers[data.lawyer_id].socket_address}`).emit('older_alerts', { message: "Help! Help!! Help!!!", data: clientAlerts });
                            }
                        }
                    }).catch((error) => {
                        console.error(error)
                        allSockets.riders[data.riderid] &&
                            io.of('/rider').to(`${allSockets.riders[data.riderid].ridersocketid}`).emit('error_message', { message: "Failed to fetch existing alerts, please try again", data: null });
                    })
                }).catch((error)=>{console.log(error)})
            })

            // socket.on('disconnect', (data) => {
            //     allSockets.removeRiderSocket(data.riderid)
            // })
        })
    }
}

module.exports = { panicSocket, allSockets }