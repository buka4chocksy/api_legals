var socket = require('socket.io');
var panicService = require('../services/panicService');
var uuidv4 = require('uuid').v4;
var { getNearbyClients, getNearbyLawyers, sortNearbyDistance, calculateDistance} = require('../utils/calculatorUtil')
// const Logger = require('../../bin/config/logger');

var allSockets = {}
allSockets.lawyers = {}
allSockets.users = {}

allSockets.addSocket = function(details, usertype) {
    if(usertype === "lawyer"){ 
        this.lawyers[details.lawyer_id] = { ...details } 
        console.log("ADDED NEW LAWYER", allSockets.lawyers)
    }
    
    if(usertype === "client" || usertype === "student"){ 
        this.users[details.client_id] = { ...details }
        console.log("ADDED NEW CLIENT", allSockets.users)
    }  
}

allSockets.updateSocket = function(details, usertype) {
    if((usertype === "lawyer" && this.lawyer[details.lawyer_id])){ 
        var lawyerDetails = this.lawyers[details.lawyer_id]
        this.lawyers[details.lawyer_id] = {...lawyerDetails, ...details };

        console.log(this.lawyers)
    }
    
    if(usertype === "user" && this.users[details.client_id]){ 
        var userDetails = this.users[details.client_id]
        this.users[details.client_id] = {...userDetails, ...details };
        console.log(this.users)
    } 


}

function panicSocket(server) {
    io = socket(server)
    this.panicAlert = () => {
        io.of("/panic").on('connection', (socket) => {
            socket.on('online', (data) => {
                data["socket_address"] = socket.id

                console.log(data.lawyer_id, data.client_id)
                console.log(allSockets.lawyers[data.lawyer_id], allSockets.users[data.client_id])

                if (allSockets.lawyers[data.lawyer_id] || allSockets.users[data.client_id]) {
                    allSockets.updateSocket(data, data["usertype"]);
                } else {
                    allSockets.addSocket(data, data.usertype);
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
                    panicService.storeAlertDetails(data)

                    panicService.createPanicAlert(data).then((result)=>{
                        var sortedDistanceArray = [],
                        distanceArray = []

                        Object.entries(allSockets.lawyers).forEach(([key, value]) => {
                            if (value.available === true) {
                                var distance = calculateDistance(data.panic_initiation_latitude, data.panic_initiation_longitude, value.lawyer_latitude, value.lawyer_longitude)
                                distanceArray = getNearbyLawyers(distance, value.lawyer_id);
                            }
                        });

                        sortedDistanceArray = sortNearbyDistance(distanceArray);

                        for (i = 0; i < sortedDistanceArray.length; i++) {
                            //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                            allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address &&
                                io.of('/panic').to(`${allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", data });
                        }

                        panicService.getNextOfKin(data.client_id).then((nextOfKins)=>{
                            for (i = 0; i < nextOfKins.length; i++) {
                                //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                                allSockets.users[nextOfKins[i].client_id].socket_address &&
                                    io.of('/panic').to(`${allSockets.users[nextOfKins[i].client_id].socket_address}`).emit('alert_kinsmen', { message: "Help! Help!! Help!!!", data });
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
                    data.lawyer_img_url = result.lawyer_img_url, 
                    data.lawyer_name = result.lawyer_name, 
                    data.lawyer_phonenumber = result.lawyer_phonenumber, 
                    data.lawyer_email = result.lawyer_email
                    data.status = "accepted"

                    panicService.updateAlertOnRedis(data)

                    panicService.updateAlertOnMongo(data).then((updated)=>{
                        //UPDATE THE HMSET HERE and set a new field accepted to true OR staus=accepted
                        allSockets.users[data.client_id].socket_address &&
                            io.of('/panic').to(`${allSockets.users[data.client_id].socket_address}`).emit('alert_accepted', { message: "A lawyer is coming to your aid", data: updated });
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
                //tick alert as accepted, and emit to client
            })

            socket.on('send_message', (data) => {
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    if(data.client_id){
                        allSockets.users[alertDetails.lawyer_id].socket_address &&
                        io.of('/panic').to(`${allSockets.users[alertDetails.lawyer_id].socket_address}`).emit('recieve_message', { message: "You got a new message", data: data.message });
                    }else{
                        allSockets.users[alertDetails.client_id].socket_address &&
                        io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('recieve_message', { message: "You got a new message", data: data.message });
                    }
                }).catch((error)=>{console.log(error)})
                //send messages between client and lawyers
                //like Canyou talk? Where are you? or any other custom messages
            })

            socket.on('close_alert', (data) => {
                //check if the lawyer ticked a)assisted b)not able to assist c)hoax
                if(data.lawyer_response === "assisted"){
                    panicService.closeAlert(data).then((result)=>{
                        allSockets.lawyers[data.lawyer_id].socket_address &&
                        io.of('/panic').to(`${allSockets.users[data.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: null });
                    }).catch((error)=>{console.log(error)})
                }else if (data.lawyer_response === "unassisted"){
                    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                        var sortedDistanceArray = [],
                        distanceArray = []

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
                        allSockets.users[result.client_id].socket_address &&
                        io.of('/panic').to(`${allSockets.users[result.client_id].socket_address}`).emit('alert_closed', { message: "Your alert was declared a hoax, do you want to appeal against this?", data: null });
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
                    panicService.storeLawyerPosition(data)

                    for(i=0; i<result.data.length; i++){
                        allSockets.users[result.data[i].client_id] &&
                            io.of('/user').to(`${allSockets.users[result.data[i].client_id].socket_address}`).emit('lawyer_position', {message:"", data});
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
                    panicService.getStoredLawyerPosition(alertDetails.lawyer_id).then((lawyerDetails)=>{
                        allSockets.users[data.client_id].socket_address &&
                            io.of('/panic').to(`${allSockets.users[data.client_id].socket_address}`).emit('lawyer_position', { message: "You got a new message", data: lawyerDetails });
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
            });

            socket.on('find_panics', (data)=>{
                panicService.getUser(data.lawyer_id).then((result)=>{
                //fetch available panics and emit to lawyer
                var sortedDistanceArray = [],
                    distanceArray = [],
                    distances = [];

                panicService.fetchExistingAlerts()
                    .then((oldDispatchArray) => {
                        if(oldDispatchArray.length > 0){
                            oldDispatchArray.map((oldDispatchObject) => {
                                if (oldDispatchObject.hasOwnProperty("userlongitude")) {
                                    var distance = calculateDistance(data.lawyer_latitude, data.lawyer_longitude, oldDispatchObject.panic_initiation_latitude, oldDispatchObject.panic_initiation_longitude);
                                    distanceArray = getNearbyClients(distance, distances, oldDispatchObject);
                                }
                            });

                            if (distanceArray.length > 0) {
                                var userRequests = [];
                                    sortedDistanceArray = sortNearbyDistance(distanceArray);

                                for (i = 0; i < sortedDistanceArray.length; i++) {
                                    //get full user details and then push
                                    userRequests.push(sortedDistanceArray[i].client);

                                    allSockets.clients[sortedDistanceArray[i].client_id].socket_address &&
                                        io.of('/panic').to(`${allSockets.clients[sortedDistanceArray[i].client_id].socket_address}`).emit('older_alerts', { message: "Help! Help!! Help!!!", data });
                                }
                            }
                        }else{
                            console.group("NO SHOW OO")
                        }
                    })
                    .catch((error) => {
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