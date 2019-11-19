import React from 'react';

class Dropzone extends React.Component{
    constructor(props){
        super(props);
        this.state = { hightlight: false };
        this.fileInputRef = React.createRef();
    }

    fileListToArray = (list) => {
        const array = [];
        for (var i = 0; i < list.length; i++) {
          array.push(list.item(i));
        }
        return array;
      }

      onDragOver = (e) => {
        e.preventDefault();
        if (this.props.disabled) return;
        this.setState({ hightlight: true });
      }

      onDragLeave = () => {
        this.setState({ hightlight: false });
      }

      onDrop = (e) => {
        e.preventDefault();
      
        if (this.props.disabled) return;
      
        const files = e.dataTransfer.files;
        
        if (this.props.onFilesAdded) {
          const array = this.fileListToArray(files);
          this.props.onFilesAdded(array);
        }
        this.setState({ hightlight: false });
      }

    openFileDialog = () =>{
        if (this.props.disabled){
            return;
        }
        this.fileInputRef.current.click();
    }

    onFilesAdded = (e) => {
        if(this.props.disabled){
            return;
        }
        const files = e.target.files;
        if(this.props.onFilesAdded){
            const array = this.fileListToArray(files);
            this.props.onFilesAdded(array);
        }
    }

    render(){
        return(
            <div
            className={`Dropzone ${this.state.hightlight ? 'Highlight' : ''}`}
            onDragOver={this.onDragOver.bind(this)}
            onDragLeave={this.onDragLeave.bind(this)}
            onDrop={this.onDrop.bind(this)}
            onClick={this.openFileDialog.bind(this)}
            style={{ cursor: this.props.disabled ? 'default' : 'pointer' }}
            >
                <input
                ref={this.fileInputRef}
                className="FileInput"
                type="file"
                multiple
                onChange={this.onFilesAdded.bind(this)}
                />
                <img
                alt="upload"
                className="Icon"
                src="../images/thumbnails/cloud_upload-24px.svg"
                />
                <span>Upload Files</span>
            </div>
        );
    }
}
export default Dropzone;