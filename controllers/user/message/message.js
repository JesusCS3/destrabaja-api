
const Message = require('../../../models/user/message/message');

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

        let messageStored = await message.save();
        
        if(!messageStored) return res.status(200).send({message: 'Error al enviar el mensaje'});

        return res.status(200).send({message: 'El mensaje se envió con éxito!'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al guardar el mensaje: ' + error});
    }

    /*
    try {
        let message = new Message();
        message.message.text = params.text;
        message.filesMessage = params.filesMessage;
        message.comesFrom = params.comesFrom;
        message.viewed = false; 
        message.users.emitter = params.emitter;
        message.users.receiver = params.receiver;
        message.sender = params.emitter;
        message.service = params.service;

        let messageStored = await message.save();

        if(!messageStored) return res.status(200).send({message: 'Error al enviar el mensaje'});

        return res.status(200).send({message: 'El mensaje se envió con éxito!'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al guardar el mensaje: ' + error});
    }
    */

    /*
    try {
        let message = new Message();
        message.message.text = params.text;
        message.filesMessage = params.filesMessage;
        message.comesFrom = params.comesFrom;
        message.viewed = false; 
        message.users = [params.emitter, params.receiver];
        message.sender = params.emitter;
        message.service = params.service;

        let messageStored = await message.save();

        if(!messageStored) return res.status(200).send({message: 'Error al enviar el mensaje'});

        return res.status(200).send({message: 'El mensaje se envió con éxito!'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al guardar el mensaje: ' + error});
    }
    */

    /*
    const params = req.body;

    if (!params.text || !params.receiver || !params.comesFrom) return res.status(200).send({message: 'Please fill all the fields!'});

    let message = new Message();
    message.emitter = params.emitter;
    message.receiver = params.receiver;
    message.text = params.text;
    message.filesMessage = params.filesMessage;
    message.comesFrom = params.comesFrom;
    message.viewed = false;

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({message: 'Error in user request'});

        if(!messageStored) return res.status(200).send({message: 'Error to send message'});

        return res.status(200).send({messageSent: messageStored});
    });
    */
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
    console.log(req.params);
    let emitterId = req.params.emitter;
    let receiverId = req.params.receiver;
    let serviceId = req.params.service;
    
    try {
        let messages = await Message.find({
            /*
            $or: [
                {emitter: emitterId},
                {receiver: emitterId},
            ],
            */
            
           /*
           $or: [
                {emitter: emitterId, receiver: receiverId},
                {emitter: receiverId, receiver: emitterId},
           ],
           */

           $and: [
                {service: serviceId},
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

        console.log(messages);
        console.log(messages.length);

        if(messages.length > 0) {
            let chatMessages = messages.map(message => {
                return {
                    fromSelf: message.emitter.toString() === emitterId,
                    message: message.text,
                };
            });
            console.log(chatMessages);
            return res.status(200).send(chatMessages);
        }

        /*
        let messages = await Message.find({
            users: {
                $all: [emitter, receiver],
            }
        }).sort({updatedAt: 1});

        console.log(messages);

        let chatMessages = messages.map(message => {
            return {
                fromSelf: message.sender.toString() === emitter,
                message: message.message.text,
            };
        });
        console.log(chatMessages);
        return res.status(200).send(chatMessages);
        */

        /*
        let chatMsgs = await Message.find({emitter: userId, receiver: receiverId}).populate('emitter receiver', '_id username');

        let chatMsgsRe = await Message.find({emitter: receiverId, receiver: userId}).populate('emitter receiver', '_id username');
        
        if(!chatMsgs) return res.status(404).send({message: 'El chat no existe'});

        return res.status(200).send(
          { 
            chatMessages: chatMsgs,
            chatMessagesRe: chatMsgsRe,
          }
        );
        */
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error al devolver el chat: ' + error});
    }

    
}

/* */ 
async function getLastMessages(req, res) {
    console.log(req.params);

    let userId = req.params.id;
    let comesFrom = req.params.comesFrom;

    //await getChatMsgs(userId, comesFrom);

    const lastChatMessages = await Message.aggregate(
        [
            {
              $match:
                /**
                 * query: The query in MQL.
                 */
                {
                  $and: [
                    {
                      comesFrom: comesFrom,
                    },
                    {
                      $or: [
                        {
                          $and: [
                            {
                              emitter: userId,
                            },
                          ],
                        },
                        {
                          $and: [
                            {
                              receiver: userId,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
            },
            {
              $addFields:
                /**
                 * newField: The new field name.
                 * expression: The new field expression.
                 */
                {
                  fromTo: {
                    $cond: {
                      if: {
                        $lt: ["$emitter", "$receiver"],
                      },
                      then: ["$emitter", "$receiver"],
                      else: ["$receiver", "$emitter"],
                    },
                  },
                },
            },
            {
              $group:
                /**
                 * _id: The id of the group.
                 * fieldN: The first field name.
                 */
                {
                  _id: "$fromTo",
                  messages: {
                    $addToSet: {
                      message: "$text",
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
                /**
                 * newField: The new field name.
                 * expression: The new field expression.
                 */
                {
                  lastFilteredMessage: {
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
        ]
    );

    return res.status(200).json({
        data: {
            lastChatMessages
        }
    });
}

async function getChatMsgs (userId, comesFrom){
    const pipeline = [
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              $and: [
                {
                  comesFrom: comesFrom,
                },
                {
                  $or: [
                    {
                      $and: [
                        {
                          emitter: userId,
                        },
                      ],
                    },
                    {
                      $and: [
                        {
                          receiver: userId,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              fromTo: {
                $cond: {
                  if: {
                    $lt: ["$emitter", "$receiver"],
                  },
                  then: ["$emitter", "$receiver"],
                  else: ["$receiver", "$emitter"],
                },
              },
            },
        },
        {
          $group:
            /**
             * _id: The id of the group.
             * fieldN: The first field name.
             */
            {
              _id: "$fromTo",
              messages: {
                $addToSet: {
                  message: "$text",
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
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              lastFilteredMessage: {
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
    ];

    let lastChatMessages = await Message.aggregate(pipeline);
    console.log(lastChatMessages);
    await lastChatMessages.forEach(message => {
        console.log(`${message}`);
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
    getChatMessages,
    getLastMessages,
    getSentMessages,
    unviewedMessages,
    setViewedMessages
}