/**
 * Created by Benedikt on 01/05/2017.
 */
var shows = [];
function Show(episodes, show, runtime) {
    this.show = show;
    this.episodes = episodes;
    this.runtime = runtime;
}
$("body").ready(function () {
    $("button").button();

    $("#search").on('input', function () {

        console.log("typed..");
        var input = $("#search").val();
        var url = "http://api.tvmaze.com/search/shows?q=" + encodeURI(input);
        console.log(url);
        $.getJSON(url, null, function (data) {
            var html = "";
            for (var i = 0; i < data.length; i++) {
                html += "<div class=\"show_search\">";
                if (data[i].show.image) {
                    html += "<img  height='20px' src='" + data[i].show.image.medium + "'>";
                }
                html += data[i].show.name + "(" + getYearFromDate(data[i].show.premiered) + ")  <a id='add_show~" + data[i].show.id + "' class='add_show_link add_show_handler' >Add</a></div>\n";
            }
            $("#search_res").html(html);
            $(".add_show_handler").click(function (obj) {
                var id = obj.target.id.split("~")[1];

                var contained = false;
                for (var i_sh = 0; i_sh < shows.length; i_sh++) {
                    if (shows[i_sh].show.id == parseInt(id)) {
                        contained = true;
                        break;
                    }
                }
                if (!contained) {
                    var url = "http://api.tvmaze.com/shows/" + id;


                    $.getJSON(url, null, function (data_show) {

                        $.getJSON("http://www.omdbapi.com/?i=" + data_show.externals.imdb, null, function (data_imdb) {
                            url += "/episodes";
                            $.getJSON(url, null, function (data_episode) {
                                shows.push(new Show(data_episode, data_show, data_imdb.Runtime));
                                updateShowList();
                            });
                        });
                    });
                }
            });
        });
    });
    updateShowList();
});
function updateShowList() {
    var html = "";
    for (var i = 0; i < shows.length; i++) {
        html += "<div class=\"show_display\">";
        if (shows[i].show.image) {
            html += "<img  class='display_img' height='20px' src='" + shows[i].show.image.medium + "'>";
        }
        html += shows[i].show.name + "(" + getYearFromDate(shows[i].show.premiered) + ") <a id='remove_show~" + shows[i].show.id + "' class='add_show_link remove_show_handler' >Remove</a></div>\n";
    }
    $("#added").html(html);
    $(".remove_show_handler").click(function (obj) {
        for (var i_sh = 0; i_sh < shows.length; i_sh++) {
            var id = obj.target.id.split("~")[1];
            console.log(id);
            if (shows[i_sh].show.id == parseInt(id)) {
                shows.splice(i_sh, 1);
            }
        }
        updateShowList();
    });
    recalculateNumber();
}
function recalculateNumber() {
    var total_min = 0;
    for (var is = 0; is < shows.length; is++) {
        if (shows[is].runtime === "string"&&shows[is].runtime!="N/A") {

            total_min += shows[is].episodes.length * (parseInt(shows[is].runtime.split(" ")[0]));
        } else {
            console.log("No IMDB runtime- using TVmaze...");
            console.log(shows[is]);
            for (var ie = 0; ie < shows[is].episodes.length; ie++) {
                total_min +=shows[is].episodes[ie].runtime;
            }
        }
    }
    var hrs = Math.floor(total_min / 60);
    var min = total_min % 60;
    if (min < 10) {
        min = "0" + min;
    }
    $("#result").html(hrs + " h " + min + " min ");
    var days = Math.floor(hrs / 24);
    hrs = hrs % 24;
    if (days > 0) {
        $("#result_small").html(days + " days " + hrs + " h " + min + " min ");
    }
}
function getYearFromDate(date) {
    if (date) {

        return parseInt(date.split("-")[0]);
    } else {
        return "-";
    }
}
