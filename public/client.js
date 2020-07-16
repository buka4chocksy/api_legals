var client_id = document.getElementById("client_id"),
    allert_id = document.getElementById("alert_id"),
    client_online = document.getElementById("client_online"),
    panic_alert = document.getElementById("panic_alert"),
    get_lawyer_position = document.getElementById("get_lawyer_position"),
    get_nok_position = document.getElementById("get_nok_position"),
    send_message = document.getElementById("send_message")


var socket = io.connect(window.location.hostname == "localhost" ? "http://localhost:8080/panic" : "https://staging-fastpaceapi.herokuapp.com/user");

client_online.addEventListener('click', function() {
    socket.emit('online', {
        client_id: client_id.value,
        panic_initiation_latitude: 6.3910178,
        panic_initiation_longitude: 7.5340073,
        user_type: "client"
    })
})

panic_alert.addEventListener('click', function() {
    socket.emit('panic_alert', {
        client_id: client_id.value,
        panic_initiation_latitude: 6.3910178,
        panic_initiation_longitude: 7.5340073
    })
})

send_message.addEventListener('click', function() {
    socket.emit('send_message', {
        client_id: client_id.value,
        alert_id: alert_id.value,
        message: "haloooo",
        to_who: "lawyer"
    })
})

get_lawyer_position.addEventListener('click', function() {
    socket.emit('get_lawyer_position', {
        alert_id: alert_id.value
    })
})

get_nok_position.addEventListener('click', function() {
    socket.emit('get_nok_position', {
        next_of_kin_id: '5f0ef270203ea25111656cd7'
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