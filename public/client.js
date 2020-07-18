var client_id = document.getElementById("client_id"),
    allert_id = document.getElementById("alert_id"),
    client_online = document.getElementById("client_online"),
    panic_alert = document.getElementById("panic_alert"),
    get_lawyer_position = document.getElementById("get_lawyer_position"),
    get_nok_position = document.getElementById("get_nok_position"),
    send_message = document.getElementById("send_message")
    to_client = document.getElementById("to_client")
    update_position = document.getElementById("update_position"),
    to__next_of_kin = document.getElementById("to_nok")
    to_who = document.getElementById("to_who")

var socket = io.connect(window.location.hostname == "localhost" ? "http://localhost:8080/panic" : "https://staging-lawyerpp-api-v2.herokuapp.com/panic");

client_online.addEventListener('click', function() {
    socket.emit('online', {
        public_id: client_id.value,
        panic_initiation_latitude: 6.3910178,
        panic_initiation_longitude: 7.5340073,
        user_type: "client"
    })
})

panic_alert.addEventListener('click', function() {
    socket.emit('panic_alert', {
        public_id: client_id.value,
        panic_initiation_latitude: 6.3910178,
        panic_initiation_longitude: 7.5340073,
    })
})

send_message.addEventListener('click', function() {
    socket.emit('send_message', {
        alert_id: alert_id.value,
        message: "haloooo my lawyer",
        to_who: 'lawyer'
    })
})

to_client.addEventListener('click', function() {
    socket.emit('send_message', {
        alert_id: alert_id.value,
        message: "haloooo my client",
        to_who: to_who.value
    })
})

to__next_of_kin.addEventListener('click', function() {
    socket.emit('send_message', {
        // client_id: client_id.value,
        next_of_kin_id: '5f0ef270203ea25111656cd7',
        message: "haloooo my next of kin",
        to_who: to_who.value
    })
})
get_lawyer_position.addEventListener('click', function() {
    socket.emit('get_lawyer_position', {
        alert_id: alert_id.value
    })
})

get_nok_position.addEventListener('click', function() {
    socket.emit('get_nok_position', {
        next_of_kin_id: '5f0ef270203ea25111656cd7',
        public_id: client_id.value
    })
})

update_position.addEventListener('click', function() {
    socket.emit('update_nok_position', {
        id: client_id.value,
        alert_id: alert_id.value,
        latitude: 6.3910178,
        longitude: 7.5340073
    })
})

socket.on('lawyer_position', function(data) {
    console.log(data)
})

socket.on('nok_position', function(data) {
    console.log(data)
})

socket.on('alert_accepted', function(data) {
    console.log(data)
})

socket.on('alert_closed', function(data) {
    console.log(data)
})

socket.on('lawyer_position', function(data) {
    console.log(data)
})

socket.on('receive_message', function(data) {
    console.log(data)
})

socket.on('alert_kinsmen', function(data) {
    console.log(data)
})

socket.on('alert_successful', function(data) {
    console.log(data)
})