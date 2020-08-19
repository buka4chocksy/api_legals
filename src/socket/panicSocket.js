var socket = require('socket.io');
// var { panicAlert, acceptAlert, sendMessage, getLawyerPosition, getNextOfKinPosition, updateLawyerPosition, updateNextOfKinPosition, closeAlert, findOlderPanics, userOnline } = require('../utils/socketUtil');
var socketUtil = require('../utils/socketUtil');
const { get } = require('mongoose');
// var panicService = require('../services/panicService');
// var uuidv4 = require('uuid').v4;
// var { getNearbyClients, getNearbyLawyers, sortNearbyDistance, calculateDistance} = require('../utils/calculatorUtil')
// const oneSignal = require('../utils/oneSignalUtil')
// const Logger = require('../../bin/config/logger');

//WHEN A LAWYER ACCEPTS A PANIC OR MAKES A PANIC ALERT SET HIS "AVAILBLE" TO FALSE AND SET TO TRUE ONLY WHEN COMPLETED

var allSockets = {}
allSockets.users = {}

var lawyersContacted = []

allSockets.addSocket = function(details) {
    this.users[details.public_id] = { ...details } 
    console.log("ADDED NEW USER", allSockets.users)  
}

allSockets.updateSocket = function(details) {
    var userDetails = this.users[details.public_id]
    this.users[details.public_id] = {...userDetails, ...details };
    console.log("UPDATED USER", allSockets.users)  
}

function panicSocket(server) {
    io = socket(server)
    this.panicAlert = () => {
        io.of("/panic").on('connection', (socket) => {
            

            socket.on('online', (data) => {
                data["socket_address"] = socket.id
                socketUtil.userOnline(data, allSockets)
            })


            socket.on('deactivate_alert', (data) => {
                //alert_id
                console.log("REQUESTING TO DEACTIVATE PANIC")
                socketUtil.deactivateAlert(data, allSockets, lawyersContacted)
            })
            
            socket.on('panic_alert', (data) => {
                //id
                socketUtil.panicAlert(data, allSockets, lawyersContacted)
            })

            socket.on('accept_alert', (data) => {
                socketUtil.acceptAlert(data, allSockets, lawyersContacted)
            })

            socket.on('send_message', (data) => {
                //alert_id,public_id,to_who
                socketUtil.sendMessage(data, allSockets)
            })

            socket.on('close_alert', (data) => {
                socketUtil.closeAlert(data, allSockets)
            })

            socket.on('update_lawyer_position', (data)=>{
                socketUtil.updateLawyerPosition(data, allSockets)
            });

            socket.on('get_lawyer_position', (data)=>{
                socketUtil.getLawyerPosition(data, allSockets)
            });

            socket.on('update_nok_position', (data)=>{
                socketUtil.updateNextOfKinPosition(data, allSockets)
            });

            socket.on('get_nok_position', (data)=>{
                socketUtil.getNextOfKinPosition(data, allSockets)
           });

            socket.on('find_panics', (data)=>{
                socketUtil.findOlderPanics(data, allSockets)
            })
        })
    }
}

module.exports = { panicSocket, allSockets }