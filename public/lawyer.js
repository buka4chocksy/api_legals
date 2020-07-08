var ridername1 = document.getElementById("ridername1"),
    phonenumber1 = document.getElementById("phone1"),
    lat1 = document.getElementById("lat1"),
    long1 = document.getElementById("long1"),
    ridername2 = document.getElementById("ridername2"),
    phonenumber2 = document.getElementById("phone2"),
    lat2 = document.getElementById("lat2"),
    long2 = document.getElementById("long2"),
    available = document.getElementById("available"),
    unavailable = document.getElementById("unavailable"),
    update = document.getElementById("update"),
    position = document.getElementById("position"),
    accept = document.getElementById("accept"),
    reject = document.getElementById("reject"),
    id = document.getElementById("sockid"),
    job1 = document.getElementById("job"),
    deliverytype1 = document.getElementById("deliverytype"),
    riderid = document.getElementById("riderid"),
    targetUser = [],
    targetSocketID = null,
    socketID,
    userSocketId,
    deliverytype,

    //riderid = "9DQe47ZT",
    rideremail = "rideremail",
    dispatched = document.getElementById("dispatched"),
    numberofrequest,
    dispatchid = document.getElementById("dispatchid"),
    locationUpdate = document.getElementById("locationUpdateId"),
    cancel = document.getElementById("cancel"),
    online = document.getElementById("online"),
    arrived = document.getElementById("arrived"),
    received = document.getElementById("received"),
    confirm = document.getElementById("confirm"),
    fetchall = document.getElementById("fetchall"),
    fetchone = document.getElementById("fetchone"),
    enroute = document.getElementById("enroute"),
    sock = document.getElementById("sock")

var details = {}
// var socket = io.connect(window.location.hostname == "localhost" ? "http://localhost:5000/rider" : "https://staging-fastpaceapi.herokuapp.com/rider"),
var    userSocket = io.connect(window.location.hostname == "localhost" ? "http://localhost:5000/panic" : "https://staging-fastpaceapi.herokuapp.com/user")

online.addEventListener('click', function() {
    var details = {
        riderid: riderid.value,
        riderlatitude: lat1.value,
        riderlongitude: long1.value
    }

    socket.emit('online', details)
})

requestriderposition.addEventListener('click', function() {
    socket.emit('find_panics', {
        userid: userid,
        dispatchid: dispatchid.value
    })
})

enroute.addEventListener('click', function() {
    var details = {
        dispatchid: dispatchid.value,
        riderid: riderid.value
    }

    userSocket.emit('accept_alert', details)
})

changeposition.addEventListener('click', function() {
    socket.emit('send_message', {
        userid: userid,
        userlatitude: 6.3910178,
        userlongitude: 7.5340073
    })
})

requestriderposition.addEventListener('click', function() {
    socket.emit('close_alert', {
        userid: userid,
        dispatchid: dispatchid.value
    })
})

requestriderposition.addEventListener('click', function() {
    socket.emit('update_position', {
        userid: userid,
        dispatchid: dispatchid.value
    })
})

requestriderposition.addEventListener('click', function() {
    socket.emit('older_alerts', {
        userid: userid,
        dispatchid: dispatchid.value
    })
})

socket.on('receive_message', function(data) {
    console.log(data)
    socket.emit('rider_merged_update', (data) => {});
})

socket.on('alert_closed', function(data) {
    console.log(data)
    socket.emit('rider_merged_update', (data) => {});
}) 

socket.on('alert_lawyer', function(data) {
    console.log(data)
    userSocket.emit('get_dispatch_id_update', (data) => {});
})

socket.on('alert_kinsmen', function(data) {
    console.log(data)
    userSocket.emit('get_dispatch_id_update', (data) => {});
})