var socket = require('socket.io');
var panicService = require('../services/panicService');
var uuidv4 = require('uuid').v4;
var { getNearbyClients, getNearbyLawyers, sortNearbyDistance, calculateDistance} = require('../utils/calculatorUtil')
const oneSignal = require('../utils/oneSignalUtil')
// const Logger = require('../../bin/config/logger');

var allSockets = {}
allSockets.lawyers = {}
allSockets.clients = {}

allSockets.addSocket = function(details, user_type) {
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
    if((user_type === "lawyer" && this.lawyers[details.lawyer_id])){ 
        var lawyerDetails = this.lawyers[details.lawyer_id]
        this.lawyers[details.lawyer_id] = {...lawyerDetails, ...details };

        console.log("UPDATED NEW LAWYER", allSockets.lawyers)
    }
    
    if(user_type === "client" && this.clients[details.client_id]){ 
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
                    allSockets.updateSocket(data, data.user_type);
                } else {
                    allSockets.addSocket(data, data.user_type);
                }
            })

            socket.on('panic_alert', (data) => {
                data.alert_id = uuidv4()

                allSockets.clients[data.client_id] &&
                    io.of('/panic').to(`${allSockets.clients[data.client_id].socket_address}`).emit('alert_successful', { message: "Panic alert successful, You can now relax!", data: data.alert_id });

                panicService.getUser(data.client_id).then((result)=>{
                    if(result.hoax_alert < 3){
                        data.status = "sent"
                        data.resolved = false
                        data.client_img_url = result.image_url
                        data.client_name = result.first_name + " " + result.last_name
                        data.client_phonenumber = result.phone_number
                        data.client_email = result.email_address
                        data.client_state = result.client_state 
                        data.client_country = result.client_country
                        data.client_device_id = result.device_id

                        panicService.createPanicAlert(data).then((result)=>{
                            panicService.getNextOfKin(data.client_id).then((nextOfKins)=>{
                                var nextOfKin = [];
                                console.log("LIST OF NEXT OF KINS", nextOfKins)
                                if(nextOfKins.length > 0){
                                    //Emit alert to NOKs
                                    for (i = 0; i < nextOfKins.length; i++) {
                                        console.log("EMITTING TO NEXT OF KIN", nextOfKins[i].next_of_kin_id)
                                        nextOfKin.push(nextOfKins[i]);

                                        //if(nextOfKins[i].next_of_kin) data.next_of_kin_device_id = nextOfKins[i].next_of_kin.device_id
        ``
                                        if(nextOfKins[i].next_of_kin_id){
                                            allSockets.clients[nextOfKins[i].next_of_kin_id] &&
                                            io.of('/panic').to(`${allSockets.clients[nextOfKins[i].next_of_kin_id].socket_address}`).emit('alert_kinsmen', { message: "Help! Help!! Help!!!", data });
                                        }
                                    }
                                }

                                data.next_of_kin = nextOfKin  
                                var sortedDistanceArray = [],
                                distanceArray = []

                                Object.entries(allSockets.lawyers).forEach(([key, value]) => {
                                    var distance = calculateDistance(data.panic_initiation_latitude, data.panic_initiation_longitude, value.lawyer_latitude, value.lawyer_longitude)
                                    distanceArray = getNearbyLawyers(distance, value.lawyer_id);
                                });

                                sortedDistanceArray = sortNearbyDistance(distanceArray);
                                console.log(sortedDistanceArray)

                                for (i = 0; i < sortedDistanceArray.length; i++) {
                                    allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address &&
                                        io.of('/panic').to(`${allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", data });
                                }

                                //data.next_of_kin  = data.next_of_kin
                                console.log("BEFORE REDIS STORES ALERT DETAILS", data)
                                panicService.storeAlertDetails(data)
                            }).catch((error)=>{console.log(error)})
                        }).catch((error)=>{console.log(error)})
                    }else{
                        allSockets.clients[data.client_id] &&
                            io.of('/panic').to(`${allSockets.clients[data.client_id].socket_address}`).emit('failed', { message: "You were blocked for making hoax alerts, please contact the admin", data: null });
                    }
                }).catch((error)=>{console.log(error)})
            })

            socket.on('accept_alert', (data) => {
                panicService.getUser(data.lawyer_id).then((result)=>{
                    console.log('FETCED LAWYER DETAILS', result)
                    console.log("ACCEPTING ALERT",data)
                    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                        if(alertDetails.status === "sent"){
                            data.lawyer_img_url = result.image_url, 
                            data.lawyer_name = result.first_name + " " + result.last_name, 
                            data.lawyer_phonenumber = result.phone_number, 
                            data.lawyer_device_id = result.device_id,
                            data.lawyer_email = result.email_address,
                            data.status = "accepted",
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
                            data.client_country = alertDetails.client_country,
                            data.relationship = alertDetails.relationship, 
                            data.client_device_id = alertDetails.client_device_id
                            data.next_of_kin = alertDetails.next_of_kin

                            console.log("TO UPDATE THE EXISTING ALERT DETAILS WHEN LAWYER ACCEPTS", data)
                            panicService.updateAlertOnRedis(data)

                            panicService.updateAlertOnMongo(data).then((updated)=>{
                                console.log("ALERT DETAILS FETCHED FROM DB", alertDetails.client_id)

                                allSockets.clients[alertDetails.client_id] &&
                                    io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('alert_accepted', { message: "A lawyer is coming to your aid", data: updated });

                                allSockets.lawyers[data.lawyer_id] &&
                                    io.of('/panic').to(`${allSockets.lawyers[data.lawyer_id].socket_address}`).emit('acceptance_successful', { message: "You have accepted the alert successfully", data: {accepted: true} });
                                
                            }).catch((error)=>{console.log(error)})
                        }
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
            })

            socket.on('send_message', (data) => {
                //alert_id,user_id,to_who
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    console.log("MESSAGE", data.client_id, data.lawyer_id)
                    if(data.to_who === "lawyer"){
                        console.log("MESSAGE lawyer",alertDetails.lawyer_id)
                        allSockets.lawyers[alertDetails.lawyer_id] &&
                            io.of('/panic').to(`${allSockets.lawyers[alertDetails.lawyer_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
                    }
                    
                    if(data.to_who === "client"){
                        console.log("MESSAGE client", alertDetails.client_id)
                        allSockets.clients[alertDetails.client_id] &&
                            io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
                    }

                    if(data.to_who === "next_of_kin"){
                        console.log("MESSAGE next of kin", data.next_of_kin_id)
                        allSockets.clients[data.next_of_kin_id] &&
                            io.of('/panic').to(`${allSockets.clients[data.next_of_kin_id].socket_address}`).emit('receive_message', {message: "You got a new message", data: data.message});
                    }
                }).catch((error)=>{console.log(error)})
            })

            socket.on('close_alert', (data) => {
                console.log("CLOSE ALERT DATA", {data})

                if(data.lawyer_response === "assisted"){
                    panicService.closeAlert(data).then((result)=>{
                        allSockets.lawyers[result.lawyer_id] &&
                        io.of('/panic').to(`${allSockets.lawyers[result.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: result });

                        allSockets.clients[result.client_id] &&
                        io.of('/panic').to(`${allSockets.clients[result.client_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: result });
                    }).catch((error)=>{console.log(error)})
                }
                
                if (data.lawyer_response === "unassisted"){
                    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                        console.log("get the alert details========================", alertDetails)

                        alertDetails.next_of_kin = JSON.parse(JSON.stringify(alertDetails.next_of_kin))
                        var sortedDistanceArray = [],
                        distanceArray = []

                        //create object to put all clients details from Redis and then send to the new Lawyers

                        Object.entries(allSockets.lawyers).forEach(([key, value]) => {
                            if (value.lawyer_id !== data.lawyer_id) {
                                console.log("did you her get at all at all", value)
                                var distance = calculateDistance(alertDetails.panic_initiation_latitude, alertDetails.panic_initiation_longitude, value.lawyer_latitude, value.lawyer_longitude)
                                distanceArray = getNearbyLawyers(distance, value.lawyer_id);
                            }
                        });
                        sortedDistanceArray = sortNearbyDistance(distanceArray);

                        for (i = 0; i < sortedDistanceArray.length; i++) {
                            console.log("LAWYER TO ASK FOR HELP", allSockets.lawyers[sortedDistanceArray[i].lawyer_id] )

                            allSockets.lawyers[sortedDistanceArray[i].lawyer_id] &&
                                io.of('/panic').to(`${allSockets.lawyers[sortedDistanceArray[i].lawyer_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", alertDetails });
                        }
                    }).catch((error)=>{console.log(error)})
                }
                
                if (data.lawyer_response === "hoax"){
                    panicService.declareHoax(data).then((result)=>{
                        allSockets.clients[result.client_id] &&
                        io.of('/panic').to(`${allSockets.clients[result.client_id].socket_address}`).emit('declared_hoax', { message: "Your alert was declared a hoax, do you want to appeal against this?", data: null });
                    }).catch((error)=>{console.log(error)})
                }
                /*if hoax, store in hoax model, increment the client numbers of hoax alert, if its up to 2, block him for one week, the emit to the 
                    cilent so that he/she can appeal and only th admin can revert the number of hoax and unblock
                */
            })

            socket.on('update_lawyer_position', (data)=>{
                panicService.fetchAllUnresolved(data)
                .then((result) => {
                    console.log("LIST OF UNRESOLVED PANIC",result)
                    console.log("LAWYER TO STORE HIS POSITION", data)
                    panicService.storePosition(data)


                    for(i=0; i<result.data.length; i++){
                        console.log(allSockets.clients[result.data[i].client_id])

                        allSockets.clients[result.data[i].client_id] &&
                            io.of('/panic').to(`${allSockets.clients[result.data[i].client_id].socket_address}`).emit('lawyer_position', {message:"Lawyer position", data});
                    }
                })
                .catch((error) => {
                    console.error(error)
                });
            });

            socket.on('get_lawyer_position', (data)=>{
                 //fetch position of a lawer/client with the public_id
                //data will contai dispatchid, userid
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    console.log("ONTO POSITION DETAILS", alertDetails)

                    panicService.getStoredPosition(alertDetails.lawyer_id).then((lawyerDetails)=>{
                        console.log("LAWYER TO GET HIS POSITION", lawyerDetails)
                        var positionDetails = {
                            lawyer_id: lawyerDetails.id, 
                            lawyer_longitude: lawyerDetails.longitude, 
                            lawyer_latitude: lawyerDetails.latitude
                        }

                        allSockets.clients[alertDetails.client_id] &&
                            io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('lawyer_position', { message: "Lawyers Position", data: positionDetails });
                    }).catch((error)=>{console.log(error)})
                }).catch((error)=>{console.log(error)})
            });

            socket.on('update_nok_position', (data)=>{
                //store update clients position on redis with the public_id
                //fetch all ongoing alerts of the person(possibly from redis) and emit position to the clients or lawyers 
                //data will contai lawyerid, lawyerlongitude, lawyerlatitude
                console.log("UPDATING NOK POSITION", data)
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    console.log("NOK TO STORE HIS POSITION", data)
                    panicService.storePosition(data)

                    allSockets.clients[alertDetails.client_id] &&
                        io.of('/panic').to(`${allSockets.clients[alertDetails.client_id].socket_address}`).emit('nok_position', {message:"Next of kin position", data});
                }).catch((error)=>{console.log(error)})
            });

            socket.on('get_nok_position', (data)=>{
                //fetch position of a lawer/client with the public_id
               //data will contai dispatchid, userid
               console.log("GET NOK POSITION",data)
                panicService.getStoredPosition(data.next_of_kin_id).then((nokDetails)=>{
                    console.log("NOK TO GET HIS POSITION", nokDetails)
                    var positionDetails = {
                        next_of_kin_id: nokDetails.id, 
                        next_of_kin_longitude: nokDetails.longitude, 
                        next_of_kin_latitude: nokDetails.latitude
                    }

                    allSockets.clients[data.client_id] &&
                        io.of('/panic').to(`${allSockets.clients[data.client_id].socket_address}`).emit('nok_position', { message: "Next of kin Position", data: positionDetails });
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
                            // console.log("EXISTING ALERT DISTANCES", distanceArray)

                            if (distanceArray.length > 0) {
                                var clientAlerts = [];
                                    sortedDistanceArray = sortNearbyDistance(distanceArray);

                                    //console.log("SORTED EXISTING ALERTS", sortedDistanceArray)

                                for (i = 0; i < sortedDistanceArray.length; i++) {
                                    console.log("EXISTING ALERT DISTANCES", typeof(sortedDistanceArray[i].next_of_kin))
                                    JSON.parse(JSON.stringify(sortedDistanceArray[i].next_of_kin))
                                    //get full user details and then push
                                    // if(sortedDistanceArray[i].next_of_kin){
                                    //     sortedDistanceArray[i].next_of_kin = JSON.parse(sortedDistanceArray[i].next_of_kin)
                                    // }

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
        })
    }
}

module.exports = { panicSocket, allSockets }