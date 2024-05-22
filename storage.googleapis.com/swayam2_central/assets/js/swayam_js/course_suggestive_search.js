$(document).ready(function() {
    $.ajax({
        url: '/course_suggestive_search',
        method: 'POST',
        dataType: 'text',
        success: function(response) {
            let XSSI_PREFIX = ")]}'";
            let payload_data = JSON.parse(response.replace(XSSI_PREFIX, ''));
            var search_items = payload_data.message;

            function recursiveListUpdate(search_items, keywords) {
                newList = [];
                search_items.forEach(function(element) {
                    if (element.instructor_name.toLowerCase().indexOf(keywords[counter].toLowerCase()) >= 0 ||
                        element.title.toLowerCase().indexOf(keywords[counter].toLowerCase()) >= 0) {
                        newList.push(element); //if any %20, etc symbols
                    }
                });
                counter++;
                if (counter == keywords.length) {
                    return newList;
                }
                return recursiveListUpdate(newList, keywords);
            }

            function handleAutocomplete(term) {
                var str = term; // get the "keywords"
                var keywordsFromNameInput = str.split(" "); // split them into a list
                counter = 0; // set counter for keywords.length
                // recursively get new list that contains the give keywords no matter the order
                return recursiveListUpdate(search_items, keywordsFromNameInput);
            }

            var autocomplete_id = '';
            if( window.location.pathname === "/explorer")
                autocomplete_id = '#keyword-input';
            else
                autocomplete_id = '#header-search-query';


            $(autocomplete_id).autocomplete({
                source: function(request, response) {
                    var term = request.term;
                    var data = handleAutocomplete(term); //your custom handling
                    response(data);
                },
                delay: 300,
                minLength: 5,
                highlightItem: true,
                multiple: true,
                multipleSeparator: " ",
                scroll: true,
                select: function(event, ui) {
                    if(event.keyCode == 13) {
                      if($(autocomplete_id).val().length==0) {
                          event.preventDefault();
                          return false;
                      }
                    }
                    $(this).val('');
                    let url = ui.item.url;
                    if (current_user_email.toLowerCase() != 'none'){
                        url += "?user_email=" + current_user_email;
                    }
                    const a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.click();
                    return false;
                },
                focus: function (event, ui) {
                    event.preventDefault();
                    return false;
                },
                create: function(event) {
                        $(autocomplete_id).autocomplete("widget").css({
                            'max-width': autocomplete_id == '#keyword-input'? '450px' : '320px',
                            'padding': '0px 15px 0px',
                            'position': 'absolute',
                            'font-family': 'Poppins',
                            'cursor': 'pointer',
                            'max-height': '460px',
                            'overflow-y': 'auto',
                            'overflow-x': 'hidden',
                            'border': '1px solid gray',
                        });
                        $(this).data('ui-autocomplete')._renderItem = function(ul, item) {
                            ul.css({
                                    'color':'#666666',
                                    'background-color':'white',
                                });

                            let display_search_content =  '<div class="block-list-item-content notranslate">' +
                                                              '<div class="search-form-autocomplete-group">' +
                                                                  '<img class="search-form-autocomplete-group-course-img" src="' + (item.picture_url != '' ? item.picture_url : ' ') + '" width="32" height="32" loading="lazy">' +
                                                                '<div style="padding: 5px;" class="search-form-autocomplete-suggestion-content heading-md" title="' + item.title + '">' + item.title +
                                                                  '<br>' +
                                                                      (item.instructor_name != '' ? '<span class="text-xs" style="padding:0px" title="' + item.instructor_name + '">' +  ' ' + item.instructor_name + '</span>' : ' ') +
                                                                '</div>' +
                                                                '</div>' +
                                                          '</div>';

                            var search_text = $(autocomplete_id).val();
                            var keywords = search_text.split(/\s+/);

                            return $("<li style='cursor: pointer;'></li>")
                                .append(display_search_content.replace(new RegExp("(" + keywords + '(?![^<>]*>)' + ")", "ig"), "<strong>$1</strong>"))
                                .css({
                                    'list-style-type': 'none',
                                    'color': '#666666',
                                })
                                .appendTo(ul);
                        };
                },
            }).focus(function () {
               $(this).autocomplete("search");
            });
        },
        error: function( xhr, status, error ) {
            // Ignoring errors
        },
    });
});
