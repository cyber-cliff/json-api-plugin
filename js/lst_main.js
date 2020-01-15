jQuery(document).ready(function() {
    jQuery(document).on("click", ".showOdds", function(event) {
        jQuery('#row'+event.target.id).toggle();
    });
    jQuery("#searchSports").on("keyup", function() {
        var value = jQuery(this).val().toLowerCase();
        jQuery("#filterTable tr").filter(function() {
            jQuery(this).toggle(jQuery(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    jQuery("#searchSports").on("keyup", function() {
        var value = jQuery(this).val().toLowerCase();
        jQuery('div[data-role="sport"]').filter(function() {
            jQuery(this).toggle(jQuery(this).find('h5').text().toLowerCase().indexOf(value) > -1 || jQuery(this).find('h6').text().toLowerCase().indexOf(value) > -1 || jQuery(this).find('span').text().toLowerCase().indexOf(value) > -1)
        });
    });
});

function sortTable(n,id) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(id);
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function ajaxlst_loadteams(sport,nonce) {
    jQuery('.loadingTeams').show();
    jQuery.ajax({
        type: 'POST',
        url: ajaxlst.ajaxurl,
        data: {
            action: 'ajaxlst_ajaxhandler_teams',
            sport: sport,
            nonce: nonce
        },
        success: function(data, textStatus, XMLHttpRequest) {
            var loadpostresult = '#loadResults';
            jQuery('.loadingTeams').hide();
            jQuery(loadpostresult).html('');
            jQuery(loadpostresult).append(data);
            jQuery(window).resize(tableToCards);
            jQuery(window).ready(tableToCards);
            jQuery("#searchSports").val('');
        },
        error: function(MLHttpRequest, textStatus, errorThrown) {
            alert(errorThrown);
        }
    });
}

function ajaxlst_loadodds(site,nonce) {
    jQuery('.loadingTeams').show();
    jQuery.ajax({
        type: 'POST',
        url: ajaxlst.ajaxurl,
        data: {
            action: 'ajaxlst_ajaxhandler_odds',
            site: site,
            nonce: nonce
        },
        success: function(data, textStatus, XMLHttpRequest) {
            var loadpostresult = '#loadResults';
            jQuery('.loadingTeams').hide();
            jQuery(loadpostresult).html('');
            jQuery(loadpostresult).append(data);
            jQuery(window).resize(tableToCards);
            jQuery(window).ready(tableToCards);
            jQuery("#searchSports").val('');
        },
        error: function(MLHttpRequest, textStatus, errorThrown) {
            alert(errorThrown);
        }
    });
}