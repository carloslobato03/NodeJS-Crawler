var express = require('express');
var crawlerRouter = express.Router();
var crawlerSrc = require('../buildSrc/crawler');

var router = () => {

    crawlerRouter.route('/crawlerUrl/')
    .get(crawlUrl);


    return crawlerRouter;
}

var crawlUrl = (req,res) => {
    var url = encodeURI(req.query.q);
    var offset = encodeURI(req.query.offset);
    crawlerSrc.callFunctions(url,offset).then((response) => {
        res.send(response);
    })
    .catch((err) => {
        res.send(err);
    })
}


module.exports = router;