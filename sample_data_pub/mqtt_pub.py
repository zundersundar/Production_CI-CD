#Supported sensor types: 
#Temperature (float), Humidity (%), C02 (ppm), CO, VFT Speed Feedback (Hz)
# Status (boolean)


import random
import paho.mqtt.client as mqtt
import time
import json

#TODO Add Energy meter
sensor_configs = [
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Temperature", 'sensor_name' : "S1" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "CO2", 'sensor_name' : "S2" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Humidity", 'sensor_name' : "S3" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Fan", 'sensor_name' : "S4" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Valve", 'sensor_name' : "S5" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S6" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S7" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Temperature", 'sensor_name' : "S8" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "CO2", 'sensor_name' : "S9" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Humidity", 'sensor_name' : "S10" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Fan", 'sensor_name' : "S11" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Valve", 'sensor_name' : "S12" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S13" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S14" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Temperature", 'sensor_name' : "S15" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "CO2", 'sensor_name' : "S16" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Humidity", 'sensor_name' : "S17" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Fan", 'sensor_name' : "S18" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Valve", 'sensor_name' : "S19" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S20" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S21" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Temperature", 'sensor_name' : "S22" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "CO2", 'sensor_name' : "S23" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Humidity", 'sensor_name' : "S24" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Fan", 'sensor_name' : "S25" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Valve", 'sensor_name' : "S26" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S27" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S28" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Temperature", 'sensor_name' : "S29" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "CO2", 'sensor_name' : "S30" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Humidity", 'sensor_name' : "S31" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Fan", 'sensor_name' : "S32" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Valve", 'sensor_name' : "S33" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S34" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S35" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Temperature", 'sensor_name' : "S36" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "CO2", 'sensor_name' : "S37" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Humidity", 'sensor_name' : "S38" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Fan", 'sensor_name' : "S39" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Valve", 'sensor_name' : "S40" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S41" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S42" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Temperature", 'sensor_name' : "S43" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "CO2", 'sensor_name' : "S44" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Humidity", 'sensor_name' : "S45" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Fan", 'sensor_name' : "S46" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Valve", 'sensor_name' : "S47" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S48" },
    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S49" },

    {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Temperature", 'sensor_name' : "S50" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "CO2", 'sensor_name' : "S51" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Humidity", 'sensor_name' : "S52" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Fan", 'sensor_name' : "S53" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Valve", 'sensor_name' : "S54" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S55" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S56" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Temperature", 'sensor_name' : "S57" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "CO2", 'sensor_name' : "S58" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Humidity", 'sensor_name' : "S59" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Fan", 'sensor_name' : "S60" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Valve", 'sensor_name' : "S61" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S62" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S63" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Temperature", 'sensor_name' : "S64" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "CO2", 'sensor_name' : "S65" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Humidity", 'sensor_name' : "S66" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Fan", 'sensor_name' : "S67" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Valve", 'sensor_name' : "S68" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S69" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S70" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Temperature", 'sensor_name' : "S71" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "CO2", 'sensor_name' : "S72" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Humidity", 'sensor_name' : "S73" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Fan", 'sensor_name' : "S74" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Valve", 'sensor_name' : "S75" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S76" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S77" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Temperature", 'sensor_name' : "S78" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "CO2", 'sensor_name' : "S79" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Humidity", 'sensor_name' : "S80" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Fan", 'sensor_name' : "S81" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Valve", 'sensor_name' : "S82" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S83" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S84" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Temperature", 'sensor_name' : "S85" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "CO2", 'sensor_name' : "S86" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Humidity", 'sensor_name' : "S87" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Fan", 'sensor_name' : "S88" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Valve", 'sensor_name' : "S89" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S90" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S91" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Temperature", 'sensor_name' : "S92" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "CO2", 'sensor_name' : "S93" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Humidity", 'sensor_name' : "S94" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Fan", 'sensor_name' : "S95" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Valve", 'sensor_name' : "S96" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S97" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S98" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Temperature", 'sensor_name' : "S99" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "CO2", 'sensor_name' : "S100" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Humidity", 'sensor_name' : "S101" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Fan", 'sensor_name' : "S102" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Valve", 'sensor_name' : "S103" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S104" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S105" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Temperature", 'sensor_name' : "S106" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "CO2", 'sensor_name' : "S107" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Humidity", 'sensor_name' : "S108" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Fan", 'sensor_name' : "S109" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Valve", 'sensor_name' : "S110" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Water", 'sensor_name' : "S111" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 1, 'sensor_type' : "Energy", 'sensor_name' : "S112" },

    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Water", 'sensor_name' : "S113" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Energy", 'sensor_name' : "S114" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Water", 'sensor_name' : "S115" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 2, 'sensor_type' : "Energy", 'sensor_name' : "S116" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Water", 'sensor_name' : "S117" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Energy", 'sensor_name' : "S118" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Water", 'sensor_name' : "S119" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 3, 'sensor_type' : "Energy", 'sensor_name' : "S120" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Water", 'sensor_name' : "S121" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Energy", 'sensor_name' : "S122" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Water", 'sensor_name' : "S123" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 4, 'sensor_type' : "Energy", 'sensor_name' : "S124" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 5, 'sensor_type' : "Water", 'sensor_name' : "S125" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 5, 'sensor_type' : "Energy", 'sensor_name' : "S126" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 6, 'sensor_type' : "Water", 'sensor_name' : "S127" },
    # {'customer_name' : "Bartlett", 'site_name' : "Feedspan" , 'building_name' : "Lotstring", 'floor_position' : 6, 'sensor_type' : "Energy", 'sensor_name' : "S128" },

]

heimdall_topic = "heimdall_monitor/0.1/development/Bartlett/Feedspan/Lotstring"
class CHDB_SENSOR_DATA:
    def __init__(self, index):
        self.sensor_index = index
                 
    def set_sensor_cfg(self, sensor_config) -> None:
        self.customer_name = sensor_config['customer_name']
        self.site_name = sensor_config['site_name']
        self.building_name = sensor_config['building_name']
        self.floor_position = sensor_config['floor_position']
        self.sensor_type = sensor_config['sensor_type']
        self.sensor_name = sensor_config['sensor_name']
        #self.topic = f"{self.site_name}/{self.floor_number}/{self.sensor_type}/{self.sensor_name}"
        #print(self.topic)
        
    def set_sensor_data(self, sensor_value) -> None:
        self.sensor_value = sensor_value



"""""
@dataclass
class mqtt:
    broker_ip: String
"""""
class CHDB_MQTT_PUB:
    def __init__(self, broker, port_number):
        self.client = None
        self.broker = broker
        self.port_number = port_number
        #self.topics_count = topics_count

    def connect_mqtt(self):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT Broker!")
            else:
                print("Failed to connect, return code %d\n", rc)
        def on_log(client, userdata, level, buf):
            #pass
            print("log: ",buf)
            
        self.client_id = f'subscribe-{random.randint(0, 100)}'
        self.client = mqtt.Client(self.client_id)
        # client.username_pw_set(username, password)
        #self.client = mqtt.Client("facility_management")
        self.client = mqtt.Client()
        self.client.on_connect = on_connect
        self.client.on_log = on_log
        #self.client.username_pw_set("clock", "clock123")
        self.client.connect(self.broker, self.port_number)


    def publish(self, sensor_data):
        #msg = f"{value}"

        print(f"Topic : {heimdall_topic}, value {sensor_data}")
        self.client.publish(heimdall_topic, sensor_data)

def main():
    sensor_count = len(sensor_configs)
    sensors_data = [CHDB_SENSOR_DATA(i) for i in range(sensor_count)]
    
    for data in sensors_data:
        data.set_sensor_cfg(sensor_config=sensor_configs[data.sensor_index])

    # broker_uri = "221a3edfcfef4303bddeb9408c05a6cd.s1.eu.hivemq.cloud"
    # broker_port = 8883
    broker_uri = "broker.hivemq.com"
    broker_port = 1883
    
    mqtt_client = CHDB_MQTT_PUB(
        broker= broker_uri, port_number=broker_port
        )

    mqtt_client.connect_mqtt()
    while True:
        for i in range (sensor_count):
            if sensors_data[i].sensor_type == 'Temperature':
                value = random.randint(35, 50)
            elif sensors_data[i].sensor_type == 'Humidity':
                value = random.randint(15, 80)
            elif sensors_data[i].sensor_type == 'CO2':
                value = random.randint(15, 30)
            elif sensors_data[i].sensor_type == 'FAN':
                value = random.randint(0,1)
            elif sensors_data[i].sensor_type == 'Valve':
                value = random.randint(0,100)
            elif sensors_data[i].sensor_type == 'Water':
                value = random.randint(500, 1500)  # Liters
            elif sensors_data[i].sensor_type == 'Energy':
                value = random.randint(100, 300)  # kWh
            
            sensors_data[i].set_sensor_data(value)
            #print(f"Publishing to topic {sensors_data[i].topic} --> value: {value}")
            message = {
                'customer_name' : sensors_data[i].customer_name,
                'site_name' : sensors_data[i].site_name,
                'building_name' : sensors_data[i].building_name,
                'floor_position' : sensors_data[i].floor_position,
                'sensor_type' : sensors_data[i].sensor_type,
                'sensor_name' : sensors_data[i].sensor_name,
                'value' : sensors_data[i].sensor_value
            }
            json_message = json.dumps(message)
            mqtt_client.publish(json_message)
            # with open('./sensor_pub.txt', 'a+') as file:
            #     file.write(str(message))

        time.sleep(30)

if __name__ == "__main__":
    main()
