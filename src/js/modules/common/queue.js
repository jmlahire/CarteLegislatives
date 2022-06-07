class Queue {

    constructor(){
        this._queue = [];
        this._pendingPromise = false;
    }

    enqueue(promise) {
        return new Promise((resolve, reject) => {
            this._queue.push({
                promise,
                resolve,
                reject,
            });
            this.dequeue();
        });
    }

    dequeue() {
        if (this._workingOnPromise) {
            return false;
        }
        const item = this._queue.shift();
        if (!item) {
            return false;
        }
        try {
            this._workingOnPromise = true;
            item.promise()
                .then((value) => {
                    this._workingOnPromise = false;
                    item.resolve(value);
                    this.dequeue();
                })
                .catch(err => {
                    this._workingOnPromise = false;
                    item.reject(err);
                    this.dequeue();
                })
        } catch (err) {
            this._workingOnPromise = false;
            item.reject(err);
            this.dequeue();
        }
        return true;
    }
}

const uniQueue=new Queue();


export {Queue,uniQueue}