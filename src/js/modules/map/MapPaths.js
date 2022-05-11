import {MapLayer} from './mapLayer.js'

import * as d3Selection from 'd3-selection'
import * as d3Transition from 'd3-transition'
import * as d3Fetch from 'd3-fetch'
import * as d3Array from 'd3-array'
import * as d3Ease from 'd3-ease'
import * as d3Geo from 'd3-geo'
import * as d3Zoom from 'd3-zoom'
import * as d3Dispatch from 'd3-dispatch'
import * as topojson from 'topojson-client'

const d3=Object.assign({},d3Selection,d3Fetch,d3Array,d3Geo,d3Zoom,d3Transition,d3Ease,d3Dispatch);

class MapPaths extends MapLayer {

    /**
     * CONSTRUCTEUR
     * @param {String}          id          Identifiant
     * @param {MapComposition}  parent      Object MapComposition parent
     * @param {Boolean}         autofit     Si true, recadre la carte sur le calque
     */
    constructor(id,parent, autofit= true){
        super(id,parent,autofit);
    }

    /**
     * Limite le zoom et le déplacement au contenu du calque
     * @returns {MapLayer}
     */
    fit(){
        this.projection.fitExtent( [[0,0], [this.parent.size.effectiveWidth, this.parent.size.effectiveHeight]],
            {type:"FeatureCollection", features: this.geodata}  );
        return this;
    }



    load(file){
        this._loading = new Promise((resolve, reject) => {
            d3.json(file)
                .then( (topology) => {
                    this.geodata = topojson.feature(topology, Object.getOwnPropertyNames(topology.objects)[0]).features;
                    console.log(this.geodata);
                    resolve(this.geodata);
                })
        });
        this.enqueue( () => this._loading );
        return this;
    }



}

export {MapPaths}