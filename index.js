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
const localUrl = `http://localhost:${port}`;

function pushData(response, manga, limit, res) {
    const html = response.data;
    const $ = cheerio.load(html);
    $(".item", html).each(function () {
        const name = $(this).find("a").attr("title");
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
// ex: http://localhost:8000/all/page=1
app.get("/all/page=:pageNumber", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(url + "manga-112?page=" + req.params.pageNumber)
            .then(function (response) {
                pushData(response, manga, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get manga by category
// ex: http://localhost:8000/all/adventure/page=1
app.get("/all/:category/page=:pageNumber", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(url + req.params.category + "?page=" + req.params.pageNumber)
            .then(function (response) {
                pushData(response, manga, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get all manga by status
// status: (-1)tất cả, (2)Hoàn thành, (1)đang tiến hành
// ex: http://localhost:8000/all/status=1&page=1
app.get("/all/status=:status&page=:pageNumber", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(url + "?status=" + req.params.status + "&page=" + req.params.pageNumber)
            .then(function (response) {
                pushData(response, manga, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get manga by category and status
// ex: http://localhost:8000/all/action-95/status=1&page=1
app.get("/all/:category/status=:status&page=:pageNumber", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(
            url +
                req.params.category +
                "?status=" +
                req.params.status +
                "&page=" +
                req.params.pageNumber
        )
            .then(function (response) {
                pushData(response, manga, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get manga by sort
// sort: (15)Truyện mới, (10)Top all, (11)top tháng, (12)top tuần, (13)top ngày, (30) số chapter
// ex: http://localhost:8000/all/status=-1&sort=15&page=1
app.get("/all/status=:status&sort=:sort&page=:pageNumber", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(
            url +
                "?status=" +
                req.params.status +
                "&sort=" +
                req.params.sort +
                "&page=" +
                req.params.pageNumber
        )
            .then(function (response) {
                pushData(response, manga, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get manga by category, status and sort
// ex: http://localhost:8000/all/action-95/status=-1&sort=30&page=1
app.get("/all/:category/status=:status&sort=:sort&page=:pageNumber", (req, res) => {
    const manga = [];
    const limit = Number(req.query.limit);
    try {
        axios(
            url +
                req.params.category +
                "?status=" +
                req.params.status +
                "&sort=" +
                req.params.sort +
                "&page=" +
                req.params.pageNumber
        )
            .then(function (response) {
                pushData(response, manga, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
