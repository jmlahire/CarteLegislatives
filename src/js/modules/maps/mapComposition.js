import {Svg} from '../common/svg.js'
import {MapPath} from './mapPath.js'
import {MapCustom} from './mapCustom.js'

import * as d3Selection from 'd3-selection'
import * as d3Transition from 'd3-transition'
import * as d3Ease from 'd3-ease'
import * as d3Geo from 'd3-geo'
import * as d3Zoom from 'd3-zoom'
import * as d3Dispatch from 'd3-dispatch'
const d3=Object.assign({},d3Selection,d3Geo,d3Zoom,d3Transition,d3Ease,d3Dispatch);



class MapComposition extends Svg{

    static _type='_mComp';
    static defaultOptions= { duration: 500, delay:0, projection: d3.geoMercator(), freezoom: false};

    /**
     * CONSTRUCTEUR
     * Objet SVG servant de contenur aux calques
     * @param {String}          id                   Identifiant
     * @param {Object}          size                 Dimensions du svg
     * @param {Number}          size.width           Largeur
     * @param {Number}          size.height          Hauteur
     * @param {Number|Object}   size.margins         Marges
     * @param {Object}          options              Marges
     * @param {Number}          options.duration     Durée des animations (zoom)
     * @param {Number}          options.delay        Délai des animations (zoom)
     * @param {Function}        options.projection   Methode de projection
     * @param {Boolean}         options.freezoom     Zoom libre autorisé ou non
     */
    constructor(id, size={}, options={}){
        super(id, size.width, size.height, size.margins);
        this._options = {...MapComposition.defaultOptions,...options};
       // this.outerContainer.classed(MapComposition._type,true);

        this._layers = new Map();
        this._defs = this.outerContainer.append('defs').lower();
        this._dispatch = d3.dispatch('zoom');
        //this._zoomEvent={e:null,level:1,source:null};
        this._zoomSource=this.outerContainer;
        this._zoom = d3.zoom()
                        .filter( (e) => !e.button && e.type != "dblclick" )
                        .scaleExtent([1, 15])
                        .translateExtent([[0, 0], [this.size.width, this.size.height]])
                        .on('zoom', (e) => this._handleZoom.call(this,e) );
        this._zoomSource.call(this._zoom);
       // this.freezoom(this._options.freezoom);

        this.projection = this._options.projection;
        this.path = d3.geoPath();
    }


    /**
     * Crée ou renvoie (si aucun paramètre optionnel) un calque de la carte
     * @param {String} id - Identifiant
     * @param {Object} [options] - Options
     * @param {String} [options.type] - Type de calque: path, point, custom, voronoi
     * @param {String} [options.source] - Fichier à charger (path,point,voronoi)
     * @param {String} [options.primary] - Clé primaire (path,point,voronoi)
     * @param {Boolean} [options.autofit] - Indique s'il faut centrer la carte sur le calque courant (path,point,voronoi)
     * @param {Boolean} [options.clickable] - Indique si les entites sont cliquables (path,point,voronoi)
     * @returns {MapPath|*}
     */
    layer(id,options){
        if (arguments.length===1) {
            return this._getLayer(id);
        }
        else if (arguments.length>1) {
            return this._addLayer(id,options);
        }
    }

    /**
     * Crée un nouveau calque
     * @param {String} id   identifiant
     * @param {Object} options
     * @param {String} options.type='path'|'custom'  type de calque
     * @returns {MapPath|MapCustom}
     * @private
     */
    _addLayer(id,options){
        let newLayer;
        if (options.type==='path') newLayer = new MapPath(id,this,options);
        else if (options.type==='custom')  newLayer = new MapCustom(id,this,options);
        this._layers.set( id, newLayer);
        return newLayer;
    }

    /**
     * Renvoie le calque dont l'identifiant est passé en paramètre
     * @param {String} id   identifiant
     * @returns {MapPath|MapCustom|MapVoronoi}
     * @private
     */
    _getLayer(id){
        return this._layers.get(id);
    }


    /**
     * Redessine tous les calques (utile par exemple en cas de modification de la projection)
     * @returns {MapComposition}
     */
    render(){
        this._layers.forEach( (layer,key)=> {console.log(layer); layer.render();} );
        return this;
    }

    frjjjjjjjjjjjjjeezoom(bool=true){
        //  this.enqueue( () => new Promise((resolve, reject) => {
        if (bool) {
            this._zoom.filter((e) => true);
            this._freezoom = true;
        } else {
            // this.zoom.filter((e) => e);
            this._zoom.scaleExtent([1, 1]);  //empeche l'appel à handleZoom
            this._freezoom = false;
        }
        //     resolve(this);
        //   }));
        return this;
    }

    /**
     * Méthode interne appelée lors du zoom
     * @param e
     * @private
     */
    _handleZoom(e) {

            //e.transform.k=1;
            /*
                    console.log('zoom level', e.transform.k,this._zoomEvent);
                    if ((e.sourceEvent && !this._zoomEvent.source) || (!e.sourceEvent && this._zoomEvent.source))  {
                        //if (this.state.zoomEvent.source!==e.sourceEvent.constructor.name)
                        console.warn('change!!!');
                      //  console.log(this.state.animationPending);
                    }*/



            //Zoom programmatique
            //e.stopPropagation();

            //  console.log('zoom level', e.transform.k,this._zoomEvent);
        this._zoomEvent = {
            e: e.sourceEvent,
            source: (e.sourceEvent) ? e.sourceEvent.constructor.name : null,
            level: e.transform.k
        };


    //    console.log(e.transform);
            if (e.sourceEvent === null) {

                //Transformation
                this.innerContainer.attr('transform', `translate(${this.size.margins.left + e.transform.x} ${this.size.margins.top + e.transform.y}) scale(${e.transform.k})`);
                //Maintien de l'échelle et disparition des étiquettes
                /*const labels=this.innerContainer.selectAll('text.label')
                if (e.transform.k<4)  labels.classed('invisible',true)
                else labels.classed('invisible',false);
                labels.style('font-size',`${24/e.transform.k}px`);*/
                //Dispatch
                this._dispatch.call('zoom', this, {level: e.transform.k, source: e.sourceEvent});

            }
            //Zoom manuel
            else if (e.sourceEvent instanceof MouseEvent) {

                // this._zoomEvent= { e:e.sourceEvent, source: (e.sourceEvent)?e.sourceEvent.constructor.name:null ,level:e.transform.k };
            }
            // console.log(this._zoomEvent);

    }

    /**
     * Zoome sur une sélection d'élements svg
     * @param {d3-selection} selection  : selection d3
     * @param {Number} zoomMargin          fixe la proportion des marges autour de la sélection zoomée (1 cadré serré, 0.5 cadré sur la moitié de la zone, etx...)
     */
    zoomTo(selection, options={ }){
        const _options = { zoomMargin:.95 };
        this.enqueue( () => new Promise((resolve, reject) => {
            selection = selection.nodes();
            //Calcul du zoom
            const getBoundaries = (selection) => {
                const bounds = {x1: Infinity, x2: -Infinity, y1: Infinity, y2: -Infinity};
                for (let i = 0; i < selection.length; i++) {
                    bounds.x1 = Math.min(selection[i].getBBox().x, bounds.x1);
                    bounds.y1 = Math.min(selection[i].getBBox().y, bounds.y1);
                    bounds.x2 = Math.max(selection[i].getBBox().x + selection[i].getBBox().width, bounds.x2);
                    bounds.y2 = Math.max(selection[i].getBBox().y + selection[i].getBBox().height, bounds.y2);
                }
                return bounds;
            }
            const bounds = getBoundaries(selection),
                hscale = this.size.effectiveWidth / (bounds.x2 - bounds.x1),
                vscale = this.size.effectiveHeight / (bounds.y2 - bounds.y1),
                scale = Math.min(hscale, vscale)*_options.zoomMargin,
                offset = {
                    x: -bounds.x1 * scale + (this.size.effectiveWidth - (bounds.x2 - bounds.x1) * scale) / 2,
                    y: -bounds.y1 * scale + (this.size.effectiveHeight - (bounds.y2 - bounds.y1) * scale) / 2
                };
            const finalTransform = d3.zoomIdentity
                .translate(offset.x, offset.y)
                .scale(scale);
            this._zoomSource
                .transition()
                .delay(this._options.delay)
                .duration(this._options.duration)
                .call(this._zoom.transform, finalTransform)
                .on('end', () => {

                    this._zoom.scaleExtent([1, finalTransform.k * 4]);
                    this.outerContainer.call(this._zoom.filter( (e) => !e.button && e.type != "dblclick" ), finalTransform);
                         resolve(this);
                })
        }));

        return this;

    }

    zoomOut(){

        this.enqueue( () => new Promise((resolve, reject) => {
            let finalTransform = d3.zoomIdentity
                .translate(0, 0)
                .scale(1);
            this._zoomSource
                .transition()
                .delay(this._options.delay)
                .duration(this._options.duration)
                .call(this._zoom.transform, finalTransform)
                .on('end', () => {
                    this._zoom.scaleExtent([1, finalTransform.k * 4]);
                    this.outerContainer.call(this._zoom, finalTransform);
                  //  this.container.selectAll('g#departements path.area').style('pointer-events','visible'); //Hack degueu
                   // this.freezoom (this.options.zoomable);
                    resolve(this);
                });
        }));
        // this.enqueue( () => this.state.animationPending);
        return this;
    }

    fadeOutLayers(selector){
        //  this.enqueue( () => new Promise((resolve, reject) => {
        this.container.selectAll(`g${selector}`)
            .transition()
            .duration(this._options.duration / 2)
            .style('opacity', 0)
            .on('end', (d, i, n) => {
                d3.select(n[i]).style('display', 'none');
                //   resolve(this);
            });
        //    }));
        return this;
    }

    fadeInLayers(selector){
        // this.enqueue( () => new Promise((resolve, reject) => {
        this.container.selectAll(`g${selector}`)
            .style('display', 'auto')
            .transition()
            .duration(this._options.duration / 2)
            .style('opacity', 1);
        //        .on('end', ()=>resolve(this));
        //  }));
        return this;
    }




}

export {MapComposition}