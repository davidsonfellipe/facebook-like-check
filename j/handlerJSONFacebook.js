function getTableContent(response){  
    "use strict";
    
    var html = '';

    $.each(response, function(index, object) { 
    
        html += "<tr class='table-content'>" + 
                    "<td><a href='" + object.normalized_url + "' target='_blank'>" + object.url + "</a></td>" +
                    "<td>" + object.like_count + "</td>" +
                    "<td>" + object.share_count + "</td>" +
                    "<td>" + (object.like_count + object.share_count) + "</td>" +
                "</tr>";

    });
    
    $(".table-body").append(html);
}
function getTableBaseOfLike(){  
    "use strict";
    
    var html = "<table id='tablesorter' class='tablesorter'>" +
                "   <thead>" +
                "   <tr>" + 
                "       <th> url </th>" +
                "      <th> likes </th>" +
                "       <th> shares </th>" +
                "       <th> total </th>" +
                "   </tr>" +
                "   </thead>" + 
                "   <tbody class='table-body'>" +
                "   </tbody>" + 
                "</table>";

    $("#result").html(html);
}
function clearTable(){
    "use strict";
    $("#result").html('');
}
function handlerJSONFacebook(response){  
    "use strict";
    getTableContent(response);
}

function getURLFormated(urls){
    "use strict";
    urls = encodeURIComponent(urls);
    return "http://api.facebook.com/restserver.php?method=links.getStats&urls=%20" +
            urls +
            "&format=json&callback=handlerJSONFacebook";
}

function handlerXMLtoJSONSitemap(response){  
    "use strict";
    var urls = "";
    var MAX_LINKS = 5000;
    var URLS_PER_REQUESTS = 100;
    var sequence = 0; //to control last request AJAX
    
    if(response.query.results.sitemapindex){
        clearTable();
        $("#result").html('<div class="error">sitemapindex is not supported</div>');
    }
    else if(response.query.results.urlset.url.length < MAX_LINKS){
        
        getTableBaseOfLike();
        
        var maxInterations = Math.ceil(response.query.results.urlset.url.length / URLS_PER_REQUESTS);
        var totalResults = response.query.results.urlset.url.length;
        var actualRange = 1;
        var url = '';
        
        if(maxInterations > 0) $(".loading").show();
        
        $.each(response.query.results.urlset.url, function(index, object) { 
            
            urls += object.loc + ',';
            
            if(index === (URLS_PER_REQUESTS * actualRange - 1)){
                
                url = getURLFormated(urls);
                
                urls = '';
                
                $.ajax({
                    url: url,
                    dataType: "script",
                    success: function(){
                        sequence++;
                       
                        if(actualRange === sequence){
                            $(".loading").hide();
                            $("#tablesorter").tablesorter();
                        }
                    }
                });
                
                actualRange++;
            }else if(index === (totalResults - 1)){
                
                url = getURLFormated(urls);
                                
                urls = '';
                
                $.ajax({
                    url: url,
                    dataType: "script",
                    success: function(){
                        sequence++;
                        
                        if(actualRange === sequence){
                            $(".loading").hide();
                            $("#tablesorter").tablesorter();
                        }
                    }
                });
                
            }
        });
        
    }else{

        clearTable();
        $("#result").html('<div class="error">sitemap too large or badly formatted</div>');
    }
}

$(document).ready(function(){
    "use strict"; 
    $('#get-info').click(function() {
        
        clearTable();
        
        var urls = encodeURIComponent($('#urls').val().replace(/(\r\n|\n|\r)/gm, ","));
        
        var amount = urls.split("%2C").length - 1;
        
        if(amount < 500){
            
            getTableBaseOfLike();

            var url = "http://api.facebook.com/restserver.php?method=links.getStats&urls=%20" + urls + "&format=json&callback=handlerJSONFacebook";
        
            $(".loading").show();
        
            $.ajax({
                url: url,
                dataType: "script",
                success: function(){
                    $(".loading").hide();
                    $("#tablesorter").tablesorter();
                }
            });
        }else{
            $("#result").html('<div class="error">sorry! max 500 urls</div>'); 
        }
    });
    
    $('.get-info-by-sitemap').click(function() {
        
        clearTable();
        getTableBaseOfLike();
        
        var urlSitemap = encodeURIComponent($('.sitemap-input').val());
        
        var url = 'http://query.yahooapis.com/v1/public/yql?q=select * from xml where url%3D"' + urlSitemap + '"&format=json&callback=handlerXMLtoJSONSitemap';
        
        $.getScript(url);
    });
    

    $('.tab', ".tabs").click(function(){
        
        $(".content",".tabs").hide()
                             .removeClass("content-active");
        $($(this).attr("rel")).show()
                              .addClass("content-active");
        clearTable();
    });
});