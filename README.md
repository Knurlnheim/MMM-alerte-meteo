# MMM-alerte-meteo
A MagicMirror module that displays Weather alerts from french service

# Installation
Clone this repo, and in the resulting directory, run "npm install"

# Configuration
In your module in config.js, add :
{
        module: "MMM-alerte-meteo",
        header: "Vigilance Météo :",
        position: "top_right",  // position
        disabled: false,
        config: {
                dptsList: [  // Array with ids and labels to watch
                        { id: '57', label: 'Moselle' },
                        { id: '59', label: 'Nord' },
                        { id: '62', label: 'Pas-de-Calais' }
                ],
        }
},
