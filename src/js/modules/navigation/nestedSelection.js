import {Component} from "./../common/component.js";

//import '../../../style/modules/navigation/nestedSelection.scss'

import * as d3Selection from 'd3-selection'
import * as d3Array from 'd3-array'
import * as d3Dispatch from 'd3-dispatch'
const d3=Object.assign({},d3Selection,d3Dispatch);



class DropdownList {

    static _options= { autoselect:true};

    constructor(level=null, options= {}){
        this.level=level;
        this._options = {...options, ...DropdownList._options };
        this._outerContainer=d3.create('li').classed(`select${level}`,level);
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

    hide(){
        this._outerContainer.style('display','none');
        return this;
    }

    show(){
        this._outerContainer.style('display','list-item');
        return this;
    }

    update(data=null,structure= null){
        this._structure = structure || this._structure;
        this.empty();
        if (data!==null){
            this.show();
            //Niveaux supérieurs (données dans une Map)
            if (data instanceof Map){
                this._innerContainer.selectAll('option')
                    .data(data)
                    .enter()
                    .append('option')
                    .attr('value',d=>d[0])
                    .text(d=> this._accessor(d[1]) );
                if (data.size===1 && this._options.autoselect) {
                    console.log('autoselect',data);
                    this._dispatch.call('change',this,{ level:this.level, value:data.keys().next().value , autoSelect:true } );
                    this.hide();
                }
            }//Dernier niveau (données dans un array)
            else if (Array.isArray(data)){
                this._innerContainer.selectAll('option')
                    .data(data)
                    .enter()
                    .append('option')
                    .attr('value',d=>d[this._structure.value])
                    .text(d=>d[this._structure.text] );
                if (data.length===1 && this._options.autoselect) {
                   // console.log(data, this.level, data[0][this._structure.value]);
                    //this._dispatch.call('change',this,{ level:this.level, value:data[0][this._structure.value], autoSelect:true } );
                }
                    //this._dispatch.call('change',this,{level:this.level, value:'099' } );
                    //this.hide();
            }

            if (this._structure.placeholder) this.addPlaceHolder(this._structure.placeholder);


            this._innerContainer.on('change',(e)=>{
                const msg={ level:this.level, value: e.target.value};
                if (e.target.value==="###") Object.assign(msg, { value:null, root:true });
                this._dispatch.call('change',this, msg);

            });
        }
        else {
            this.hide();
        }

        return this;
    }

    addPlaceHolder(text){
        this._innerContainer
            .append('option')
            .property('disabled',true)
            .property('selected',true)
            .property('hidden',true)
            .text(text);
        return this;
    }

    /**
     * Ajoute une ligne d'option
     * @param {Number|String} value valeur de l'option
     * @param {String} label  nom de l'option
     * @param {Boolean} first=true  si true, place l'option en tête de la liste
     * @returns {DropdownList}
     */
    addOption(value,label, first=true ){
        if (this.findValue(value)===null){
            let option=this._innerContainer
                .append('option')
                .attr('value',value)
                .text(label)
            if (first) option.lower();
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
    data(data,metadata, options={} ){

        this._sections = new Array();
        this._selected = new Array();
        options = {...options, ... { root: 'FRANCE ENTIERE'}}

        const   size = metadata.length,
                structure = metadata.reverse(),
                dataset = data.toGroups(structure.map(d=>d.value).slice(1).reverse() , 'map');

        for (let i=0; i<=size-1; i++){
            this._selected[i]=null;
            this._sections[i]=new DropdownList(i)
                                    .appendTo(this)
                                    .update( (i===size-1)? dataset: null , structure[i])
                                    .on('change', (msg) => {
                                        this._selected[i] =  msg.value;
                                        for (let j=i-1;j>=0;j--) {
                                                this._selected[j] = null;
                                                this._sections[j].update(null);
                                        }
                                        if (msg.level>0) {
                                            let k=size-1,
                                                dataNode=dataset;
                                            while (this._selected[k]!==null && dataNode instanceof Map){
                                                dataNode=dataNode.get(this._selected[k--]);
                                            }
                                            this._sections[msg.level-1].update(dataNode);
                                        }
                                        this._dispatch.call('select',this,msg);
                                        if (options.root) {
                                            this._sections[size-1].addOption("###",options.root);
                                            if (i===size-1 && msg.root) {
                                                this._sections[size-2].update(null);
                                                console.log("UPDATE NULL");
                                            }
                                        }

                                    });
        }

        return this;
    }




}


export {NestedSelection}