import {Component} from "./../common/component.js";

import '../../../style/modules/maps/mapLegend.scss'

import * as d3Selection from 'd3-selection'
import * as d3Dispatch from 'd3-dispatch'

const d3=Object.assign({},d3Selection,d3Dispatch);

class MapLegend extends Component {



    /**
     * CONSTRUCTEUR
     * Objet SVG servant de conteneur à la légende
     * @param {String}          id                   Identifiant
     */
    constructor(id ) {
        super(id);
        this._outerContainer=d3.create('div').classed('_mapLegend',true);
        this._innerContainer=this._outerContainer.append('ul');

    }

    categories(data,meta={}){
        this._innerContainer.attr('class','categories');
        this._innerContainer.selectAll("li")
            .data(data,d=>d.id)
            .join(
                enter => enter.append("li")
                                .each(function(d){
                                    const elt = d3.select(this);
                                    elt.append('span').attr('class','color').style('background',d[meta.color])
                                        .attr('title', d=>d[meta.name]);
                                    elt.append('span').text(d[meta.shortName]);
                                }),
                update => update,
                exit => exit.remove()
            );
        return this;
    }

}

export {MapLegend}

