const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Profile = require('../../../models/user/profile/profile');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from profile!'
    });
}

/* *** save profile *** */
function saveProfile (req, res) {
  let params = req.body;
  let profile = new Profile();

  if (params.name && params.fatherLastName && params.motherLastName && params.gender 
    && params.dateBirth && params.contry && params.city && params.publishCheck){
    profile.profileImg = null;
    profile.name = params.name;
    profile.fatherLastName = params.fatherLastName;
    profile.motherLastName = params.motherLastName;
    profile.gender = params.gender;
    profile.dateBirth = params.dateBirth;
    profile.contry = params.contry;
    profile.city = params.city;
    profile.resumeSummary = params.resumeSummary;
    profile.profileVideo = null;
    profile.resumeSummaryFile = null;
    profile.previousWork = null;
    profile.publishCheck = params.publishCheck;
    profile.rfc = params.rfc;
    profile.user = req.user.sub;
    profile.createdAt = moment().unix();

    /* *** control duplicate users *** */
    Profile.find({user: profile.user}).exec((err, users) => {
      if(err) return res.status(500).send({message: 'Error en la solicitud'});

      if(users && users.length >= 1){
        return res.status(200).send({message: 'El usuario ya tiene un perfil'});
      }else{
        /* *** control duplicate rfc *** */
        if (profile.rfc.toUpperCase().length >= 12 && profile.rfc.toUpperCase().length <= 13){
          Profile.find({rfc: profile.rfc.toUpperCase()}).exec((err, rfcs) => {
            if(err) return res.status(500).send({message: 'Error en la solicitud'});
  
            if(rfcs && rfcs.length >= 1){
              return res.status(200).send({message: 'El RFC ya existe'});
            }else{
              profile.save((err, profileStored) => {
                if (err) return res.status(500).send({message: '¡Error al guardar el perfil!'});
          
                if (!profileStored) return res.status(404).send({message: '¡No se ha guardado el perfil!'});
          
                return res.status(200).send({profile: profileStored});
              });
            }
          });
        }

        profile.save((err, profileStored) => {
          if (err) return res.status(500).send({message: '¡Error al guardar el perfil!'});
    
          if (!profileStored) return res.status(404).send({message: '¡No se ha guardado el perfil!'});
    
          return res.status(200).send({profile: profileStored});
        });
        
      }
    });

  }else{
    return res.status(200).send({
      message: '¡Rellene todos los campos obligatorios!'
    }); 
  }
}

/* *** delete profile *** */
function deleteProfile (req, res) {
  let profileId = req.params.id;

  Profile.find({user: req.user.sub, '_id': profileId}).remove(err => {
    if (err) return res.status(500).send({message: 'Error when deleting profile'});

    if(!profileRemoved) return res.status(404).send({message: 'Could not delete profile'});

    return res.status(200).send({message: 'Profile deleted successfully'});
  });
}

/* *** get profile *** */
function getProfile (req, res) {
  let userId = req.user.sub;

  Profile.findOne({user: userId}, (err, profile) => {
    if (err) return res.status(500).send({message: 'Error al devolver el perfil'});

    if(!profile) return res.status(404).send({message: 'El perfil no existe'});

    return res.status(200).send({profile});
  });
}

/* *** update profile data *** */
function updateProfile (req, res) {
  let profileId = req.params.id;
  let update = req.body;

  Profile. findOne({'user': req.user.sub, '_id': profileId}).exec().then((profile) => {
    if (profile){
      /* *** update profile *** */
      Profile.findByIdAndUpdate(profileId, update, {new: true}, (err, profileUpdated) => {
        if (err) return res.status(500).send({message: 'Error in request'});
    
        if (!profileUpdated) return res.status(404).send({message: 'Could not update profile data'});
    
        return res.status(200).send({profile: profileUpdated});
      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update profile data'});
    }
  });
}

/* *** upload img file *** */
function uploadImage (req, res){
  let profileId = req.params.id;

  if (req.files){
    console.log(req.files);
    let filePath = req.files.imgProfile.path;
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){

      Profile. findOne({'user': req.user.sub, '_id': profileId}).exec().then((profile) => {

        if (profile){

          if (profile.profileImg){

            let previousImg = './uploads/users/profile/img/' + profile.profileImg;

            fs.unlink(previousImg, (err) =>{
              if (err) return res.status(200).send({message: err});
            });

            /* *** update image *** */
            Profile.findByIdAndUpdate(profileId, {profileImg: fileName}, {new: true}, (err, profileUpdated) => {
              
              if (err) return res.status(500).send({message: 'Error en la solicitud.'});

              if (!profileUpdated) return res.status(404).send({message: '¡No se ha podido actualizar la imagen del perfil!'});
              console.log(profileUpdated);
              return res.status(200).send({profile: profileUpdated});
            });
          }

          if (!profile.profileImg) {
            /* *** update image *** */
            Profile.findByIdAndUpdate(profileId, {profileImg: fileName}, {new: true}, (err, profileUpdated) => {
              
              if (err) return res.status(500).send({message: 'Error en la solicitud.'});

              if (!profileUpdated) return res.status(404).send({message: '¡No se ha podido actualizar la imagen del perfil!'});

              return res.status(200).send({profile: profileUpdated});
            });
          }
        }else{
          return removeFilesOfUploads(res, filePath, '¡No tiene permiso para actualizar la imagen de perfil!');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, '¡Extensión no válida!');
    }

  }else{
    return res.status(200).send({message: 'No se ha cargado ninguna imagen.'});
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
  let pathFile = './uploads/users/profile/img/' + imgFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Image file not found'});
    }
  });
}

/* *** upload video file *** */
function uploadVideo (req, res){
  let profileId = req.params.id;

  if (req.files){
    let filePath = req.files.videoProfile.path;
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'mp4' || fileExt == 'mov' || fileExt == 'wmv' || fileExt == 'avi'){
      Profile. findOne({'user': req.user.sub, '_id': profileId}).exec().then((profile) => {
        if (profile){
          if (profile.profileVideo){

            let previousVideo = './uploads/users/profile/video/' + profile.profileVideo;

            fs.unlink(previousVideo, (err) =>{
              if (err) return res.status(200).send({message: err});
            });
 
            /* *** update video *** */
            Profile.findByIdAndUpdate(profileId, {profileVideo: fileName}, {new: true}, (err, profileUpdated) => {
              if (err) return res.status(500).send({message: 'Error in request'});

              if (!profileUpdated) return res.status(404).send({message: 'Could not update data'});

              return res.status(200).send({profile: profileUpdated});
            });
          }

          if (!profile.profileVideo){
            /* *** update video *** */
            Profile.findByIdAndUpdate(profileId, {profileVideo: fileName}, {new: true}, (err, profileUpdated) => {
              if (err) return res.status(500).send({message: 'Error in request'});

              if (!profileUpdated) return res.status(404).send({message: 'Could not update data'});

              return res.status(200).send({profile: profileUpdated});
            });
          }
          
        }else{
          return removeFilesOfUploads(res, filePath, 'Does not have permission to update profile video');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Invalid extension');
    }

  }else{
    return res.status(200).send({message: 'No video uploaded'});
  }
}

/* *** get video file *** */
function getVideoFile (req, res){
  let videoFile = req.params.videoFile;
  let pathFile = './uploads/users/profile/video/' + videoFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Video file not found'});
    }
  });
}

/* *** upload resumesummary file *** */
function uploadResumesummary (req, res){
  let profileId = req.params.id;

  if (req.files){
    let filePath = req.files.resumesummaryFile.path;
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[5];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'pdf'){
      Profile. findOne({'user': req.user.sub, '_id': profileId}).exec().then((profile) => {
        if (profile){
          if (profile.resumeSummaryFile){

            let previousResumesummaryFile = './uploads/users/profile/pdf/resumeSummaryFile/' + profile.resumeSummaryFile;

            fs.unlink(previousResumesummaryFile, (err) =>{
              if (err) return res.status(200).send({message: err});
            });
            /* *** update resumesummary *** */
            Profile.findByIdAndUpdate(profileId, {resumeSummaryFile: fileName}, {new: true}, (err, profileUpdated) => {
              if (err) return res.status(500).send({message: 'Error in request'});

              if (!profileUpdated) return res.status(404).send({message: 'Could not update data'});

              return res.status(200).send({profile: profileUpdated});
            });
          }

          if (!profile.resumeSummaryFile){
            /* *** update resumesummary *** */
            Profile.findByIdAndUpdate(profileId, {resumeSummaryFile: fileName}, {new: true}, (err, profileUpdated) => {
              if (err) return res.status(500).send({message: 'Error in request'});

              if (!profileUpdated) return res.status(404).send({message: 'Could not update data'});

              return res.status(200).send({profile: profileUpdated});
            });
          }
        }else{
          return removeFilesOfUploads(res, filePath, 'Does not have permission to update resumesummary file');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Invalid extension');
    }

  }else{
    return res.status(200).send({message: 'No file uploaded'});
  }
}

/* *** get resumesummary file *** */
function getResumesummaryFile (req, res){
  let resumesummaryFile = req.params.resumesummaryFile;
  let pathFile = './uploads/users/profile/pdf/resumeSummaryFile/' + resumesummaryFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'PDF file not found'});
    }
  });
}

/* *** upload previous work file *** */
function uploadPreviousWork (req, res){
  let profileId = req.params.id;

  if (req.files){
    let filePath = req.files.previousWork.path;
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[5];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'pdf'){
      Profile. findOne({'user': req.user.sub, '_id': profileId}).exec().then((profile) => {
        if (profile){
          if (profile.previousWork){

            let previousWorkFile = './uploads/users/profile/pdf/previousWork/' + profile.previousWork;

            fs.unlink(previousWorkFile, (err) =>{
              if (err) return res.status(200).send({message: err});
            });

            /* *** update previous work *** */
            Profile.findByIdAndUpdate(profileId, {previousWork: fileName}, {new: true}, (err, profileUpdated) => {
              if (err) return res.status(500).send({message: 'Error in request'});

              if (!profileUpdated) return res.status(404).send({message: 'Could not update data'});

              return res.status(200).send({profile: profileUpdated});
            });
          }

          if (!profile.previousWork){
            /* *** update previous work *** */
            Profile.findByIdAndUpdate(profileId, {previousWork: fileName}, {new: true}, (err, profileUpdated) => {
              if (err) return res.status(500).send({message: 'Error in request'});

              if (!profileUpdated) return res.status(404).send({message: 'Could not update data'});

              return res.status(200).send({profile: profileUpdated});
            });
          }
        }else{
          return removeFilesOfUploads(res, filePath, 'Does not have permission to update previous work file');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Invalid extension');
    }

  }else{
    return res.status(200).send({message: 'No file uploaded'});
  }
}

/* *** get previous work file *** */
function getPreviousWorkFile (req, res){
  let previousWork = req.params.previousWork;
  let pathFile = './uploads/users/profile/pdf/previousWork/' + previousWork;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'PDF file not found'});
    }
  });
}

module.exports = {
    test,
    saveProfile,
    deleteProfile,
    updateProfile,
    getProfile,
    uploadImage,
    getImageFile,
    uploadVideo,
    getVideoFile,
    uploadResumesummary,
    getResumesummaryFile,
    uploadPreviousWork,
    getPreviousWorkFile
}