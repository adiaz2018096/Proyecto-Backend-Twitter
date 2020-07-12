'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/twitter', {useNewUrlParser:true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Conexión exitosa con la base de datos!!');
        app.listen(port, ()=>{
            console.log('El servidor de express esta corriendo en el puerto No:', port);
        });
    }).catch(err=>{
        console.log('Error desconocido, no se ha podido establecer una conexión con la base de datos');
    });
