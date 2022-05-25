import {Registry} from './registry';
import {Queue} from './queue';

import * as d3Selection from 'd3-selection'
import * as d3Dispatch from 'd3-dispatch'
import * as d3Transition from 'd3-transition'
const d3=Object.assign({},d3Selection,d3Dispatch,d3Transition);




const idGenerator = (function () {
    const _index = {};
    return (component) => {
        const type = component.type || 'ID';
        if (!_index.hasOwnProperty(type)) _index[type]=0;
        return `${type}${_index[type]++}`;
    }
}());



class Component extends Queue {

    /**
     * Constructeur
     * @param  {String} id : identifiant
     */
    constructor(id) {
        super();
        this.id = id || idGenerator(this);
        this._style = { };
        this._dispatch = d3.dispatch('user');
        this._container = undefined;
        this._transition = d3.transition().duration(750);
        Registry.add(this);
    }


    /**
     * Renvoie le nom du constructeur
     * @returns {String}
     */
    get type(){
        return this.constructor.name;
    }


    /**
     * Renvoie le conteneur extérieur du composant (par défaut, renvoie vers le conteneur unique)
     * @returns {d3.selection}
     */
    get outerContainer(){
        return this._container || this._outerContainer;
    }

    /**
     * Renvoie le conteneur intérieur du composant (par défaut, renvoie vers le conteneur unique)
     * @returns {d3.selection}
     */
    get innerContainer(){
        return this._container || this._innerContainer;
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
     * Insère le composant dans le dom
     * @param parent {Component|d3.selection|String}: parent dans lequel insérer le composant. Au choix: objet hérité de Component | sélecteur | id du parent | selection d3
     * @returns {Component}
     */
    appendTo (parent) {
        //Impossible d'insérer ce qui n'a pas encore été créé
        if (!this.outerContainer)
            console.warn(`Aucun contenu présent dans le composant ${this.id}`);
        //Determination du type de parent
        else {
            this._parent={ component:null, container:undefined };
            //Composant (passé directement)
            if (parent instanceof Component) {
                this._parent.component = parent;
                this._parent.container = parent.innerContainer;
            }
            //Composant (passé par son id)
            else if (typeof parent === 'string' && Registry.has(parent)) {
                this._parent.component = Registry.get(parent);
                this._parent.container = this._parent.component.innerContainer;
            }
            //Selection d3 (passé directement)
            else if (parent instanceof d3.selection){
                this._parent.container = parent;
            }
            //Selection d3 (passé par son id)
            else if (typeof parent === 'string') {
                this._parent.container = d3.select(`#${parent.replace('#','')}`);
            }
            else this._parent.container = d3.select('body');

            //Insertion dans le DOM
            try {
                this._parent.container.append(() => this.outerContainer.node());
            } catch (error) {
                console.warn(`Erreur lors de l'insertion du composant ${this.id} dans le DOM -> Insertion dans <body>`);
                this.appendTo(null);
            }
        }
        return this;
    }

    display(bool){
        this._style.display=bool;
        const value = (bool)? 'block':'none';
        this.outerContainer.style('display',value);
        return this;
    }

    visibility(bool){
        this._style.visibility=bool;
        const value = (bool)? 'visible':'hidden';
        this.outerContainer.style('visibility',value);
        return this;
    }


    opacity(o, options= {} ){
        options= {...{duration:0, delay:0},...options };
        if (o>0) {
            if (!this._style.display || !this._style.visibility) {
                this.outerContainer.style('opacity',0);
                this.display(true).visibility(true);
            }
        }
        this.outerTransition=this.outerContainer.transition()
            .style('opacity',o)
            .on('end', () => this._style.opacity = o );
        return this;
    }

    fadeIn(options= { } ) {
        options={...{duration:500,delay:0},...options};
        return this.opacity(1,options);
    }

    fadeOut(options= {  }) {
        options={...{duration:500,delay:0},...options};
        return this.opacity(0,options);
    }

    show(){
        return this.display(true).visibility(true);
    }

    hide(){
        return this.display(false);
    }

    lower(){
        this.outerContainer.lower();
        return this;
    }
    raise(){
        this.outerContainer.raise();
        return this;
    }

    test(){
        this.outerContainer
            .style('width','100%')
            .style('display','block')
            .style('opacity',0)
            .transition(this._outerTransition)
            .style('opacity',1)
            .transition(this._outerTransition)
            .style('outline-color','blue').style('width','50%');
    }

    empty(){
        this.innerContainer.selectAll('*').remove();
        return this;
    }
}



export {Component}