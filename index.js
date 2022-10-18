const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// SET UP
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
dotenv.config(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
    })
);

const port = process.env.PORT || 8000;
const url = "https://nettruyenco.vn/tim-truyen/";
const urlTruyenTranh = "https://nettruyenco.vn/truyen-tranh/";
const urlAnilist = "https://anilist.co/search/manga/popular";

const localUrl = `https://manga-api-e6vn.onrender.com`;
// const localUrl = `http://localhost:${port}`;

function pushData(response, manga, limit, res) {
    const html = response.data;
    const $ = cheerio.load(html);
    $(".item", html).each(function () {
        const name = $(this).find("a").attr("title").split("Truyện tranh ")[1];
        const link = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("data-original");
        const messageMain = $(this).find(".message_main");
        const otherName = messageMain.find("p").eq(0).text().split("Tên khác:")[1];
        const categories = messageMain.find("p").eq(1).text().split("Thể loại:")[1];
        const status = messageMain.find("p").eq(2).text().split("Tình trạng:")[1];
        const view = messageMain.find("p").eq(3).text().split("Lượt xem:")[1];
        const comment = messageMain.find("p").eq(4).text().split("Bình luận:")[1];
        const follow = messageMain.find("p").eq(5).text().split("Theo dõi:")[1];
        const updateDate = messageMain.find("p").eq(6).text().split("Ngày cập nhật:")[1];
        const description = $(this).find(".box_text").text().split("Nội dung")[1];
        const chapter = $(this).find(".chapter").find("a").eq(0).text();
        manga.push({
            name,
            link: localUrl + link.split("https://nettruyenco.vn")[1],
            image,
            otherName,
            categories,
            status,
            view,
            comment,
            follow,
            updateDate,
            description,
            chapter,
            nameAndId: link.split("https://nettruyenco.vn/truyen-tranh/")[1],
        });
    });
    if (limit && limit > 0) {
        res.status(200).json(manga.slice(0, limit));
    } else {
        res.status(200).json(manga);
    }
}

// routes
// get all manga
// ex: http://localhost:8000/v1
// ex: http://localhost:8000/v1?page=1

// get manga by status
// status: hoàn thành(2), đang tiến hành(1), all(-1)
// ex: http://localhost:8000/v1?status=2
// ex: http://localhost:8000/v1?status=2&page=1

// get manga by sort
// sort: (15)Truyện mới, (10)Top all, (11)top tháng, (12)top tuần, (13)top ngày, (30) số chapter
// ex: http://localhost:8000/v1?status=2&sort=30
// ex: http://localhost:8000/v1?status=-1&sort=15&page=1

app.get("/v1", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const status = Number(req.query.status);
    const sort = Number(req.query.sort);
    try {
        if (page && !status && !sort) {
            axios(url + "?page=" + page)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (page && status && !sort) {
            axios(url + "?status=" + status + "&page=" + page)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (!page && status && !sort) {
            axios(url + "?status=" + status)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (!page && !status && !sort) {
            axios(url)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (status && page && sort) {
            axios(url + "?status=" + status + "&sort=" + sort + "&page=" + page)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (status && sort) {
            axios(url + "?status=" + status + "&sort=" + sort)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// get manga by category
// ex: http://localhost:8000/v1/adventure
// ex: http://localhost:8000/v1/adventure?page=1
// ex: http://localhost:8000/v1/action-95?status=1
// ex: http://localhost:8000/v1/action-95?status=1&page=1
// ex: http://localhost:8000/v1/action-95?status=-1&sort=30
// ex: http://localhost:8000/v1/action-95?status=-1&sort=30&page=2
app.get("/v1/:category", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const status = Number(req.query.status);
    const sort = Number(req.query.sort);
    try {
        if (page && !status && !sort) {
            axios(url + req.params.category + "?page=" + page)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (!page && !status && !sort) {
            axios(url + req.params.category)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (page && status && !sort) {
            axios(url + req.params.category + "?status=" + status + "&page=" + page)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (!page && status && !sort) {
            axios(url + req.params.category + "?status=" + status)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (status && page && sort) {
            axios(
                url + req.params.category + "?status=" + status + "&sort=" + sort + "&page=" + page
            )
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else if (status && sort) {
            axios(url + req.params.category + "?status=" + status + "&sort=" + sort)
                .then(function (response) {
                    pushData(response, manga, limit, res);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// get 1 detail manga by click link
app.get("/truyen-tranh/:mangaName", (req, res) => {
    const mangaDetail = [];
    try {
        let url = urlTruyenTranh + req.params.mangaName;
        axios(url)
            .then(function (response) {
                const html = response.data;
                const $ = cheerio.load(html);
                $(".chapter", html).each(function () {
                    const chapterNumber = $(this).find("a").text();
                    const chapterLink = $(this).find("a").attr("href");
                    mangaDetail.push({
                        chapterNumber,
                        link: localUrl + chapterLink.split("https://nettruyenco.vn")[1],
                    });
                });
                res.status(200).json(mangaDetail);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get 1 chapter by click link
app.get("/truyen-tranh/:mangaName/:chapterNumber/:dataId", (req, res) => {
    const chapters = [];
    try {
        let url =
            urlTruyenTranh +
            req.params.mangaName +
            "/" +
            req.params.chapterNumber +
            "/" +
            req.params.dataId;
        axios(url)
            .then(function (response) {
                const html = response.data;
                const $ = cheerio.load(html);
                $(".page-chapter", html).each(function () {
                    const image = $(this).find("img").attr("data-original");
                    if (image !== undefined) {
                        chapters.push({
                            image,
                        });
                    }
                });
                res.status(200).json(chapters);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get v2 popular manga
app.get("/v2", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(urlAnilist)
            .then(function (response) {
                const html = response.data;
                const $ = cheerio.load(html);
                $(".media-card", html).each(function () {
                    const link = $(this).find(".cover").attr("href");
                    const image = $(this).find(".cover .image").attr("src");
                    const title = $(this).find(".title").text();
                    manga.push({
                        link: localUrl + link,
                        image,
                        title,
                    });
                });
                if (limit && limit > 0) {
                    res.status(200).json(manga.slice(0, limit));
                } else {
                    res.status(200).json(manga);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// v2 info
app.get("/manga/:id/:mangaName", (req, res) => {
    const mangaDetail = [];
    try {
        let url = "https://anilist.co/manga/" + req.params.id + "/" + req.params.mangaName;
        axios(url)
            .then(function (response) {
                const html = response.data;
                const $ = cheerio.load(html);
                const banner = $(".banner", html).css("background-image");
                const description = $(".description", html).text();
                mangaDetail.push({
                    banner,
                    description,
                });
                res.status(200).json(mangaDetail);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// v2 chapter

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
