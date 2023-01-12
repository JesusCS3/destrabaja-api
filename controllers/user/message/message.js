const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Message = require('../../../models/user/message/message');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');
const message = require('../../../models/user/message/message');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from message!'
    });
}

/* *** save message *** */
function saveMessage (req, res) {
    const params = req.body;

    if (!params.text || !params.receiver) return res.status(200).send({message: 'Please fill all the fields!'});

    let message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.createdAt = moment().unix();
    message.viewed = false;

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({message: 'Error in user request'});

        if(!messageStored) return res.status(200).send({message: 'Error to send message'});

        return res.status(200).send({message: messageStored});
    });
}

/* *** get received messages *** */
function getReceivedMessages (req, res) {
    let userId = req.user.sub;

    let page = 1;

    if (req.params.page){
        page = req.params.page;
    }

    let itemsPerPage = 4;

    Message.find({receiver: userId}).populate('emitter', '_id username').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({message: 'Error in user request'});
        
        if(!messages) return res.status(404).send({message: 'No messages'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

/* *** get emit messages *** */
function getSentMessages (req, res) {
    let userId = req.user.sub;

    let page = 1;

    if (req.params.page){
        page = req.params.page;
    }

    let itemsPerPage = 4;

    Message.find({emitter: userId}).populate('emitter receiver', '_id username').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({message: 'Error in user request'});
        
        if(!messages) return res.status(404).send({message: 'No messages'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

/* *** unviewed messages *** */
function unviewedMessages (req, res){
    let userId = req.user.sub;

    Message.count({receiver: userId, viewed: false}).exec((err, count) => {
        if (err) return res.status(500).send({message: 'Error in user request'});

        return res.status(200).send({
            'unviewed': count
        });
    });
}

/* *** set viewed messages *** */
function setViewedMessages (req, res) {
    let userId = req.user.sub;

    Message.update({receiver: userId, viewed: false}, {viewed: true}, {"multi": true}, (err, messagesUpdated) => {
        if (err) return res.status(500).send({message: 'Error in user request'});

        return res.status(200).send({
            messages: messagesUpdated
        });
    });
}

module.exports = {
    test,   
    saveMessage,
    getReceivedMessages,
    getSentMessages,
    unviewedMessages,
    setViewedMessages
}