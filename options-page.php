<?php
    //add_action('admin_menu', 'plugin_admin_add_page');
    add_action('admin_menu', 'lst_add_admin_page');
    function lst_add_admin_page() {
        add_options_page('API Settings', 'API Setting Menu', 'manage_options', 'plugin', 'lst_options_page');
    }
    
    function lst_options_page() {
?>
        <div>
            <form action="options.php" method="post">
                <?php settings_fields('lst_options'); ?>
                <?php do_settings_sections('plugin'); ?>
                <input name="Submit" type="submit" class="button button-primary" value="<?php esc_attr_e('Save Changes'); ?>" />
            </form>
        </div>
<?php
    }
    
    add_action('admin_init', 'lst_admin_init');
    
    function lst_admin_init(){
        register_setting( 'lst_options', 'lst_options', 'lst_options_validate' );
        add_settings_section('plugin_main', 'rapidapi Key', 'lst_section_text', 'plugin');
        add_settings_field('plugin_text_string', 'API Key', 'lst_setting_string', 'plugin', 'plugin_main');
    }

    function lst_setting_string() {
        $options = get_option('lst_options');
        echo "<input id='plugin_text_string' name='lst_options[text_string]' size='40' type='text' value='{$options['text_string']}' />";
    }
    
    function lst_options_validate($input) {
        $newinput['text_string'] = trim($input['text_string']);
        /*if(!preg_match('/^[a-z0-9]{32}$/i', $newinput['text_string'])) {
            $newinput['text_string'] = '';
        }*/
        return $newinput;
    }
    function lst_section_text() {
        echo '<p>Enter the rapidapi key to get the info from rapidapi.com</p>';
    }
?>