const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const rp = require("request-promise");
const hbshelpers = require("handlebars-helpers");
const app = express();
const port = process.env.PORT || 5000;
const multihelpers = hbshelpers();
const path = require('path');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine("hbs", exphbs.engine({extname: ".hbs", helpers: multihelpers}));
app.set("view engine", "hbs");
app.set('views', path.join(__dirname, "./views"));

// Function - Get host name
function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === "string" && match[2].length > 0) {
        var hostname = match[2].split(".");
        return hostname[0];
    } else {
        return null;
    }
}

// var request = require("request");

// request({url: "https://s.lazada.co.th/s.Si1pp", followRedirect: false}, function(error, response, body) {
//     console.log(response.statusCode);
//     if (response.statusCode >= 300 && response.statusCode < 400) {
//         console.log(response.headers.location);
//     }
// });


// Function - Check url
function CheckURL(url) { // Check is valid URL
    const isValidUrl = (urlString) => {
        var urlPattern = new RegExp("^(https?:\\/\\/)?" + // validate protocol
                "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
                "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
                "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
                "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
                "(\\#[-a-z\\d_]*)?$", "i"); // validate fragment locator
        return !! urlPattern.test(urlString);
    };

    // Remove string is not url
    const domain = url.match(/\bhttps?:\/\/\S+/gi);

    // Check
    if (isValidUrl(domain) === true) {
        if (getHostName(url) == "lazada") {
            return true;
        } else if (getHostName(url) == "s") {
            rp(url).then(function (html) {
              const $ = cheerio.load(url);
              const logo = $("head > meta:nth-child(8)", html).text();
              console.log(logo);
              return true;
            }).catch(function (err) {
                console.log(err);
                return false;
                
            });
        } else {
            console.log("Not lazada");
            return false;
        }
    } else {
        console.log("Url is invalid");
        return false;
    }
}

// // Router ////

// Home - index
app.get("", (req, res) => {
    res.render("home");
});

// Verify - post data
app.post("/verify", (req, res) => {
    const url = req.body.url;

    if (CheckURL(url) === true) {

        options = {
            jar: true
        }

        rp(url, options).then(function (html) {
            const $ = cheerio.load(url);

            const p_name = $("#module_product_title_1 > div > div > h1", html).text();
            const p_img = $("#module_item_gallery_1 > div > div.gallery-preview-panel > div > img.pdp-mod-common-image.gallery-preview-panel__image", html).attr("src");
            const p_brand = $("#module_product_brand_1 > div > a.pdp-link.pdp-link_size_s.pdp-link_theme_blue.pdp-product-brand__brand-link", html).text();
            const p_model = $("#module_product_detail > div > div > div > div.pdp-mod-specification > div.pdp-general-features > ul > li:nth-child(2) > div", html).text();
            const p_warantee = $("#module_seller_warranty > div > div.warranty__options > div:nth-child(2) > div > div > div > div", html).text();
            const p_store = $("#module_seller_info > div > div.seller-name-retail > div.seller-name__wrapper > div.seller-name__detail > a.pdp-link.pdp-link_size_l.pdp-link_theme_black.seller-name__detail-name", html).text();
            const p_store_link = $("#module_seller_info > div > div.seller-name-retail > div.seller-name__wrapper > div.seller-name__detail > a", html).attr("href");
            const p_near = $("#module_product_brand_1 > div > a.pdp-link.pdp-link_size_s.pdp-link_theme_blue.pdp-product-brand__suggestion-link", html).attr("href");

            const star_none = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURf/XAPakAPalAPenAPakAPalAPenAEdwTP+vAP69APalAPivAPemAPmrAP+1APelAPakAPalAPmvAPioAPajAHElIkoAAAAUdFJOUxr0zm3rwngADSm3TZRFBqfggTda/y+eEwAAAPRJREFUKM+N09mShCAMBdCwNjuC9/+/dQDLaaCnrcmDVeSQCIL0egxah0Y8smbmgY1EeWANLs1XNlJF6K8s4Mkt5TMnqYjWctqKaS2f2BytmMjP5Z2TjSK4A6OYSIHxXM5qBpeWR88EMZSqDmrkJLf0MgrOW9qjCoazN28uPpQsbzre/Zdfeq08OehdmX9vbPdb732nPHvTuH6WxPLEv8d6s0GZmsuwccU5sVIbC9Sr73hmtnFgPX1yFvoEDVpZ8XZWCkdGn+CxrVzm6CBFetkMWex9qHcTHJD6ugfVtUFeOIKV9yWJCnxhEdYb7VdO//vH9vgB7woXsbjqY50AAAAASUVORK5CYII=";
            const star_half = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABgUExURUdwTP/FAPirAPivAP61APemAPakAP+xAPeoAPWkAPalAPakAPutAPelAPalAPelAPakAPiqAPeqAPakAPelAPisAPajAPiwAPi2APakAP/dAP/OAP/WAPm0AP3GAPvBAOnWcZMAAAAZdFJOUwAHNO0WfPUNcOu9yCVAz0+1qZ7hYPyQ2cHaE99YAAAA/ElEQVQoz52S2XKFIBBER0QExN27dFDv//9lAFMGtLQqmQegOTQMA0R/iVLe4kKUd2aF4gZLNOranqmO3dglGHWX9kxpomu7RO3aK3s5at+d7BmTw/slEMzODtH0xcR4UO8HfCzLx26rjXx2o59SlSHiOZb5K0S8o2kFJj9yfD1hKvVGIx7TCu0+/uExFW2kcnzmed41b2LqMgl8X92I+nB3l/6O+amwJnaTGk71Xq3dla4OuIcNeHuOpzjgV8B1JZ6+1BN4ivOHtavG2EMUJdVoU4xlXaBkRqZ3HUf6oZl/oWE7mLlNRJp6Aejf4+oKTZp4YxLdpjfL6F/xDSgjESzpN0O9AAAAAElFTkSuQmCC";
            const star_half_plus = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABUUExURUdwTPepAP2yAPitAPemAPeqAPakAPakAP+yAP+9APeqAPmrAPelAPeoAPiqAPelAPepAPenAPakAP/OAP/UAP/RAP/aAP/XAP/eAPmyAPzAAP/KAIFqyggAAAASdFJOUwBtHPN76srzDwm/MUndqVqckA5DiAwAAAD9SURBVCjPnZKLroQgDETxgSj4HEEF//8/t0CMindN7k5MMD0ZHNsy9h/V2SsuRf1CG4HyBU+wL/ZGWP1iL2G273Yyb9t3e0bmbbO8+dvMi4VkHnaVjbITwOzxUkBUfTmomEEW8LLW7YEuJptk50uiUozlBeyu10PLuoQv5YPA4N+Iu/WqmERGSnPgxPWq6Vn9GWrVQSPXpwIV7WWOJzfapNT/M5w59KDEYU+cPzqTw82HGOPjo99XLKsE99ij5p3wJBLcBex8B3d/V37HnMrOousheM0UkuSwBHnWMNXTkUZXfkBl3AMl0WFMtgzjuWNthXv0Xt6ztHfcsJ/0AWxHFobg9zY6AAAAAElFTkSuQmCC";
            const star_full = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURfakAPelAPakAPekAPakAPelAPalAEdwTP+vAPiuAPakAPqoAPalAPalAPelAP/WAP/TAP/MAP/PAP/bAPq1APy/AP7HAGxqCN8AAAAPdFJOU/5Lu2byeuMADP2nIMmTOjbD1MQAAAD7SURBVCjPhdNbkoMgEAXQq4KhAZWn+1/qAFFjk5TTH1pwuIoIeD0WeFPJR5ZCPbASkA8sQTzOWM3keBw8HGJicfBwjIHF7zzBx8jj6MJxY/HGZpiWcQb8VjwShNVyWlXjpfSXopT3rZXLKVHtErPBS1kk77a+wg5M9eFqRP7SzVHR9u7qrqtAGM6pffuhx4c1D8GFAuUeTr2+WyOHqzyJoVsWkW58rczJ6p4OWDpekf2nyHY8YW/wvibR8YLanQmpDkgwnEfye8FZowzYM7qZi1SxLKNpA86pH2zqD5LvfbCOpaEZDxDLZ5OsFpax1Ibt6GH+eUr+OWN9/QE2YB+QdE4J4wAAAABJRU5ErkJggg==";

            const star_5 = $("#module_product_review_star_1 > div > div > img:nth-child(5)", html).attr("src");
            const star_4 = $("#module_product_review_star_1 > div > div > img:nth-child(4)", html).attr("src");
            const star_3 = $("#module_product_review_star_1 > div > div > img:nth-child(3)", html).attr("src");
            const star_2 = $("#module_product_review_star_1 > div > div > img:nth-child(2)", html).attr("src");
            const star_1 = $("#module_product_review_star_1 > div > div > img:nth-child(1)", html).attr("src");

            function starcheck(star) {
                if (star === star_full) {
                    return(star = + 1);
                }
                if (star === star_half) {
                    return(star = + 0.5);
                }
                if (star === star_half_plus) {
                    return(star = + 0.6);
                }
                if (star === star_none) {
                    return(star = + 0);
                } else {
                    return(star = + 0.2);
                }
            }

            function getPoint(point) {
                if (point != null) {
                    return point;
                }
                if (point == "No") {
                    return null;
                }
            }

            function i_p_star(star) {
                if (star == 0) {
                    return 0;
                }
                if (star <= 1) {
                    return 15;
                }
                if (star <= 2.5) {
                    return 30;
                }
                if (star <= 3) {
                    return 55;
                }
                if (star <= 3.5) {
                    return 75;
                }
                if (star <= 4) {
                    return 80;
                }
                if (star <= 4.5) {
                    return 90;
                }
                if (star <= 5) {
                    return 100;
                }
            }

            function i_p_point(point) {
                if (point <= 10) {
                    return 25;
                }
                if (point <= 50) {
                    return 50;
                }
                if (point <= 100) {
                    return 75;
                }
                if (point <= 500) {
                    return 100;
                }
                if (point >= 500) {
                    return 100;
                }
            }

            const p_point = getPoint($("#module_product_review_star_1 > div > a:nth-child(2)", html).text().replace("Ratings", ""));
            const p_star = starcheck(star_5) + starcheck(star_4) + starcheck(star_3) + starcheck(star_2) + starcheck(star_1);
            const p_store_point = $("#module_seller_info > div > div.pdp-seller-info-pc > div:nth-child(1) > div.seller-info-value.rating-positive", html).text().replace("%", "");
            const p_store_chat = $("#module_seller_info > div > div.pdp-seller-info-pc > div:nth-child(3) > div.seller-info-value", html).text().replace("%", "");

            function CheckNone(number) {
                if (number != null) {
                    return number;
                } else {
                    return 0;
                }
            }

            const chart_star = i_p_star(parseInt(p_star));
            const chart_point = i_p_point(parseInt(p_point));
            const chart_store_point = parseInt(p_store_point);
            const chart_store_chat = parseInt(p_store_chat);

            function chart(star, point, store_point, store_chat) {
                return(star + point + store_point + store_chat) / 4;
            }

            const chart_sum = parseInt(chart(CheckNone(chart_star), CheckNone(chart_point), CheckNone(chart_store_point), CheckNone(chart_store_chat)));
            console.log(chart_star);

            if (p_name != null) {
                if (p_img != null) {
                    console.log(p_img);

            const success = true;
                    res.render("verify", {
                        url,
                        p_name,
                        p_img,
                        p_star,
                        p_point,
                        p_brand,
                        p_model,
                        p_warantee,
                        p_store,
                        p_store_link,
                        p_near,
                        p_store_point,
                        p_store_chat,
                        chart_star,
                        chart_point,
                        chart_store_point,
                        chart_store_chat,
                        chart_sum,
                        success
                    });
                }
            } else {
                const error = true;
                res.render("home",{error});
            }
        }).catch(function (err) {
            const error = true;
            res.render("home",{error});
            console.log(err);
        });
    } else {
        const error = true;
        res.render("home",{error});
    }
});

app.listen(port, () => console.log("Listening on port " + port));
