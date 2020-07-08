var username = document.getElementById("username"),
    phonenumber = document.getElementById("phone"),
    lat = document.getElementById("lat"),
    long = document.getElementById("long"),
    request = document.getElementById("request"),
    socketID,
    userid = "NNl8HYwc",
    useremail = "useremail",
    price = 20,
    distance= 50,
    pickuplocation = "pickuplocation",
    destination = "destination",
    description = "description",
    pickuptime = "2020-01-27T12:33:34.269+00:00",
    deliverytype = document.getElementById("deliverytype"),
    dispatchid = document.getElementById("dispatchid"),
    recipientname = "recipientname",
    recipientnumber = "+2348138570888",
    contentdetails = "contentdetails",
    canceldispatch = document.getElementById("canceldispatch"),
    crequest = document.getElementById("crequest"),
    ongoing = document.getElementById("ongoing"),
    cash = document.getElementById("cash"),
    online = document.getElementById("online"),
    sock = document.getElementById("sock"),
    cancel = document.getElementById("cancel"),
    fetchall = document.getElementById("fetchall"),
    fetchone = document.getElementById("fetchone"),
    useronline = document.getElementById("useronline"),
    changeposition = document.getElementById("changeposition")
    dispatchid = document.getElementById("dispatchid"),
    confirmreceived = document.getElementById("confirmreceived"),
    requestriderposition = document.getElementById("requestriderposition")


var socket = io.connect(window.location.hostname == "localhost" ? "http://localhost:5000/panic" : "https://staging-fastpaceapi.herokuapp.com/user");

useronline.addEventListener('click', function() {
    // socketID = socket.id
    username = username.value
    phonenumber = phonenumber.value


    //if rider is on available state
    socket.emit('online', {
        userid: userid,
        username: username,
        userphonenumber: phonenumber,
        useremail: undefined,
        userlatitude: 6.3910178,
        userlongitude: 7.5340073
    })
})

request.addEventListener('click', function() {
    socketID = socket.id
    username = username.value
    phonenumber = phonenumber.value
    lat = lat.value
    long = long.value
    deliverytype = deliverytype.value

    socket.emit('panic_alert', {
        userid: userid,
        price: price,
        pickuplocation: pickuplocation,
        destination: destination,
        description: description,
        pickuptime: pickuptime,
        recipientname: recipientname,
        recipientnumber: recipientnumber,
        contentdetails: contentdetails,
        userdeliverytype: deliverytype,
        destinationlongitude: 7.00000,
        destinationlatitude: 6.00000,
        userlatitude: lat,
        userlongitude: long,
        request: true,
        fragile: true,
        userimageurl: "imageurl"
    })
})

changeposition.addEventListener('click', function() {
    socket.emit('send_message', {
        userid: userid,
        userlatitude: 6.3910178,
        userlongitude: 7.5340073
    })
})

requestriderposition.addEventListener('click', function() {
    socket.emit('get_position', {
        userid: userid,
        dispatchid: dispatchid.value
    })
})

socket.on('alert_accepted', function(data) {
    console.log(data)
    socket.emit('rider_merged_update', (data) => {});
})

socket.on('alert_closed', function(data) {
    console.log(data)
    socket.emit('rider_merged_update', (data) => {});
})

socket.on('lawyer_position', function(data) {
    console.log(data)
    socket.emit('rider_merged_update', (data) => {});
})

socket.on('receive_message', function(data) {
    console.log(data)
    socket.emit('rider_merged_update', (data) => {});
})