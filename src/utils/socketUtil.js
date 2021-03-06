var panicService = require('../services/panicService');
// const axios = require("axios");
var uuidv4 = require('uuid').v4;
var http = require('http');
var { getNearbyClients, getNearbyLawyers, sortNearbyDistance, calculateDistance } = require('./calculatorUtil');
const oneSignal = require('./oneSignalUtil');
const { getLocation } = require('./mapUtil');
const { allSockets } = require('../socket/panicSocket');


exports.userOnline = (data, allSockets) => {
    allSockets.users[data.public_id] ? allSockets.updateSocket(data) : allSockets.addSocket(data);

    if (data.user_type === "lawyer") {
        panicService.fetchAllUnresolved(data)
            .then((result) => {
                if (result.data.length < 1) {
                    allSockets.users[data.public_id]["available"] = true;
                } else {
                    console.log("THIS LAWYER ALREADY HAS AN ONGOING ALERT AND CANNOT BE AVAILBLE FOR NOW");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
};


const formatClientPanicRequestData = (data, result, locationDetails) => {
    data.client_id = data.public_id;
    data.status = "sent";
    data.resolved = false;
    data.client_img_url = result.image_url;
    data.client_name = result.first_name + " " + result.last_name;
    data.client_phonenumber = result.phone_number;
    data.client_email = result.email_address;
    data.client_state = result.client_state;
    data.client_country = result.client_country;
    data.client_device_id = result.device_id;
    data.creation_time = new Date();
    data.panic_initiation_longitude = data.user_longitude;
    data.panic_initiation_latitude = data.user_latitude;
    data.local_address = locationDetails.results[0].formatted_address;
    data.place_id = locationDetails.results[0].place_id;
    data.client_location = {
        local_address: locationDetails.results[0].formatted_address,
        place_id: locationDetails.results[0].place_id,
        latitude: data.user_latitude,
        longitude: data.user_longitude
    };
    // data.next_of_kin = {};
    return data;
};


exports.panicAlert = async (data, allSockets, lawyersContacted) => {
    try {
        data.alert_id = uuidv4();
        let sortedDistanceArray = [],
            distanceArray = [];

        if (allSockets.users[data.public_id] && allSockets.users[data.public_id].user_type === "lawyer") {
            if (allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = false;
        }

        const userDetails = await panicService.getUser(data.public_id);
        if (!userDetails) return new Error("user could not be found");

        const locationDetails = await getLocation(data.user_latitude, data.user_longitude);
        const unresolved = await panicService.fetchAllUnresolvedForClient(data);
        if (unresolved.data.length < 1) {
            allSockets.users[data.public_id] &&
                io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('alert_successful', { message: "Panic alert successful, You can now relax!", data: data.alert_id });

            if (userDetails.hoax_alert < 3) {
                data = formatClientPanicRequestData(data, userDetails, locationDetails);
                const nextOfKins = await panicService.getNextOfKin(data.public_id);
                if (nextOfKins.length > 0) {
                    data.next_of_kin = {
                        full_name: nextOfKins[0].full_name,
                        email_address: nextOfKins[0].email_address,
                        phone_number: nextOfKins[0].phone_number
                    };

                    data.next_of_kin_full_name = nextOfKins[0].full_name;
                    data.next_of_kin_email_address = nextOfKins[0].email_address;
                    data.next_of_kin_phone_number = nextOfKins[0].phone_number;
                    //Emit alert to NOKs
                    for (i = 0; i < nextOfKins.length; i++) {
                        if (nextOfKins[i].next_of_kin_id) {
                            allSockets.users[nextOfKins[i].next_of_kin_id] &&
                                io.of('/panic').to(`${allSockets.users[nextOfKins[i].next_of_kin_id].socket_address}`).emit('alert_kinsmen', { message: `${data.client_name} needs your help`, data });
                        }
                    }
                }

                const createdPanic = await panicService.createPanicAlert(data);

                Object.entries(allSockets.users).forEach(([key, value]) => {
                    if (value.user_type === "lawyer" && value.available === true) {
                        var distance = calculateDistance(data.user_latitude, data.user_longitude, value.user_latitude, value.user_longitude);
                        distanceArray = [...distanceArray, ...getNearbyLawyers(distance, value.public_id)];
                    }
                });

                sortedDistanceArray = sortNearbyDistance(distanceArray);

                for (i = 0; i < sortedDistanceArray.length; i++) {
                    lawyersContacted.push(sortedDistanceArray[i].public_id);
                    allSockets.users[sortedDistanceArray[i].public_id] &&
                        io.of('/panic').to(`${allSockets.users[sortedDistanceArray[i].public_id].socket_address}`).emit('alert_lawyer', { message: "Help! Help!! Help!!!", data });
                }
                panicService.storeAlertDetails(data);

            }
        }
    } catch (err) {
        //log error here
        allSockets.users[data.public_id] &&
            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('panic_alert_failed', { message: "failed to instantiate panic", data: null });
    }

};

const formatLawyerPanicAcceptanceData = (panicDetail, alertDetails, lawyerUserDetail, lawyerLocationDetails) => {
    panicDetail = { ...alertDetails, ...panicDetail };
    panicDetail.lawyer_id = panicDetail.public_id;
    panicDetail.lawyer_img_url = lawyerUserDetail.image_url;
    panicDetail.lawyer_name = lawyerUserDetail.first_name + " " + lawyerUserDetail.last_name;
    panicDetail.lawyer_phonenumber = lawyerUserDetail.phone_number;
    panicDetail.lawyer_device_id = lawyerUserDetail.device_id;
    panicDetail.lawyer_latitude = panicDetail.user_latitude;
    panicDetail.lawyer_longitude = panicDetail.user_longitude;
    panicDetail.lawyer_location = {
        local_address: lawyerLocationDetails.results[0].formatted_address,
        place_id: lawyerLocationDetails.results[0].place_id,
        longitude: panicDetail.user_latitude, latitude: panicDetail.user_longitude
    };
    panicDetail.lawyer_email = lawyerUserDetail.email_address;
    panicDetail.status = "accepted";
    panicDetail.resolved = false;
    panicDetail.accepted = true;
    // panicDetail.next_of_kin = {};
    delete panicDetail.nextOfKin;
    return panicDetail;
};


exports.acceptAlert = (panicAcceptanceDetail, allSockets, lawyersContacted) => {
    try {
        if (!panicAcceptanceDetail.public_id || !panicAcceptanceDetail.user_latitude || !panicAcceptanceDetail.user_longitude || !panicAcceptanceDetail.alert_id) return;

        Promise.all([panicService.getUser(panicAcceptanceDetail.public_id), getLocation(panicAcceptanceDetail.user_latitude, panicAcceptanceDetail.user_longitude), panicService.fetchAllUnresolved(panicAcceptanceDetail)]).then((allResults) => {
            let [lawyerUserDetail, locationDetails, unresolved] = allResults;
            if (!lawyerUserDetail) return;

            if (unresolved.data.length < 1) {
                panicService.getStoredAlertDetails(panicAcceptanceDetail.alert_id).then((alertDetails) => {
                    if (alertDetails.status === "sent") {
                        panicAcceptanceDetail = formatLawyerPanicAcceptanceData(panicAcceptanceDetail, alertDetails, lawyerUserDetail, locationDetails);

                        panicService.updateAlertOnMongo(panicAcceptanceDetail).then((updated) => {
                            // console.log("Acceptance details", panicAcceptanceDetail);
                            allSockets.users[panicAcceptanceDetail.public_id] &&
                                io.of('/panic').to(`${allSockets.users[panicAcceptanceDetail.public_id].socket_address}`).emit('acceptance_successful', { message: "You have accepted the alert successfully", data: panicAcceptanceDetail });

                            allSockets.users[alertDetails.client_id] &&
                                io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('alert_accepted', { message: "A lawyer is coming to your aid", data: panicAcceptanceDetail });


                            if (panicAcceptanceDetail.user_type && panicAcceptanceDetail.user_type === "lawyer") {
                                if (allSockets.users[panicAcceptanceDetail.public_id]) allSockets.users[panicAcceptanceDetail.public_id]["available"] = false;
                            }

                            const index = lawyersContacted.indexOf(panicAcceptanceDetail.public_id);

                            if (index > -1) {
                                lawyersContacted.splice(index, 1);
                            }

                            if (lawyersContacted.length > 0) {
                                for (i = 0; i < lawyersContacted.length; i++) {
                                    allSockets.users[lawyersContacted[i]] &&
                                        io.of('/panic').to(`${allSockets.users[lawyersContacted[i]].socket_address}`).emit('not_available', { message: "This request has already been accepted", data: { alert_id: alertDetails.alert_id, available: false } });
                                }
                            }
                        }).catch((error) => { console.log(error); });
                    } else {
                        allSockets.users[panicAcceptanceDetail.public_id] &&
                            io.of('/panic').to(`${allSockets.users[panicAcceptanceDetail.public_id].socket_address}`).emit('acceptance_failed', { message: "This alert no longer exist", data: { alert_id: panicAcceptanceDetail.alert_id, accepted: false } });
                    }
                }).catch((error) => { console.log(error); });
            } else {
                allSockets.users[panicAcceptanceDetail.public_id] &&
                    io.of('/panic').to(`${allSockets.users[panicAcceptanceDetail.public_id].socket_address}`).emit('lawyer_has_pending_alert_request', { message: "you have a pending request to complete", data: unresolved.data[0] });
            }

        });
    } catch (err) {
        console.log("error ocurred", err);
    }
};

exports.sendMessage = (data, allSockets) => {
    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails) => {
        if (data.to_who === "lawyer") {
            allSockets.users[alertDetails.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.lawyer_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
        }

        if (data.to_who === "client") {
            allSockets.users[alertDetails.client_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
        }

        if (data.to_who === "next_of_kin") {
            allSockets.users[data.next_of_kin_id] &&
                io.of('/panic').to(`${allSockets.users[data.next_of_kin_id].socket_address}`).emit('receive_message', { message: "You got a new message", data: data.message });
        }
    }).catch((error) => { console.log(error); });
};

exports.deactivateAlert = (data, allSockets, lawyersContacted) => {
    panicService.getAlert(data.alert_id).then((alertDetails) => {
        if (alertDetails) {
            allSockets.users[alertDetails.data.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.data.lawyer_id].socket_address}`).emit('alert_deactivated', { message: "Alert has been deactivated", data: { deactivated: true } });
        }

        if (lawyersContacted.length > 0) {
            for (i = 0; i < lawyersContacted.length; i++) {

                allSockets.users[lawyersContacted[i]].public_id &&
                    io.of('/panic').to(`${allSockets.users[lawyersContacted[i]].socket_address}`).emit('not_available', { message: "This request has already been deactivated already", data: { alert_id: data.alert_id, available: false } });
            }
        }
    }).catch((error) => { console.log(error); });
};

exports.closeAlert = (data, allSockets) => {
    if (data.lawyer_response === "assisted") {
        panicService.closeAlert(data).then((result) => {

            allSockets.users[result.lawyer_id] &&
                io.of('/panic').to(`${allSockets.users[result.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: { closed: true } });

            allSockets.users[result.client_id] &&
                io.of('/panic').to(`${allSockets.users[result.client_id].socket_address}`).emit('alert_closed', { message: "Lawyer has helped and alert has been closed", data: { event_type: "assisted" } });

            if (allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = true;

        }).catch((error) => { console.log(error); });
    }

    if (data.lawyer_response === "unassisted") {
        panicService.getStoredAlertDetails(data.alert_id).then((alertDetails) => {
            panicService.closeAlert(data).then((result) => {
                if (allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = true;

                allSockets.users[alertDetails.client_id] &&
                    io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('alert_closed', { message: "This lawyer could not assit you, please initate another panic", data: { event_type: "unassisted" } });

                allSockets.users[alertDetails.lawyer_id] &&
                    io.of('/panic').to(`${allSockets.users[alertDetails.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: { closed: true } });

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
            }).catch((error) => { console.log(error); });

        }).catch((error) => { console.log(error); });
    }

    if (data.lawyer_response === "hoax") {
        panicService.declareHoax(data).then((result) => {
            panicService.closeAlert(data).then((closed) => {
                allSockets.users[result.client_id] &&
                    io.of('/panic').to(`${allSockets.users[result.client_id].socket_address}`).emit('alert_closed', { message: "Your alert was declared a hoax", data: { event_type: "hoax" } });

                allSockets.users[result.lawyer_id] &&
                    io.of('/panic').to(`${allSockets.users[result.lawyer_id].socket_address}`).emit('alert_closed', { message: "Alert has been closed", data: { closed: true } });

                if (allSockets.users[data.public_id]) allSockets.users[data.public_id]["available"] = true;
            }).catch((error) => { console.log(error); });
        }).catch((error) => { console.log(error); });
    }
    /*if hoax, store in hoax model, increment the client numbers of hoax alert, if its up to 2, block him for one week, the emit to the
        cilent so that he/she can appeal and only th admin can revert the number of hoax and unblock
    */
};

exports.updateLawyerPosition = (data, allSockets) => {
    panicService.fetchAllUnresolved(data)
        .then((result) => {
            panicService.storePosition(data);

            var positionDetails = {
                lawyer_id: data.public_id,
                lawyer_longitude: data.user_longitude,
                lawyer_latitude: data.user_latitude
            };

            for (i = 0; i < result.data.length; i++) {
                console.log(allSockets.users[result.data[i].client_id]);

                allSockets.users[result.data[i].client_id] &&
                    io.of('/panic').to(`${allSockets.users[result.data[i].client_id].socket_address}`).emit('lawyer_position', { message: "Lawyer position", data: positionDetails });
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

exports.getLawyerPosition = (data, allSockets) => {
    //fetch position of a lawer/client with the public_id
    //data will contai dispatchid, userid
    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails) => {

        panicService.getStoredPosition(alertDetails.lawyer_id).then((lawyerDetails) => {
            var positionDetails = {
                lawyer_id: lawyerDetails.id,
                lawyer_longitude: lawyerDetails.user_longitude,
                lawyer_latitude: lawyerDetails.user_latitude
            };

            allSockets.users[alertDetails.client_id] &&
                io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('lawyer_position', { message: "Lawyers Position", data: positionDetails });
        }).catch((error) => { console.log(error); });
    }).catch((error) => { console.log(error); });
};

exports.updateNextOfKinPosition = (data, allSockets) => {
    //store update clients position on redis with the public_id
    //fetch all ongoing alerts of the person(possibly from redis) and emit position to the clients or lawyers
    //data will contai lawyerid, lawyerlongitude, lawyerlatitude
    panicService.getStoredAlertDetails(data.alert_id).then((alertDetails) => {
        panicService.storePosition(data);

        allSockets.users[alertDetails.client_id] &&
            io.of('/panic').to(`${allSockets.users[alertDetails.client_id].socket_address}`).emit('nok_position', { message: "Next of kin position", data });
    }).catch((error) => { console.log(error); });
};

exports.getNextOfKinPosition = (data, allSockets) => {
    //fetch position of a lawer/client with the public_id
    //data will contai dispatchid, userid
    panicService.getStoredPosition(data.next_of_kin_id).then((nokDetails) => {
        var positionDetails = {
            next_of_kin_id: nokDetails.id,
            next_of_kin_longitude: nokDetails.user_longitude,
            next_of_kin_latitude: nokDetails.user_latitude
        };

        allSockets.users[data.public_id] &&
            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('nok_position', { message: "Next of kin Position", data: positionDetails });
    }).catch((error) => { console.log(error); });
};

exports.findOlderPanics = (data, allSockets) => {
    panicService.getUser(data.public_id).then((result) => {
        panicService.fetchAllUnresolved(data)
            .then((unresolved) => {
                if (unresolved.data.length < 1) {
                    //fetch available panics and emit to lawyer
                    var sortedDistanceArray = [],
                        distanceArray = [],
                        distances = [];

                    panicService.fetchExistingAlerts().then((oldDispatchArray) => {
                        if (oldDispatchArray.length > 0) {
                            oldDispatchArray.map((oldDispatchObject) => {
                                if (oldDispatchObject.hasOwnProperty("user_longitude") && oldDispatchObject.status !== "accepted") {
                                    var distance = calculateDistance(allSockets.users[data.public_id].user_latitude, allSockets.users[data.public_id].user_longitude, oldDispatchObject.panic_initiation_latitude, oldDispatchObject.panic_initiation_longitude);
                                    distanceArray = [...distanceArray, ...getNearbyClients(distance, oldDispatchObject)];
                                }
                            });

                            if (distanceArray.length > 0) {

                                var clientAlerts = [];
                                sortedDistanceArray = sortNearbyDistance(distanceArray);

                                for (i = 0; i < sortedDistanceArray.length; i++) {
                                    if (sortedDistanceArray[i].next_of_kin_full_name || sortedDistanceArray[i].next_of_kin_email_address || sortedDistanceArray[i].next_of_kin_phone_number) {
                                        data.next_of_kin = {
                                            full_name: sortedDistanceArray[i].next_of_kin_full_name,
                                            email_address: sortedDistanceArray[i].next_of_kin_email_address,
                                            phone_number: sortedDistanceArray[i].next_of_kin_phone_number
                                        };
                                    } else {
                                        data.next_of_kin = {};
                                    }
                                    //JSON.parse(JSON.stringify(sortedDistanceArray[i].next_of_kin))

                                    sortedDistanceArray[i].next_of_kin = {
                                        full_name: sortedDistanceArray[i].next_of_kin_full_name,
                                        email_address: sortedDistanceArray[i].next_of_kin_email_address,
                                        phone_number: sortedDistanceArray[i].next_of_kin_phone_number
                                    };

                                    clientAlerts.push(sortedDistanceArray[i]);
                                }

                                allSockets.users[data.public_id] &&
                                    io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('older_alerts', { message: "Help! Help!! Help!!!", data: clientAlerts });
                            }
                        } else {
                            console.log("NO OLDER PANIC ALERTS");
                        }
                    }).catch((error) => {
                        console.error(error);
                        allSockets.users[data.public_id] &&
                            io.of('/panic').to(`${allSockets.users[data.public_id].socket_address}`).emit('error_message', { message: "Failed to fetch existing alerts, please try again", data: null });
                    });
                } else {
                    console.log("THIS LAWYER ALREADY HAS AN ONGOING ALERT AND CANNOT GET OLDER ALERTS");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }).catch((error) => { console.log(error); });
};