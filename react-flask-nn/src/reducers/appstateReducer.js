const appstateDefaultState = {
    flaskProcessing:false
};

const appstateReducer = (state = appstateDefaultState, action) => {
    switch(action.type){
        case 'TOGGLE_STATE':
            return {flaskprocessing:action.flaskProcessing};
        default:
            return state;
    }
};

export default appstateReducer;