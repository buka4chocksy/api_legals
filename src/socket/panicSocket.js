var socket = require('socket.io');
var panicService = require('../services/panicService');
var uuidv4 = require('uuid').v4;
// const Logger = require('../../bin/config/logger');

var allSockets = {}
allSockets.lawyers = {}
allSockets.users = {}

allSockets.addSocket = function(details, usertype) {
    if(usertype === "lawyer"){ 
        this.lawyers[details.public_id] = { ...details } 
    }
    
    if(usertype === "user"){ 
        this.users[details.public_id] = { ...details }
    }  
}

allSockets.updateSocket = function(details, usertype) {
    if((usertype === "lawyer" && this.lawyer[details.public_id])){ 
        var lawyerDetails = this.lawyers[details.public_id]
        this.lawyers[details.public_id] = {...lawyerDetails, ...details };
    }
    
    if(usertype === "user" && this.user[details.public_id]){ 
        var userDetails = this.users[details.public_id]
        this.users[details.public_id] = {...userDetails, ...details };
    } 
}

function panicSocket(server) {
    io = socket(server)
    this.panicAlert = () => {
        io.of("/panic").on('connection', (socket) => {
            socket.on('online', (data) => {
                data["socket_address"] = socket.id

                if (allSockets.lawyers[data.public_id] || allSockets.user[data.public_id]) {
                    allSockets.updateSocket(data, data["usertype"]);
                } else {
                    data = { socket, ...data };
                    allSockets.addSocket(data, data.usertype);
                }
            })

            socket.on('panic_alert', (data) => {
                panicService.getUser(data.public_id).then((result)=>{
                    data.alert_id = uuidv4()
                    data.status = "sent"
                    data.resolved = false
                    data.client_id = data.public_id
                    panicService.storeAlertDetails(data)

                    panicService.createPanicAlert(data).then((result)=>{
                        var sortedDistanceArray = [],
                        distanceArray = []

                        Object.entries(allSockets.lawyers).forEach(([key, value]) => {
                            if (value.available === true) {
                                var distance = calculateDistance(data.panic_initiation_latitude, data.panic_initiation_latitude, value.lawyer_latitude, value.lawyer_longitude)
                                distanceArray = getNearbyLawyers(distance, value.public_id);
                            }
                        });

                        sortedDistanceArray = sortNearbyDistance(distanceArray);

                        for (i = 0; i < sortedDistanceArray.length; i++) {
                            //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                            allSockets.lawyers[sortedDistanceArray[i].public_id].socket_address &&
                                io.of('/panic').to(`${allSockets.lawyers[sortedDistanceArray[i].public_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", data });
                        }

                        panicService.getNextOfKin(data.public_id).then((nextOfKins)=>{
                            for (i = 0; i < nextOfKins.length; i++) {
                                //ridersContacted.push(sortedDistanceArray[i].rider.riderid)
                                allSockets.users[nextOfKins[i].public_id].socket_address &&
                                    io.of('/panic').to(`${allSockets.users[nextOfKins[i].public_id].socket_address}`).emit('alert_kinsmen', { message: "Help! Help!! Help!!!", data });
                            }
                        }).catch((error)=>{console.log(error)})
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
                //create_unique_id for the alert
                //store on redis and on mongo
                //emit to NettOfKin and all nearby lawyers
            })

            socket.on('accept_alert', (data) => {
                data.status = "accepted"
                panicService.updatePanicAlert(data).then((updated)=>{
                    //UPDATE THE HMSET HERE and set a new field accepted to true OR staus=accepted
                    allSockets.users[data.client_id].socket_address &&
                        io.of('/panic').to(`${allSockets.users[data.client_id].socket_address}`).emit('alert_accepted', { message: "A lawyer is coming to your aid", data: updated });
                }).catch((error)=>{console.log(error)})
                //tick alert as accepted, and emit to client
            })

            socket.on('send_message', (data) => {
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    if(data.public_id === alertDetails.client_id){
                        alertDetails.lawyer_id &&
                        io.of('/panic').to(`${allSockets.users[data.lawyer_id].socket_address}`).emit('recieve_message', { message: "You got a new message", data: alertDetails });
                    }else{
                        alertDetails.client_id &&
                        io.of('/panic').to(`${allSockets.users[data.client_id].socket_address}`).emit('recieve_message', { message: "You got a new message", data: alertDetails });
                    }
                }).catch((error)=>{console.log(error)})
                //send messages between client and lawyers
                //like Canyou talk? Where are you? or any other custom messages
            })

            socket.on('deactivate_alert', (data) => {
                //delete from redis
                //first confirm the password, then store the alert details and the reason for deactivation in a seperate model
                //delete from redis
            })

            socket.on('close_alert', (data) => {
                //check if the lawyer ticked a)assisted b)not able to assist c)hoax
                //if assited, tick the aert as completed
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
                    //     io.of('/rider').to(`${allSockets.riders[data.riderid].ridersocketid}`).emit('error_message', { message: 'Failed to stored rider position' });
                });
            });

            socket.on('get_position', (data)=>{
                 //fetch position of a lawer/client with the public_id
                //data will contai dispatchid, userid
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    panicService.getStoredLawyerPosition(alertDetails.lawyer_id).then((lawyerDetails)=>{
                        allSockets.users[data.client_id].socket_address &&
                            io.of('/panic').to(`${allSockets.users[data.client_id].socket_address}`).emit('recieve_message', { message: "You got a new message", data: lawyerDetails });
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
            });

            socket.on('disconnect', (data) => {
                allSockets.removeRiderSocket(data.riderid)
            })
        })
    }
}

module.exports = { panicSocket, allSockets }