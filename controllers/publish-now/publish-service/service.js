const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

const Service = require('../../../models/publish-now/publish-service/service');
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

  if(!params.generalInfo.name || !params.generalInfo.category || !params.generalInfo.subcategory
    || !params.description.shortDescription)
    return res.status(200).send({message: 'Rellene todos los campos obligatorios!'});
  
  try {
    let service = new Service();

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
    service.user = req.user.sub;

    let serviceStored = await service.save();
        
    if(!serviceStored) return res.status(200).send({message: '¡Error al guardar el servicio!'});

    return res.status(200).send({
      service: serviceStored,
    });
  } catch (error) {
      console.log(error);
      return res.status(500).send({message: '¡Error al guardar el servicio!'});
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
async function getServices (req, res) {
  let userId = req.user.sub;
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

  await Service.find({user: userId}).select({videoService:1, images:1, name:1, shortDescription:1, clientPricePlanOne:1, status:1, createdAt:1}).sort('-createdAt').populate('user', {image:1, username:1}).paginate(page, itemsPerPage, (err, services, total) => {
    if (err) return res.status(500).send({message: 'Error when returning services'});

    if (!services) return res.status(200).send({message: 'There are no services'});

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
async function getAllServices (req, res) {
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

  await Service.find({status: 'active'}).select({videoService:1, images:1, name:1, shortDescription:1, clientPricePlanOne:1, status:1, createdAt:1}).sort('-createdAt').populate('user', {image:1, username:1}).paginate(page, itemsPerPage, (err, services, total) => {
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

  try {
    let servicePublished = await Service.findById(serviceId).sort('-createdAt').populate('user', {image:1, username:1});

    if(!servicePublished) return res.status(404).send({message: 'El servicio no existe'});

    return res.status(200).send(
      { 
        service: servicePublished,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el servicio: ' + error});
  }
}

/* *** get service purchased by id *** */
async function getServicePurchasedById (req, res) {
  let serviceId = req.params.id;
  let plan = req.params.plan;

  try {
    if(plan === 'one'){
      let serviceOne = await Service.findById(serviceId).select({name:1, namePlanOne:1, 
        clientPricePlanOne:1, deliveryTimePlanOne:1, requirement:1, videoService:1, images:1, 
        user:1 }).populate('user', {username:1});

      console.log(serviceOne);

      if(!serviceOne) return res.status(404).send({message: 'El servicio no existe'});

      return res.status(200).send(
        { 
          service: {
            id: serviceOne._id,
            name: serviceOne.name,
            plan: serviceOne.namePlanOne,
            clientPrice: serviceOne.clientPricePlanOne,
            deliveryTime: serviceOne.deliveryTimePlanOne,
            requirement: serviceOne.requirement,
            videoService: serviceOne.videoService,
            images: serviceOne.images,
            user: serviceOne.user,
          },
        }
      );
    }

    if(plan === 'two'){
      let serviceTwo = await Service.findById(serviceId).select({name:1, namePlanTwo:1, 
        clientPricePlanTwo:1, deliveryTimePlanTwo:1, requirement:1, videoService:1, images:1, 
        user:1}).populate('user', {username:1});

      if(!serviceTwo) return res.status(404).send({message: 'El servicio no existe'});

      return res.status(200).send(
        { 
          service: {
            id: serviceTwo._id,
            name: serviceTwo.name,
            plan: serviceTwo.namePlanTwo,
            clientPrice: serviceTwo.clientPricePlanTwo,
            deliveryTime: serviceTwo.deliveryTimePlanTwo,
            requirement: serviceTwo.requirement,
            videoService: serviceTwo.videoService,
            images: serviceTwo.images,
            user: serviceTwo.user,
          },
        }
      );
    }

    if(plan === 'three'){
      let serviceThree = await Service.findById(serviceId).select({name:1, namePlanThree:1, 
        clientPricePlanThree:1, deliveryTimePlanThree:1, requirement:1, videoService:1, images:1, 
        user:1}).populate('user', {username:1});

      if(!serviceThree) return res.status(404).send({message: 'El servicio no existe'});

      return res.status(200).send(
        { 
          service: {
            id: serviceThree._id,
            name: serviceThree.name,
            plan: serviceThree.namePlanThree,
            clientPrice: serviceThree.clientPricePlanThree,
            deliveryTime: serviceThree.deliveryTimePlanThree,
            requirement: serviceThree.requirement,
            videoService: serviceThree.videoService,
            images: serviceThree.images,
            user: serviceThree.user,
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el servicio: ' + error});
  }
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
async function updateService (req, res) {
  let serviceId = req.params.id;
  let update = req.body;
  let userId = update.user;
  

  console.log(serviceId);
  console.log(userId);
  console.log(update);

  if(!update.generalInfo.name || !update.generalInfo.category || !update.generalInfo.subcategory
    || !update.description.shortDescription)
    return res.status(200).send({message: 'Rellene todos los campos obligatorios!'});
  
  try {
    let updateData = {
      name: update.generalInfo.name,
      hashtags: update.generalInfo.hashtags,
      category: update.generalInfo.category,
      subcategory: update.generalInfo.subcategory,
      shortDescription: update.description.shortDescription,
      longDescription: update.description.longDescription,
      checkPlanTwo: update.levels.checkPlanTwo,
      checkPlanThree: update.levels.checkPlanThree,
      namePlanOne: update.levels.namePlanOne,
      namePlanTwo: update.levels.namePlanTwo,
      namePlanThree: update.levels.namePlanThree,
      deliverables: update.levels.deliverables,
      deliveryTimePlanOne: update.levels.deliveryTimePlanOne,
      deliveryTimePlanTwo: update.levels.deliveryTimePlanTwo,
      deliveryTimePlanThree: update.levels.deliveryTimePlanThree,
      commentPlanOne: update.levels.commentPlanOne,
      commentPlanTwo: update.levels.commentPlanTwo,
      commentPlanThree: update.levels.commentPlanThree,
      pricePlanOne: update.levels.pricePlanOne,
      pricePlanTwo: update.levels.pricePlanTwo,
      pricePlanThree: update.levels.pricePlanThree,
      clientPricePlanOne: update.levels.clientPricePlanOne,
      clientPricePlanTwo: update.levels.clientPricePlanTwo,
      clientPricePlanThree: update.levels.clientPricePlanThree,
      extras: update.extras.extras,
      requirement: update.requirements.requirement,
    };

    console.log(updateData);

    let service = await Service.findOne({'user': userId, '_id': serviceId});
        
    if(!service) return res.status(404).send({message: '¡Servicio no encontrado!'});

    if(service){
      let serviceUpdate = await Service.findByIdAndUpdate(serviceId, updateData, {new: true});

      if(!serviceUpdate) return res.status(200).send({message: '¡Error al actualizar el servicio!'});

      return res.status(200).send({
        service: serviceUpdate,
      });
    }
  } catch (error) {
      console.log(error);
      return res.status(500).send({message: '¡Error al actualizar el servicio!'});
  }
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

async function uploadImage (req, res) {
  let serviceId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if(req.files && req.files.images && Array.isArray(req.files.images)) { 
      /* *** if images are received *** */
      let images = req.files.images.map(file => {
        
        console.log(req.files.images);
        filePath = file.path;
        fileSplit = filePath.split(/[\\/]/);
        fileName = fileSplit[4];
        extSplit = fileName.split('\.');
        fileExt = extSplit[1];
  
        /* *** validate extension *** */
        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
          return fileName;
        }else{
          removeFilesOfUploads(res, filePath, 'Error al borrar un archivo con extensión incorrecta');
          fileName = null;
          return fileName;
        }  
      });
  
      /* *** create new array without null elements *** */
      let newImages = images.filter(image => image != null);
  
      if (newImages.length <= 3){
        /* *** update images *** */
        let service = await Service. findOne({'user': req.user.sub, '_id': serviceId}).select({images:1});

        if(!service) return res.status(500).send({message: 'No tiene permiso para actualizar los datos del servicio'});

        //if(service.images){}

        if(service){
          let serviceUpdated = await Service.findByIdAndUpdate(serviceId, {images: newImages}, {new: true}).
          select({name:1, images:1});

          if (!serviceUpdated) return res.status(404).send({message: 'No se han podido actualizar los datos del servicio'});
  
          return res.status(200).send({service: serviceUpdated});
        }
      }else{
        /* *** delete files for exceeding the allowed limit *** */
        newImages.map(file => {
          let filePath = './uploads/publish-now/publish-service/img/' + file;
          removeFilesOfUploads(res, filePath, 'Error al borrar archivos, por exceder el límite permitido');
        });
  
        return res.status(500).send({message: 'Se ha superado el límite de imágenes'});
      } 
    }

    if(req.files && req.files.images) { 
      /* *** if an image is received *** */
      filePath = req.files.images.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[4];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
      
      /* *** validate extension *** */
      if(!fileExt == 'png' || !fileExt == 'jpg' || !fileExt == 'jpeg' || !fileExt == 'gif'){
        return removeFilesOfUploads(res, filePath, 'Extension invalida!');
      }

      let service = await Service. findOne({'user': req.user.sub, '_id': serviceId}).select({images:1});

      if(!service) return removeFilesOfUploads(res, filePath, '¡No tiene permiso para actualizar la imagen del servicio!');

      //if(service.images){}

      if(service){
        let serviceUpdated = await Service.findByIdAndUpdate(serviceId, {images: fileName}, {new: true}).
        select({name:1, images:1});

        if (!serviceUpdated) return res.status(404).send({message: 'No se han podido actualizar los datos del servicio'});
  
        return res.status(200).send({service: serviceUpdated});
      }
    }
  } catch (error) {
    console.log(error);
    
    // fs.unlink(filePath, (err) => {
    //   if (err) throw err;
    // });
    return res.status(500).send({message: 'Error al actualizar imagen: ' + error});
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
    if (err) return res.status(200).send({message: message + ' ' + err});
  });
}

/* *** upload video file *** */
async function uploadVideo (req, res){
  let serviceId = req.params.id;
  let filePath, fileSplit, fileName, extSplit, fileExt;

  try {
    if (req.files){
      filePath = req.files.videoService.path;
      fileSplit = filePath.split(/[\\/]/);
      fileName = fileSplit[4];
      extSplit = fileName.split('\.');
      fileExt = extSplit[1];
    }

    if(!fileExt == 'mp4' || !fileExt == 'mov' || !fileExt == 'wmv' || !fileExt == 'avi'){
      return removeFilesOfUploads(res, filePath, 'Extension invalida!');
    }

    let videoService = await Service.findOne({'user': req.user.sub, '_id': serviceId}).select({videoService:1});

    if (!videoService) return res.status(404).send({message: '¡No tiene permiso para actualizar el video del proyecto!'});

    if(videoService.videoService){ 
      let filePathDelete = './uploads/publish-now/publish-service/video/' + videoService.videoService;
      fs.unlink(filePathDelete, (err) => {
        if (err) throw err;
      });
    }
  
    let service = await Service.findByIdAndUpdate(serviceId, {videoService: fileName}, {new: true}).select({videoService:1});

    if (!service) return res.status(404).send({message: '¡No se ha podido actualizar el video del servicio!'});

    return res.status(200).send({service});

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
    getServicePurchasedById,
    deleteService,
    updateService,
    updateStatusService,
    uploadImage,
    getImageFile,
    uploadVideo,
    getVideoFile,
}