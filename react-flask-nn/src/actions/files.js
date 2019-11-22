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
        processedImage:fileInfo.data.prediction_image
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
                        save(res.data.name, res.data.prediction_video);
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

function b64toBlob(b64Data, contentType='video/mp4', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

function save(filename, data) {
    var blob = b64toBlob(data);
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}