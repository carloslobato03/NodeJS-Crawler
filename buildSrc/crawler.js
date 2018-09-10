var Crawler = require('crawler');
var fs = require('fs');

const crawlerSearchPage = (url,i) => {
    var urlToCall = "https://www.wired.com/search/?q=" + url+"&page="+i+"&sort=publishDate_tdt desc";
    var newJson = [];
    return new Promise((resolve, reject) => {
        var c = new Crawler({
            maxConnections: 10,
            // This will be called for each crawled page
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    var $ = res.$;
                    ($(".archive-item-component__info > a").each(function(index){
                        newJson.push($( this ).attr("href") );
                    }))
                    resolve(newJson);
                }
                done();
            }
        });
        c.queue(urlToCall);
    })
}

const crawlerInsideNews = (url) => {
    var insideTexts = [];
    return new Promise((resolve, reject) => {
        crawlerNews(url).then((response) => {
            crawlerNewsPage2(2, url).then((response2) => {
                crawlerNewsPage2(3, url).then((response3) => {
                    crawlerNewsPage2(4, url).then((response4) => {

                        for (var it in response2) {
                            response.push(response2[it]);
                        }
                        for (var i3 in response3) {
                            response.push(response3[i3]);
                        }
                        for(var i4 in response4) {
                            response.push(response4[i4]);
                        }
                        var responseController = response;
                        return new Promise((resolveInside, rejectInside) => {
                            var c = new Crawler({
                                maxConnections: 10,
                                // This will be called for each crawled page
                                callback: function (error, res, done) {
                                    if (error) {
                                        console.log("Deu erro aqui" + error);
                                    } else {
                                        var $ = res.$;
                                        jqueryContent = ($('.texto-artigo p').text());
                                        jqueryTitle = ($('.twelve.columns.titleNews').text());
                                        jqueryPublishedDate = ($('.published-date').text());
                                        jqueryContent += ($('.six.columns.list-note.left').text());
                                        jqueryContent += ($('.six.columns.list-note.right').text());
                                        jqueryPublishedDate = jqueryPublishedDate.split(" ")
                                        var splittedDate = jqueryPublishedDate[3];
                                        var insideNewsDesc = {
                                            "content": jqueryContent,
                                            "title": jqueryTitle,
                                            "publishedDate": splittedDate,
                                            "src": "website"
                                        };
                                        if (insideNewsDesc.content == "") {
                                            responseController.pop();
                                        } else {

                                            insideTexts.push(insideNewsDesc);
                                            responseController.pop();

                                            // ** Save News into TXT ** 
                                            // fs.writeFile("./exemplo/" + responseController.length + "Content.txt", insideNewsDesc.content, function (err) {
                                            //     if (err) {
                                            //         return console.log(err);
                                            //     }
                                            // });
                                            // ** End of Creating Files to News Content **

                                        }
                                    }
                                    if (responseController.length == 0) {
                                        resolve(insideTexts);
                                    }
                                    done();
                                }
                            });
                            c.queue(response);
                        })

                    })
                })
            })

        })
    })

}

const callUrl = (url,offset) => {
    var i = offset;
    // var url = "https://www.wired.com/search/?q=" + url+"&page="+i+"&sort=publishDate_tdt desc";
    var urls = [];
    return new Promise((resolve,reject) => {
        crawlerSearchPage(url,i).then((response) => {
            i++;
            for(var i1 in response){
                urls.push(response[i1]);
            }
            crawlerSearchPage(url,i).then((response2) => {
                i++;
                for(var i2 in response2) {
                    urls.push(response2[i2]);
                }
                crawlerSearchPage(url,i).then((response3) => {
                    for(var i3 in response3){
                        urls.push(response3[i3]);
                    }
                    resolve(urls);
                })
            })
        })
    })
}

const callFunctions = (url,offset) => {
    return new Promise((resolve,reject) => {
        callUrl(url,offset).then((response) => {
            callNews(response).then((responseNews) => {
                console.log("Response News: " + responseNews);
                resolve(responseNews);
            })
        })
    })
}
const callNews = (urls) => {
    var urlsToCall = [];
    for(var key in urls) {
        var url = "https://www.wired.com";
        url += urls[key];
        urlsToCall.push(url);
    }
    console.log("Urls:" + urlsToCall)
    var newsArray = [];
    return new Promise((resolve, reject) => {
        var c = new Crawler({
            maxConnections: 10,
            // This will be called for each crawled page
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    var $ = res.$;
                    var news = ($("article > div > p")).text()
                    var data = ($(".date-mdy")).text();
                    // console.log("Data: "+(data.substring(0,8)));
                    json = {
                        "news-body": news,
                        "date": data.substring(0,8)
                    }
                    newsArray.push(json);
                    // console.log("JSON: " + JSON.stringify(json));
                    if(newsArray.length == urls.length){
                        resolve(newsArray);
                    }
                }
                done();
            }
        });
        c.queue(urlsToCall);
    })
}
module.exports = {
    crawlerSearchPage,
    callUrl,
    callFunctions
}