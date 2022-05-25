import {Component} from './component'

import * as d3Selection from 'd3-selection'
const d3=Object.assign({},d3Selection);



class SvgSize {

    constructor( {width ,height, margins} ){
        this.width = width;
        this.height = height;
        this.margins = (isNaN(margins))? margins : { top:margins, right:margins, bottom: margins, left:margins };
        this._update();
        //Proxy
        const handler={
            get(target,prop){
                if (typeof target[prop]==='object' && target[prop] !== null) return new Proxy(target[prop],handler);
                else return target[prop];
            },
            set(target,prop,value){
                target[prop]=value;
                target._update();
                return true;
            }
        }
        return new Proxy(this,handler);

    }

    _update(){
        this.effectiveWidth=this.width-this.margins.left-this.margins.right;
        this.effectiveHeight=this.height-this.margins.top-this.margins.bottom;
    }

}

class Svg extends Component {

    /**
     * Constructeur
     * @param id
     * @param size
     */
    constructor(id, width =2000, height=1200, margins=  { top: 50, right: 50,bottom: 50, left:50 } ){
        super(id);
        this.size = new SvgSize({width,height,margins} );
        this._outerContainer=d3.create('svg:svg')
                                    .attr('id',this.id)
                                    .attr('class',this.constructor.name)
                                    .attr(`preserveAspectRatio`, 'xMaxYMin meet')
                                    .attr('viewBox', `0 0 ${this.size.width} ${this.size.height}`)
                                    .attr('width', `100%`);
        this._innerContainer=this._outerContainer.append('svg:g')
                                    .attr('class','svgContent')
                                    .attr('transform',`translate(${this.size.margins.left} ${this.size.margins.top})`);
    }

    get outerContainer(){
        return this._outerContainer;
    }

    get innerContainer(){
        return this._innerContainer;
    }

    get container(){
        return this._innerContainer;
    }

}

export {Svg}