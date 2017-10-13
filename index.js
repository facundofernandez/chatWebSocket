"use strict";

const WebSocket = require('ws');

const server = new WebSocket.Server({port: 8080});

server.on('connection', (socket, req) => {

    console.log("Conexion");

    socket.color = getRandomColor();

    socket.on('message', (message) => {
        console.log('Server received: %s', message);
        let json = JSON.parse(message);

        switch (json.event) {
            case "TECLEA":
                teclea(socket, json);
                break;
            case "NEW":
                newUser(socket, json);
                break;
            case "CHAT":
                writeChat(socket, json);
                break;
        }

    });

    socket.on('close', (code, reason) => {
        if (typeof socket.nombre !== "undefined") {
            server.sendAll({
                event: "CLOSE",
                nombre: socket.nombre,
                nUsers: server.usuariosConectados()
            });
        }

    })

});


server.sendAll = function (data) {
    server.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

server.sendOther = function (socket, data) {
    server.clients.forEach(function each(client) {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

server.usuariosConectados = function () {
    let nUser = 0;
    server.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            nUser++;
        }
    });
    return nUser;
};


function teclea(socket, json) {
    server.sendOther(socket, {
        event: "TECLEA",
        nom: json.nom
    })
}

function newUser(socket, json) {
    server.sendAll({
        event: "CONECTADOS",
        nUsers: server.usuariosConectados()
    });
    server.sendOther(socket, {
        event: "NEW",
        id: json.id
    });
    socket.nombre = json.id;
}


function writeChat(socket, json) {
    server.sendAll({
        event: "CHAT",
        id: json.id,
        texto: json.texto + "<br>",
        color: socket.color
    })
}
