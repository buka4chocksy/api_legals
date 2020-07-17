var lawyer_id = document.getElementById("lawyer_id"),
    lawyer_online = document.getElementById("lawyer_online"),
    accept_alert = document.getElementById("accept_alert"),
    send_message = document.getElementById("send_message"),
    close_alert = document.getElementById("close_alert"),
    update_position = document.getElementById("update_position"),
    alert_id = document.getElementById("alert_id")
    response = document.getElementById("response")
    
var details = {}
var    socket = io.connect(window.location.hostname == "localhost" ? "http://localhost:8080/panic" : "https://staging-lawyerpp-api-v2.herokuapp.com/panic")

lawyer_online.addEventListener('click', function() {
    socket.emit('online', {
        lawyer_id: lawyer_id.value,
        lawyer_latitude: 6.3910178,
        lawyer_longitude: 7.5340073,
        user_type: "lawyer"
    })

    socket.emit('find_panics', {
        lawyer_id: lawyer_id.value,
        lawyer_latitude: 6.3910178,
        lawyer_longitude: 7.5340073
    })
})

accept_alert.addEventListener('click', function() {
    console.log(alert_id.value)
    socket.emit('accept_alert', {
        lawyer_id: lawyer_id.value,
        lawyer_latitude: 6.3910178,
        lawyer_longitude: 7.5340073,
        alert_id: alert_id.value
    })
})

send_message.addEventListener('click', function() {
    console.log("sent message")
    socket.emit('send_message', {
        lawyer_id: lawyer_id.value,
        alert_id: alert_id.value,
        message: "What's going on client?!",
        to_who: "client"
    })
})

close_alert.addEventListener('click', function() {
    console.log({
        alert_id: alert_id.value,
        lawyer_response: response.value
    })
    socket.emit('close_alert', {
        lawyer_id: lawyer_id.value,
        alert_id: alert_id.value,
        lawyer_response: response.value
    })
})

update_position.addEventListener('click', function() {
    socket.emit('update_lawyer_position', {
        id: lawyer_id.value,
        lawyer_latitude: 6.3910178,
        lawyer_longitude: 7.5340073
    })
})

socket.on('older_alerts', function(data) {
    console.log(data)
})

socket.on('receive_message', function(data) {
    console.log(data)
})

socket.on('alert_closed', function(data) {
    console.log(data)
}) 

socket.on('alert_lawyer', function(data) {
    console.log(data)
})

socket.on('alert_kinsmen', function(data) {
    console.log(data)
})