import '../style/normalize.scss'
import '../style/minireset.scss'
import '../style/custom.scss'
import '../style/dev.scss'

import * as d3Selection from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Dsv from 'd3-dsv'
import * as d3Array from 'd3-array'
import * as d3Fetch from 'd3-fetch'
import * as d3Color from 'd3-color'
import * as d3Dispatch from 'd3-dispatch'
import * as d3Transition from 'd3-transition'
import * as d3Slider from 'd3-simple-slider'
import * as d3Geo from 'd3-geo'
const d3 = Object.assign({},d3Selection,d3Scale,d3Dispatch,d3Transition,d3Dsv,d3Array,d3Fetch,d3Slider,d3Color,d3Geo);

import {Component} from './modules/common/component';
import {MapComposition} from './modules/map/mapComposition';
import {DataCollection} from "./modules/common/dataCollection";


d3.select('body').append('h1').text('Résultats du premier tour');

const   nuances=new DataCollection("nuances");
        nuances.load("./assets/data/nuances.csv", { primary:"id" });

const   resultats=new DataCollection("resultats");
        resultats.load("./assets/data/sample.csv",
                        {   primary:"id",
                                    dtype: { circo:"int", pano:"int", nuanceId:"int", pct_exprimes:"float", pct_inscrits:"float", voix:"int"},
                                    mapper: d => { d.idcirco=`${d.id.substring(0,3)}-${d.id.substring(3,5)}`; return d; }}
                                );

function styleFunction (properties) {
    let fill=d3.hsl("#CCC"),
        stroke=d3.color('#fff'),
        strokeWidth=1;


    try{
        const data=properties.joined.sort((a,b) => d3.descending(a.voix,b.voix)),
            first = data[0];
        fill=nuances.map.get(first.nuanceId)[0].couleur;
        fill=d3.hsl(fill);
        //Election au premier tour
        if ( (first.pct_exprimes>50 && first.pct_inscrits>25) || true ){
            strokeWidth=1;
            stroke=fill.copy();
            stroke.l=.9;
        }
        //Ballottage
        else{
            fill.s*=.5;
            fill.l*=1.5;
        }

    }
    catch(error){
        console.warn(error);
    }
    return { fill: fill.formatHex(), stroke: stroke.formatHex(), strokeWidth:strokeWidth } ;
}

function renderDomLabels ()  {
    const fontSize=40;
    const doms = { x0: 60, y0: 1028, gap: 83 };
    this._container.append('text')
        .attr('x', doms.x0+15 )
        .attr('y', doms.y0-fontSize*2 )
        .text("Outremer")
        .style('font-size',`${fontSize*1.5}px`)
        .style('text-anchor','start');
    [971,972,973,974,975,976,977,986,987,988].forEach( (d,i)=> {
        this._container.append('text')
                        .attr('x',doms.x0 )
                        .attr('y', (doms.y0+i*doms.gap) )
                        .text(d)
                        .style('font-size',`${fontSize}px`)
                        .style('text-anchor','end');
    })
    const etranger=  { x0: 510, y0: 2050, gap: 117.5 };
    const label=this._container.append('text')
        .attr('x',doms.x0+20 )
        .attr('y', etranger.y0+fontSize )
        .style('font-size',`${fontSize*1.5}px`)
        .style('text-anchor','start');
    label.append('tspan').text("Français").attr('dx',0 ).attr('dy', 0 );
    label.append('tspan').text("de l'étranger").attr('x',doms.x0+20 ).attr('dy', fontSize*1.6 );
    for (let i=0;i<11;i++){
        this._container.append('text')
                        .attr('x',etranger.x0+i*etranger.gap )
                        .attr('y', etranger.y0 )
                        .text(i+1)
                        .style('font-size',`${fontSize}px`)
                        .style('text-anchor','middle');
    }
}




const myMap=new MapComposition( 'CarteFrance', { width:2000, height:2200, margins:10 } )
                .appendTo(null);

Promise.all([nuances.ready, resultats.ready]).then(()=>{

    myMap.layer('circos', {  type:'path', source:'./../assets/geodata/circonscriptions-simplifie.topojson', primary:'ID', autofit:true, clickable:true })
        .load()
        .fit( )  //
        .render()
        .on('click', d=>console.log(d))
        .join(resultats,"idcirco")
        .fill(styleFunction);
    myMap.layer('depts', {  type:'path', source:'./../assets/geodata/departements-simplifie.topojson', primary:'DEP', autofit:"auto", clickable:false })
        .load()
        .render();
    myMap.layer('labels', {type:'custom', render: renderDomLabels})
        .render();







})






setTimeout(()=>{
    console.log('FIT');
    myMap.layer('circos').fit(d=>d.properties.REG==='84').render();
},2000)
