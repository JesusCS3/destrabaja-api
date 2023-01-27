const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Service = require('../../../models/publish-now/publish-service/service');
const ServicePlanOne = require('../../../models/publish-now/publish-service/servicePlanOne');
const ServicePlanTwo = require('../../../models/publish-now/publish-service/servicePlanTwo');
const ServicePlanThree = require('../../../models/publish-now/publish-service/servicePlanThree');
const Deliverable = require('../../../models/publish-now/publish-service/deliverable');
const Extra = require('../../../models/publish-now/publish-service/extra');
const RequirementsService = require('../../../models/publish-now/publish-service/requirement-service');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from service!'
    });
}

/* *** save service *** */
async function saveService (req, res) {
  let params = req.body;
  let service = new Service();
  let servicePlanOne = new ServicePlanOne();
  let servicePlanTwo = new ServicePlanTwo();
  let servicePlanThree = new ServicePlanThree();
  let deliverable = new Deliverable();
  let extra = new Extra();
  let requirementsService = new RequirementsService();

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
    service.status = 'active';
    service.createdAt = moment().unix();
    service.user = req.user.sub;

    /* *** save service *** */
    let servicePublished = await service.save().then((serviceStored) => {
      if (!serviceStored) return res.status(404).send({message: 'El servicio no se ha guardado.'});

      return serviceStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar el servicio: ' + err});
    });

    /* *** save plans *** */
    servicePlanOne.namePlanOne = params.namePlanOne;
    servicePlanOne.deliveryTimePlanOne = params.deliveryTimePlanOne;
    servicePlanOne.commentPlanOne = params.commentPlanOne;
    servicePlanOne.pricePlanOne = params.pricePlanOne;
    servicePlanOne.clientPricePlanOne = params.clientPricePlanOne;
    servicePlanOne.service = service._id;

    let servicePlanOnePublished = await servicePlanOne.save().then((servicePlanOneStored) => {
      if (!servicePlanOneStored) return res.status(404).send({message: 'El plan de servicio uno no se ha guardado.'});

      return servicePlanOneStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar el plan de servicio uno: ' + err});
    });
    
    servicePlanTwo.namePlanTwo = params.namePlanTwo;
    servicePlanTwo.deliveryTimePlanTwo = params.deliveryTimePlanTwo;
    servicePlanTwo.commentPlanTwo = params.commentPlanTwo;
    servicePlanTwo.pricePlanTwo = params.pricePlanTwo;
    servicePlanTwo.clientPricePlanTwo = params.clientPricePlanTwo;
    servicePlanTwo.service = service._id;

    let servicePlanTwoPublished = await servicePlanTwo.save().then((servicePlanTwoStored) => {
      if (!servicePlanTwoStored) return res.status(404).send({message: 'El plan de servicio dos no se ha guardado.'});

      return servicePlanTwoStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar el plan de servicio dos: ' + err});
    });

    servicePlanThree.namePlanThree = params.namePlanThree;
    servicePlanThree.deliveryTimePlanThree = params.deliveryTimePlanThree;
    servicePlanThree.commentPlanThree = params.commentPlanThree;
    servicePlanThree.pricePlanThree = params.pricePlanThree;
    servicePlanThree.clientPricePlanThree = params.clientPricePlanThree;
    servicePlanThree.service = service._id;

    let servicePlanThreePublished = await servicePlanTwo.save().then((servicePlanThreeStored) => {
      if (!servicePlanThreeStored) return res.status(404).send({message: 'El plan de servicio tres no se ha guardado.'});

      return servicePlanThreeStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar el plan de servicio tres: ' + err});
    });

    deliverable.name = params.name; 
    deliverable.checkPlanOne = params.checkPlanOne;
    deliverable.checkPlanTwo = params.checkPlanTwo;
    deliverable.checkPlanThree = params.checkPlanThree;
    deliverable.service = service._id;

    let deliverablesPublished = await deliverable.save().then((deliverableStored) => {
      if (!deliverableStored) return res.status(404).send({message: 'Los entregables no se ha guardado.'});

      return deliverableStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar los entregables: ' + err});
    });

    extra.name = params.name;
    extra.checkPlanOneExtra = params.checkPlanOneExtra;
    extra.deliveryTimePlanOneExtra = params.deliveryTimePlanOneExtra;
    extra.pricePlanOneExtra = params.pricePlanOneExtra;
    extra.clientPricePlanOneExtra = params.clientPricePlanOneExtra;
    extra.checkPlanTwoExtra = params.checkPlanTwoExtra;
    extra.deliveryTimePlanTwoExtra = params.deliveryTimePlanTwoExtra;
    extra.pricePlanTwoExtra = params.pricePlanTwoExtra;
    extra.clientPricePlanTwoExtra = params.clientPricePlanTwoExtra;
    extra.checkPlanThreeExtra = params.checkPlanThreeExtra;
    extra.deliveryTimePlanThreeExtra = params.deliveryTimePlanThreeExtra;
    extra.pricePlanThreeExtra = params.pricePlanThreeExtra;
    extra.clientPricePlanThreeExtra = params.clientPricePlanThreeExtra;
    extra.service = service._id;

    let extrasPublished = await extra.save().then((extraStored) => {
      if (!extraStored) return res.status(404).send({message: 'Los extras no se ha guardado.'});

      return extraStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar los extras: ' + err});
    });

    requirementsService.requirement = params.requirementsService;
    requirementsService.service = service._id;

    let requirementsPublished = await requirementsService.save().then((requirementsStored) => {
      if (!requirementsStored) return res.status(404).send({message: 'Los requerimientos del servicio no se ha guardado.'});

      return requirementsStored;
    }).catch((err) => {
      return res.status(500).send({message: 'Error al guardar los requerimientos del servicio: ' + err});
    });

    return res.status(200).send(
      { 
        service: servicePublished,
        servicePlanOne: servicePlanOnePublished,
        servicePlanTwo: servicePlanTwoPublished,
        servicePlanThree: servicePlanThreePublished,
        deliverables: deliverablesPublished,
        extras: extrasPublished,
        requirements: requirementsPublished
         
      }
    );

  }else{
    return res.status(200).send({
      message: '¡Rellene todos los campos obligatorios!'
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

function uploadImage (req, res) {
  let serviceId = req.params.id;

  if(req.files && req.files.images && Array.isArray(req.files.images)) { 
    /* *** if images are received *** */
    let images = req.files.images.map(file => {
      
      //console.log(req.files.images);
      let filePath = file.path;
      let fileSplit = filePath.split('\\');
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
          Service.findByIdAndUpdate(serviceId, {imgServiceOne: newImages[0], imgServiceTwo: newImages[1], imgServiceThree: newImages[2]}, {new: true}, (err, serviceUpdated) => {
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
    let fileSplit = filePath.split('\\');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];
    
    /* *** validate extension *** */
    if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
      Service. findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
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
  } else {
    /* *** if no images are received * ***/
    return res.status(404).send({message: 'There are no images'});
  }
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
    getImageFile,
    uploadVideo,
    getVideoFile
}