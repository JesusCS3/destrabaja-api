'use strict';
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from chime-integration!'
    });
}

/* *** create meeting *** */
async function createVideoCall(req, res){
    let meetingData = req.body;
    console.log(meetingData);

    // You must use "us-east-1" as the region for Chime API and set the endpoint.
    const chime = new AWS.Chime({ region: 'us-east-1' });
    chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

    try {
         /*new meeting */
        if ((meetingData.meetingId === "") || (meetingData.meetingId === null) || 
            (meetingData.meetingId === undefined)) {
            
            const meetingResponse = await chime
            .createMeeting({
                ClientRequestToken: uuid(),
                MediaRegion: 'us-west-2', // Specify the region in which to create the meeting.
            })
            .promise();
        }

        if(meetingData.meetingId){
            /* Join existing meeting */
        
            // Fetch meeting details
            try {
                let meetingId = meetingData.meetingId;
                const meetingResponse = await chime
                .getMeeting({
                    MeetingId: meetingId,
                })
                .promise();
            } catch (error) {
                console.log(error);
                return res.status(500).send({message: 'Error: ' + error});
            }
        }

        /* add atteende to new or existing meeting */
        const attendeeResponse = await chime
        .createAttendee({
            MeetingId: meetingResponse.Meeting.MeetingId,
            ExternalUserId: meetingData.username,
            //ExternalUserId: uuid(), // Link the attendee to an identity managed by your application.
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

/* *** delete meeting *** */
async function deleteVideoCall(req,res){
    let meetingData = req.body;
    console.log(meetingData);

    try {
        // Delete the meeting
        const deleteRequest = await chime
        .deleteMeeting({
            MeetingId: meetingData.meetingId,
        }).promise();

        return res.status(200).send({
            deleteRequest,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error: ' + error});
    }
}

/* *** delete attendee *** */
async function deleteAttendee(req,res){
    let meetingData = req.body;
    console.log(meetingData);

    try {
        // Delete attendee from the meeting
        const deleteRequest = await chime
        .deleteAttendee({
            MeetingId: meetingData.meetingId,
            AttendeeId: meetingData.attendeeId
        }).promise();

        return res.status(200).send({
            deleteRequest,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error: ' + error});
    }
}

module.exports = {
    test,
    createVideoCall,
    deleteVideoCall,
    deleteAttendee,
}