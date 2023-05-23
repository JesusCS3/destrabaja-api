
const Message = require('../../../models/user/message/message');
const mongoose = require('mongoose');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from message!'
    });
}

/* *** save message *** */
async function saveMessage (req, res) {
    const params = req.body;

    console.log(params);

    if(!params.emitter || !params.receiver || !params.text 
        || !params.comesFrom || !params.service) 
    return res.status(200).send({message: 'Por favor, rellene todos los campos!'});

    try {
        let message = new Message();
        message.emitter = params.emitter;
        message.receiver = params.receiver;
        message.text = params.text;
        message.filesMessage = params.filesMessage;
        message.comesFrom = params.comesFrom;
        message.viewed = false; 
        message.service = params.service;

        //campos de prueba
        message.purchasedService = params.purchasedService;
        message.project = params.project;
        message.projectStarted = params.projectStarted;

        let messageStored = await message.save();
        
        if(!messageStored) return res.status(200).send({message: 'Error al enviar el mensaje'});

        return res.status(200).send({message: 'El mensaje se envió con éxito!'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al guardar el mensaje: ' + error});
    }
}

/* *** get received messages *** */
function getReceivedMessages (req, res) {
    let userId = req.user.sub;

    let page = 1;

    if (req.params.page){
        page = req.params.page;
    }

    let itemsPerPage = 4;

    Message.find({receiver: userId}).populate('emitter receiver', '_id username').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({message: 'Error in user request'});
        
        if(!messages) return res.status(404).send({message: 'No messages'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

/* *** get chat messages *** */
async function getChatMessages (req, res) {
    console.log(req.params)
    let emitterId = req.params.emitter;
    let receiverId = req.params.receiver;
    let chatId = req.params.chatId;
    
    try {
        let messages = await Message.find({

           $and: [
                {$or: [
                    {service: chatId},
                    {purchasedService: chatId},
                    {project: chatId},
                    {projectStarted: chatId},
                ]},
                //{service: serviceId},
                {$or: [
                    {emitter: emitterId},
                    {receiver: emitterId},
                ]},
                {$or: [
                    {emitter: receiverId},
                    {receiver: receiverId},
                ]},
           ]
        }).sort({updatedAt: 1});

        if(messages.length > 0) {
            let chatMessages = messages.map(message => {
                return {
                    fromSelf: message.emitter.toString() === emitterId,
                    message: message.text,
                    addAt: message.updatedAt,
                };
            });
            //console.log(chatMessages);
            return res.status(200).send(chatMessages);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al devolver el chat: ' + error});
    }

    
}

/* *** get last messages *** */
async function getLastMessages(req, res) {
    console.log(req.params);
    let userId = req.params.id;
    let comesFrom = req.params.comesFrom;

    try {
        const lastMsgs = await Message.aggregate(
            [
                {
                    $match:
                    {
                        $and: [
                            {
                                $or: [
                                    {
                                        emitter: mongoose.Types.ObjectId(userId),
                                    },
                                    {
                                        receiver: mongoose.Types.ObjectId(userId),
                                    },
                                ],
                            },
                            {
                                comesFrom: comesFrom,
                            },
                        ],
                    },
                },
                {
                    $group:
                    {
                        _id: {
                            comesFrom: "$comesFrom",
                            service: "$service",
                            project: "$project",
                            purchasedService: "$purchasedService",
                            projectStarted: "$projectStarted",
                        },
                        messages: {
                            $addToSet: {
                                emitter: "$emitter",
                                receiver: "$receiver",
                                message: "$text",
                                service: "$service",
                                purchasedService: "$purchasedService",
                                project: "$project",
                                projectStarted: "$projectStarted",
                                comesFrom: "$comesFrom",
                                addAt: "$updatedAt",
                            },
                        },
                        lastMessage: {
                            $last: "$updatedAt",
                        },
                    },
                },
                {
                    $addFields:
                    {
                        lastMsg: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$messages",
                                        as: "msgs",
                                        cond: {
                                            $eq: [
                                                "$$msgs.addAt",
                                                "$lastMessage",
                                            ],
                                        },
                                        //limit: 1,
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $project:
                    {
                        _id: 0,
                        lastMsg: 1,
                    },
                },
                {
                    $replaceRoot:
                    {
                        newRoot: "$lastMsg",
                    },
                },
            ]
        );

        console.log(lastMsgs);

        if(lastMsgs.length > 0) {
            let chatMessages = lastMsgs.map(message => {
                return {
                    fromSelf: message.emitter.toString() === userId,
                    emitter: message.emitter,
                    receiver: message.receiver,
                    message: message.message,
                    service: message.service,
                    purchasedService: message.purchasedService,
                    project: message.project,
                    projectStarted: message.projectStarted,
                    comesFrom: message.comesFrom,
                    addAt: message.addAt,
                };
            });
            console.log(chatMessages);
            await Message.populate(chatMessages, (
                {
                    path: 'emitter , receiver',
                    select: '_id username image',
                }
            ));
            return res.status(200).send(chatMessages);
        }      
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al devolver los ultimos mensajes de chat: ' + error});
    }
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
async function unviewedMessages (req, res){
    let userId = req.user.sub;

    try {
        let unviewed = await Message.count({receiver: userId, viewed: false});

        if(!unviewed) return res.status(404).send({message: 'Has visto todos los mensajes!'});

        return res.status(200).send({
            unviewed: unviewed,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al devolver mensajes no vistos: ' + error});
    }
}

/* *** set viewed messages *** */
async function setViewedMessages (req, res) {
    let userId = req.user.sub;

    try {
        let viewed = await Message.updateMany({receiver: userId, viewed: false}, {viewed: true}, {"multi": true});

        if(!viewed) return res.status(404).send({message: 'Has visto todos los mensajes!'});

        return res.status(200).send({
            viewed: viewed,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error en la solicitud: ' + error});
    }
}

module.exports = {
    test,   
    saveMessage,
    getReceivedMessages,
    getChatMessages,
    getLastMessages,
    getSentMessages,
    unviewedMessages,
    setViewedMessages
}