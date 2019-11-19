const filesReducerDefaultState = [];

const filesReducer = (state = filesReducerDefaultState, action) => {
    switch(action.type){
        case 'UPLOAD_FILE':
            return state.concat(action);
        case 'REMOVE_FILE':
            return state.filter(({name}) => name !== action.name);
        case 'CLEAR_FILES':
            return [];
        default:
            return state;
    }
};

export default filesReducer;