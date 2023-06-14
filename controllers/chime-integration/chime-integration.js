'use strict';
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from chime-integration!'
    });
}

async function createVideoCall(req, res){
    let item = req.body;
    console.log(item);

    try {
        // You must use "us-east-1" as the region for Chime API and set the endpoint.
        const chime = new AWS.Chime({ region: 'us-east-1' });
        chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

        const meetingResponse = await chime
        .createMeeting({
            ClientRequestToken: uuid(),
            MediaRegion: 'us-west-2', // Specify the region in which to create the meeting.
        })
        .promise();

        const attendeeResponse = await chime
        .createAttendee({
            MeetingId: meetingResponse.Meeting.MeetingId,
            ExternalUserId: uuid(), // Link the attendee to an identity managed by your application.
        })
        .promise();

        // Respond with these infos so the frontend can safely use it
        return res.status(200).send({
            attendeeResponse,
            meetingResponse,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error: ' + error});
    }
    
}

module.exports = {
    test,
    createVideoCall,
}