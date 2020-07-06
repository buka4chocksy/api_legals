var socket = require('socket.io');
var {getUser} = require('../services/panicService');
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
                    var rider = { socket, ...data };
                    allSockets.addRiderSocket(rider);
                }
            })

            socket.on('panic_alert', (data) => {
                
                //create_unique_id for the alert
                //store on redis and on mongo
                //emit to NettOfKin and all nearby lawyers
            })

            socket.on('accept_alert', (data) => {
                //tick alert as accepted, 
            })

            socket.on('send_message', (data) => {
                //send messages between client and lawyers
                //like Canyou talk? Where are you? or any other custom messages
            })

            socket.on('deactivate_alert', (data) => {
                //first confirm the password, then store the alert details and the reason for deactivation in a seperate model
            })

            socket.on('close_alert', (data) => {
                //check if the lawyer ticked a)assisted b)not able to assist c)hoax
                //if assited, tick the aert as completed
                //if not assited, find other nearby lawyers and emit the alert to them
                /*if hoax, store in hoax model, increment the client numbers of hoax alert, if its up to 2, block him for one week, the emit to the 
                    cilent so that he/she can appeal and only th admin can revert the number of hoax and unblock
                */
            })

            socket.on('update_position', (data)=>{
                //store/update clients position on redis with the public_id
                //fetch all ongoing alerts of the person(possibly from redis) and emit position to the clients or lawyers 
            })

            socket.on('get_position', (data)=>{
                //fetch position of a lawer/client with the public_id
            })

            socket.on('disconnect', (data) => {
                allSockets.removeRiderSocket(data.riderid)
            })
        })
    }
}

module.exports = { panicSocket, allSockets }