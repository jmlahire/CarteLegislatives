import {MapLayer} from './mapLayer.js'

//import '../../../style/modules/maps/mapCustom.scss'

import * as d3Selection from 'd3-selection'
import * as d3Transition from 'd3-transition'
import * as d3Fetch from 'd3-fetch'
import * as d3Array from 'd3-array'
import * as d3Ease from 'd3-ease'
import * as d3Geo from 'd3-geo'
import * as d3Zoom from 'd3-zoom'
import * as d3Dispatch from 'd3-dispatch'
const d3=Object.assign({},d3Selection,d3Fetch,d3Array,d3Geo,d3Zoom,d3Transition,d3Ease,d3Dispatch);

class MapCustom extends MapLayer {

    static _type='_mCust';

    /**
     * CONSTRUCTEUR
     * @param {String} id - Identifiant
     * @param {MapComposition} parent - instance parente MapComposition
     * @param {Object} options   -  Si true, recadre la carte sur le calque
     * @param {Function} options.render - clé primaire des données géographiques
     */
    constructor(id,parent, options = {} ){
        super(id, MapCustom._type, parent);
        this._render=options.render;
    }


    /**
     * Lance le rendu du calque
     * @returns {MapPaths}
     */
    render(){
        this._render.call(this);
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            this.fadeIn({duration:1000});
            resolve(this);
        }))
        return this;
    }






}

export {MapCustom}