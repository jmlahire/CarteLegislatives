import {Component} from '../common/component.js'

import * as d3Selection from 'd3-selection';
import * as d3Timer from 'd3-timer';
import * as d3Dispatch from 'd3-dispatch';
import * as d3Drag from 'd3-drag';
const d3=Object.assign({},d3Selection,d3Timer,d3Dispatch,d3Drag);



class Panel extends Component{

    static _type='_Panel';
    static defaultOptions = { anchor: 'right', width: '80%', height:'80%', minWidth:250, handleWidth:'1.3rem', handleText:'Légende', initialPosition: 'folded', duration: 1000, delay:0, timer:500000  };

    /**
     * CONSTRUCTEUR
     * Crée un panneau latéral amovible
     *
     * @param {String} id                      Identifiant
     * @param {Object} options={}              Options:
     * @param {String} options.anchor               Ancrage (right par défaut)
     * @param {String} options.width                Largeur du panneau en % de l'élement parent
     * @param {String} options.height               Hauteur du panneau en % de l'élement parent
     * @param {String} options.handleWidth          Largeur de la poignée en pixels
     * @param {String} options.maxWidth             Largeur maximale du apnneau en pixels
     * @param {String} options.initialPosition      Position initiale (folded ou unfolded)
     * @param {Number} options.duration             Durée des transitions
     * @param {Number} options.delay                Délai des transitions
     * @param {Number} options.timer                Délai avant que le panneau se replie automatiquement (désactivé si 0 ou nul)
     *
     */
    constructor(id, options){
        super(id);
        this._options = {...Panel.defaultOptions,...options};
        this._position = this._options.initialPosition;
        this._dispatch = d3.dispatch('position');
        this._timer=new d3.timeout( () => {}, 0);
        this._outerContainer = d3.create('div').classed(Panel._type,true).classed('right',true);
        this._handle = this._outerContainer.append('div').classed('handle',true);
        this._innerContainer = this._outerContainer.append('div').classed('content',true);

        this._pos = { };
        this._outerContainer
            .on('click',(e)=>{
                if (this._position==='unfolded') {
                    this.fold();
                    this._outerContainer.call(d3.drag().on('start',null).on('end',null));
                }
                else {
                    this.unfold();
                    this._outerContainer.call(  d3.drag()
                        .on("start", (e)=>{
                            if (this._position==='folded') this.unfold();
                            else {
                                this._pos.x=e.x;
                                this._pos.y=e.y;
                            }
                        })
                        .on("end", (e)=>{
                            if (this._position==='folded') this.unfold();
                            else {
                                if (this._options.anchor==='right' && e.x>this._pos.x+5) this.fold();
                            }
                        })
                    )
                }
            });


    }


    appendTo(parent){
        super.appendTo(parent);
        this._parent.container.style('overflow','hidden');
        this.resize();
        return this;
    }

    /**
     * Calcule les dimensions du panneau par rapport à l'élement parent, et le redimensionne
     * @returns {Panel}
     */
    resize(){

        this.size={ width:undefined, height:undefined, handle:undefined };

        //Calcul dimensions parent
        const parentSize = this._parent.container.node().getBoundingClientRect();

        ['width','height'].forEach( (k) => {
            this.size[k]=Panel._convertLengthToPx(this._options[k],parentSize[k]);
        })
        if (this._options.maxWidth) this.size.width=Math.min( this.size.width, Panel._convertLengthToPx(this._options.maxWidth) , parentSize.width );
        if (this._options.minWidth) this.size.width=Math.max( this.size.width, Panel._convertLengthToPx(this._options.minWidth));

        //Dimensionnement du panel
        this.outerContainer
            .style('top',`${(parentSize.height-this.size.height)/2}px`)
            .style('width',`${this.size.width}px`)
            .style('height',`${this.size.height}px`);
        //Dimensionnement et positionnement poignée
        this.size.handle=Panel._convertLengthToPx(this._options.handleWidth, this.size.width);
        this._handle
            .style('width',`${this.size.handle}px`)
            .style('height',`${this.size.height}px`);
        this._handle.append('span')
            .style('line-height',`${this.size.height}px`)
            .style('font-size',`${this.size.handle*.7}px`)
            .text('◀')
            .classed('txt',()=>this._options.handleText)
            .filter(()=>this._options.handleText)
                .text(this._options.handleText)
                .style('transform',`translateX(-${this.size.handle*1.05}px) rotate(-90deg)`);

        //Dimensionnement et positionnement contenu
        this.size.content=this.size.width-this.size.handle;
        this.innerContainer
            .style('left',`${this.size.handle}px`)
            .style('width',`${this.size.width-this.size.handle}px`)
            .style('height',`${this.size.height}px`);
        //Position initiale
        if (this._options.initialPosition==='unfolded')
            this.outerContainer
                .classed('unfolded',true)
                .style('right','0px');
        else {
            this.outerContainer
                .classed('folded',true)
                .style('right',`-${this.size.content}px`);
        }
        return this;
    }


    /**
     * Convertit une longueur (en pixels, rem ou % d'un element dont la dimension est passée en argument) en longueur en pixels
     * @param {String|Number} value
     * @param {Number} [reference]  dimension de l'element de réference si la longueur est exprimée en %
     * @returns {number}
     * @private
     */
    static _convertLengthToPx (value, reference) {
        if (!isNaN(value)){
            return value;
        }
        else if (value.includes('%') && reference!==undefined){
            return reference*parseFloat(value)/100;
        }
        else if (value.includes('rem')) {
            return parseFloat(value) * parseFloat(getComputedStyle(document.documentElement).fontSize);
        }
        else {
            return parseInt(value);
        }
    }

    /**
     * Replie le panneau
     * @param {Object} options              Options:
     * @param {Number} options.duration         Durée des transitions
     * @param {Number} options.delay            Délai des transitions
     * @returns {Panel}
     */
    fold(options={}){
        options={...this._options,...options};
        this._timer.stop();
        this.enqueue( () => new Promise((resolve, reject) => {

            this.outerContainer
                .transition()
                .duration(options.duration)
                .delay(options.delay)
                .style('opacity',.5)
                .style('right',`-${this.size.content}px`)
                .on('end', () => {
                    this._dispatch.call('position',this,{action: 'folded'});
                    this._position = 'folded';
                    this.outerContainer.classed('folded',true).classed('unfolded',false);
                    resolve(this);
                });

        }));
        return this;
    }

    /**
     * Déplie le panneau
     * @param {Object} options              Options:
     * @param {Number} options.duration         Durée des transitions
     * @param {Number} options.delay            Délai des transitions
     * @returns {Panel}
     */
    unfold(options={}){
        options={...this._options,...options};
        if (this._options.timer) this._timer.restart( this.fold.bind(this), this._options.timer);
        this.enqueue( () => new Promise((resolve, reject) => {
            this.outerContainer
                .transition()
                .duration(options.duration)
                .delay(options.delay)
                .style('opacity',1)
                .style('right','0px')
                .on('end', ()=> {
                    this._dispatch.call('position',this,{action: 'unfolded'});
                    this._position = 'unfolded';
                    this.outerContainer.classed('unfolded',true).classed('folded',false);
                    resolve(this);
                });
        }));
        return this;
    }



}

export {Panel}