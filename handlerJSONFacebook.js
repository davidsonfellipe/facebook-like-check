function handlerJSONFacebook(response){  

	var HTML = "<table id='tablesorter' class='tablesorter'>" +
                "<thead>" +
                "<tr>" + 
                    "<th> url </th>" +
                    "<th> likes </th>" +
                    "<th> shares </th>" +
                    "<th> total </th>" +
                "</tr>" +
                "</thead>" + 
                "<tbody>";

	$.each(response, function(index, object) { 
        
        HTML += "<tr class='table-content'>" + 
                    "<td><a href='" + object.normalized_url + "' target='_blank'>" + object.url + "</a></td>" +
                    "<td>" + object.like_count + "</td>" +
                    "<td>" + object.share_count + "</td>" +
                    "<td>" + object.total_count + "</td>" +
                "</tr>";

    });

    HTML += "</tbody>" + 
            "</html>";

    $("#result").html(HTML);
    $("#tablesorter").tablesorter(); 
}

function handlerXMLtoJSONSitemap(response){  

    var urls = "";
    
    if(response.query.results.sitemapindex){
        $("#result").html('<div class="error">sitemapindex is not supported</div>');
    }
    else if(response.query.results.urlset.url.length < 1000){
        $.each(response.query.results.urlset.url, function(index, object) { 
            urls += object.loc + ',';
        });
        
        urls = encodeURIComponent(urls);

        var url = "http://api.facebook.com/restserver.php?method=links.getStats&urls=%20" + urls + "&format=json&callback=handlerJSONFacebook";

        $.getScript(url);
    }else{
        //response.query.results.urlset.url
        $("#result").html('<div class="error">sitemap too large or badly formatted</div>');
    }
}

$(document).ready(function(){
    
    $('#get-info').click(function() {
        
        var urls = encodeURIComponent($('#urls').val().replace(/(\r\n|\n|\r)/gm, ","));
               
        var url = "http://api.facebook.com/restserver.php?method=links.getStats&urls=%20" + urls + "&format=json&callback=handlerJSONFacebook";

        $.getScript(url);
    });
    
    $('.get-info-by-sitemap').click(function() {
        
        var urlSitemap = encodeURIComponent($('.sitemap-input').val());
        
        var url = 'http://query.yahooapis.com/v1/public/yql?q=select * from xml where url%3D"' + urlSitemap + '"&format=json&callback=handlerXMLtoJSONSitemap';
        
        $.getScript(url);
    });
    

    $('.tab', ".tabs").click(function(){
        $(".content",".tabs").hide();
        $(".content",".tabs").removeClass("content-active");
        $($(this).attr("rel")).show();
        $($(this).attr("rel")).addClass("content-active");
        $("#result").html("");
    });
});