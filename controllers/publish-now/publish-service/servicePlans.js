const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const ServicePlans = require('../../../models/publish-now/publish-service/servicePlans');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from service plans!'
    });
}

/* *** save service plans *** */
function saveServicePlans (req, res) {
  let params = req.body;
  let servicePlans = new ServicePlans();                                         

  if (params.namePlanOne && params.deliveryTimePlanOne && params.pricePlanOne && params.clientPricePlanOne){
    servicePlans.namePlanOne = params.namePlanOne;
    servicePlans.deliveryTimePlanOne = params.deliveryTimePlanOne;
    servicePlans.commentPlanOne = params.commentPlanOne;
    servicePlans.pricePlanOne = params.pricePlanOne;
    servicePlans.clientPricePlanOne = params.clientPricePlanOne;
    servicePlans.namePlanTwo = params.namePlanTwo;
    servicePlans.deliveryTimePlanTwo = params.deliveryTimePlanTwo;
    servicePlans.commentPlanTwo = params.commentPlanTwo;
    servicePlans.pricePlanTwo = params.pricePlanTwo;
    servicePlans.clientPricePlanTwo = params.clientPricePlanTwo;
    servicePlans.namePlanThree = params.namePlanThree;
    servicePlans.deliveryTimePlanThree = params.deliveryTimePlanThree;
    servicePlans.commentPlanThree = params.commentPlanThree;
    servicePlans.pricePlanThree = params.pricePlanThree;
    servicePlans.clientPricePlanThree = params.clientPricePlanThree;
    servicePlans.createdAt = moment().unix();
    servicePlans.service = req.service.sub;

    servicePlans.save((err, servicePlansStored) => {
      if (err) return res.status(500).send({message: 'Error saving service plans'});

      if (!servicePlansStored) return res.status(404).send({message: 'Service plans has not been stored'});

      return res.status(200).send({servicePlans: servicePlansStored});
    });
  }else{
    return res.status(200).send({
      message: 'Please fill all the fields required!'
    }); 
  }
}

module.exports = {
    test,
    saveServicePlans
}