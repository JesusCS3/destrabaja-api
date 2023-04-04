const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Project = require('../../../models/publish-now/publish-project/project');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from project!'
    });
}

/* *** save project *** */
function saveProject (req, res) {
  let params = req.body;
  let project = new Project();

  if (params.generalInfo.name && params.generalInfo.category && params.generalInfo.subcategory
    && params.description.shortDescription){
    project.name = params.generalInfo.name;
    project.hashtags = params.generalInfo.hashtags;
    project.category = params.generalInfo.category;
    project.subcategory = params.generalInfo.subcategory;
    project.videoProject = null;
    project.images = null;
    project.filesProject = null;
    project.shortDescription = params.description.shortDescription;
    project.longDescription = params.description.longDescription;
    project.budget = params.features.budget;
    project.checkDeliveryDate = params.features.checkDeliveryDate;
    project.deliveryDate = params.features.deliveryDate;
    project.requirement = params.requirements.requirement;
    project.status = 'active';
    project.createdAt = moment().unix();
    project.user = req.user.sub;

    project.save((err, projectStored) => {
      if (err) return res.status(500).send({message: '¡Error al guardar el proyecto!'});

      if (!projectStored) return res.status(404).send({message: '¡No se ha guardado el proyecto!'});

      return res.status(200).send({project: projectStored});
    });

  }else{
    return res.status(200).send({
      message: '¡Rellene todos los campos obligatorios!'
    }); 
  }
}

/* *** get projects *** */
function getProjects (req, res) {
  let userId = req.user.sub;
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

  Project.find({user: userId}).select({videoProject:1, images:1, name:1, shortDescription:1, status:1, createdAt:1}).sort('-createdAt').populate('user', {image:1, username:1}).paginate(page, itemsPerPage, (err, projects, total) => {
    if (err) return res.status(500).send({message: 'Error when returning projects'});

    if (!projects) return res.status(404).send({message: 'There are no projects'});

    return res.status(200).send({
      totalItems: total,
      pages: Math.ceil(total/itemsPerPage),
      page: page,
      itemsPerPage: itemsPerPage,
      projects
    });
  });
}

/* *** get all projects *** */
function getAllProjects (req, res) {
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

  Project.find({status: 'active'}).select({videoProject:1, images:1, name:1, shortDescription:1, status:1, createdAt:1}).sort('-createdAt').populate('user', {image:1, username:1}).paginate(page, itemsPerPage, (err, projects, total) => {
    if (err) return res.status(500).send({message: 'Error when returning projects'});

    if (!projects) return res.status(404).send({message: 'There are no projects'});

    return res.status(200).send({
      totalItems: total,
      pages: Math.ceil(total/itemsPerPage),
      page: page,
      itemsPerPage: itemsPerPage,
      projects
    });
  });
}

/* *** get projects by id *** */
async function getProjectsById (req, res) {
  let projectId = req.params.id;

  let projectPublished = await Project.findById(projectId).sort('-createdAt').populate('user', {image:1, username:1}).then((project) => { 

    if(!project) return res.status(404).send({message: 'The project does not exist'});

    return project;
  }).catch((err) => {
    return res.status(500).send({message: 'Error when returning project: ' + err});
  });

  return res.status(200).send(
    { 
      project: projectPublished,
    }
  );
}

/* *** delete project *** */
async function deleteProject (req, res) {
  let projectId = req.params.id;

  await Project.find({user: req.user.sub, '_id': projectId}).remove().then((projectRemoved) => { 

    if(!projectRemoved) return res.status(404).send({message: 'Could not delete project'});

  }).catch((err) => {
    return res.status(500).send({message: 'Error when deleting project: ' + err});
  });

  return res.status(200).send({message: 'Project deleted successfully'});
}

/* *** update project data *** */
async function updateProject (req, res) {
  let projectId = req.params.id;
  let update = req.body;

  await Project.findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
    if (project){
      /* *** update project *** */
      Project.findByIdAndUpdate(projectId, update, {new: true}, (err, projectUpdated) => {
        
        if (err) return res.status(500).send({message: 'Error in request'});
    
        if (!projectUpdated) return res.status(404).send({message: 'Could not update project data'});
    
        return res.status(200).send({project: projectUpdated});

      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update project data'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error when update project: ' + err});
  });

}

/* *** update status project *** */
async function updateStatusProject (req, res) {
  console.log(req.params);
  let projectId = req.params.id;
  let statusProject = req.body;
console.log(statusProject);
  await Project.findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
    if (project){
      /* *** update project *** */
      Project.findByIdAndUpdate(projectId, {status: statusProject.status}, {new: true}, (err, projectUpdated) => {
        
        if (err) return res.status(500).send({message: 'Error in request'});
    
        if (!projectUpdated) return res.status(404).send({message: 'Could not update status project'});
    
        return res.status(200).send({project: projectUpdated});

      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update status project'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error when update status project: ' + err});
  });
}

/* *** upload img file *** */
function uploadImage (req, res){
  let projectId = req.params.id;

  if(req.files && req.files.images && Array.isArray(req.files.images)) { 

    /* *** if images are received *** */
    let images = req.files.images.map(file => {
      
      console.log(req.files.images);
      let filePath = file.path;
      console.log(filePath);
      let fileSplit = filePath.split('\/');
      console.log(fileSplit);
      let fileName = fileSplit[4];
      console.log(fileName);
      let extSplit = fileName.split('\.');
      console.log(extSplit);
      let fileExt = extSplit[1];
      console.log(fileExt);

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
      Project. findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
        if (project){
          Project.findByIdAndUpdate(projectId, {images: newImages}, {new: true}, (err, projectUpdated) => {
            if (err) return res.status(500).send({message: 'Error en la solicitud.'});

            if (!projectUpdated) return res.status(404).send({message: '¡No se ha podido actualizar la imagen del proyecto!'});

            return res.status(200).send({project: projectUpdated});
          });
        }else{
          return res.status(500).send({message: '¡No tiene permiso para actualizar la imagen del proyecto!'});
        }
      });
    }else{
      /* *** delete files for exceeding the allowed limit *** */
      newImages.map(file => {
        let filePath = './uploads/publish-now/publish-project/img/' + file;
        removeFilesOfUploads(res, filePath, 'Error al borrar archivos, por exceder el límite permitido');
      });

      return res.status(500).send({message: 'Se ha superado el límite de imágenes'});
    } 
  } else if(req.files && req.files.images) { 
    console.log(req.files.images);
    /* *** if an image is received *** */
    let filePath = req.files.images.path;
    let fileSplit = filePath.split('\/');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];
    
    /* *** validate extension *** */
    if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){

      /* *** update images *** */
      Project. findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
        if (project){
          /* *** update image *** */
          Project.findByIdAndUpdate(projectId, {images: fileName}, {new: true}, (err, projectUpdated) => {
            if (err) return res.status(500).send({message: 'Error en la solicitud.'});

            if (!projectUpdated) return res.status(404).send({message: '¡No se ha podido actualizar la imagen del proyecto!'});

            return res.status(200).send({project: projectUpdated});
          });
        }else{
          return removeFilesOfUploads(res, filePath, '¡No tiene permiso para actualizar la imagen del proyecto!');
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

/* *** remove img file of uploads *** */
function removeFilesOfUploads (res, filePath, message){
  fs.unlink(filePath, (err) =>{
    if (err) return res.status(200).send({message: message});
  });
}

/* *** get img file *** */
function getImageFile (req, res){
  let imgFile = req.params.imageFile;
  let pathFile = './uploads/publish-now/publish-project/img/' + imgFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Archivo de imagen no encontrado'});
    }
  });
}

/* *** upload video file *** */
function uploadVideo (req, res){
  let projectId = req.params.id;
  console.log(req.files);
  if (req.files){
    let filePath = req.files.videoProject.path;
    let fileSplit = filePath.split('\/');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];

    if(fileExt == 'mp4' || fileExt == 'mov' || fileExt == 'wmv' || fileExt == 'avi'){
      Project. findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
        if (project){
          if (project.videoProject){

            let previousVideo = './uploads/publish-now/publish-project/video/' + project.videoProject;

            fs.unlink(previousVideo, (err) =>{
              if (err) return res.status(200).send({message: err});
            });
 
            /* *** update video *** */
            Project.findByIdAndUpdate(projectId, {videoProject: fileName}, {new: true}, (err, projectUpdated) => {
              if (err) return res.status(500).send({message: 'Error en la solicitud.'});

              if (!projectUpdated) return res.status(404).send({message: '¡No se ha podido actualizar el video del proyecto!'});

              return res.status(200).send({project: projectUpdated});
            });
          }

          if (!project.videoProject){
            /* *** update video *** */ 
            Project.findByIdAndUpdate(projectId, {videoProject: fileName}, {new: true}, (err, projectUpdated) => {
              if (err) return res.status(500).send({message: 'Error en la solicitud.'});

              if (!projectUpdated) return res.status(404).send({message: '¡No se ha podido actualizar el video del proyecto!'});

              return res.status(200).send({project: projectUpdated});
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
  let videoFile = req.params.videoFile;
  let pathFile = './uploads/publish-now/publish-project/video/' + videoFile;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Archivo de vídeo no encontrado'});
    }
  });
}

/* *** upload resumesummary file *** */
function uploadFiles (req, res){
  let projectId = req.params.id;

  if(req.files && req.files.filesProject && Array.isArray(req.files.filesProject)) { 
    /* *** if files are received *** */
    let files = req.files.filesProject.map(file => {
      
      //console.log(req.files.filesProject);
      let filePath = file.path;
      let fileSplit = filePath.split('\/');
      let fileName = fileSplit[4];
      let extSplit = fileName.split('\.');
      let fileExt = extSplit[1];

      /* *** validate extension *** */
      if(fileExt == 'pdf'){
        return fileName;
      }else{
        removeFilesOfUploads(res, filePath, 'Error deleting file with wrong extension');
        fileName = null;
        return fileName;
      }  
    });

    /* *** create new array without null elements *** */
    let newFiles = files.filter(file => file != null);

    if (newFiles.length <= 3){
      /* *** update files *** */
      Project. findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
        if (project){
          Project.findByIdAndUpdate(projectId, {filesProject: newFiles}, {new: true}, (err, projectUpdated) => {
            if (err) return res.status(500).send({message: 'Error en la solicitud.'});

            if (!projectUpdated) return res.status(404).send({message: '¡No se ha podido actualizar la imagen del proyecto!'});

            return res.status(200).send({project: projectUpdated});
          });
        }else{
          return res.status(500).send({message: '¡No tiene permiso para actualizar la imagen del proyecto!'});
        }
      });
      
    }else{
      /* *** delete files for exceeding the allowed limit *** */
      newFiles.map(file => {
        let filePath = './uploads/publish-now/publish-project/pdf/' + file;
        removeFilesOfUploads(res, filePath, 'Error al borrar archivos, por exceder el límite permitido');
      });

      return res.status(500).send({message: 'Límite de archivos superado'});
    } 
  } else if(req.files && req.files.filesProject) { 
    /* *** if an image is received *** */
    let filePath = req.files.filesProject.path;
    let fileSplit = filePath.split('\/');
    let fileName = fileSplit[4];
    let extSplit = fileName.split('\.');
    let fileExt = extSplit[1];
    
    /* *** validate extension *** */
    if(fileExt == 'pdf'){

      /* *** update files *** */
      Project. findOne({'user': req.user.sub, '_id': projectId}).exec().then((project) => {
        if (project){

          Project.findByIdAndUpdate(projectId, {filesProject: fileName}, {new: true}, (err, projectUpdated) => {
            if (err) return res.status(500).send({message: 'Error en la solicitud.'});

            if (!projectUpdated) return res.status(404).send({message: '¡No se han podido actualizar los archivos del proyecto!'});

            return res.status(200).send({project: projectUpdated});
          });
        }else{
          return removeFilesOfUploads(res, filePath, '¡No tiene permiso para actualizar los archivos del proyecto!');
        }
      });
    }else{
      return removeFilesOfUploads(res, filePath, 'Extensión no válida');
    }
  } else {
    /* *** if no images are received * ***/
    return res.status(404).send({message: 'No hay archivos'});
  }
}

/* *** get resumesummary file *** */
function getFiles (req, res){
  let filesProject = req.params.filesProject;
  let pathFile = './uploads/publish-now/publish-project/pdf/' + filesProject;

  fs.exists(pathFile, (exists) =>{
    if (exists){
      res.sendFile(path.resolve(pathFile));
    }else{
      res.status(200).send({message: 'Archivo PDF no encontrado'});
    }
  });
}


module.exports = {
    test,
    saveProject,
    getProjects,
    getAllProjects,
    getProjectsById,
    deleteProject,
    updateProject,
    updateStatusProject,
    uploadImage,
    getImageFile,
    uploadVideo,
    getVideoFile,
    uploadFiles,
    getFiles,
}