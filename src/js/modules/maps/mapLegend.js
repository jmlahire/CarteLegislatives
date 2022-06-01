import {Component} from "./../common/component.js";

//import '../../../style/modules/maps/mapLegend.scss'

import * as d3Selection from 'd3-selection'
import * as d3Dispatch from 'd3-dispatch'

const d3=Object.assign({},d3Selection,d3Dispatch);

class MapLegend extends Component {

    static _type='_mLeg';

    /**
     * CONSTRUCTEUR
     * Objet SVG servant de conteneur à la légende
     * @param {String}          id                   Identifiant
     */
    constructor(id, title='Légende' ) {
        super(id);
        this._outerContainer=d3.create('div').classed(MapLegend._type,true);
        this._outerContainer.append('h4').text(title);
        this._innerContainer=this._outerContainer.append('div');

    }

    categories(data,meta={}){
        this._innerContainer.attr('class','vertical categories');
        this._innerContainer.selectAll("figure")
            .data(data,d=>d.id)
            .join(
                enter => enter.append("figure")
                                .each(function(d){
                                    const elt = d3.select(this);
                                    elt.append('span')
                                        .attr('class','color')
                                        .style('background',d[meta.color])
                                        //.attr('title', d=>d[meta.name])
                                        .on('click',(d)=> elt.select('span+span').style('display','block'));
                                    let figcaption = elt.append('figcaption')
                                    figcaption.append('span').text(`${d[meta.name]} (${d[meta.shortName]})`);

                                }),
                update => update,
                exit => exit.remove()
            );
        return this;
    }

}

export {MapLegend}

