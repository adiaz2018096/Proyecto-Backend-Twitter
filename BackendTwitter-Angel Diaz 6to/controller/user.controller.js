'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var User = require('../model/user.model');
var Tweet = require('../model/tweet.model');


function register(req, res){
    var user = new User();
    var params = req.body;

    if(params.command.split(' ')[1] && params.command.split(' ')[2], params.command.split(' ')[3], 
        params.command.split(' ')[4], params.command.split(' ')[5]){
            User.findOne({$or: [{username: params.command.split(' ')[3]}, {email: params.command.split(' ')[4]}]}, (err, userFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(userFound){
                    res.status(200).send({message: 'El usuario ya existe'});
                }else{
                    user.name = params.command.split(' ')[1];
                    user.lastname = params.command.split(' ')[2];
                    user.username = params.command.split(' ')[3];
                    user.email = params.command.split(' ')[4];

                    bcrypt.hash(params.command.split(' ')[5], null, null, (err, passwordHash)=>{
                        if(err){
                            res.status(500).send({message: 'Error al encriptar la contraseña'});
                        }else if(passwordHash){
                            user.password = passwordHash;
                            user.save((err, saveUser)=>{
                                if(err){
                                    res.status(500).send({message: 'Error al realizar la peticion'})
                                }else if(saveUser){
                                    res.status(200).send({message: 'El usuario se guardo exitosamente', saveUser});
                                }else{
                                    res.status(418).send({message: 'Intentes mas tarde'})
                                }
                            })
                        }else{
                            res.status(418).send({message: 'Encriptar la contraseña mas tarde'});
                        }
                    });
                }    
            });
    }else{
        res.status(404).send({message: 'Debe de ingresar todos los datos'});
    }
}

function login(req, res){
    var params = req.body;
    var command = params.command;

    if(command.split(' ')[1] && command.split(' ')[2]){
        User.findOne({$or: [{email: command.split(' ')[1]}, {username: command.split(' ')[1]}, {name: command.split(' ')[1]}]}, (err, check)=>{
            if(err){
                res.status(500).send({message: 'Error al realizar la peticion'})
            }else if(check){
                bcrypt.compare(command.split(' ')[2], check.password, (err, passwordOk)=>{
                    if(err){
                        res.status(500).send({message: 'Error al comparar las contraseñas'});
                    }else if(passwordOk){
                        if(params.gettoken = true){
                            res.send({token: jwt.createToken(check), user: check.name});
                        }else{
                            res.send({message: 'Error al realizar la autenticacion'});
                        }
                    }else{
                        res.send({message: 'Contraseña incorrecta'})
                    }
                });
            }else{
                res.send({message: 'El email o username no es el correcto'});
            }
        });
    }else{
        res.send({message: 'Ingrese los datos minimos'});
    }
}


function addTweet(req, res){
    var tweet = new Tweet();
    var command = req.body.command;

    if(req.headers.authorization){
        if(command.split(' ')[1] && command.split(' ').length < 50){
            var textTweet = '';
            for(let i = 1; i <= 50; i++){
                if(command.split(' ')[i] != null){
                        var textTweet = textTweet + command.split(' ')[i] + ' ';
                } else if(command.split(' ')[i]== null){
                    i =50;
                }
            }       
            tweet.text = textTweet;
            tweet.user = req.user.sub;

            tweet.save((err, tweetPost)=>{
                if(err){
                    res.status(500).send({message: 'Error  en la peticion'});
                }else if(tweetPost){
                    res.send({message: 'Tweet posteado correctamente', tweetPost});
                }else{
                    res.status(418).send({message: 'No se puede postear el tweet'})
                }
            });
        }else{
            res.send({message: 'Ingresar los datos correctos'})
        }
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function deleteTweet(req, res){
    var command = req.body.command;
    
    if(req.headers.authorization){
        Tweet.findById(command.split(' ')[1], (err, findTweet)=>{
            if(err){
                res.status(418).send({message: 'No se puede postear el tweet'})
            } else if(findTweet){
                if(findTweet.user == req.user.sub){
                    Tweet.findByIdAndDelete(command.split(' ')[1], (err, tweetDeleted)=>{
                        if(err){
                            res.status(500).send({message: 'Error realizar la peticion'});
                        } else if(tweetDeleted){
                            res.status(200).send({message: 'tweet eliminado correctamente', tweetDeleted});
                        } else{
                            res.status(418).send({message: 'No se puede eliminar el tweet en el perfil'})
                        }
                    });
                } else if(findTweet.user != req.user.sub){
                    res.status(403).send({message: 'No tienes permiso'})
                }
            } else{
                res.status(418).send({message: 'No se puede eliminar el tweet'})
            }
        });
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function editTweet(req, res){
    var command = req.body.command;
    var textTweet = '';

    if(req.headers.authorization){
        for(let i = 2; i <= 50; i++){
            if(command.split(' ')[i] != null){
                    var textTweet = textTweet + command.split(' ')[i] + ' ';
            } else if(command.split(' ')[i]== null){
                i =50;
            }
        }

        Tweet.findById(command.split(' ')[1], (err, findTweet)=>{
            if(err){
                res.status(418).send({message: 'No se puede postear el tweet'})
            } else if(findTweet){
                if(findTweet.user == req.user.sub){
                    Tweet.findByIdAndUpdate(command.split(' ')[1], {text: textTweet}, {new: true}, (err, tweetUpdated)=>{
                        if(err){
                            res.status(500).send({message: 'Error al realizar la peticion'});
                        } else if(tweetUpdated){
                            res.status(200).send({message: 'Tweet acutalizado correctamente', tweetUpdated});
                        } else{
                            res.status(418).send({message: 'No se puede editar el tweet'})
                        }
                    })    
                } else if(findTweet.user != req.user.sub){
                    res.status(403).send({message: ' no tienes permiso'})
                }
            } else{
                res.status(418).send({message: 'No se puede editar el tweet'})
            }
        });       
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function viewTweets(req, res){
    if(req.headers.authorization){
        Tweet.find({}, (err, tweets)=>{
            if(err){
                res.status(500).send({message: 'Error al realizar la peticion'});
            } else if(tweets){
                res.status(200).send({message: 'Estos son los tweets que existen', tweets});
            } else{
                res.status(418).send({message: 'No hay tweets en la base de datos'})
            }
        })
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function follow(req, res){
    var command = req.body.command;

    if(req.headers.authorization){
        User.findById(req.user.sub, (err, findUser)=>{
            if(err){
                res.status(500).send({message: 'Error al buscar usuario'});
            } else if(findUser){
                var followedUser = false;
                for(var i = 0; i < findUser.followed.length; i++){
                    if(findUser.followed[i] == command.split(' ')[1]){
                        followedUser = true;
                        i = findUser.followed.length;
                    }
                }
                if(followedUser == false){
                    User.findOne({username: command.split(' ')[1]}, (err, findUser)=>{
                        if(err){
                            res.status(500).send({message: 'Error general'})
                        } else if(findUser){
                                User.findByIdAndUpdate(req.user.sub, {$push:{followed: command.split(' ')[1]}}, {new: true}, (err, following)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error al seguir un usuario'});
                                    } else if(following){
                                        res.status(200).send({message: 'Comenzo a seguir a un usuario' + command.split(' ')[1]})
                                    } else{
                                        res.status(404).send({message: 'No se pudo realizar la peticion'});
                                    }
                                });
                        } else{
                            res.status(500).send({message: 'El usuario que quiere seguir no existe'})
                        }
                    });
                } else if(followedUser == true){
                    res.status(200).send({message: 'Ya sigue a este usuario'})
                }
            } else{
                res.status(418).send({message: 'No se puede realizar la peticion'})
            }
        });
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function unfollow(req, res){
    var command = req.body.command;

    if(req.headers.authorization){
        User.findOne({username: command.split(' ')[1]}, (err, findUser)=>{
            if(err){
                res.status(500).send({message: 'Error  en el servidor al seguir un usuario'});
            } else if(findUser){
                User.findByIdAndUpdate(req.user.sub, {$pull:{followed: command.split(' ')[1]}}, {new: true}, (err, following)=>{
                    if(err){
                        res.status(500).send({message: 'Error  en el servidor al seguir un usuario'});
                    } else if(following){
                        res.status(200).send({message: 'Ya no sigue a este usuario ' + command.split(' ')[1]})
                    } else{
                        res.status(404).send({message: 'No se puede dejar de seguir a un usuario que no existe'});
                    }
                });
            } else {
                res.status(500).send({message: 'No se puede dejar de seguir a un usuario que no existe'});
            }
        });
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function profile(req, res){
    var command = req.body.command;
    if(req.headers.authorization){
        User.findOne({username: command.split(' ')[1]}, (err, findProfile)=>{
            if(err){
                res.status(500).send({message: 'Error en el servidor al seguir un usuario'});
            } else if(findProfile){
                res.status(200).send({message: findProfile})
            } else{
                res.status(404).send({message: 'No existe el usuario'});
            }
        });
    } else{
        res.send({message: 'Iniciar sesion'})
    }
}

function commands(req, res){
    var params = req.body;
    var command = params.command.split(' ')[0];

    if(command == 'ADD_TWEET'){
        addTweet(req, res);
    } else if(command == 'LOGIN'){
        login(req, res);
    } else if(command == 'REGISTER'){
        register(req, res);
    } else if(command == 'DELETE_TWEET'){
        deleteTweet(req, res);
    } else if(command == 'EDIT_TWEET'){
        editTweet(req, res);
    } else if(command == 'VIEW_TWEETS'){
        viewTweets(req, res);
    } else if(command == 'FOLLOW'){
        follow(req, res);
    } else if(command == 'UNFOLLOW'){
        unfollow(req, res);
    } else if(command == 'PROFILE'){
        profile(req, res);
    } else{
        res.status(404).send({message: 'El comando no existe'});
    }
}

module.exports = {
    commands
}