/**
 * Registre recensant tous les composants
 */
class SingleRegistry {
    constructor() {
        this._components = new Map();
    }

    has(id) {
        return this._components.has(id);
    }

    get(id) {
        return this._components.get(id);
    }

    add(component) {
        this._components.set(component.id, component);
        return this;
    }
    delete(id) {
        this._components.delete(id);
        return this;
    }
}

const Registry=new SingleRegistry();

export  {Registry}