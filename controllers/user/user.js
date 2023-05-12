const bcrypt = require('bcrypt-nodejs');
const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

const User = require('../../models/user/user');
const Follow = require('../../models/user/follow/follow');
const Service = require('../../models/publish-now/publish-service/service');
const jwt = require('../../services/jwt');


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
    user.image = null;
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
async function loginUser (req, res) {
  let params = req.body;
  
  let email = params.email;
  let password = params.password;

  try {
    let user = await User.findOne({email: email}).select({username:1, image:1, password:1});

    if(user){
      bcrypt.compare(password, user.password, (err, check) => {
        if(err) return res.status(500).send({message: 'Error en la solicitud: ' + err});

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
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el usuario: ' + error});
  }
}

/* *** get user *** */
async function getUser(req, res) {
  let userId = req.params.id;

  try {
    let user = await User.findById(userId).select({password:0, createdAt:0, updatedAt:0, __v:0});

    if (!user) return res.status(404).send({message: 'Usuario no encontrado.'});

    let follow = await followThisUser(req.user.sub, userId);

    return res.status(200).send({
      user, 
      following: follow.following,
      followed: follow.followed
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el usuario: ' + error});
  }
}

/* *** get user (update identity) *** */
async function updateIdentity(req, res) {
  let userId = req.params.id;

  try {
    let user = await User.findById(userId).select({username:1, image:1});

    if (!user) return res.status(404).send({message: 'Usuario no encontrado.'});

    return res.status(200).send({user});
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el usuario: ' + error});
  }
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
async function uploadImage (req, res){
  let userId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if (req.files){
      filePath = req.files.image.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[3];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
    }
  
    if(!fileExt == 'png' || !fileExt == 'jpg' || !fileExt == 'jpeg' || !fileExt == 'gif'){
      return removeFilesOfUploads(res, filePath, 'Extension invalida!');
    }

    let userImg = await User.findById(userId).select({image:1});

    if (!userImg) return res.status(404).send({message: 'Usuario no encontrado.'});

    if(userImg.image){ 
      let filePathDelete = './uploads/users/img/' + userImg.image;
      fs.unlink(filePathDelete, (err) => {
        if (err) throw err;
      });
    }
  
    let user = await User.findByIdAndUpdate(userId, {image: fileName}, {new: true}).select({username:1, image:1});

    if (!user) return res.status(404).send({message: 'Usuario no actualizado.'});

    return res.status(200).send({user});
  } catch (error) {
    console.log(error);
    
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
    return res.status(500).send({message: 'Error al actualizar imagen: ' + error});
  }
}

/* *** remove img file of uploads *** */
function removeFilesOfUploads (res, filePath, message){
  fs.unlink(filePath, (err) =>{
    if (err) return res.status(200).send({message: message + ' ' + err});
  });
}

/* *** get img file *** */
function getImageFile (req, res){
  let imgFile = req.params.imageFile;
  let pathFile = './uploads/users/img/' + imgFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Image file not found'});
    }
  });
}

/* *** new password *** */
async function newPassword (req, res){
  let params = req.body;
  let username = params.email.toLowerCase();
  let newPassword = params.newPassword;

  if(!username) return res.status(400).send({message: 'El username es requerido'});

  if(!newPassword) return res.status(400).send({message: 'El nuevo password es requerido'});

  try {
    let userAccount = await User.findOne({email: username});
    if(userAccount){
      bcrypt.hash(newPassword, null, null, async (err, hash) => {
        const password = hash;
        /* *** store data *** */
        let changePass = await User.findByIdAndUpdate(userAccount._id, {password: password}, {new: true});

        if(!changePass) return res.status(404).send({message: 'Algo salio mal!'});

        if(changePass) return res.status(200).send({message: 'Se ha cambiado la contraseña!'});
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({message: 'Algo salio mal!'});
  }
}

module.exports = {
    test,
    home,
    saveUser,
    loginUser,
    getUser,
    updateIdentity,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile,
    newPassword,
}