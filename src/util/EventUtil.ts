import EventEmitter from "events";

class EventUtil {
    // 자식(ex. promiseConnection) 에 이벤트가 등록됐을 때 events배열 안에 있는 이벤트라면 부모(ex. connection)에도 해당 이벤트를 똑같이 등록시킨다
    static inheritEvents(parent:EventEmitter, child:EventEmitter, events:string[]){
        const listeners:{[key:string]:(...args:any[]) => void} = {};
        
        // ex. 만약 promiseConnection 에 새로운 리스너가 추가됐을때때
        child
        .on('newListener', (eventName) => {
            // newListener emitted before listener added
            if (events.indexOf(eventName) >= 0 && !child.listenerCount(eventName)){
                // baseConnection에 같은 리스너를 추가해준다
                parent.on(eventName,
                    // 같은 실행함수를 등록하기 위해 emit.apply
                    (listeners[eventName] = function(...args:any[]){
                        child.emit.apply(child,[eventName, args]) 
                    })
                )
            }
        })
        .on('removeListener', (eventName) => {
            // removeListener emitted after listener removed => !child.listener~
            if (events.indexOf(eventName) >= 0 && !child.listenerCount(eventName)){
                parent.removeListener(eventName, listeners[eventName])
                delete listeners[eventName]
            }
        })
    }
}