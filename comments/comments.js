// decodes a json comment set.

$(document).ready(function() {
    $.getJSON( "test.json", function( data ) {
        list = $( "<ul/>", {
            id: "my-new-list",
            class: "media-list"
        }).appendTo( "#comments-target" );

        $.each( data, function( key, value ) {
            listItem = $("<li/>", { 
                class: "media"
            });
            commentDiv = $("<div/>", {class: "media-body"});
            $("<h4/>", {
                text: key, 
                class: "media-heading"}).appendTo(commentDiv);
            $("<p/>", {text: value}).appendTo(commentDiv);
            commentDiv.appendTo(listItem);
            listItem.appendTo(list);
        });
        
    });
});
