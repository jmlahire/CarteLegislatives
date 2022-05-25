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

class MapPath extends MapLayer {

    static defaultOptions= { primary:'ID', autofit:"auto", clickable:true };

    /**
     * CONSTRUCTEUR
     * @param {String} id - Identifiant
     * @param {MapComposition} parent - instance parente MapComposition
     * @param {Object} options   -  Si true, recadre la carte sur le calque
     * @param {String} options.primary='ID' - clé primaire des données géographiques
     * @param {Boolean|String} options.autofit="auto" - si true, zoome et recentre toute la carte sur le contenu du calque. Si false, aucune action. Si "auto", utilise l'autofit du calque dont autofit=true
     * @param {Boolean} options.clickable=true - si vrai, les polygones sont clickables
     */
    constructor(id,parent, options = {} ){
        super(id, parent);
        this._options = {...MapPath.defaultOptions, ...options };
    }

    /**
     * Limite le zoom et le déplacement au contenu du calque
     * @returns {MapPath}
     */
    fit(filterFn=(d)=>true){
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            const focused = this.geodata.filter( filterFn );
            this.projection.fitExtent( [[0,0], [this.parent.size.effectiveWidth, this.parent.size.effectiveHeight]], {type:"FeatureCollection", features: focused }  );
            resolve(this)
        }));
        return this;
    }


    /**
     * Charge les données géographiques du calque
     * @param {String|Number} [arg] - paramètre optionnel à passer à this._options.source si cette dernière est une fonction (chargement dynamique)
     * @returns {MapPath}
     */
    load(arg){
        const source = (this._options.source instanceof Function) ? this._options.source(arguments[0]) : this._options.source;
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            d3.json(source)
                .then( (topology) => {
                    this.geodata = topojson.feature(topology, Object.getOwnPropertyNames(topology.objects)[0]).features;
                    resolve(this.geodata);
                })
        }) );
        return this;
    }

    /**
     * Lance le rendu du calque
     * @returns {MapPath}
     */
    render(){
        //if (this._options.autofit===true) this.fit();
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            this.path.projection(this.projection);
            this._container
                    .selectAll("path")
                    .data(this.geodata)
                    .enter()
                    .append('path')
                    .attr('class', d => `path _${d.properties[this._options.primary]}` )
                    .classed('clickable',this._options.clickable)
                    .attr('d', this.path)
                    .on('click', (e,d) => (this._options.clickable ) ? this._dispatch.call('click', this, { event:e, values: d.properties, id :d.properties[this._options.primary]} ) : null );
            resolve(this);
        }))
        return this;
    }

    /**
     * Fusionne un jeu de données externe (elles seront ajoutées à d.properties)
     * @param {DataCollection} dataCollection - données sous forme DataCollection
     * @param {String=} [dataKey=dataCollection.primary] - clé primaire des données externes. Si vide, utilise la clé primaire de l'objet DataCollection
     * @param {String} [geoKey= this._options.primary] - clé primaire des données géographiques à utiliser. Si vide, la méthode utilise la clé primaire des données géo
     * @returns {MapLayer}
     */
    join(dataCollection, dataKey, geoKey){
        geoKey = geoKey || this._options.primary;
        dataKey = dataKey || dataCollection.primary;
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            dataCollection.ready.then( (data)=> {
                data=data.exportToMap(dataKey);
                this._container.selectAll("path")
                    .each( (d) => {
                        d.properties.joined =  d.properties.joined || [];
                        const   id = d.properties[geoKey],
                                datum = data.get(id);
                        if (datum) d.properties.joined.push(...datum);
                    });
                resolve(this);
            });
        }));
        return this;
    }

    /**
     * Calcule les domaines (et les moyennes et médianes) des données contenues dans d.properties: ils seront disponibles dans this.metadata
     * @param {Array|String} keys - clés des données dont il faut calculer les statistiques
     * @param {Array} [type]  - statistiques à calculer parmi les suivantes: domain, sum, count, median, deviation
     */
    statistics(keys, types=['domain','mean']){
        const   calcRound = (v) => Math.round(v*10000)/10000;
        const   calcFunction = {
            domain:d3.extent,
            sum:d3.sum,
            count:d3.count,
            mean: (v) => calcRound(d3.mean(v)),
            median: (v) => calcRound(d3.median(v)),
            deviation: (v) => calcRound(d3.deviation(v,.1))
        }
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            this.metadata = this.metadata || {};
            if (typeof keys === 'string') keys = [keys];
            types.forEach( prop => this.metadata[prop]= this.metadata[prop] || {} );
            types=types.reduce((a, v) => ({ ...a, [v]: true}), {});
            Object.keys(calcFunction)
                .forEach( (t) => {
                    keys.forEach((k) => {
                        let data = this.geodata.map(d => d.properties[k]);
                        if (types[t]) this.metadata[t][k]=calcFunction[t](data);
                    })
                });
            resolve(this);
        }));
        return this;

    }

    fill(styleFunction){
        this.parent.enqueue( () => new Promise((resolve, reject) => {
            this._container.selectAll("path")
                .each( (d,i,n) => {
                    let style=styleFunction(d.properties);
                    if (style.fill) d3.select(n[i]).style('fill',style.fill);
                    if (style.stroke) d3.select(n[i]).style('stroke',style.stroke);
                    if (style.strokeWidth) d3.select(n[i]).style('stroke-width',style.strokeWidth);
                });
            resolve(this);
        }));
        return this;
    }





}

export {MapPath}