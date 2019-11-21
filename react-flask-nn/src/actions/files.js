import axios from "axios";
import { toggleState } from './appstate'

const flaskApiUrl = 'http://0.0.0.0:5000';

export const removeFile = ({ name } = {}) => {
    return{
        type:'REMOVE_FILE',
        name
    };
};

export const uploadFilesToReducer = (fileInfo) =>{
    return {
        type:'UPLOAD_FILE',
        ext:fileInfo.data.ext,
        name:fileInfo.data.name,
        size:fileInfo.data.size,
        processed:fileInfo.data.processed,
        scores:fileInfo.data.prediction_scores,
        labels:fileInfo.data.prediction_labels,
        processedImage:fileInfo.data.prediction_image,
        processedVideo:fileInfo.data.prediction_video
    };
};

export const uploadFiles = (uploadData = {}, ) => {
    const reader = new FileReader();
    const {name, size, type} = uploadData;
    const typeList = type.split('/');
    const ext = typeList[1];

    return (dispatch) => {
        const fileAsBlob = new Blob([uploadData], {type:uploadData.type});
        const fr = new FileReader();

        fr.onload = async function() {
            const arrayBuff = this.result;
            var Uint8array = btoa(
                new Uint8Array(arrayBuff)
                  .reduce((data, byte) => data + String.fromCharCode(byte), '')
              );
            uploadData["Uint8array"] = Uint8array;

            if(typeList[0] == 'image' && (ext =='jpeg') || (ext =='jpg')){
                try{
                    dispatch(toggleState(true));
                    const res = await axios
                    .post(`${flaskApiUrl}/image`, {name, size, type, ext, Uint8array})
                    .then((res) => {
                        dispatch(uploadFilesToReducer(res));
                        dispatch(toggleState(false));
                    }) 
                } catch{
                    dispatch(toggleState(false));
                    return Promise.reject(res);
                }
            }
            else if(typeList[0] == 'video' && (ext =='mp4')){
                try{
                    dispatch(toggleState(true));
                    const res = await axios
                    .post(`${flaskApiUrl}/video`, {name, size, type, ext, Uint8array})
                    .then((res) => {
                        dispatch(uploadFilesToReducer(res));
                        dispatch(toggleState(false));
                        download(res);
                    }) 
                } catch{
                    return Promise.reject(res);
                }
            }
            else{
                return;
            }
        }       
        fr.readAsArrayBuffer(fileAsBlob);
    }
    return;
};

function download(res) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:video/mp4;base64,' + res.data.prediction_video);
    element.setAttribute('download', 'processed-'+res.data.name);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }