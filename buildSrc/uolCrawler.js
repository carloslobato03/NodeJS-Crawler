var Crawler = require('crawler');
var fs = require('fs');
const getUrlsToCrawl = (query) => {
    var json = {};
    var outterArray = [];
    var urls = ["https://busca.uol.com.br/result.html?term=" + query + "&page=1"]
    return new Promise((resolve, reject) => {
        console.log("Entrou");
        var c = new Crawler({
            maxConnections: 10,
            // This will be called for each crawled page
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    var $ = res.$;
                    var reqUrls = ($("article > h1 > a").toArray());
                    console.log("Req Urls: "+reqUrls);
                    resolve(query);
                }
                done();
            }
        });
        c.queue(urls);
    })
}

const getInsideNews = (urls) => {
    var contentArray = [];
    return new Promise((resolve, reject) => {
        var c = new Crawler({
            maxConnections: 10,
            // This will be called for each crawled page
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    var $ = res.$;
                    var texts = ($('#content_01_body p').text());
                    var dateJq = ($('.geral-noticiasLeftData').toArray());
                    var title = ($('.content_01_title').text());
                    var dateFull = dateJq[0].children[0].data;
                    dateFull = dateFull.split("\t");
                    var date = dateFull[8];
                    date = date.split(" ");

                    var json = {
                        "title": title,
                        "content": texts,
                        "date": date[0],
                        "source": "almg"
                    }
                    // ** Save News into TXT ** 
                    // fs.writeFile("./exemplo/" + contentArray.length + "Content.json", JSON.stringify(json), function (err) {
                    //     if (err) {
                    //         return console.log(err);
                    //     }
                    // });
                    // ** End of Creating Files to News Content **
                    contentArray.push(json);
                    if (contentArray.length == urls.length) {
                        resolve(contentArray);
                    }
                }

                done();
            }
        });
        c.queue(urls);
    })
}

const callCrawler = (query) => {
    return new Promise((resolve, reject) => {
        getUrlsToCrawl(query).then((response) => {
            // getInsideNews(response).then((responseInside) => {
                resolve(response);
            // })
        })
    })
}

callCrawler();

module.exports = {
    callCrawler
}