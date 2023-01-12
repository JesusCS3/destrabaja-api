//const fs = require('fs');
//const path = require('path');
const mongoosePagination = require('mongoose-pagination');

const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from follow test!'
    });
}

/* *** save follow *** */
function saveFollow (req, res) {
    let params = req.body;
    let follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Error when saving follow'});

        if (!followStored) return res.status(404).send({ message: 'Follow has not been saved'});

        return res.status(200).send({follow: followStored});
    });
}

/* *** delete follow *** */
function deleteFollow (req, res) {
    let userId = req.user.sub;
    let followId = req.params.id;

    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        if (err) return res.status(500).send({ message: 'Error when quitting follow'});

        return res.status(200).send({message: 'Follow has been removed'});
    });
}

/* *** get following users *** */
function getFollowingUsers (req, res) {
    let userId = req.user.sub;
    
    if (req.params.id){
        userId = req.params.id;
    }

    let page = 1;

    if (req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    let itemsPerPage = 4;

    Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Server error'});

        if (!follows) return res.status(404).send({ message: 'You are not following any user'});

        return res.status(200).send({
            total:total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

/* *** get followed users *** */
function getFollowedUsers (req, res) {
    let userId = req.user.sub;
    
    if (req.params.id){
        userId = req.params.id;
    }

    let page = 1;

    if (req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    let itemsPerPage = 4;

    Follow.find({followed: userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Server error'});

        if (!follows) return res.status(404).send({ message: 'No user follows you'});

        return res.status(200).send({
            total:total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

/* *** get user list *** */
function getMyFollows (req, res) {
    let userId = req.user.sub;
    
    let find = Follow.find({user: userId});

    if (req.params.followed){
        find = Follow.find({followed: userId});
    }

    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Server error'});

        if (!follows) return res.status(404).send({ message: 'You are not following any user'});

        return res.status(200).send({follows});
    });
}

module.exports = {
    test,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}
  