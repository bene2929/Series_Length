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
            console.log(data);
            var html = "";
            for (var i = 0; i < data.length; i++) {
                html += "<div class=\"show_search\">";
                if (data[i].show.image) {
                    html += "<img  height='20px' src='" + data[i].show.image.medium + "'>";
                }
                html += data[i].show.name + "(" + getYearFromDate(data[i].show.premiered) + ")  <a id='add_show~" + data[i].show.id + "' class='add_show_link' >Add</a></div>\n";
            }
            $("#search_res").html(html);
            $(".add_show_link").click(function (obj) {
                console.log(obj.target.id);
                var id = obj.target.id.split("~")[1];

                var contained = false;
                for (var i_sh = 0; i < shows.length; i++) {
                    if (shows[i][0].id == parseInt(id)) {
                        contained = true;
                        break;
                    }
                }
                if (!contained) {
                    var url = "http://api.tvmaze.com/shows/" + id;


                    $.getJSON(url, null, function (data_show) {

                        $.getJSON("http://www.omdbapi.com/?i=" + data_show.externals.imdb, null, function (data_imdb) {
                            console.log(data_imdb);
                            url += "/episodes";
                            $.getJSON(url, null, function (data_episode) {
                                console.log(data_show);

                                console.log(data_episode);
                                shows.push(new Show(data_episode, data_show, data_imdb.Runtime));
                                updateShowList();
                            });
                        });
                    });
                }
            });
        });
    });
});
function updateShowList() {
    var html = "";
    for (var i = 0; i < shows.length; i++) {
        html += "<div class=\"show_display\">";
        if (shows[i].show.image) {
            html += "<img  class='display_img' height='20px' src='" + shows[i].show.image.medium + "'>";
        }
        html += shows[i].show.name + "(" + getYearFromDate(shows[i].show.premiered) + ")</div>\n";
    }
    $("#added").html(html);
    recalculateNumber();
}
function recalculateNumber() {
    var total_min = 0;
    for (var is = 0; is < shows.length; is++) {
        total_min += shows[is].episodes.length * (parseInt(shows[is].runtime.split(" ")[0]));
    }
    var hrs = Math.floor(total_min / 60);
    var min = total_min % 60;
    if (min < 10) {
        min = "0" + min;
    }
    $("#result").html(hrs + ":" + min);
}
function getYearFromDate(date) {
    if (date) {

        return parseInt(date.split("-")[0]);
    } else {
        return "-";
    }
}
