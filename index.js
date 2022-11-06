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
const urlTruyenTranhLh = "https://truyentranhlh.net/tim-kiem";

const localUrl = `https://manga-api-4cze.onrender.com`;
// const localUrl = `http://localhost:${port}`;

// ===================NETTRUYENCO===================== //
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
                url +
                    req.params.category +
                    "?status=" +
                    status +
                    "&sort=" +
                    sort +
                    "&page=" +
                    page
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
                    const image = $(this).find("img").attr("src");
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
// ===================NETTRUYENCO===================== //

// ===================TRUYENTRANHLH===================== //

function pushDataTruyenTranhLh(response, mangaList, limit, res) {
    const html = response.data;
    const $ = cheerio.load(html);

    $(".thumb-item-flow", html).each(function () {
        const link = $(this).find(".thumb-wrapper > a").attr("href");
        const name = $(this).find(".series-title > a").attr("title");
        const image = $(this).find(".img-in-ratio").attr("data-bg");
        const lastChapter = $(this).find(".thumb_attr").attr("title");
        mangaList.push({
            link:
                localUrl +
                "/v3" +
                link.split("https://truyentranhlh.net/truyen-tranh")[1],
            name,
            image,
            lastChapter,
        });
    });

    if (limit && limit > 0) {
        return res.status(200).json(mangaList.slice(0, limit));
    } else {
        return res.status(200).json(mangaList);
    }
}

// get v3 truyen-tranh-lh
app.get("/v3", (req, res) => {
    const mangaList = [];
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const status = Number(req.query.status);
    const sort = req.query.sort;
    const artist = req.query.artist;
    const q = req.query.q;
    const accept_genres = req.query.accept_genres;
    const reject_genres = req.query.reject_genres;

    if (page && sort) {
        const url = urlTruyenTranhLh + "?sort=" + sort + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (page && status && sort) {
        const url =
            urlTruyenTranhLh + "?status=" + status + "&sort=" + sort + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (artist && page) {
        const url = urlTruyenTranhLh + "?artist=" + artist + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (artist && page && status && sort) {
        const url =
            urlTruyenTranhLh +
            "?artist=" +
            artist +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (artist && page && status) {
        const url =
            urlTruyenTranhLh +
            "?artist=" +
            artist +
            "&status=" +
            status +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (artist && page && sort) {
        const url =
            urlTruyenTranhLh + "?artist=" + artist + "&sort=" + sort + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page) {
        const url = urlTruyenTranhLh + "?q=" + q + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page && status && sort) {
        const url =
            urlTruyenTranhLh +
            "?q=" +
            q +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page && status) {
        const url = urlTruyenTranhLh + "?q=" + q + "&status=" + status + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page && sort) {
        const url = urlTruyenTranhLh + "?q=" + q + "&sort=" + sort + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page && status && sort) {
        const url =
            urlTruyenTranhLh +
            "?q=" +
            q +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page && artist) {
        const url = urlTruyenTranhLh + "?q=" + q + "&artist=" + artist + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (q && page && artist && status && sort) {
        const url =
            urlTruyenTranhLh +
            "?q=" +
            q +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && page) {
        const url =
            urlTruyenTranhLh + "?accept_genres=" + accept_genres + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && page && status) {
        const url =
            urlTruyenTranhLh +
            "?accept_genres=" +
            accept_genres +
            "&status=" +
            status +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && page && status && sort) {
        const url =
            urlTruyenTranhLh +
            "?accept_genres=" +
            accept_genres +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && page && sort) {
        const url =
            urlTruyenTranhLh +
            "?accept_genres=" +
            accept_genres +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && artist && page) {
        const url =
            urlTruyenTranhLh +
            "?accept_genres=" +
            accept_genres +
            "&artist=" +
            artist +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && artist && status && page) {
        const url =
            urlTruyenTranhLh +
            "?accept_genres=" +
            accept_genres +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (accept_genres && artist && status && sort && page) {
        const url =
            urlTruyenTranhLh +
            "?accept_genres=" +
            accept_genres +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && page) {
        const url =
            urlTruyenTranhLh + "?reject_genres=" + reject_genres + "&page=" + page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && page && status) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&status=" +
            status +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && page && status && sort) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && page && sort) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && artist && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&artist=" +
            artist +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && artist && status && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && artist && status && sort && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && accept_genres && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&accept_genres=" +
            accept_genres +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && accept_genres && status && page) {
    } else if (reject_genres && accept_genres && status && sort && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&accept_genres=" +
            accept_genres +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && accept_genres && artist && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&accept_genres=" +
            accept_genres +
            "&artist=" +
            artist +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && accept_genres && artist && status && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&accept_genres=" +
            accept_genres +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && accept_genres && artist && status && sort && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&accept_genres=" +
            accept_genres +
            "&artist=" +
            artist +
            "&status=" +
            status +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (reject_genres && accept_genres && sort && page) {
        const url =
            urlTruyenTranhLh +
            "?reject_genres=" +
            reject_genres +
            "&accept_genres=" +
            accept_genres +
            "&sort=" +
            sort +
            "&page=" +
            page;
        axios(url)
            .then(function (response) {
                pushDataTruyenTranhLh(response, mangaList, limit, res);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
});

// get v3 detail manga
app.get("/v3/:mangaName", (req, res) => {
    const mangaDetail = {};
    try {
        let url = "https://truyentranhlh.net/truyen-tranh/" + req.params.mangaName;
        axios(url)
            .then(function (response) {
                const html = response.data;
                const $ = cheerio.load(html);

                $(".series-information", html).each(function () {
                    const infoItem = $(this).find(".info-item");
                    const otherName = infoItem.eq(0).find(".info-value").text().trim();
                    const genres = infoItem
                        .eq(1)
                        .find(".info-value > a > span")
                        .text()
                        .trim();
                    const authorName = infoItem
                        .eq(2)
                        .find(".info-value > a")
                        .text()
                        .trim();
                    const authorLink = infoItem
                        .eq(2)
                        .find(".info-value > a")
                        .attr("href");
                    const status = infoItem.eq(3).find(".info-value > a").text().trim();

                    mangaDetail.otherName = otherName;
                    mangaDetail.genres = genres;
                    mangaDetail.authorLink = authorLink;
                    mangaDetail.authorName = authorName;
                    mangaDetail.status = status;
                });

                $(".statistic-list", html).each(function () {
                    const statisticItem = $(this).find(".statistic-item");
                    const timeUpdate = statisticItem
                        .eq(0)
                        .find(".statistic-value")
                        .text()
                        .trim();
                    const view = statisticItem
                        .eq(2)
                        .find(".statistic-value")
                        .text()
                        .trim();

                    mangaDetail.timeUpdate = timeUpdate;
                    mangaDetail.view = view;
                });

                $(".side-features", html).each(function () {
                    const featureItem = $(this).find(".feature-item");
                    const like = featureItem.eq(0).find(".feature-name").text();
                    const dislike = featureItem.eq(1).find(".feature-name").text();
                    const follow = featureItem.eq(2).find(".feature-name").text();

                    mangaDetail.like = like;
                    mangaDetail.dislike = dislike;
                    mangaDetail.follow = follow;
                });

                $(".summary-wrapper", html).each(function () {
                    const seriesSummary = $(this).find(".series-summary");
                    const description = seriesSummary
                        .eq(0)
                        .find(".summary-content > p")
                        .text()
                        .trim();
                    mangaDetail.description = description;
                });

                const listChapters = [];
                $(".list-chapters a", html).each(function () {
                    const link = $(this).attr("href");
                    const chap = $(this).attr("title");
                    listChapters.push({
                        link:
                            localUrl +
                            "/v3" +
                            link.split("https://truyentranhlh.net/truyen-tranh")[1],
                        chap,
                    });
                    mangaDetail.listChapters = listChapters;
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

// get manga reader
app.get("/v3/:mangaName/:chapterNumber", (req, res) => {
    const chapters = [];
    let urlReader =
        "https://truyentranhlh.net/truyen-tranh/" +
        req.params.mangaName +
        "/" +
        req.params.chapterNumber;

    try {
        axios(urlReader)
            .then(function (response) {
                const html = response.data;
                const $ = cheerio.load(html);

                $("#chapter-content", html).each(function () {
                    const imgElement = $(this).find("img");
                    imgElement.each(function () {
                        const img = $(this).attr("data-src");
                        chapters.push({
                            img,
                        });
                    });
                });

                res.status(200).json(chapters);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        error.status(500).json(error);
    }
});
// ===================TRUYENTRANHLH===================== //

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
