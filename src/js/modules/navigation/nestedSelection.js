import {Component} from "./../common/component.js";

//import '../../../style/modules/navigation/nestedSelection.scss'

import * as d3Selection from 'd3-selection'
import * as d3Array from 'd3-array'
import * as d3Dispatch from 'd3-dispatch'
const d3=Object.assign({},d3Selection,d3Dispatch);



class DropdownList {


    constructor(level, metadata, autoselect=true){
        this.level=level
        this._metadata=metadata;
        this._autoselect=autoselect;
        this._outerContainer=d3.create('li').attr('class',`ddList${level}`);
        this._innerContainer=this._outerContainer.append('select');
        this._dispatch=d3.dispatch('change');
    }

    appendTo(parent) {
        parent._innerContainer.append(() => this._outerContainer.node());
        return this;
    }

    empty(){
        this._innerContainer.selectAll('option').remove();
        return this;
    }

    visibility(bool){
        this._outerContainer.style('visibility', (bool)? 'visible':'hidden');
        return this;
    }

    display(bool){
        this._outerContainer.style('display', (bool)? 'list-item':'none');
        return this;
    }

    update(data=null, selected=null) {
        this.empty();
        const   traverseText = (datum) => {
                    while (datum instanceof Map) {
                        datum = datum.values().next().value;
                    }
                    return datum[0][this._metadata.text];
        }
        const   getValue = (d) => (data instanceof Map) ? d[0] : d[this._metadata.value],
                getText  = (d) => (data instanceof Map) ? traverseText(d[1]) : d[this._metadata.text];

        //Données vides -> on n'affiche rien
        if (data === null) {
            this.visibility(false);
        }
        //Un seul choix possible -> si autoselect, le sélectionne automatiquement
        else if (this._autoselect && data instanceof Map && data.size===1){

            let value=data.keys().next().value;
            this.display(false);

            if (!this._autoselected) {
                this._autoselected=true;
                this._dispatch.call('change',this, {level: this.level, value:value});
            }

            console.warn('AUTOSELECT',this.level,this._autoselected);
        }
        //Plusieurs choix possibles
        else {
            this.visibility(true).display(true);
            this._autoselected=false;
            this._innerContainer
                .selectAll('option')
                .data(data)
                .enter()
                .append('option')
                .property('selected', d=> getValue(d)===selected)
                .attr('value', getValue)
                .text(getText);

            if (selected===null && this._metadata.placeholder) this.addPlaceHolder(this._metadata.placeholder);
            this._innerContainer.on('change',(e)=>{
                const msg={ level: this.level, value:  e.target.value};
                this._dispatch.call('change',this, msg);
            });
        }
    }

    addPlaceHolder(text){
        this._innerContainer
            .append('option')
            .property('disabled',true)
            .property('selected',true)
            .property('hidden',true)
            .text(text)
            .lower();
        return this;
    }

    /**
     * Ajoute une ligne d'option
     * @param {Number|String} value valeur de l'option
     * @param {String} label  nom de l'option
     * @param {Boolean} first=true  si true, place l'option en tête de la liste
     * @returns {DropdownList}
     */
    addOption(value,text, firstPosition=true ){
        if (this.findValue(value)===null){
            let option=this._innerContainer
                .append('option')
                .attr('value',value)
                .text(text)
            if (firstPosition) option.lower();
        }
        return this;
    }

    /**
     * Renvoie l'option correspondant à la valeur passée en paramètre, si elle existe
     * @param value
     * @returns {Selection|null} Selection d3 ou null
     */
    findValue(value){
        let options=this._innerContainer.selectAll('option').nodes();
        let found=options.findIndex(d=>d.value===value);
        return (found>=0)? d3.select(options[found]): null;
    }


    select(value){
        this._innerContainer
            .selectAll('option')
            .each(d=>console.log(d));   //TODO
        return this;
    }


    /**
     * Passe un callback à un typename de this._dispatch pour la gestion du comportement
     * @param {String}      listener
     * @param {Function}    callback
     */
    on(listener, callback){
        this._dispatch.on(listener, callback);
        return this;
    }


    /**
     * Descend dans l'arborescence pour trouver la valeur texte
     * @param datum
     * @param textKey
     * @private
     */
    _accessor(datum){
        console.log(datum);
        while (datum instanceof Map) {
            datum = datum.values().next().value;
        }
        return datum[0][this._structure.text];
    }

}


class NestedSelection extends Component{

    static _type='_nNestSel';

    constructor(id){
        super(id);
        this._dispatch=d3.dispatch('select');
        this._outerContainer=d3.create('div')
            .attr('id',this.id)
            .classed(NestedSelection._type,true);
        this._innerContainer = this._outerContainer
            .append('ul');
    }

    /**
     *
     * @param {DataCollection} data
     * @param {Array} structure
     * @returns {NestedSelection}
     */
    data(data,metadata, options={} , selection){

        this._data=data.dataset;
        this._nestedData = data.toGroups(metadata.slice(0,-1).map(d=>d.value), 'map');
        this._metadata = metadata;
        this._sections = Array(metadata.length-1);
        this._selected = selection || Array(metadata.length).fill(null);

        for (let i=0; i<this._metadata.length; i++){
            this._sections[i]=new DropdownList( i , this._metadata[i])
                .appendTo(this)
                .on('change', e => {
                    //Modification des valeurs sélectionnées
                    this._selected[e.level]= (e.value==='null')? null: e.value;
                    for (let i=e.level+1;i<this._metadata.length;i++) this._selected[i]=null;
                    //MAJ des selects
                    this.update();
                    //Renvoi du dispatch
                    let value = this._selected[e.level];
                    if (value!==null && this._metadata[e.level].valueMapper) value=this._metadata[e.level].valueMapper(this._selected[e.level]);
                    this._dispatch.call('select',this,{ level:e.level, value:value});
                });
        }
        this.update();
        return this;
    }



    update(){
        console.log(this._selected);
        let subdata=this._nestedData;
        for (let i=0; i<this._metadata.length; i++){
            this._sections[i].update(subdata, this._selected[i]);
            if (this._metadata[i].root) {
                let test=this._selected.slice(i,this._metadata.length);
                if (test.some(d=>d!==null)) {
                    this._sections[i].addOption("null",this._metadata[i].root);
                }
            }
            if (subdata!==null && subdata instanceof Map) subdata=subdata.get(this._selected[i]);
        }
    }


    /**
     * Modifie les selects en choisissant les bonnes options
     * @param {Array] } selection
     */
    select(selection){
        let needle,
            i = this._metadata.length-1;
        while (!needle && i>=0){
            if (selection[i]!==null)  needle= this._data.find( d => d[this._metadata[i].value]===selection[i]);
            i--;
        }
        if (needle){
            let level=i+1;
            for (let j=level; j>=0; j--) {
                this._selected[j]=needle[this._metadata[j].value];
            }
            let value = (this._metadata[level].valueMapper)? this._metadata[level].valueMapper(this._selected[level]): this._selected[level];
            this.update();
            this._dispatch.call('select',this,{ level:level, value:value});
        }


    }



}


export {NestedSelection}