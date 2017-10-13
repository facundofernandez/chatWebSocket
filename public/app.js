"use strict";

//let url = 'ws://echo.websocket.org';
let url = 'ws://192.168.0.16:8080';
let client = new WebSocket(url);
let nombre = document.getElementById("nombre");
let msj = document.getElementById("msj");
let inputfile = document.getElementById("imageid");
let text = document.getElementById("texto");

nombre.focus();
console.log(client);
client.onopen = function (event) {

    client.onmessage = function (event) {
        console.log(event.data);
        let json = JSON.parse(event.data);

        switch (json.event) {
            case "CHAT":
                text.innerHTML = `<strong style="color:${json.color}">${json.id}</strong> : ${json.texto}\n` + text.innerHTML;
                break;
            case "NEW":
                alertify.success("NUEVO USUARIO " + json.id);
                break;
            case "TECLEA":
                console.log("Teclea");
                document.getElementById("teclea").innerHTML = `${json.nom} esta escribiendo..`;
                break;
            case "CONECTADOS":
                document.getElementById("conectados").innerHTML = `${json.nUsers} usuarios conectados.`;
                break;
            case "CLOSE":
                alertify.error(json.nombre + " Se fue del chat");
                document.getElementById("conectados").innerHTML = `${json.nUsers} usuarios conectados.`;
                break;
            case "IMG":
                let image = new Image();
                image.src = json.img;
                let content = `<strong style="color:${json.color}">${json.id}</strong> : \n`

                text.appendChild(image);
                text.innerHTML = content +  text.innerHTML;

                break;

        }
    };

    client.onclose = function (event) {
        console.log("PERDIO CONEXION <br>" + msj.innerHTML);

        console.log('Client notified socket has closed\n', event);
    };

};


nombre.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        document.getElementById("inicio").style.display = "none";
        enviarMsj({event: "NEW", id: nombre.value});
        msj.focus();
    }
});

msj.addEventListener("keypress", (e) => {

    enviarMsj({event: "TECLEA", nom: nombre.value});

    if (e.code === "Enter") {
        enviarMsj({event: "CHAT", id: nombre.value, texto: msj.value});
        msj.value = "";
    }
});


inputfile.addEventListener("change", (e) => {
    enviarImg({event:"IMG"})
});

function enviarMsj(json) {
    client.send(JSON.stringify(json));
}

function enviarImg(json) {
    let file = document.getElementById("imageid").files[0];
    let reader = new FileReader();
    reader.addEventListener("load", function () {
        json.img = reader.result;
        enviarMsj(json)
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    }
}

setInterval(() => {
    document.getElementById("teclea").innerHTML = "";
}, 1000);
