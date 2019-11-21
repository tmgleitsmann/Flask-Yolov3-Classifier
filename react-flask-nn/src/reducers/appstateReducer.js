const appstateDefaultState = {
    flaskProcessing:false,
    processesLeft:0
};

const appstateReducer = (state = appstateDefaultState, action) => {
    switch(action.type){
        case 'TOGGLE_TRUE':
            return {flaskprocessing:action.flaskProcessing, processesLeft:state.processesLeft+1};
            
        case 'TOGGLE_FALSE':
            if(state.processesLeft-1 == 0){
                return {flaskprocessing:action.flaskProcessing, processesLeft:state.processesLeft-1};
            }
            else{
                return {flaskprocessing:true, processesLeft:state.processesLeft-1};
            }
        default:
            return state;
    }
};

export default appstateReducer;