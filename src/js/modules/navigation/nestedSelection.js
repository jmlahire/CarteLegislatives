import {Component} from "./../common/component.js";

import '../../../style/modules/navigation/nestedSelection.scss'

import * as d3Selection from 'd3-selection'
import * as d3Array from 'd3-array'
import * as d3Dispatch from 'd3-dispatch'
const d3=Object.assign({},d3Selection,d3Dispatch);



class DropdownList {

    constructor(level=null){
        this.level=level;
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
     //   console.log('UPDATE');
        const autoSelect=true;
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
                if (data.size===1 && autoSelect) {
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
                console.log(data,data.length);
                if (data.length===1 && autoSelect) {
                   // console.log(data, this.level, data[0][this._structure.value]);
                    //this._dispatch.call('change',this,{ level:this.level, value:data[0][this._structure.value], autoSelect:true } );
                }
                    //this._dispatch.call('change',this,{level:this.level, value:'099' } );
                    //this.hide();
            }

            if (this._structure.placeholder){
                this._innerContainer
                    .append('option')
                    .property('disabled',true)
                    .property('selected',true)
                    .property('hidden',true)
                    .text(this._structure.placeholder);
            }
            this._innerContainer.on('change',(e)=>{
                this.value=e.target.value;
                const msg={ level:this.level, value: this.value};
                this._dispatch.call('change',this,msg);

            });
        }
        else {
            this.hide();
        }

        return this;
    }

    select(value){
        this._innerContainer
            .selectAll('option')
            .property('selected',d=>console.log(d));
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

    constructor(id){
        super(id);
        this._dispatch=d3.dispatch('select');
        this._outerContainer=d3.create('div')
            .attr('id',this.id)
            .classed('_nestedSelection',true);
        this._innerContainer = this._outerContainer
            .append('ul');
    }

    /**
     *
     * @param {DataCollection} data
     * @param {Array} structure
     * @returns {NestedSelection}
     */
    data(data,structure){

        this.size = structure.length;
        this._structure = structure.reverse();
        this._levels = this._structure.length-1;
        this._data = data.toGroups(['REG_ID','DEP_ID'], 'map');

        this._sections = new Array();
        this._selected= new Array();


        for (let i=0; i<=this.size-1; i++){
            this._selected[i]=null;
            this._sections[i]=new DropdownList(i)
                                    .appendTo(this)
                                    .update( (i===this.size-1)? this._data: null , this._structure[i])
                                    .on('change', (msg) => {
                                        console.warn(i,msg);
                                        this._selected[i] =  msg.value;
                                        for (let j=i-1;j>=0;j--) {
                                                this._selected[j] =  null;
                                                this._sections[j].update(null)
                                        }
                                        //console.log(this._selected);
                                        let k=this.size-1,
                                            data=this._data;
                                        while (this._selected[k]!==null && data instanceof Map){
                                            data=data.get(this._selected[k--]);
                                        }

                                        let next = (msg.level>1)? msg.level-1 : 0;
                                        this._sections[next].update(data);
                                        this._dispatch.call('select',this,msg);
                                    });
        }



        return this;
    }


}


export {NestedSelection}