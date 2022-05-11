import '../style/normalize.scss'
import '../style/minireset.scss'
import '../style/screen.scss'
import '../style/dev.scss'

import * as d3Selection from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Dsv from 'd3-dsv'
import * as d3Fetch from 'd3-fetch'
import * as d3Color from 'd3-color'
import * as d3Dispatch from 'd3-dispatch'
import * as d3Transition from 'd3-transition'
import * as d3Slider from 'd3-simple-slider'
const d3 = Object.assign({},d3Selection,d3Scale,d3Dispatch,d3Transition,d3Dsv,d3Fetch,d3Slider,d3Color);

import {Component} from './modules/common/component';
import {MapComposition} from './modules/map/mapComposition';


d3.select('body').append('h1').text('Hello World! ;-)');
let d=new MapComposition( '');
d.appendTo(null).addLayer('circos')
            .on('user.click', function(d) { console.log(d,this) } )
            .load('./../assets/geodata/circonscriptions.topojson');
//console.warn(d.getLayer('circos'));

setTimeout(()=>{

    setTimeout(()=>{

       d.getLayer('circos').test();
    },1000)


},1000)