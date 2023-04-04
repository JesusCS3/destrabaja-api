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
  console.log(params);
  if (params.generalInfo.name && params.generalInfo.category && params.generalInfo.subcategory
    && params.description.shortDescription){
    service.name = params.generalInfo.name;
    service.hashtags = params.generalInfo.hashtags;
    service.category = params.generalInfo.category;
    service.subcategory = params.generalInfo.subcategory;
    service.videoService = null;
    service.images = null;
    service.shortDescription = params.description.shortDescription;
    service.longDescription = params.description.longDescription;
    service.checkPlanTwo = params.levels.checkPlanTwo;
    service.checkPlanThree = params.levels.checkPlanThree;
    service.namePlanOne = params.levels.namePlanOne;
    service.namePlanTwo = params.levels.namePlanTwo;
    service.namePlanThree = params.levels.namePlanThree;
    service.deliverables = params.levels.deliverables;
    service.deliveryTimePlanOne = params.levels.deliveryTimePlanOne;
    service.deliveryTimePlanTwo = params.levels.deliveryTimePlanTwo;
    service.deliveryTimePlanThree = params.levels.deliveryTimePlanThree;
    service.commentPlanOne = params.levels.commentPlanOne;
    service.commentPlanTwo = params.levels.commentPlanTwo;
    service.commentPlanThree = params.levels.commentPlanThree;
    service.pricePlanOne = params.levels.pricePlanOne;
    service.pricePlanTwo = params.levels.pricePlanTwo;
    service.pricePlanThree = params.levels.pricePlanThree;
    service.clientPricePlanOne = params.levels.clientPricePlanOne;
    service.clientPricePlanTwo = params.levels.clientPricePlanTwo;
    service.clientPricePlanThree = params.levels.clientPricePlanThree;
    service.extras = params.extras.extras;
    service.requirement = params.requirements.requirement;
    service.status = 'active';
    service.createdAt = moment().unix();
    service.user = req.user.sub;

    /* *** save service *** */
    service.save((err, serviceStored) => {
      if (err) return res.status(500).send({message: '¡Error al guardar el servicio!' + err});

      if (!serviceStored) return res.status(404).send({message: '¡No se ha guardado el servicio!'});

      return res.status(200).send({service: serviceStored});
    });

  }else{
    return res.status(200).send({
      message: '¡Rellene todos los campos obligatorios!'
    }); 
  }
}

/* *** get services from people I follow *** */
function getServicesFollow (req, res) {
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

/* *** get services *** */
function getServices (req, res) {
  let userId = req.user.sub;
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

  Service.find({user: userId}).select({videoService:1, images:1, name:1, shortDescription:1, clientPricePlanOne:1, status:1, createdAt:1}).sort('-createdAt').populate('user', {image:1, username:1}).paginate(page, itemsPerPage, (err, services, total) => {
    if (err) return res.status(500).send({message: 'Error when returning services'});

    if (!services) return res.status(404).send({message: 'There are no services'});

    return res.status(200).send({
      totalItems: total,
      pages: Math.ceil(total/itemsPerPage),
      page: page,
      itemsPerPage: itemsPerPage,
      services
    });
  });
}

/* *** get all services *** */
function getAllServices (req, res) {
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

  Service.find({status: 'active'}).select({videoService:1, images:1, name:1, shortDescription:1, clientPricePlanOne:1, status:1, createdAt:1}).sort('-createdAt').populate('user', {image:1, username:1}).paginate(page, itemsPerPage, (err, services, total) => {
    if (err) return res.status(500).send({message: 'Error when returning services'});

    if (!services) return res.status(404).send({message: 'There are no services'});

    return res.status(200).send({
      totalItems: total,
      pages: Math.ceil(total/itemsPerPage),
      page: page,
      itemsPerPage: itemsPerPage,
      services
    });
  });
}

/* *** get services by id *** */
async function getServicesById (req, res) {
  let serviceId = req.params.id;

  let servicePublished = await Service.findById(serviceId).sort('-createdAt').populate('user', {image:1, username:1}).then((service) => { 

    if(!service) return res.status(404).send({message: 'The service does not exist'});

    return service;
  }).catch((err) => {
    return res.status(500).send({message: 'Error when returning service: ' + err});
  });

  return res.status(200).send(
    { 
      service: servicePublished,
    }
  );
}

/* *** delete service *** */
async function deleteService (req, res) {
  let serviceId = req.params.id;

  await Service.find({user: req.user.sub, '_id': serviceId}).deleteOne().then((serviceRemoved) => { 

    if(!serviceRemoved) return res.status(404).send({message: 'Could not delete service'});

  }).catch((err) => {
    return res.status(500).send({message: 'Error when deleting service: ' + err});
  });

  return res.status(200).send({message: 'Service deleted successfully'});
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

/* *** update status service *** */
async function updateStatusService (req, res) {
  console.log(req.params);
  let serviceId = req.params.id;
  let statusService = req.body;
console.log(statusService);
  await Service.findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
    if (service){
      /* *** update service *** */
      Service.findByIdAndUpdate(serviceId, {status: statusService.status}, {new: true}, (err, serviceUpdated) => {
        
        if (err) return res.status(500).send({message: 'Error in request'});
    
        if (!serviceUpdated) return res.status(404).send({message: 'Could not update status service'});
    
        return res.status(200).send({service: serviceUpdated});

      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update status service'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error when update status service: ' + err});
  });
}

function uploadImage (req, res) {
  let serviceId = req.params.id;

  if(req.files && req.files.images && Array.isArray(req.files.images)) { 
    /* *** if images are received *** */
    let images = req.files.images.map(file => {
      
      console.log(req.files.images);
      let filePath = file.path;
      let fileSplit = filePath.split('\/');
      let fileName = fileSplit[4];
      let extSplit = fileName.split('\.');
      let fileExt = extSplit[1];

      /* *** validate extension *** */
      if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
        return fileName;
      }else{
        removeFilesOfUploads(res, filePath, 'Error deleting file with wrong extension');
        fileName = null;
        return fileName;
      }  
    });

    /* *** create new array without null elements *** */
    let newImages = images.filter(image => image != null);

    if (newImages.length <= 3){
      /* *** update images *** */
      Service. findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
        if (service){
          Service.findByIdAndUpdate(serviceId, {images: newImages}, {new: true}, (err, serviceUpdated) => {
            if (err) return res.status(500).send({message: 'Error in request'});

            if (!serviceUpdated) return res.status(404).send({message: 'Could not update user data'});

            return res.status(200).send({service: serviceUpdated});
          });
        }else{
          return res.status(500).send({message: 'Does not have permission to update service data'});
        }
      });
    }else{
      /* *** delete files for exceeding the allowed limit *** */
      newImages.map(file => {
        let filePath = './uploads/publish-now/publish-service/img/' + file;
        removeFilesOfUploads(res, filePath, 'Error when deleting files, due to exceeding the allowed limit');
      });

      return res.status(500).send({message: 'Exceeded image limit'});
    } 
  } else if(req.files && req.files.images) { 
    /* *** if an image is received *** */
    let filePath = req.files.images.path;
    let fileSplit = filePath.split('\/');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];
    
    /* *** validate extension *** */
    if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
      Service. findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
        if (service){
          /* *** update image *** */
          Service.findByIdAndUpdate(serviceId, {images: fileName}, {new: true}, (err, serviceUpdated) => {
            if (err) return res.status(500).send({message: 'Error en la solicitud.'});

            if (!serviceUpdated) return res.status(404).send({message: '¡No se ha podido actualizar la imagen del servicio!'});

            return res.status(200).send({service: serviceUpdated});
          });
        }else{
          return removeFilesOfUploads(res, filePath, '¡No tiene permiso para actualizar la imagen del servicio!');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Extensión no válida');
    }
  } else {
    /* *** if no images are received * ***/
    return res.status(404).send({message: 'No hay imágenes'});
  }
}

/* *** get img file *** */
function getImageFile (req, res){
  let imageFile = req.params.imageFile;
  let pathFile = './uploads/publish-now/publish-service/img/' + imageFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Archivo de imagen no encontrado'});
    }
  });
}

/* *** remove file of uploads *** */
function removeFilesOfUploads (res, filePath, message){
  fs.unlink(filePath, (err) =>{
    if (err) return res.status(200).send({message: message});
  });
}

/* *** upload video file *** */
function uploadVideo (req, res){
  let serviceId = req.params.id;

  if (req.files){
    let filePath = req.files.videoService.path;
    let fileSplit = filePath.split('\/');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'mp4' || fileExt == 'mov' || fileExt == 'wmv' || fileExt == 'avi'){
      Service. findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
        if (service){
          if (service.videoService){

            let previousVideo = './uploads/publish-now/publish-service/video/' + service.videoService;

            fs.unlink(previousVideo, (err) =>{
              if (err) return res.status(200).send({message: err});
            });

            /* *** update video *** */
            Service.findByIdAndUpdate(serviceId, {videoService: fileName}, {new: true}, (err, serviceUpdated) => {
              if (err) return res.status(500).send({message: 'Error en la solicitud.'});

              if (!serviceUpdated) return res.status(404).send({message: '¡No se ha podido actualizar el video del servicio!'});

              return res.status(200).send({service: serviceUpdated});
            });
          }

          if (!service.videoService){
            /* *** update video *** */
            Service.findByIdAndUpdate(serviceId, {videoService: fileName}, {new: true}, (err, serviceUpdated) => {
              if (err) return res.status(500).send({message: 'Error en la solicitud.'});

              if (!serviceUpdated) return res.status(404).send({message: '¡No se ha podido actualizar el video del servicio!'});

              return res.status(200).send({service: serviceUpdated});
            });
          }
          
        }else{
          return removeFilesOfUploads(res, filePath, '¡No tiene permiso para actualizar el video del proyecto!');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Extensión no válida');
    }

  }else{
    return res.status(200).send({message: 'No se ha cargado ningún vídeo'});
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
      res.status(200).send({message: 'Archivo de vídeo no encontrado'});
    }
  });
}

module.exports = {
    test,
    saveService,
    getServicesFollow,
    getServices,
    getAllServices,
    getServicesById,
    deleteService,
    updateService,
    updateStatusService,
    uploadImage,
    getImageFile,
    uploadVideo,
    getVideoFile
}