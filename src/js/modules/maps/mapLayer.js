import {MapComposition} from "./mapComposition.js"
import {Component} from './../common/component.js'

import * as d3Selection from 'd3-selection'
import * as d3Transition from 'd3-transition'
import * as d3Ease from 'd3-ease'
import * as d3Geo from 'd3-geo'
import * as d3Zoom from 'd3-zoom'
import * as d3Dispatch from 'd3-dispatch'

const d3=Object.assign({},d3Selection,d3Geo,d3Zoom,d3Transition,d3Ease,d3Dispatch);

class MapLayer extends Component {


    /**
     * CONSTRUCTEUR
     * @param {String} id   Identifiant
     * @param {String} [className]   Classe optionnelle
     * @param {MapComposition} parent   Conteneur oarent (instance de MapComposition)
     */
    constructor(id,className='', parent){
        super(id);
        this._dispatch = d3.dispatch('click');
        this._container = d3.create('svg:g')
                                .attr('id',this.id)
                                .style('opacity',0)
                                .classed(className,className);
        this.appendTo(parent);
    }

    /**
     * Alias vers l'instance de la carte parent
     * @returns {MapComposition}
     */
    get parent(){
        return this._parent.component;
    }

    /**
     * Renvoie la projection de la carte parent
     * @returns {*|Function}
     */
    get projection(){
        return this.parent.projection || d3.geoMercator();
    }

    /**
     * Renvoie la fonction path de la carte parent
     * @returns {*}
     */
    get path(){
        return this.parent.path || d3.geoPath();
    }














}

export {MapLayer}