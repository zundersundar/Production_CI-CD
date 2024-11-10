// Config.js

const API_PATHS = {

    //Upload Image
    UPLOAD_CUSTOMER_LOGO_IMAGE : 'upload_logo',
    DELETE_CUSTOMER_LOGO_IMAGE:'delete_logo',
    UPLOAD_FLOOR_IMAGE : 'upload_floor_plan',
    DELETE_FLOOR_IMAGE : 'delete_floor_plan',

    //Customers Path
    GET_CUSTOMER_LIST: 'customers',
    CREATE_CUSTOMER_LIST: 'customer',
    DELETE_CUSTOMER_BY_ID:'customer',

    //Site Path
    GET_SITE_LIST:'read_sites',
    CREATE_SITE_LIST:'site',
    GET_SITE_BY_CUSTOMER_ID:'sites_by_customer_id',
    DELETE_SITE_BY_SITE_ID:'site',

    //Buildings Path
    GET_BUILDINGS_LIST:'read_buildings',
    CREATE_BUILDINGS_LIST:'building',
    GET_BUILDINGS_BY_SITE_ID:'buildings_by_site_id',
    DELETE_BUILDING_BY_BUILDING_ID:'building',


    //Floor Path
    GET_FLOOR_LIST:'read_floors',
    GET_FLOOR_BY_BUILDING_ID:'floors_by_building_id',
    CREATE_FLOOR :'floor',
    DELETE_FLOOR :'floor',
    UPDATE_FLOOR :'floor',

    // Floor Planning
    GET_SENSOR_LIST:'read_sensors',
    CREATE_SENSOR:'add_new_sensor_heimdall_memory',
    ADD_MULTIPLE_SENSORS:'multiple_sensors',
    // GET_SENSOR_BY_BUILDING_ID :'sensors_by_building_id',
    GET_SENSORS_BY_FLOOR_ID:'sensors_by_floor_id',
    GET_SENSORS_BY_FLOOR_POSITION:'sensors_by_floor_position'



  };
  
  export default API_PATHS;
  