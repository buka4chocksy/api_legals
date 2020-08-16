var panicService = require('../services/panicService');
// const axios = require("axios");
var uuidv4 = require('uuid').v4;
var http = require('http');
var { getNearbyClients, getNearbyLawyers, sortNearbyDistance, calculateDistance} = require('./calculatorUtil')
const oneSignal = require('./oneSignalUtil');
const {getLocation} = require('./mapUtil')
const { allSockets } = require('../socket/panicSocket');


exports.userOnline = (data, allSockets) => {
    allSockets.users[data.public_id] ? allSockets.updateSocket(data) : allSockets.addSocket(data);

    if(data.user_type === "lawyer"){
        panicService.fetchAllUnresolved(data)
        .then((result) => {
            console.log("LIST OF OPEN ALERT FOR THIS LAWYER", result)
            if(result.data.length < 1){
                allSockets.users[data.public_id]["available"] = true
                console.log("new lawyer details", allSockets.users[data.public_id])
            }else{
                console.log("THIS LAWYER ALREADY HAS AN ONGOING ALERT AND CANNOT BE AVAILBLE FOR NOW")
            }
        })
        .catch((error) => {
            console.error(error)
        });
    }
}

exports.panicAlert = async(data, allSockets, lawyersContacted) => {
    data.alert_id = uuidv4()

    if(allSockets.users[data.public_id] && allSockets.users[data.public_id].user_type === "lawyer"){
        if(allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = false
    }

    panicService.getUser(data.public_id).then((result)=>{
        console.log('GET USER SUCCESS')

        getLocation(data.user_latitude, data.user_longitude)
        .then((locationDetails)=>{
            console.log("ANOTHERANOTHERANOTHERANOTHERANOTHERANOTHERANOTHERANOTHERANOTHERANOTHER", locationDetails.results[0].formatted_address, locationDetails.results[0].place_id)
            panicService.fetchAllUnresolvedForClient(data)
            .then((unresolved) => {
                    if(unresolved.data.length < 1){
                        allSockets.users[data.public_id] &&
                            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('alert_successful', { message: "Panic alert successful, You can now relax!", data: data.alert_id });

                    if(result.hoax_alert < 3){
                        data.client_id = data.public_id
                        data.status = "sent"
                        data.resolved = false
                        data.client_img_url = result.image_url
                        data.client_name = result.first_name + " " + result.last_name
                        data.client_phonenumber = result.phone_number
                        data.client_email = result.email_address
                        data.client_state = result.client_state 
                        data.client_country = result.client_country
                        data.client_device_id = result.device_id
                        data.creation_time = new Date()
                        data.panic_initiation_longitude = data.user_longitude
                        data.panic_initiation_latitude = data.user_latitude
                        data.local_address = locationDetails.results[0].formatted_address
                        data.place_id = locationDetails.results[0].place_id
            
                        panicService.createPanicAlert(data).then((result)=>{
                            panicService.getNextOfKin(data.public_id).then((nextOfKins)=>{
                                //var nextOfKin = [];
                                console.log("LIST OF NEXT OF KINS", nextOfKins)
                                if(nextOfKins.length > 0){
                                    data.next_of_kin = {
                                        full_name: nextOfKins[0].full_name,
                                        email_address: nextOfKins[0].email_address,
                                        phone_number: nextOfKins[0].phone_number
                                    }
            
                                    data.next_of_kin_full_name = nextOfKins[0].full_name
                                    data.next_of_kin_email_address = nextOfKins[0].email_address
                                    data.next_of_kin_phone_number = nextOfKins[0].phone_number
                                    //Emit alert to NOKs
                                    for (i = 0; i < nextOfKins.length; i++) {
                                        //nextOfKin.push(nextOfKins[i]);
            
                                        if(nextOfKins[i].next_of_kin_id){
                                            allSockets.users[nextOfKins[i].next_of_kin_id] &&
                                            io.of('/panic').to(`${allSockets.users[nextOfKins[i].next_of_kin_id].socket_address}`).emit('alert_kinsmen', { message: "Help! Help!! Help!!!", data });
                                        }
                                    }
                                }else{
                                    data.next_of_kin = {}
                                }
            
                                var sortedDistanceArray = [],
                                distanceArray = []
            

                                Object.entries(allSockets.users).forEach(([key, value]) => {
                                    if(value.user_type === "lawyer" && value.available === true){
                                        console.log("POINTS TO SELECT WITH", data.user_latitude, data.user_longitude, value.user_latitude, value.user_longitude)
                                        var distance = calculateDistance(data.user_latitude, data.user_longitude, value.user_latitude, value.user_longitude)
                                        distanceArray = [...distanceArray, ...getNearbyLawyers(distance, value.public_id)];
                                    }        
                                });
            
                                sortedDistanceArray = sortNearbyDistance(distanceArray);

                                console.log("ARRAY OF LAYWERS",sortedDistanceArray)
            
                                for (i = 0; i < sortedDistanceArray.length; i++) {
                                    console.log("LAWYER ID TO EMIT TO", allSockets.users[sortedDistanceArray[i].public_id], allSockets.users[sortedDistanceArray[i].public_id].socket_address)

                                    lawyersContacted.push(sortedDistanceArray[i].public_id)

                                    allSockets.users[sortedDistanceArray[i].public_id] &&
                                        io.of('/panic').to(`${allSockets.users[sortedDistanceArray[i].public_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", data });
                                }
            
                                console.log("BEFORE REDIS STORES ALERT DETAILS", data)
                                panicService.storeAlertDetails(data)
                                console.log("LIST OF CONTACTED RIDERS", lawyersContacted)
                            }).catch((error)=>{console.log(error)})
                        }).catch((error)=>{console.log(error)})
                    }else{
                        allSockets.users[data.id] &&
                            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('failed', { message: "You were blocked for making hoax alerts, please contact the admin", data: null });
                    }
                }else{
                    console.log("THIS CLIENT ALREADY HAS AN ONGOING ALERT AND CANNOT BE PANIC MORE")
                }
            })
            .catch((error) => {
                console.error(error)
            });
        })
        .catch((error)=>{console.log(error)})
    }).catch((error)=>{console.log(error)})
}

exports.acceptAlert = (data, allSockets, lawyersContacted) => {
    console.log("USER LAT AND LONG CHECK FOR ACCEPTING", data);
    panicService.getUser(data.public_id).then((result)=>{
        panicService.fetchAllUnresolved(data)
        .then((unresolved) => {
            if(unresolved.data.length < 1){
                panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
                    if(alertDetails.status === "sent"){
                        data.lawyer_id = data.public_id
                        data.lawyer_img_url = result.image_url
                        data.lawyer_name = result.first_name + " " + result.last_name
                        data.lawyer_phonenumber = result.phone_number
                        data.lawyer_device_id = result.device_id
                        data.lawyer_latitude = data.user_latitude
                        data.lawyer_longitude = data.user_longitude
                        data.lawyer_email = result.email_address
                        data.status = "accepted"
                        data.client_img_url = alertDetails.client_img_url
                        data.alert_id = alertDetails.alert_id
                        data.creation_time = alertDetails.creation_time
                        data.client_name = alertDetails.client_name
                        data.client_phonenumber = alertDetails.client_phonenumber
                        data.client_email = alertDetails.client_email
                        data.client_id = alertDetails.client_id
                        data.panic_initiation_location = alertDetails.panic_initiation_location
                        data.destination = alertDetails.destination
                        data.resolved = false
                        data.alert_type = alertDetails.alert_type
                        data.panic_initiation_latitude = alertDetails.panic_initiation_latitude 
                        data.panic_initiation_longitude = alertDetails.panic_initiation_longitude
                        data.client_state = alertDetails.client_state
                        data.client_country = alertDetails.client_country
                        data.relationship = alertDetails.relationship
                        data.client_device_id = alertDetails.client_device_id
                        data.local_address = alertDetails.local_address
                        data.place_id = alertDetails.place_id
                        //data.next_of_kin = JSON.parse(JSON.stringify(alertDetails.next_of_kin.toString().replace("\n", "")))
                        data.accepted = true
        
                        if(alertDetails.next_of_kin_full_name || alertDetails.next_of_kin_email_address || alertDetails.next_of_kin_phone_number){
                            data.next_of_kin = {
                                full_name: alertDetails.next_of_kin_full_name,
                                email_address: alertDetails.next_of_kin_email_address,
                                phone_number: alertDetails.next_of_kin_phone_number
                            }
                        }else{
                            data.next_of_kin = {}
                        }
        
                        console.log("TO UPDATE THE EXISTING ALERT DETAILS WHEN LAWYER ACCEPTS", data, "NEXT OF KIN DETAILSSSSSS", data.next_of_kin)
                        panicService.updateAlertOnRedis(data)
        
                        panicService.updateAlertOnMongo(data).then((updated)=>{
                            allSockets.users[alertDetails.client_id] &&
                                io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('alert_accepted', { message: "A lawyer is coming to your aid", data: data });
        
                            allSockets.users[data.public_id] &&
                                io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('acceptance_successful', { message: "You have accepted the alert successfully", data: data });
                            
                            if(data.user_type && data.user_type === "lawyer"){
                                if(allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = false
                            }

                            const index = lawyersContacted.indexOf(data.public_id);

                            if (index > -1) {
                                lawyersContacted.splice(index, 1);
                            }

                            if(lawyersContacted.length>0){
                                for (i = 0; i < lawyersContacted.length; i++) {
                                    console.log("LAWYERS INFORMED THAT ALERT HAS BEEN ACCEPTED", lawyersContacted, allSockets.users[lawyersContacted[i]].public_id, allSockets.users[lawyersContacted[i]].socket_address)

                                    allSockets.users[lawyersContacted[i]] &&
                                        io.of('/panic').to(`${allSockets.users[lawyersContacted[i]].socket_address}`).emit('not_available', { message: "This request has already been accepted", data: { alert_id: alertDetails.alert_id, available: false } });
                                }
                            }
                        }).catch((error)=>{console.log(error)})
                    }else{
                        console.log("ACCEPTANCE FAILED", allSockets.users[data.public_id])
                        allSockets.users[data.public_id] &&
                            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('acceptance_failed', { message: "This alert no longer exist", data: {alert_id: data.alert_id, accepted: false }});
                    }
                }).catch((error)=>{console.log(error)})
            }else{
                console.log("THIS LAWYER ALREADY HAS AN ONGOING ALERT AND CANNOT BE AVAILBLE FOR NOW")
            }
        })
        .catch((error) => {
            console.error(error)
        });
    }).catch((error)=>{console.log(error)})
}

exports.sendMessage = (data, allSockets) => {
    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
        console.log("MESSAGE", data.client_id, data.lawyer_id)
        if(data.to_who === "lawyer"){
            console.log("MESSAGE lawyer",alertDetails)
            allSockets.users[alertDetails.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.lawyer_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
        }
        
        if(data.to_who === "client"){
            console.log("MESSAGE client", alertDetails.client_id)
            allSockets.users[alertDetails.client_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
        }

        if(data.to_who === "next_of_kin"){
            console.log("MESSAGE next of kin", data.next_of_kin_id)
            allSockets.users[data.next_of_kin_id] &&
                io.of('/panic').to(`${allSockets.users[data.next_of_kin_id].socket_address}`).emit('receive_message', {message: "You got a new message", data: data.message});
        }
    }).catch((error)=>{console.log(error)})
}

exports.deactivateAlert = (data, allSockets, lawyersContacted) => {
    //panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
        panicService.getAlert(data.alert_id).then((alertDetails)=>{
            console.log("MESSAGE lawyer",alertDetails)
            console.log("RESULT", alertDetails)
            if(alertDetails){
                console.log("TRYING TO DEAVTIVATE", alertDetails);
                allSockets.users[alertDetails.data.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.data.lawyer_id].socket_address}`).emit('alert_deactivated', { message: "Alert has been deactivated", data: {deactivated: true} });
            }

                console.log('LAWYERS TO BE CONTACTED WHEN DEACTIVATIN', lawyersContacted)
            if(lawyersContacted.length>0){
                for (i = 0; i < lawyersContacted.length; i++) {
                    console.log('LAWYERS TO BE CONTACTED WHEN DEACTIVATIN', allSockets.users[lawyersContacted[i]].socket_address)

                    allSockets.users[lawyersContacted[i]].public_id &&
                        io.of('/panic').to(`${allSockets.users[lawyersContacted[i]].socket_address}`).emit('not_available', { message: "This request has already been deactivated already", data: { alert_id: data.alert_id, available: false } });
                }
            }
        // panicService.delet(data.alert_id)
        }).catch((error)=>{console.log(error)})
    //}).catch((error)=>{console.log(error)})
}

exports.closeAlert = (data, allSockets) => {
    console.log("CLOSE ALERT DATA", {data})
    if(data.lawyer_response === "assisted"){
        panicService.closeAlert(data).then((result)=>{

            console.log("ASSISTED=================================", result)
            allSockets.users[result.lawyer_id] &&
            io.of('/panic').to(`${allSockets.users[result.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: {closed: true} });

            allSockets.users[result.client_id] &&
            io.of('/panic').to(`${allSockets.users[result.client_id].socket_address}`).emit('alert_closed', { message: "Lawyer has helped and alert has been closed", data: {event_type: "assisted"} });

            if(allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = true
            
        }).catch((error)=>{console.log(error)})
    }
    
    if (data.lawyer_response === "unassisted"){
        panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
            panicService.closeAlert(data).then((result)=>{
                if(allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = true

                console.log("UNASSISTED==========================", alertDetails)
                allSockets.users[alertDetails.client_id] &&
                    io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('alert_closed', { message: "This lawyer could not assit you, please initate another panic", data: {event_type: "unassisted"} });

                allSockets.users[alertDetails.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: {closed: true} });

                //DON'T CLEAN THIS SET OF COMMETED CODES OOOO
                // alertDetails.next_of_kin = JSON.parse(JSON.stringify(alertDetails.next_of_kin))
                // var sortedDistanceArray = [],
                // distanceArray = []

                // Object.entries(allSockets.users).forEach(([key, value]) => {
                //     if(value.user_type === "lawyer" && value.available === true){
                //         if (value.public_id !== data.public_id) {
                //             console.log("did you her get at all at all", value)
                //             var distance = calculateDistance(alertDetails.panic_initiation_latitude, alertDetails.panic_initiation_longitude, value.user_latitude, value.user_longitude)
                //             distanceArray = getNearbyLawyers(distance, value.lawyer_id);
                //         }
                //     }
                // });
                // sortedDistanceArray = sortNearbyDistance(distanceArray);

                // for (i = 0; i < sortedDistanceArray.length; i++) {
                //     console.log("LAWYER TO ASK FOR HELP", allSockets.users[sortedDistanceArray[i].public_id] )

                //     allSockets.users[sortedDistanceArray[i].public_id] &&
                //         io.of('/panic').to(`${allSockets.users[sortedDistanceArray[i].public_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", alertDetails });
                // }
            }).catch((error)=>{console.log(error)})
                
        }).catch((error)=>{console.log(error)})
    }
    
    if (data.lawyer_response === "hoax"){
        panicService.declareHoax(data).then((result)=>{
            panicService.closeAlert(data).then((closed)=>{
                console.log("HOAX ALERT=====================", result)
                allSockets.users[result.client_id] &&
                    io.of('/panic').to(`${allSockets.users[result.client_id].socket_address}`).emit('alert_closed', { message: "Your alert was declared a hoax", data: {event_type: "hoax"}});

                allSockets.users[result.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[result.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: {closed: true} });

                if(allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = true
            }).catch((error)=>{console.log(error)})
        }).catch((error)=>{console.log(error)})
    }
    /*if hoax, store in hoax model, increment the client numbers of hoax alert, if its up to 2, block him for one week, the emit to the 
        cilent so that he/she can appeal and only th admin can revert the number of hoax and unblock
    */
}

exports.updateLawyerPosition = (data, allSockets) => {
    console.log("POSITION DATA", data)
    panicService.fetchAllUnresolved(data)
        .then((result) => {
            console.log("LIST OF UNRESOLVED PANIC",result)
            console.log("LAWYER TO STORE HIS POSITION", data)
            panicService.storePosition(data)

            var positionDetails = {
                lawyer_id: data.public_id, 
                lawyer_longitude: data.user_longitude, 
                lawyer_latitude: data.user_latitude
            }

            for(i=0; i<result.data.length; i++){
                console.log(allSockets.users[result.data[i].client_id])

                allSockets.users[result.data[i].client_id] &&
                    io.of('/panic').to(`${allSockets.users[result.data[i].client_id].socket_address}`).emit('lawyer_position', {message:"Lawyer position", data: positionDetails});
            }
        })
        .catch((error) => {
            console.error(error)
        });
}

exports.getLawyerPosition = (data, allSockets) => {
    //fetch position of a lawer/client with the public_id
    //data will contai dispatchid, userid
    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
        console.log("ONTO POSITION DETAILS", alertDetails)

        panicService.getStoredPosition(alertDetails.lawyer_id).then((lawyerDetails)=>{
            console.log("LAWYER TO GET HIS POSITION", lawyerDetails)
            var positionDetails = {
                lawyer_id: lawyerDetails.id, 
                lawyer_longitude: lawyerDetails.user_longitude, 
                lawyer_latitude: lawyerDetails.user_latitude
            }

            allSockets.users[alertDetails.client_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('lawyer_position', { message: "Lawyers Position", data: positionDetails });
        }).catch((error)=>{console.log(error)})
    }).catch((error)=>{console.log(error)})
}

exports.updateNextOfKinPosition = (data, allSockets) => {
    //store update clients position on redis with the public_id
    //fetch all ongoing alerts of the person(possibly from redis) and emit position to the clients or lawyers 
    //data will contai lawyerid, lawyerlongitude, lawyerlatitude
    console.log("UPDATING NOK POSITION", data)
    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails)=>{
        console.log("NOK TO STORE HIS POSITION", data)
        panicService.storePosition(data)

        allSockets.users[alertDetails.client_id] &&
            io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('nok_position', {message:"Next of kin position", data});
    }).catch((error)=>{console.log(error)})
}

exports.getNextOfKinPosition = (data, allSockets) => {
    //fetch position of a lawer/client with the public_id
    //data will contai dispatchid, userid
    console.log("GET NOK POSITION",data)
    panicService.getStoredPosition(data.next_of_kin_id).then((nokDetails)=>{
        console.log("NOK TO GET HIS POSITION", nokDetails)
        var positionDetails = {
            next_of_kin_id: nokDetails.id, 
            next_of_kin_longitude: nokDetails.user_longitude, 
            next_of_kin_latitude: nokDetails.user_latitude
        }

        allSockets.users[data.public_id] &&
            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('nok_position', { message: "Next of kin Position", data: positionDetails });
    }).catch((error)=>{console.log(error)})
}

exports.findOlderPanics = (data, allSockets) => {
    panicService.getUser(data.public_id).then((result)=>{
        panicService.fetchAllUnresolved(data)
            .then((unresolved) => {
                if(unresolved.data.length < 1){
                    //fetch available panics and emit to lawyer
                var sortedDistanceArray = [],
                distanceArray = [],
                distances = [];

                panicService.fetchExistingAlerts().then((oldDispatchArray) => {
                    if(oldDispatchArray.length > 0){
                        console.log('OLD ALERT LENTGH',oldDispatchArray.length)
                        oldDispatchArray.map((oldDispatchObject) => {
                            if (oldDispatchObject.hasOwnProperty("user_longitude") && oldDispatchObject.status !== "accepted") {
                                var distance = calculateDistance(allSockets.users[data.public_id].user_latitude, allSockets.users[data.public_id].user_longitude, oldDispatchObject.panic_initiation_latitude, oldDispatchObject.panic_initiation_longitude);
                                distanceArray =[...distanceArray, ...getNearbyClients(distance, oldDispatchObject)];
                            }
                        });

                        console.log('DISNTACE ARRAY LENGTH', distanceArray.length)
                        if (distanceArray.length > 0) {

                            var clientAlerts = [];
                                sortedDistanceArray = sortNearbyDistance(distanceArray);

                            for (i = 0; i < sortedDistanceArray.length; i++) {
                                if(sortedDistanceArray[i].next_of_kin_full_name || sortedDistanceArray[i].next_of_kin_email_address || sortedDistanceArray[i].next_of_kin_phone_number){
                                    data.next_of_kin = {
                                        full_name: sortedDistanceArray[i].next_of_kin_full_name,
                                        email_address: sortedDistanceArray[i].next_of_kin_email_address,
                                        phone_number: sortedDistanceArray[i].next_of_kin_phone_number
                                    }
                                }else{
                                    data.next_of_kin = {}
                                }
                                console.log("EXISTING ALERT DISTANCES", typeof(sortedDistanceArray[i].next_of_kin))
                                //JSON.parse(JSON.stringify(sortedDistanceArray[i].next_of_kin))

                                sortedDistanceArray[i].next_of_kin = {
                                    full_name: sortedDistanceArray[i].next_of_kin_full_name,
                                    email_address: sortedDistanceArray[i].next_of_kin_email_address,
                                    phone_number: sortedDistanceArray[i].next_of_kin_phone_number
                                }

                                clientAlerts.push(sortedDistanceArray[i]);
                            }

                            console.log("OLDER ALERTS TO LAWYER", allSockets.users[data.public_id])
                            allSockets.users[data.public_id] &&
                                io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('older_alerts', { message: "Help! Help!! Help!!!", data: clientAlerts });
                        }
                    }else{
                        console.log("NO OLDER PANIC ALERTS")
                    }
                }).catch((error) => {
                    console.error(error)
                    allSockets.users[data.public_id] &&
                        io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('error_message', { message: "Failed to fetch existing alerts, please try again", data: null });
                })
                }else{
                    console.log("THIS LAWYER ALREADY HAS AN ONGOING ALERT AND CANNOT GET OLDER ALERTS")
                }
            })
            .catch((error) => {
                console.error(error)
            });
    }).catch((error)=>{console.log(error)})
}