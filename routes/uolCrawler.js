var express = require('express');
var crawlerRouter = express.Router();
var crawlerSrc = require('../buildSrc/uolCrawler');

var router = () => {

    crawlerRouter.route('/uolCrawler/')
    .get(crawlUrl);

    return crawlerRouter;
}

var crawlUrl = (req,res) => {
    var url = encodeURI(req.query.q);
    console.log("URL: " + url);
    crawlerSrc.callCrawler(url).then((response) => {
        res.send(response);
    })
    .catch((err) => {
        res.send(err);
    })
}


module.exports = router;