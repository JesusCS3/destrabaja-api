const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Service = require('../../../models/publish-now/publish-service/service');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from service!'
    });
}

/* *** save service *** */
function saveService (req, res) {
  let params = req.body;
  let service = new Service();

  if (params.name && params.category && params.subcategory && params.shortDescription){
    service.name = params.name;
    service.hastags = params.hastags;
    service.category = params.category;
    service.subcategory = params.subcategory;
    service.videoService = null;
    service.imgServiceOne = null;
    service.imgServiceTwo = null;
    service.imgServiceThree = null;
    service.shortDescription = params.shortDescription;
    service.longDescription = params.longDescription;
    service.createdAt = moment().unix();
    service.user = req.user.sub;

    service.save((err, serviceStored) => {
      if (err) return res.status(500).send({message: 'Error saving service'});

      if (!serviceStored) return res.status(404).send({message: 'Service has not been stored'});

      return res.status(200).send({service: serviceStored});
    });
  }else{
    return res.status(200).send({
      message: 'Please fill all the fields required!'
    }); 
  }
}

/* *** get services from people I follow *** */
function getServices (req, res) {
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 4;

  Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
    if (err) return res.status(500).send({message: 'Error when returning follow'});

    let followsClean = [];

    follows.forEach((follow) => {
      followsClean.push(follow.followed);
    });

    Service.find({user: {"$in": followsClean}}).sort('-createdAt').populate('user').paginate(page, itemsPerPage, (err, service, total) => {
      if (err) return res.status(500).send({message: 'Error when returning services'});

      if (!service) return res.status(404).send({message: 'There are no services'});

      return res.status(200).send({
        totalItems: total,
        pages: Math.ceil(total/itemsPerPage),
        page: page,
        service
      });
    });
  });
}

/* *** get services by id *** */
function getServicesById (req, res) {
  let serviceId = req.params.id;

  Service.findById(serviceId, (err, service) => {
    if (err) return res.status(500).send({message: 'Error when returning service'});

    if(!service) return res.status(404).send({message: 'The service does not exist'});

    return res.status(200).send({service});
  });
}

/* *** delete service *** */
function deleteService (req, res) {
  let serviceId = req.params.id;

  Service.find({user: req.user.sub, '_id': serviceId}).remove(err => {
    if (err) return res.status(500).send({message: 'Error when deleting service'});

    if(!serviceRemoved) return res.status(404).send({message: 'Could not delete service'});

    return res.status(200).send({message: 'Service deleted successfully'});
  });
}

/* *** update service data *** */
function updateService (req, res) {
  let serviceId = req.params.id;
  let update = req.body;

  Service. findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
    if (service){
      /* *** update service *** */
      Service.findByIdAndUpdate(serviceId, update, {new: true}, (err, serviceUpdated) => {
        if (err) return res.status(500).send({message: 'Error in request'});
    
        if (!serviceUpdated) return res.status(404).send({message: 'Could not update service data'});
    
        return res.status(200).send({service: serviceUpdated});
      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update service data'});
    }
  });
}

function uploadImageTwo (req, res, nex) {
  let serviceId = req.params.id;

  if(req.files && req.files.uploads && Array.isArray(req.files.uploads)) { // suponiendo que espero el input llamado 'uploads'
    let images = req.files.uploads.map(file => {
      // operaciones con cada elemento file para obtener el nombre del archivo y guardarlo en una lista
      console.log(req.files.uploads);
      return fileName;
    });
    Project.findByIdAndUpdate(id, { $push: {images: {$each: images} } }, callback);
    // ...
  } else if(req.files && req.files.uploads) { // caso de un único archivo
    // lógica para obtener el nombre del archivo
    // let imageName = ...
    Project.findByIdAndUpdate(id, { $push: {images: imageName} }, callback);
    //..
  } else {
    // caso de no recibir imágenes
  }
}

/* *** upload img file *** */
function uploadImage (req, res){
  let serviceId = req.params.id;

  if (req.files){
    console.log(req.files);
    let filePath = req.files.images.path;
    console.log(filePath);
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[2];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
      Service. findOne({'user': request.user.sub, '_id': serviceId}).exec((err, service) => {
        if (service){
          /* *** update image *** */
          Service.findByIdAndUpdate(serviceId, {imgServiceOne: fileName}, {new: true}, (err, serviceUpdated) => {
            if (err) return res.status(500).send({message: 'Error in request'});

            if (!serviceUpdated) return res.status(404).send({message: 'Could not update user data'});

            return res.status(200).send({service: serviceUpdated});
          });
        }else{
          return removeFilesOfUploads(res, filePath, 'Does not have permission to update service image');
        }
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
  let imgServiceOne = req.params.imgServiceOne;
  let pathFile = './uploads/publish-now/publish-service/img/' + imgServiceOne;

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
  let serviceId = req.params.id;

  if (req.files){
    let filePath = req.files.videoService.path;
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'mp4' || fileExt == 'mov' || fileExt == 'wmv' || fileExt == 'avi'){
      Service. findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
        if (service){
          /* *** update video *** */
          Service.findByIdAndUpdate(serviceId, {videoService: fileName}, {new: true}, (err, serviceUpdated) => {
            if (err) return res.status(500).send({message: 'Error in request'});

            if (!serviceUpdated) return res.status(404).send({message: 'Could not update data'});

            return res.status(200).send({service: serviceUpdated});
          });
        }else{
          return removeFilesOfUploads(res, filePath, 'Does not have permission to update service video');
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
  let videoService = req.params.videoService;
  let pathFile = './uploads/publish-now/publish-service/video/' + videoService;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Video file not found'});
    }
  });
}

module.exports = {
    test,
    saveService,
    getServices,
    getServicesById,
    deleteService,
    updateService,
    uploadImage,

    uploadImageTwo,

    getImageFile,
    uploadVideo,
    getVideoFile
}