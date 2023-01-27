const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Project = require('../../../models/publish-now/publish-project/project');
const RequirementsProject = require('../../../models/publish-now/publish-project/requirement-project');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from project!'
    });
}

/* *** save project *** */
async function saveProject (req, res) {
  let params = req.body;
  let project = new Project();
  let requirementsProject = new RequirementsProject();

  if (params.name && params.category && params.subcategory && params.shortDescription){
    project.name = params.name;
    project.hastags = params.hastags;
    project.category = params.category;
    project.subcategory = params.subcategory;
    project.videoProject = null;
    project.imgProjectOne = null;
    project.imgProjectTwo = null;
    project.imgProjectThree = null;
    project.fileProjectOne = null;
    project.fileProjectTwo = null;
    project.fileProjectThree = null;
    project.shortDescription = params.shortDescription;
    project.longDescription = params.longDescription;
    project.budget = params.budget;
    project.deliveryDate = params.deliveryDate;
    project.createdAt = moment().unix();
    project.user = req.user.sub;

    let projectPublished = await project.save().then((projectStored) => {
      return projectStored;
    }).catch((err) => {
      return handleError(err);
    });

    requirementsProject.requirement = params.requirement;
    requirementsProject.project = project._id;

    let requirementsPublished = await requirementsProject.save().then((requirementsProjectStored) => {      
      return requirementsProjectStored;
    }).catch((err) => {
      return handleError(err);
    });

    return res.status(200).send(
      { 
        project: projectPublished,
        requirementsProject: requirementsPublished 
      }
    );

  }else{
    return res.status(200).send({
      message: 'Please fill all the fields required!'
    }); 
  }
}

/* *** get projects by id *** */
async function getProjectsById (req, res) {
  let projectId = req.params.id;

  let projectPublished = await Project.findById(projectId).then((project) => { 

    if(!project) return res.status(404).send({message: 'The project does not exist'});

    return project;
  }).catch((err) => {
    return res.status(500).send({message: 'Error when returning project: ' + err});
  });

  let requirementsPublished = await RequirementsProject
  .find({"project" : projectId}).select({'_id': 0, '__v': 0, 'project': 0, 'createdAt': 0, 'updatedAt': 0})
  .then((requirementsProject) => {

    if(!requirementsProject) return res.status(404).send({message: 'The requirements project does not exist'});
         
    return requirementsProject;
  }).catch((err) => {
    return res.status(500).send({message: 'Error when returning requirements project: ' + err});
  });

  return res.status(200).send(
    { 
      project: projectPublished,
      requirementsProject: requirementsPublished 
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

  await RequirementsProject.find({user: req.user.sub, 'project': projectId})
  .remove().then((requirementsProjectRemoved) => { 

    if(!requirementsProjectRemoved) return res.status(404).send({message: 'Could not delete requirements project'});

  }).catch((err) => {
    return res.status(500).send({message: 'Error when deleting requirements project: ' + err});
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
    
        //return res.status(200).send({project: projectUpdated});

        //return projectUpdated;
      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update project data'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error when update project: ' + err});
  });

  await RequirementsProject.findOne({user: req.user.sub, 'project': projectId}).exec().then((requirement) => {
    if (requirement){
      /* *** update project *** */
      RequirementsProject.findOneAndUpdate({'project': projectId}, update, {new: true}, (err, requirementProjectUpdated) => {
        if (err) return res.status(500).send({message: 'Error in request'});
    
        if (!requirementProjectUpdated) return res.status(404).send({message: 'Could not update requirementProject data'});
    
        //return res.status(200).send({requirementProject: requirementProjectUpdated});

        //return requirementProjectUpdated;
      });
    }else{
      return res.status(500).send({message: 'Does not have permission to update requirementProject data'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error when update requirements project: ' + err});
  });

  /*
  return res.status(200).send(
    { 
      project: projectPublished,
      requirementsProject: requirementsPublished 
    }
  );
  */

  return res.status(200).send({message: 'Project update successfully'});

}


module.exports = {
    test,
    saveProject,
    getProjectsById,
    deleteProject,
    updateProject
}