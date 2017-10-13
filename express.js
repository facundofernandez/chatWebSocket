"use strict";
const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const path = require('path');
const users = [];
const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({server});

app.get("/saludoATodos",(req,res)=>{

    webSocketServer.sendAll({
        event: "CHAT",
        id: "SERVIDOR",
        texto: "HOLA A TODOS LOS USUARIOS <br>",
        color: "RED"
    });

    res.send("OK");

});

app.get("/usuarios",(req,res)=>{

    res.render('monitor', {
        title: 'Lenguajes de Programacion',
        lenguajes: ['javascript', 'java', '.net', 'python', 'php']
    });

});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});

webSocketServer.on('connection', (socket, req) => {

    console.log("Conexion");

    socket.color = getRandomColor();

    socket.on('message', (message) => {

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
            case "IMG":
                json.id = socket.nombre;
                webSocketServer.sendAll(json);
                break;
        }

    });

    socket.on('close', (code, reason) => {
        console.log(socket.nombre)
        if (typeof socket.nombre !== "undefined") {
            webSocketServer.sendAll({
                event: "CLOSE",
                nombre: socket.nombre,
                nUsers: webSocketServer.usuariosConectados()
            });
        }

    })
});

webSocketServer.sendByType = function (type,data) {
    webSocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN && client.type === "monitor") {

            client.send(JSON.stringify(data));
        }
    });
};

webSocketServer.sendAll = function (data) {
    webSocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

webSocketServer.sendOther = function (socket, data) {
    webSocketServer.clients.forEach(function each(client) {
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

webSocketServer.usuariosConectados = function () {
    let nUser = 0;
    webSocketServer.clients.forEach(function each(client) {
        console.log(client.type);
        if (client.readyState === WebSocket.OPEN && client.type !== "monitor") {
            nUser++;
        }
    });
    return nUser;
};


function teclea(socket, json) {
    webSocketServer.sendOther(socket, {
        event: "TECLEA",
        nom: json.nom
    })
}

function newUser(socket, json) {
    webSocketServer.sendAll({
        event: "CONECTADOS",
        nUsers: webSocketServer.usuariosConectados()
    });
    webSocketServer.sendOther(socket, {
        event: "NEW",
        id: json.id
    });
    webSocketServer.nombre = json.id;
}


function writeChat(socket, json) {
    webSocketServer.sendAll({
        event: "CHAT",
        id: json.id,
        texto: json.texto + "<br>",
        color: socket.color
    })
}
