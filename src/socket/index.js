var panic = require('./panicSocket')

exports.initSocket = (server) => {
    var panicInstance = new panic.panicSocket(server)

    panicInstance.panicAlert()
}