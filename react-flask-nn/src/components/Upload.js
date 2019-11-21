import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/Header';
import Dropzone from '../components/Dropzone';
import Progress from '../components/Progress';
import {uploadFiles} from '../actions/files';
import { connect } from 'react-redux';

class Upload extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        files: [],
        uploading: false,
        uploadProgress: {},
        successfullUploaded: false
      };
  
      this.onFilesAdded = this.onFilesAdded.bind(this);
      this.uploadFiles = this.uploadFiles.bind(this);
      this.sendRequest = this.sendRequest.bind(this);
      this.renderActions = this.renderActions.bind(this);
    }
  
    onFilesAdded(files) {
      this.setState(prevState => ({
        files: prevState.files.concat(files)
      }));
    }
  
    async uploadFiles() {
      this.setState({ uploadProgress: {}, uploading: true });
      const promises = [];
      this.state.files.forEach(file => {
        promises.push(this.sendRequest(file));
      });
      try {
        await Promise.all(promises);
        this.setState({ successfullUploaded: true, uploading: false });
      } catch (e) {
        // Not Production ready! Do some error handling here instead...
        console.log(e, "We've encountered an error here.");
        //this.setState({ successfullUploaded: true, uploading: false });
      }
    }
  

    sendRequest(file){
        this.props.uploadFiles(file)
        //make this wait for update in redux, then update render.
    }
  
    renderProgress(file) {
        const uploadProgress = this.state.uploadProgress[file.name];
        if ((this.state.uploading || this.state.successfullUploaded) && (file.type == "image/jpeg" || file.type == "video/mp4")) {
            return (
                <div className="ProgressWrapper">
                    <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
                    <img
                    className="CheckIcon"
                    alt="done"
                    src="../images/thumbnails/check_circle_outline-24px.svg"
                    style={{
                        opacity:
                        this.state.successfullUploaded ? 0.5 : 0
                    }}
                    />
                </div>
            );
        }
    }
  
    renderActions() {
      if (this.state.successfullUploaded) {
        return (
          <button className="btn btn-primary btn-xl js-scroll-trigger"
            onClick={() =>
              this.setState({ files: [], successfullUploaded: false })
            }
          >
            Clear
          </button>
        );
      } else {
        return (
          <button className="btn btn-primary btn-xl js-scroll-trigger"
            disabled={this.state.files.length < 0 || this.state.uploading}
            onClick={this.uploadFiles}
          >
            Upload
          </button>
        );
      }
    }

    render(){
        return(
            <div id="page-top">
                <Header />
                <header className="masthead text-center text-white d-flex" id="upload-img">
                    <div className="container my-auto">
                        <div className="row" id="mediaUpload">
                            <div className="Content">
                                <div>
                                    <Dropzone
                                    onFilesAdded={this.onFilesAdded}
                                    disabled={this.state.uploading || this.state.successfullUploaded}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                
                                    <div className="card-body">
                                        <p className="card-text">Have a jpeg image you want to classify? Have a mp4 video you want to process?</p>
                                        <p className="card-text">Go ahead and upload em.</p>
                                        <div className="col-lg-8 mx-auto">{this.renderActions()}</div>
                                        <div className="Files">
                                            {this.state.files.map(file => {
                                            return (
                                                <div key={file.name} className="Row">
                                                <span className="Filename">{file.name}</span>
                                                {this.renderProgress(file)}
                                                </div>
                                            );
                                            })}
                                        </div>
                                    </div>
                                
                            </div>
                        </div>
                    </div>
                </header>




                
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        uploadFiles: (files) => dispatch(uploadFiles(files)),
    };
};
export default connect(null, mapDispatchToProps)(Upload);