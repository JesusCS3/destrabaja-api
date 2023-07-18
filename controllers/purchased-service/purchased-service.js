const PurchasedService = require('../../models/purchased-service/purchased-service');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from purchased service!'
    });
}

/* *** save purchased service *** */
async function savePurchasedService (req, res) {
    let params = req.body;

    if (!params.service || !params.buyingUser || !params.sellingUser || !params.plan || !params.startDate || !params.deadlineDate) 
    return res.status(200).send({message: 'Por favor, rellene todos los campos!'});

    try {
        let purchasedService = new PurchasedService();

        purchasedService.service = params.service;
        purchasedService.buyingUser = params.buyingUser;
        purchasedService.sellingUser = params.sellingUser;
        purchasedService.plan = params.plan;
        purchasedService.price = params.price;
        purchasedService.deliverables = params.deliverables;
        purchasedService.extras = params.extras;
        purchasedService.startDate = params.startDate;
        purchasedService.deadlineDate = params.deadlineDate;
        purchasedService.dateExtension = params.dateExtension;
        purchasedService.extensionReason = params.extensionReason;
        purchasedService.endDate = params.endDate;
        purchasedService.status = params.status;

        let purchasedServiceStored = await purchasedService.save();
        
        if(!purchasedServiceStored) return res.status(200).send({message: 'Error al guardar el servicio adquirido!'});

        return res.status(200).send({
          purchasedService: purchasedServiceStored,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al guardar el servicio adquirido: ' + error});
    }
}

/* *** get services purchased *** */
async function getPurchasedServices (req, res) {
    //console.log(req.user.sub);
    //console.log(req.params.page);
  let userId = req.user.sub;
  let page = 1;

  if (req.params.page){
    page = req.params.page;
  }

  let itemsPerPage = 6;

    await PurchasedService.find({user: userId}).sort('-createdAt').
    populate('service', {images:1, name:1, user:1, namePlanOne:1, namePlanTwo:1, namePlanThree:1}).
    paginate(page, itemsPerPage, (err, purchased, total) => {
        //console.log(purchased);
        if (err) return res.status(500).send({message: 'Error al regresar servicios adquiridos: ' + err});
        
        if(!purchased) return res.status(200).send({message: 'No hay servicios adquiridos!'});

        return res.status(200).send({
            totalItems: total,
            pages: Math.ceil(total/itemsPerPage),
            page: page,
            itemsPerPage: itemsPerPage,
            purchased
        });
    });
}

/* *** get purchased services by id *** */
async function getPurchasedServicesById (req, res) {
  let serviceId = req.params.id;

  try {
    let servicePublished = await PurchasedService.findById(serviceId).sort('-createdAt').
    populate({
      path: 'service',
      select: 'images name user namePlanOne namePlanTwo namePlanThree deliverables',
      //populate: {
      //  path: 'sellingUser',
      //  select: 'username image',
      //}
    }).
    populate({
      path: 'sellingUser',
      select: 'username image',
    });
    //populate('service', {images:1, name:1, user:1, namePlanOne:1, namePlanTwo:1, namePlanThree:1, deliverables:1}).
    //populate('service.user', {image:1, username:1});

    if(!servicePublished) return res.status(404).send({message: 'El servicio adquirido no existe'});

    return res.status(200).send(
      { 
        service: servicePublished,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'Error al devolver el servicio adquirido: ' + error});
  }
}

/* *** update status service *** */
async function updateStatusServicePurchased (req, res) {
  console.log(req.params);
  let serviceId = req.params.id;
  let statusService = req.body;
  console.log(statusService);
  await PurchasedService.findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
    if (service){
      /* *** update service *** */
      PurchasedService.findByIdAndUpdate(serviceId, {status: statusService.status}, {new: true}, (err, serviceUpdated) => {
        
        if (err) return res.status(500).send({message: 'Error en la solicitud'});
    
        if (!serviceUpdated) return res.status(404).send({message: 'No se ha podido actualizar el estado del servicio'});
    
        return res.status(200).send({service: serviceUpdated});

      });
    }else{
      return res.status(500).send({message: 'No tiene permiso para actualizar el estado del servicio'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error al actualizar el estado del servicio: ' + err});
  });
}

/* *** update dateExtension service *** */
async function updateDateExtension (req, res) {
  console.log(req.params);
  let serviceId = req.params.id;
  let extension = req.body;
  console.log(extension);
  await PurchasedService.findOne({'user': req.user.sub, '_id': serviceId}).exec().then((service) => {
    if (service){
      /* *** update date extension *** */
      PurchasedService.findByIdAndUpdate(serviceId, {dateExtension: extension.dateExtension, extensionReason: extension.extensionReason}, {new: true}, (err, serviceUpdated) => {
        
        if (err) return res.status(500).send({message: 'Error en la solicitud'});
    
        if (!serviceUpdated) return res.status(404).send({message: 'No se ha podido actualizar la extensión de fecha'});
    
        //return res.status(200).send({service: serviceUpdated});

        if(serviceUpdated.dateExtension){
          /* *** update end date *** */
          PurchasedService.findByIdAndUpdate(serviceId, {endDate: serviceUpdated.dateExtension}, {new: true}, (err, serviceUpdated) => {
        
            if (err) return res.status(500).send({message: 'Error en la solicitud'});
        
            if (!serviceUpdated) return res.status(404).send({message: 'No se ha podido actualizar la fecha de finalización'});
        
            return res.status(200).send({service: serviceUpdated});
    
          });
        }


      });
    }else{
      return res.status(500).send({message: 'No tiene permiso para actualizar el estado del servicio'});
    }
  }).catch((err) => {
    return res.status(500).send({message: 'Error al actualizar el estado del servicio: ' + err});
  });
}

module.exports = {
    test,
    savePurchasedService,
    getPurchasedServices,
    getPurchasedServicesById,
    updateStatusServicePurchased,
    updateDateExtension,
}