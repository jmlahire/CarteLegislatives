import '../style/main.scss'


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

import {MapComposition} from './modules/maps/mapComposition';
import {MapLegend} from './modules/maps/mapLegend';
import {DataCollection} from "./modules/common/dataCollection";
import {NestedSelection} from "./modules/navigation/nestedSelection";
import {Synthese} from './modules/custom/synthese';
import {Panel} from './modules/navigation/panel';
import {getHostColor} from './modules/common/fnUrl';


d3.select('#header span.keyword').style('background',getHostColor).style('color','#FFF');
d3.selectAll('#header h1,#header h2').style('color',getHostColor);



/**********************************************************************
 ***************************** DONNEES*********************************
 **********************************************************************/

const   nuancesPol = new DataCollection("nuances")
                        .load("./assets/data/nuances.csv", { primary:"id" });

const   listeCircos = new DataCollection('listeCircos')
                        .load( "./assets/data/listecircos.csv",
                        {   delimiter:';',
                                    primary:'CIRCO_ID',
                                    dtype: { CIRCO_ID:"string"}} );


const   resultats = new DataCollection("resultats")
                        .load("./assets/data/sample.csv",
                        {   primary:"id",
                                    dtype: { circo:"int", pano:"int", nuanceId:"int", pct_exprimes:"float", pct_inscrits:"float", voix:"int"},
                                    mapper: d => { d.idcirco=`${d.id.substring(0,3)}-${d.id.substring(3,5)}`; return d; }}
                                );




/**********************************************************************
 ************************ FONCTIONS ET METHODES ***********************
 **********************************************************************/


/**
 * Calcule et renvoie différentes stats à partir du fichier résultats et nuancesPol
 * @param {DataCollection} nuancesPol
 * @returns {{nuances: {compteur: {tete: any[], qualif: any[]}, list: Set<any>}, synthese: {quadrang: Map<any, any>, triang: Map<any, any>, elus: Map<any, any>, duels: Map<any, any>}}}
 */
resultats.statistics=function(nuancesPol){
    const   dataKey='idcirco',
            dataset = this.toGroups(dataKey,'map');
    let nuancesList = new Set(),          //Nuances arrivées en tête dans au mojns une circo
        nuancesCompteur = { tete: new Array(nuancesPol.map.size).fill(0 ), qualif: new Array(nuancesPol.map.size).fill(0 ) },
        syntheseResultats = { elus : new Map(), duels: new Map(), triang: new Map(), quadrang:new Map() };
    function addColors(values){
        values.forEach( v =>{
            v.nuanceCol=nuancesPol.map.get(v.nuanceId)[0].couleur;
        });
    }

    for (const [key,value] of dataset) {
        nuancesList.add(nuancesPol.map.get(value[0].nuanceId)[0]);
        nuancesCompteur.tete[value[0].nuanceId]++;
        addColors(value);
        value.forEach((v, i) => {
            nuancesCompteur.qualif[v.nuanceId]++;
        });
        switch (value.length) {
            case 1:
                if (value[0].pct_exprimes > 50 && value[0].pct_inscrits > 25) syntheseResultats.elus.set(key, value[0]);
                break;
            case 2:
                syntheseResultats.duels.set(key, value);

                break;
            case 3:
                syntheseResultats.triang.set(key, value);
                break;
            case 4:
                syntheseResultats.quadrang.set(key, value);
                break;
        }
    }
    nuancesList=Array.from(nuancesList)
        .map(d=> Object.assign(d, { tete: nuancesCompteur.tete[d.id], qualif : nuancesCompteur.qualif[d.id]}))
        .sort((a,b)=> d3.descending(a.tete,b.tete));

    return { nuances: { compteur: nuancesCompteur, list: nuancesList }, synthese: syntheseResultats };

}


/**
 * Fonction utilisée pour le remplissage de la carte
 * @param properties
 * @returns {{fill: string}}
 */
function mapFillingFunction (properties) {

    const blank='#ccc';
    let fill = blank;

    try{
        const   data=properties.JDATA.sort((a,b) => d3.descending(a.voix,b.voix)),
                first = data[0];
        if (first) {
            const color = nuancesPol.map.get(first.nuanceId)[0].couleur;
            //Election au premier tour
            if ( (first.pct_exprimes>50 && first.pct_inscrits>25)  ){
                let colorA=d3.hsl(color),
                    colorB=colorA.copy();
                colorA.l*=.5;
                colorB.l*=1.2;
                fill=d3.create('svg:pattern')
                    .attr('id',`pat${first.nuanceId}`)
                    .attr('patternUnits','userSpaceOnUse')
                    .attr('width',10)
                    .attr('height',10)
                    .attr('patternTransform','rotate(45)');
                fill.append('rect')
                    .attr('x',0)
                    .attr('y',0)
                    .attr('width',10)
                    .attr('height',10)
                    .attr('fill',colorB.formatHex());
                fill.append('line')
                    .attr('x1',0)
                    .attr('y1',0)
                    .attr('x2',0)
                    .attr('y2',10)
                    .attr('stroke',color)
                    .attr('stroke-width',5);
            }//Ballotage
            else {
                fill=color;
            }
        }
    }
    catch(error){
        console.warn(error);
    }
    return { fill: fill } ;
}


function highlightCirco(id){
    let elt=myMap.layer ('circos');
    console.log(elt);
}

/**********************************************************************
 ***************************** CARTES *********************************
 **********************************************************************/

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
    const etranger  =  { x0: 510, y0: 2050, gap: 117.5 };
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



const   myMap=new MapComposition( 'CarteFrance', { width:2000, height:2200, margins:10 } ).appendTo('#mapContainer');
        myMap.layer ('circos',  { type:'path', source:'assets/geodata/circonscriptions-simplifie.topojson', primary:'ID', autofit:true, clickable:true });
        myMap.layer ('depts',   { type:'path', source:'assets/geodata/departements-simplifie.topojson', primary:'DEP', autofit:"auto", clickable:false });
        myMap.layer ('labels',  { type:'custom', render: renderDomLabels});

const   mySelector = new NestedSelection('choixCirco').appendTo('#header');


const   myFooter = new Synthese('Synthese').appendTo('#innerContainer');

const   myPanel = new Panel('sidePanel').appendTo('#mapContainer');

const   myLegend=new MapLegend(undefined,'Nuances politiques').appendTo(myPanel);

/**********************************************************************
 ******************************* MAIN *********************************
 **********************************************************************/

Promise.all([nuancesPol.ready, resultats.ready, listeCircos.ready]).then(()=>{

    myMap.layer('circos')
        .load()
        .fit( )
        .render()
        .on('click', d=>console.log(d))
        .join(resultats,"idcirco")
        .fill(mapFillingFunction);
    myMap.layer('depts')
        .load()
        .render();
    myMap.layer('labels')
        .render();



    mySelector
        .data ( listeCircos,
                [ { value:'REG_ID',text:'REG_NOM', label:'Région', placeholder:'Région ou territoire' },
                  { value:'DEP_ID',text:'DEP_NOM', label:'Département', placeholder:'Département'},
                  { value:'CIRCO_ID',text:'CIRCO_NOM', label:'Circonscription', placeholder:'Circonscription'} ],
                { root:'France entière'} )
        .on('select', (e) => {
            console.log(e);
            if (e.level===2){
                e.value=parseInt(e.value);
                if (e.root) {
                    myMap.layer('circos').zoomOut();
                }
                else if (e.value<99 && e.value>0) {
                    console.log('ZOOM',e);
                    myMap.layer('circos').zoomTo('REG',e.value);
                }
            }
            else if (e.level===1 && e.value.length<3 && e.value!=='99'){
                e.value=e.value.toString().padStart(3,0);
                myMap.layer('circos').zoomTo('DEP3',e.value);
            }


        });




    const stats=resultats.statistics(nuancesPol);
    myLegend.categories(stats.nuances.list, { color:'couleur', name:'nom', shortName:'code' });

    myFooter.update(stats);





})






