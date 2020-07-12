'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'CHUACHENEGER69';

exports.ensureAuth = (req, res, next)=>{
    if(req.headers.authorization){    
        if(req.headers.authorization){
            var token = req.headers.authorization.replace(/['"]+/g, '');
            try{
                var payload = jwt.decode(token, key);
                if(payload.exp <= moment().unix()){
                    return res.status(401).send({message: 'El Token ya expirado'});
                }
            }catch(ex){
                return res.status(404).send({message: 'El Token no es valido'});
            }
            req.user = payload;
        }
    }
    next();
}