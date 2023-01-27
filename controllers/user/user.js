const bcrypt = require('bcrypt-nodejs');
const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

const User = require('../../models/user/user');
const Follow = require('../../models/user/follow/follow');
const Service = require('../../models/publish-now/publish-service/service');
const jwt = require('../../services/jwt');
const user = require('../../models/user/user');


/* *** test *** */
function test (req, res) {
  res.status(200).send({
    message:'Hello World! from test!'
  });
}

function home (req, res) {
    res.status(200).send({
      message:'Hello World! from user'
    });
}

/* *** signup *** */
function saveUser (req, res) {
  let params = req.body;
  let user = new User();

  if (params.email && params.username && params.password) {
    user.username = params.username;
    user.email = params.email;
    user.phone = params.phone;

    /* *** control duplicate users *** */
    User.find({
      $or: [
        {username: user.username},
        {email: user.email.toLowerCase()}
      ]
    }).exec((err, users) => {
      if(err) return res.status(500).send({message: 'Error en la solicitud del usuario.'});

      if(users && users.length >= 1){
        return res.status(200).send({message: 'Ya existe una cuenta con el usuario o correo electrónico indicado.'});
      }else{
        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash;

          /* *** store data *** */
          user.save((err, userStored) =>{
            if(err) return res.status(500).send({message: 'Error al guardar el usuario.'});

            if(userStored){
              res.status(200).send({user: userStored});
            }else{
              res.status(404).send({message: 'El usuario no se ha registrado.'});
            }
          });
        });
      }
    });
  }else{
    res.status(200).send({
      message: '¡Rellene todos los campos obligatorios!'
    });  
  }
}

/* *** signin *** */
function loginUser (req, res) {
  let params = req.body;
  
  let email = params.email;
  let password = params.password;

  User.findOne({email: email}, (err, user) => {
    if(err) return res.status(500).send({message: 'Error en la solicitud.'});

    if(user){
      bcrypt.compare(password, user.password, (err, check) => {
        if(check){
          if(params.gettoken){
            /* *** generate and return token *** */
            return res.status(200).send({
              token: jwt.createToken(user)
            })
          }else{
            /* *** return user data *** */
            user.password = undefined;
            return  res.status(200).send({user});
          }
        }else{
          return res.status(404).send({message: 'Nombre de usuario o contraseña incorrectos.'});
        }
      });
    }else{
      return res.status(404).send({message: 'No se ha podido identificar al usuario.'});
    }

  });
}

/* *** get user *** */
function getUser(req, res) {
  let userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({message: 'Error en la solicitud.'});

    if (!user) return res.status(404).send({message: 'Usuario no encontrado.'});

    followThisUser(req.user.sub, userId).then((value) =>{
      user.password = undefined;

      return res.status(200).send({
        user, 
        following: value.following,
        followed: value.followed
      });
    });
  });
}

/* *** follow this user? *** */
async function followThisUser(identityUserId, userId) {
  let following = await Follow.findOne({"user": identityUserId, "followed": userId}).exec().then((follow) => {
    return follow;
  }).catch((err) => {
    return handleError(err);
  });
  
  let followed = await Follow.findOne({"user": userId, "followed": identityUserId}).exec().then((follow) => {
    return follow;
  }).catch((err) => {
    return handleError(err);
  });

  return {
    following: following,
    followed: followed
  }
}


/* *** get paginated users *** */
function getUsers (req, res) {
  let identityUserId = req.user.sub;

  let page = 1;
  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 5;

  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
    if (err) return res.status(500).send({message: 'Error en la solicitud.'});

    if (!users) return res.status(404).send({message: 'No hay usuarios disponibles.'});

    followUserIds(identityUserId).then((value) => {
      return res.status(200).send({
        users,
        usersFollowing: value.following,
        usersFollowMe: value.followed,
        total,
        pages: Math.ceil(total/itemsPerPage)
      });
    });
  });
}

/* *** check follows *** */
async function followUserIds(userId){
  let following = await Follow.find({"user": userId}).select({'_id': 0, '__v': 0, 'user': 0}).exec().then((follows) => {
    return follows;
  }).catch((err) => {
    return handleError(err);
  });

  let followed = await Follow.find({"followed": userId}).select({'_id': 0, '__v': 0, 'followed': 0}).exec().then((follows) => {
    return follows;
  }).catch((err) => {
    return handleError(err);
  });

    
  /* *** process following ids *** */
  let followingClean = [];

    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

  /* *** process followed ids *** */
  let followedClean = [];

    followed.forEach((follow) => {
      followedClean.push(follow.user);
    });

  return {
    following: followingClean,
    followed: followedClean
  }
}

/* *** follower counters *** */
function getCounters (req, res) {
  let userId = req.user.sub;
  if (req.params.id){
    userId = req.params.id;
  }

  getCount(userId).then((value) => {
    return res.status(200).send(value);
  });
}

async function getCount(userId){
  let following = await Follow.count({"user": userId}).exec().then((count) => {
    return count;
  }).catch((err) => {
    return handleError(err);
  });

  let followed = await Follow.count({"followed": userId}).exec().then((count) => {
    return count;
  }).catch((err) => {
    return handleError(err);
  });

  let services = await Service.count({"user": userId}).exec().then((count) => {
    return count;
  }).catch((err) => {
    return handleError(err);
  });

  return {
    following: following,
    followed: followed,
    services: services
  }
}

/* *** update user data *** */
function updateUser (req, res) {
  let userId = req.params.id;
  let update = req.body;


  /* *** delete password *** */
  delete update.password;

  if (userId != req.user.sub){
    return res.status(500).send({message: 'No tiene permiso para actualizar los datos del usuario.'});
  }
 console.log(update);
  /* *** control duplicate users *** */
  User.find({
    $or: [
      {username: update.username},
      {email: update.email.toLowerCase()}
    ]
  }).exec((err, users) => {
    if(err) return res.status(500).send({message: 'Error en la solicitud del usuario.'});

    let linkedEmail = false;
    users.forEach((user) => {
      if(user && user._id != userId) linkedEmail = true;
    });

    if(linkedEmail) return res.status(200).send({message: 'Ya existe una cuenta con el usuario o correo electrónico indicado.'});

    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
      if (err) return res.status(500).send({message: 'Error en la solicitud.'});
  
      if (!userUpdated) return res.status(404).send({message: 'No se han podido actualizar los datos del usuario.'});
  
      return res.status(200).send({user: userUpdated});
    });
  });
}

/* *** upload img file *** */
function uploadImage (req, res){
  let userId = req.params.id;

  if (req.files){
    let filePath = req.files.image.path;
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[2];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if (userId != req.user.sub){
      return removeFilesOfUploads(res,filePath, 'Does not have permission to update image');
    }

    if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
      /* *** update image *** */
      User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdated) => {
        if (err) return res.status(500).send({message: 'Error in request'});

        if (!userUpdated) return res.status(404).send({message: 'Could not update user data'});

        return res.status(200).send({user: userUpdated});
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Invalid extension');
    }

  }else{
    return res.status(200).send({message: 'No image uploaded'});
  }
}

/* *** remove img file of uploads *** */
function removeFilesOfUploads (res, filePath, message){
  fs.unlink(filePath, (err) =>{
    return res.status(200).send({message: message});
  });
}

/* *** get img file *** */
function getImageFile (req, res){
  let imgFile = req.params.imageFile;
  let pathFile = './uploads/users/' + imgFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Image file not found'});
    }
  });
}

module.exports = {
    test,
    home,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
}