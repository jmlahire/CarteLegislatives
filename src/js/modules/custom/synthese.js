import {Component} from "./../common/component.js";
import * as d3Selection from 'd3-selection'
import * as d3Dispatch from 'd3-dispatch'
const d3=Object.assign({},d3Selection,d3Dispatch);


class FigureFactory{

    /**
     *
     * @returns {FigureFactory}
     */
    constructor(){
        if (FigureFactory._instance) {
            return FigureFactory._instance;
        }
        FigureFactory._instance = this;
    }

    render(type,colors){
        if (typeof colors==='string') colors=[colors];
        let code= '',
            size = { width :300, height : 300 };
        switch (type){
            case 'man':             size.width=200;
                                    code = this._man(colors);
                                    break;
            case 'woman':           size.width=200;
                                    code = this._woman(colors);
                                    break;
            case 'triangulaire':    size.width=300;
                                    code = this._triangulaire(colors);
                                    break;
            case 'quadrangulaire':  size.width=300;
                                    code = this._quadrangulaire(colors);
                                    break;


        }
        return d3.create('svg:svg')
                        .attr('preserveAspectRatio','xMaxYMin meet')
                        .attr('viewBox',`0 0 ${size.width} ${size.height}`)
                        .html(code);
    }

    _man(c){
        return `<circle fill="${c[0]}" cx="90" cy="31.6" r="24"/><path fill="${c[0]}" d="M120.5,60.7H59.1c-17,0-30.7,12.9-30.7,28.9v70.8c0,5.6,4.7,10.2,10.9,10.2s10.9-4.4,10.9-10.2V95.5c0-1.6,1.4-2.9,3.1-2.9s3.1,1.3,3.1,2.9v175.6c0,8.7,6.8,15.8,15.4,15.8s15.4-7.1,15.4-15.8V170.9c0-1.6,1.4-2.9,3.1-2.9s3.1,1.3,3.1,2.9v100.2c0,8.7,6.8,15.8,15.4,15.8s15.4-7.1,15.4-15.8V95.5c0-1.6,1.4-2.9,3.1-2.9c1.7,0,3.1,1.3,3.1,2.9v65.3c0,5.6,4.7,10.2,10.9,10.2c6.1,0,10.9-4.4,10.9-10.2V89.7C151.2,73.7,137.2,60.7,120.5,60.7z"/>`;
    }
    _woman(c){
        return `<circle fill="${c[0]}" cx="90" cy="31.6" r="24"/><path fill="${c[0]}" d="M112.2,59.4c17.1,0,29.4,13.2,31.8,20.5l20.9,64.9c4.3,13.9-14.8,19.7-19.3,6.1l-19-59.6h-10.5L147.6,197h-30v79.2c0,14.1-22.5,14.1-22.5,0v-79.9H83.7V276c0,14.4-22.5,14.4-22.5,0v-78.8H31L62.3,91.5H51.9l-18.7,59.7c-4.5,13-23.4,7.6-19.3-6.3L34.8,80C37,72.6,47,59.5,64.2,59.5C64.2,59.4,112.2,59.4,112.2,59.4z"/>`;
    }
    _triangulaire(c){
        return `<polyline fill="${c[0]}" points="39.7,243.6 266.8,243.6 153.2,173.9 "/><polyline fill="${c[1]}" points="149.8,166.1 149.8,46.8 39.8,236.2 "/><polyline fill="${c[2]}" points="157.4,166.1 156.5,46.8 266.8,236.2 "/>`;
    }
    _quadrangulaire(c){
        return `<polyline fill="${c[0]}" points="50.6,52.5 50.6,247.4 148.3,149.9 "/><polyline fill="${c[1]}" points="253.4,52.5 253.4,247.4 154.7,149.9 "/><polyline fill="${c[2]}" points="53.9,48.7 249.9,48.7 151.9,144.6 "/><polyline fill="${c[3]}" points="53.9,251.3 249.9,251.3 151.9,154.4 "/>`;
    }

}



class Synthese extends Component {

    static _type='_cSynth';

    /**
     * CONSTRUCTEUR
     * @param {String}          id                   Identifiant
     */
    constructor(id ) {
        super(id);
        this._container = d3.create('div').attr('id',id);
        this._dispatch = d3.dispatch('select');
        this._sectionElus = this._container.append('section').attr('class','elus');
        this._sectionElus.append('h3').text('D??put??s ??lus au premier tour');
        this._sectionElus.append('ul');
        this._sectionTriang = this._container.append('section').attr('class','triang');
        this._sectionTriang.append('h3').text('Triangulaires & quadrangulaires');
        this._sectionTriang.append('ul');
    }

    update(data){
        this._renderElus(data.synthese.elus);
        this._renderTriangulaires(new Map([...data.synthese.triang, ...data.synthese.quadrang]));
        return this;
    }
    _renderElus(data){
        if (!data.size) this._sectionElus.style('display','none');
        else this._sectionElus
            .select('ul')
            .selectAll('li')
            .data(data)
            .enter()
            .append('li')
            .each( (d,i,n)=> {
                let circo=d[0],
                    color=d[1].nuanceCol,
                    figure=(d[1].civ==='M')?'man':'woman';
                let svg=new FigureFactory().render(figure, color);
                d3.select(n[i])
                    .attr('class',`_${circo}`)
                    .append(()=> svg.node())
                    .on('click',() => this._dispatch.call('select', this, {circo: circo} ));
            });

    }

    _renderTriangulaires(data){
        if (!data.size) this._sectionTriang.style('display','none');
        else this._sectionTriang
            .select('ul')
            .selectAll('li')
            .data(data)
            .enter()
            .append('li')
            .each( (d,i,n)=> {
                let circo=d[0],
                    colors=d[1].map(d=>d.nuanceCol);
                let figure=(d[1].length===3)?'triangulaire':'quadrangulaire';
                let svg=new FigureFactory().render(figure, colors);
                d3.select(n[i])
                    .attr('class',`_${circo}`)
                    .append(()=> svg.node())
                    .on('click',() => this._dispatch.call('select', this, {circo: circo} ));
            });

    }

}

export {Synthese}
