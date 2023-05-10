const fs = require('fs');
const path = require('path');
const Profile = require('../../../models/user/profile/profile');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from profile!'
    });
}

/* *** save profile *** */
async function saveProfile (req, res) {
  let params = req.body;

  if(!params.name || !params.fatherLastName || !params.motherLastName || !params.gender 
    || !params.dateBirth || !params.contry || !params.city || !params.publishCheck)
    return res.status(200).send({message: '¡Rellene todos los campos obligatorios!'});

  try {
    let profile = new Profile();

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
    profile.user = params.user;

    /* *** control duplicate users *** */
    let duplicateUser = await Profile.find({user: profile.user});

    if(duplicateUser && duplicateUser.length >= 1){
      return res.status(200).send({message: 'El usuario ya tiene un perfil'});
    }

    if (profile.rfc.toUpperCase().length === 12 && profile.rfc.toUpperCase().length <= 13){
      let rfc = await Profile.find({rfc: profile.rfc.toUpperCase()});

      if(rfc && rfc.length >= 1){
        return res.status(200).send({message: 'El RFC ya existe'});
      }
    }

    let profileStored = await profile.save();
        
    if(!profileStored) return res.status(200).send({message: 'Error al guardar el perfil!'});

    return res.status(200).send({profile: profileStored});

  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al guardar el servicio adquirido: ' + error});
  }
}

/* *** delete profile *** */
function deleteProfile (req, res) {
  let profileId = req.params.id;

  Profile.find({user: req.user.sub, '_id': profileId}).deleteOne(err => {
    if (err) return res.status(500).send({message: 'Error when deleting profile'});

    if(!profileRemoved) return res.status(404).send({message: 'Could not delete profile'});

    return res.status(200).send({message: 'Profile deleted successfully'});
  });
}

/* *** get profile *** */
async function getProfile (req, res) {
  let profileId = req.params.id;

  try {
    let profilePublished = await Profile.findOne({user: profileId}).populate('user', {image:1, username:1});

    if(!profilePublished) return res.status(404).send({message: 'El perfil no existe'});

    return res.status(200).send(
      { 
        profile: profilePublished,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el perfil: ' + error});
  }
}

/* *** update profile data *** */
async function updateProfile (req, res) {
  let update = req.body;
  let profileId = update.id;

  if(!update.name || !update.fatherLastName || !update.motherLastName || !update.gender 
    || !update.dateBirth || !update.contry || !update.city || !update.publishCheck)
    return res.status(200).send({message: '¡Rellene todos los campos obligatorios!'});
    
  if (update.rfc.toUpperCase().length >= 12 && update.rfc.toUpperCase().length <= 13) {
    let rfc = await Profile.findOne({ rfc: update.rfc.toUpperCase() }).select({rfc:1, user:1}).
    populate('user', {username:1});

    if(rfc){
      if(update.user != rfc.user._id){
        return res.status(200).send({ message: 'El RFC ya existe' });
      }
    }    
  }

  try {
    let profile = await Profile. findOne({'user': req.user.sub, '_id': profileId});

    if (!profile) return res.status(500).send({message: 'No tiene permiso para actualizar los datos del perfil'});

    let profileUpdated;

    if(profile){
      profileUpdated = await Profile.findByIdAndUpdate(profileId, update, {new: true});

      if (!profileUpdated) return res.status(404).send({message: 'No se han podido actualizar los datos del perfil'});
    }

    return res.status(200).send({
      profile: profileUpdated
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al actualizar el perfil: ' + error});
  }
}

/* *** upload img file *** */
async function uploadImage (req, res){
  let profileId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if (req.files){
      filePath = req.files.imgProfile.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[4];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
    }

    if(!fileExt == 'png' || !fileExt == 'jpg' || !fileExt == 'jpeg' || !fileExt == 'gif'){
      return removeFilesOfUploads(res, filePath, 'Extension invalida!');
    }

    let profileImg = await Profile.findById(profileId).select({profileImg:1});

    if (!profileImg) return res.status(404).send({message: 'Perfil no encontrado.'});

    if(profileImg.profileImg){ 
      let filePathDelete = './uploads/users/profile/img/' + profileImg.profileImg;
      fs.unlink(filePathDelete, (err) => {
        if (err) throw err;
      });
    }

    let profile = await Profile.findByIdAndUpdate(profileId, {profileImg: fileName}, {new: true}).select({profileImg:1});

    if (!profile) return res.status(404).send({message: 'Imagen de perfil no actualizada.'});

    return res.status(200).send({profile});

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
    if (err) throw err;
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
async function uploadVideo (req, res){
  let profileId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if (req.files){
      filePath = req.files.videoProfile.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[4];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
    }

    if(!fileExt == 'mp4' || !fileExt == 'mov' || !fileExt == 'wmv' || !fileExt == 'avi'){
      return removeFilesOfUploads(res, filePath, 'Extension invalida!');
    }

    let profileVideo = await Profile.findById(profileId).select({profileVideo:1});

    if (!profileVideo) return res.status(404).send({message: 'Perfil no encontrado.'});

    if(profileVideo.profileVideo){ 
      let filePathDelete = './uploads/users/profile/video/' + profileVideo.profileVideo;
      fs.unlink(filePathDelete, (err) => {
        if (err) throw err;
      });
    }
  
    let profile = await Profile.findByIdAndUpdate(profileId, {profileVideo: fileName}, {new: true}).select({profileVideo:1});

    if (!profile) return res.status(404).send({message: 'Perfil no actualizado.'});

    return res.status(200).send({profile});
  } catch (error) {
    console.log(error);
    
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
    return res.status(500).send({message: 'Error al actualizar video: ' + error});
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
async function uploadResumesummary (req, res){
  let profileId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if (req.files){
      filePath = req.files.resumesummaryFile.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[5];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
    }

    if(!fileExt == 'pdf'){
      return removeFilesOfUploads(res, filePath, 'Extension invalida!');
    }

    let resumeSummaryFile = await Profile.findById(profileId).select({resumeSummaryFile:1});

    if (!resumeSummaryFile) return res.status(404).send({message: 'Perfil no encontrado.'});

    if(resumeSummaryFile.resumeSummaryFile){ 
      let filePathDelete = './uploads/users/profile/pdf/resumeSummaryFile/' + resumeSummaryFile.resumeSummaryFile;
      fs.unlink(filePathDelete, (err) => {
        if (err) throw err;
      });
    }
  
    let profile = await Profile.findByIdAndUpdate(profileId, {resumeSummaryFile: fileName}, {new: true}).select({resumeSummaryFile:1});

    if (!profile) return res.status(404).send({message: 'Perfil no actualizado.'});

    return res.status(200).send({profile});
  } catch (error) {
    console.log(error);
    
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
    return res.status(500).send({message: 'Error al actualizar cv: ' + error});
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
async function uploadPreviousWork (req, res){
  let profileId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if (req.files){
      filePath = req.files.previousWork.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[5];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
    }
    if(!fileExt == 'pdf'){
      return removeFilesOfUploads(res, filePath, 'Extension invalida!');
    }

    let previousWork = await Profile.findById(profileId).select({previousWork:1});

    if (!previousWork) return res.status(404).send({message: 'Perfil no encontrado.'});

    if(previousWork.previousWork){ 
      let filePathDelete = './uploads/users/profile/pdf/previousWork/' + previousWork.previousWork;
      fs.unlink(filePathDelete, (err) => {
        if (err) throw err;
      });
    }
  
    let profile = await Profile.findByIdAndUpdate(profileId, {previousWork: fileName}, {new: true}).select({previousWork:1});

    if (!profile) return res.status(404).send({message: 'Perfil no actualizado.'});

    return res.status(200).send({profile});
  } catch (error) {
    console.log(error);
    
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
    return res.status(500).send({message: 'Error al actualizar trabajo previo: ' + error});
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
    getPreviousWorkFile,
}