<?php
/*
Plugin Name: Live Sports Table
Description: Displays a table with sporting events from rapidapi based on the sport you can then see the teams and finally the odds from various sites.
Author: Michael Alvares
*/
    defined( 'ABSPATH' ) || exit;
    require_once( __DIR__.'/options-page.php' );

    function get_live_sports_data($sport=''){
        $options = get_option('lst_options');
        $API = $options['text_string'];
        $jsonURL = 'https://odds.p.rapidapi.com/v1/sports';
        if($sport!='')
            $jsonURL = 'https://odds.p.rapidapi.com/v1/odds?sport='.$sport.'&region=uk&mkt={mkt}';
        $args = array(
            'headers' => array(
                'x-rapidapi-host' => 'odds.p.rapidapi.com',
                'x-rapidapi-key' => $API
            )
        );
        return wp_remote_get( $jsonURL, $args);
        
    }
    function live_sports_shortcode() {
        $fullData = get_live_sports_data();
        $data = json_decode($fullData['body']);
        if(@$data->success!=1){
            return '<span style="color:red">'.$data->message.'</span>';
        }else{
            $nonce = wp_create_nonce("ajaxlst_nonce");
            $tableData = $data->data;
            $string = '
                <div class="loadingTeams"><div class="loader"></div></div>
                <input type="text" id="searchSports" class="form-control" placeholder="Enter search key" /><br />
                <div id="loadResults">
                    <table class="table" id="sportTable">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col" data-card-subtitle onclick="sortTable(0,\'sportTable\')"><a class="isLink">League&nbsp;<i class="fas fa-sort"></i></a></th>
                                <th scope="col" data-card-title onclick="sortTable(1,\'sportTable\')"><a class="isLink">Sport&nbsp;<i class="fas fa-sort"></i></a></th>
                                <th scope="col" data-card-footer>Deatils</th>
                                <th scope="col" data-card-action-links>View Games</th>
                            </tr>
                        </thead>
                        <tbody id="filterTable">
            ';
            foreach ($tableData as $TD) {
                $arguments =  "'".$TD->key."','".$nonce."'";
                $string .= '
                    <tr>
                        <td scope="col">'.$TD->title.'</td>
                        <td scope="col">'.$TD->group.'</td>
                        <td scope="col">'.$TD->details.'</td>
                        <td scope="col"><a onclick="ajaxlst_loadteams('.$arguments.');" class="show-odds-btn">View&nbsp;<i class="fas fa-caret-right"></i></a></td>
                    </tr>
                ';
            }
            $string .= '
                        </tbody>
                    </table>
                </div>
            ';
            return $string;
        }

    }
    function get_sport_teams($sport,$n) {
        $fullData = get_live_sports_data($sport);
        $data = json_decode($fullData['body']);
        if(@$data->success!=1){
            return '<span style="color:red">aa'.$data->message.'</span>';
        }else{
            $nonce = wp_create_nonce("ajaxlst_nonce");
            $tableData = $data->data;
            $string = '
                <table class="table" id="teamsTable">
                    <thead class="thead-dark">
                        <tr>
                            <th scope="col" data-card-title onclick="sortTable(0,\'teamsTable\')"><a class="isLink">Teams&nbsp;<i class="fas fa-sort"></i></a></th>
                            <th scope="col" data-card-subtitle onclick="sortTable(0,\'teamsTable\')"><a class="isLink">Home Team&nbsp;<i class="fas fa-sort"></i></a></th>
                            <th scope="col" data-card-footer onclick="sortTable(0,\'teamsTable\')"><a class="isLink">Start Time&nbsp;<i class="fas fa-sort"></i></a></th>
                            <th scope="col" data-card-action-links> Odds</th>
                        </tr>
                    </thead>
                    <tbody id="filterTable">';
            $i=1;
            foreach ($tableData as $TD) {
                $arguments =  "'".urlencode(serialize($TD->sites))."','".$nonce."'";
                $string .= '
                    <tr>
                        <td scope="col">'.$TD->teams[0].' VS '.$TD->teams[1].'</td>
                        <td scope="col">'.$TD->home_team.'</td>
                        <td scope="col">'.date("Y-m-d H:i:s", $TD->commence_time).'</td>
                        <td scope="col"><a onclick="ajaxlst_loadodds('.$arguments.');" class="show-odds-btn">View Odds</a></td>
                    </tr>';
            }
            $string .= '
                    </tbody>
                </table>
            ';
            return $string;
        }
    }
    function get_sport_odds($odds) {
        $data = unserialize(urldecode($odds));
        $string = '
            <table class="table" id="oddsTable">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col" data-card-title onclick="sortTable(0,\'oddsTable\')"><a class="isLink">Site&nbsp;<i class="fas fa-sort"></i></a></th>
                        <th scope="col" data-card-subtitle onclick="sortTable(0,\'oddsTable\')"><a class="isLink">Odds&nbsp;<i class="fas fa-sort"></i></a></th>
                        <th scope="col" data-card-footer onclick="sortTable(0,\'oddsTable\')"><a class="isLink">Last Update&nbsp;<i class="fas fa-sort"></i></a></th>
                    </tr>
                </thead>
                <tbody id="filterTable">
        ';
        foreach($data as $row){
            $string .='
                <tr>
                    <td scope="col">'.$row->site_nice.'</td>
                    <td scope="col">'.$row->odds->h2h[0].' - '.$row->odds->h2h[1].'</td>
                    <td scope="col">'.date("Y-m-d H:i:s", $row->last_update).'</td>
                </tr>
            ';
        }
        $string .='
                </tbody>
            </table>
        ';
        return $string;
    }
    function ajaxlst_enqueuescripts() {
        $localize = array(
            'ajaxurl' => admin_url( 'admin-ajax.php' )
        );
        wp_enqueue_script( 'ajaxlst', plugins_url( 'js/lst_main.js', __FILE__ ), ['jquery'], "", '' );
        wp_enqueue_script( 'tableToCard', plugins_url( 'js/tableToCard.js', __FILE__ ), ['jquery'], "", '' );
        wp_localize_script( 'ajaxlst', 'ajaxlst', $localize);
    }
    add_action('wp_enqueue_scripts', 'ajaxlst_enqueuescripts');

    function ajaxlst_ajaxhandler_teams() {
        if ( !wp_verify_nonce( $_POST['nonce'], "ajaxlst_nonce")) {
            exit("Wrong nonce");
        }
        $results = get_sport_teams($_POST['sport'],$_POST['nonce']);
        die($results);
    }
    
    function ajaxlst_ajaxhandler_odds() {
        if ( !wp_verify_nonce( $_POST['nonce'], "ajaxlst_nonce")) {
            exit("Wrong nonce");
        }
        $results = get_sport_odds($_POST['site']);
        die($results);
    }

    add_action('wp_ajax_nopriv_ajaxlst_ajaxhandler_teams', 'ajaxlst_ajaxhandler_teams');
    add_action('wp_ajax_ajaxlst_ajaxhandler_teams', 'ajaxlst_ajaxhandler_teams');

    add_action('wp_ajax_nopriv_ajaxlst_ajaxhandler_odds', 'ajaxlst_ajaxhandler_odds');
    add_action('wp_ajax_ajaxlst_ajaxhandler_odds', 'ajaxlst_ajaxhandler_odds');
    
    add_shortcode( 'listodds', 'live_sports_shortcode' );
    add_action( 'init', 'get_live_sports_data' );
