export const toggleState = (toToggle) =>{
    if(toToggle){
        return {
            type:'TOGGLE_TRUE',
            flaskProcessing:true,
        };
    }
    else{
        return {
            type:'TOGGLE_FALSE',
            flaskProcessing:false,
        };
    }
};