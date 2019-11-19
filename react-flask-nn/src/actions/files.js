import axios from "axios";

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
    };
};

export const uploadFiles = (uploadData = {}, ) => {
    console.log(uploadData);
    const reader = new FileReader();
    const {name, size, type} = uploadData;
    const typeList = type.split('/');
    const ext = typeList[1];

    return (dispatch) => {
        const fileAsBlob = new Blob([uploadData], {type:uploadData.type});
        console.log(fileAsBlob);
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
                    const res = await axios
                    .post(`${flaskApiUrl}/image`, {name, size, type, ext, Uint8array})
                    .then((res) => {
                        dispatch(uploadFilesToReducer(res));
                    }) 
                } catch{
                    return Promise.reject(res);
                }
            }
            else if(typeList[0] == 'video'){
                try{
                    const res = await axios
                    .post(`${flaskApiUrl}/video`, {name, size, type, ext, Uint8array})
                    .then((res) => {
                        dispatch(uploadFilesToReducer(uploadData));
                    }) 
                } catch{
                    return Promise.reject(res);
                }
            }
            else{
                return;
            }
        }       
        fr.readAsArrayBuffer(fileAsBlob)
    }
    return;
};

// const b64encodeHelper = (b64) => {
//     var binaryString = window.atob(b64);
//     var binaryLen = binaryString.length;
//     var bytes = new Uint8Array(binaryLen);
//     for (var i = 0; i < binaryLen; i++) {
//         var ascii = binaryString.charCodeAt(i);
//         bytes[i] = ascii;
//     }
//     return bytes;
// }